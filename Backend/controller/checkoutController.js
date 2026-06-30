const Order = require('../model/Order');
const User = require('../model/Usermodel');
const crypto = require('crypto');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { sendAdminOrderNotification, sendCustomerConfirmation } = require('../utils/mailer');

const mapItems = (items) =>
    items.map((item) => ({
        productId: item.productId || item.id,
        name: item.name,
        image: item.image,
        price: parseFloat(item.price),
        quantity: parseInt(item.quantity),
        size: item.size || undefined,
    }));

const calcSubtotal = (items) =>
    items.reduce((sum, item) => sum + parseFloat(item.price) * parseInt(item.quantity), 0);

const findOrCreateUser = async (customerInfo, existingUserId = null) => {
    try {
        if (existingUserId) {
            const loggedInUser = await User.findById(existingUserId);
            if (loggedInUser) return loggedInUser;
        }

        if (!customerInfo?.email) return null;

        const email = customerInfo.email.toLowerCase().trim();

        let user = await User.findOne({ email });
        if (user) {
            if (!user.phone && customerInfo.phone) {
                user.phone = customerInfo.phone;
                await user.save();
            }
            return user;
        }

        const randomPassword = crypto.randomBytes(8).toString('hex');

        user = new User({
            firstName: customerInfo.firstName || 'Customer',
            lastName: customerInfo.lastName || '',
            email,
            phone: customerInfo.phone || '',
            password: randomPassword,
            isActive: true,
            isGuestCreated: true,
        });

        await user.save();
        console.log('👤 Auto-created user account for guest checkout:', email);
        return user;
    } catch (err) {
        console.error('⚠️ findOrCreateUser error:', err.message);
        try {
            const fallbackUser = await User.findOne({ email: customerInfo?.email?.toLowerCase().trim() });
            return fallbackUser || null;
        } catch {
            return null;
        }
    }
};

exports.createPaymentIntent = async (req, res) => {
    try {
        const { amount, paymentMethodTypes, customerInfo, items, browserId } = req.body;
        console.log('📦 create-intent HIT | amount:', amount, '| methods:', paymentMethodTypes);
        if (!amount || amount <= 0) return res.status(400).json({ error: 'Invalid amount.' });
        if (!items || items.length === 0) return res.status(400).json({ error: 'Cart is empty.' });
        if (!customerInfo?.email) return res.status(400).json({ error: 'Customer email required.' });

        const serverSubtotal = calcSubtotal(items);
        const finalAmountInCents = Math.round(serverSubtotal * 100);

        const intentParams = {
            amount: finalAmountInCents,
            currency: 'eur',
            description: `Barosche order by ${customerInfo.email}`,
            metadata: {
                browserId: browserId || 'unknown',
                customerEmail: customerInfo.email,
                customerName: `${customerInfo.firstName} ${customerInfo.lastName}`,
            },
            receipt_email: customerInfo.email,
        };

        if (Array.isArray(paymentMethodTypes) && paymentMethodTypes.length > 0) {
            intentParams.payment_method_types = paymentMethodTypes;
        } else {
            intentParams.automatic_payment_methods = { enabled: true };
        }

        const paymentIntent = await stripe.paymentIntents.create(intentParams);
        console.log('PaymentIntent created:', paymentIntent.id, '| status:', paymentIntent.status);
        return res.status(200).json({
            clientSecret: paymentIntent.client_secret,
            intentId: paymentIntent.id,
        });
    } catch (error) {
        console.error('❌ Create Intent Error:', error.message);
        return res.status(500).json({ error: error.message || 'Failed to create payment intent' });
    }
};

exports.confirmAndSaveOrder = async (req, res) => {
    console.log('🔔 confirm-intent API HIT');
    try {
        const { paymentIntentId, browserId, customerInfo, items, note, userId } = req.body;
        console.log('📋 paymentIntentId:', paymentIntentId);
        console.log('👤 email:', customerInfo?.email);
        console.log('🛒 items:', items?.length);

        if (!paymentIntentId) return res.status(400).json({ success: false, message: 'Payment intent ID required.' });
        if (!items || items.length === 0) return res.status(400).json({ success: false, message: 'Cart is empty.' });
        if (!customerInfo) return res.status(400).json({ success: false, message: 'Customer info required.' });

        const existingOrder = await Order.findOne({ stripeChargeId: paymentIntentId });
        if (existingOrder) {
            console.log('ℹ️ Order already exists for this paymentIntent, returning existing order:', existingOrder._id);
            return res.status(200).json({
                success: true,
                message: 'Order already recorded.',
                paymentId: paymentIntentId,
                amount: Math.round(existingOrder.finalTotal * 100),
                orderId: existingOrder._id,
                orderNumber: existingOrder.orderNumber,
                customerEmail: existingOrder.customerInfo?.email,
            });
        }

        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
        console.log('🔍 Stripe status:', paymentIntent.status);

        const validStatuses = ['succeeded', 'requires_capture'];
        if (!validStatuses.includes(paymentIntent.status)) {
            return res.status(400).json({ success: false, message: `Payment not completed. Status: ${paymentIntent.status}` });
        }

        const serverSubtotal = calcSubtotal(items);

        let detectedPaymentMethod = 'card';
        const pmTypes = paymentIntent.payment_method_types || [];
        if (pmTypes.includes('klarna')) detectedPaymentMethod = 'klarna';
        else if (pmTypes.includes('apple_pay')) detectedPaymentMethod = 'apple_pay';
        else if (pmTypes.includes('google_pay')) detectedPaymentMethod = 'google_pay';
        else if (pmTypes.includes('paypal')) detectedPaymentMethod = 'paypal';

        const linkedUser = await findOrCreateUser(customerInfo, userId);

        const newOrder = new Order({
            userId: linkedUser ? linkedUser._id : null,
            customerInfo,
            items: mapItems(items),
            subtotal: serverSubtotal,
            finalTotal: serverSubtotal,
            note: note || '',
            paymentMethodId: paymentIntent.payment_method,
            paymentMethod: detectedPaymentMethod,
            paymentStatus: 'succeeded',
            stripeChargeId: paymentIntent.id,
            shippingDetails: {
                country: customerInfo.country || 'DE',
                state: customerInfo.state || '',
                city: customerInfo.city || '',
                zip: customerInfo.zip || '',
            },
            createdAt: new Date(),
            orderNumber: `ORD-${Date.now()}`,
        });

        await newOrder.save();
        console.log(' Order saved:', newOrder._id, '| orderNumber:', newOrder.orderNumber, '| userId:', newOrder.userId);

        const emailResults = await Promise.allSettled([
            sendAdminOrderNotification(newOrder, customerInfo, newOrder.items),
            sendCustomerConfirmation(newOrder, customerInfo, newOrder.items),
        ]);
        emailResults.forEach((r, i) => {
            if (r.status === 'rejected') console.error(`❌ Email ${i === 0 ? 'admin' : 'customer'} failed:`, r.reason);
            else console.log(`📧 Email ${i === 0 ? 'admin' : 'customer'} sent`);
        });

        return res.status(200).json({
            success: true,
            message: 'Order placed successfully!',
            paymentId: paymentIntent.id,
            amount: paymentIntent.amount,
            orderId: newOrder._id,
            orderNumber: newOrder.orderNumber,
            customerEmail: customerInfo.email,
            userId: linkedUser ? linkedUser._id : null,
        });
    } catch (error) {
        console.error('❌ Confirm Intent Error:', error.message);
        console.error(error.stack);
        return res.status(500).json({ success: false, message: error.message || 'Order save failed' });
    }
};

exports.placeOrder = async (req, res) => {
    try {
        const { amount, paymentMethodId, browserId, items, customerInfo, note, userId } = req.body;
        if (!amount || amount <= 0) return res.status(400).json({ success: false, message: 'Invalid amount.' });
        if (!paymentMethodId) return res.status(400).json({ success: false, message: 'Payment method ID required.' });
        if (!items || items.length === 0) return res.status(400).json({ success: false, message: 'Cart is empty.' });
        if (!customerInfo) return res.status(400).json({ success: false, message: 'Customer info required.' });

        const serverSubtotal = calcSubtotal(items);
        const finalAmountInCents = Math.round(serverSubtotal * 100);

        const paymentIntent = await stripe.paymentIntents.create({
            amount: finalAmountInCents,
            currency: 'eur',
            payment_method: paymentMethodId,
            confirm: true,
            automatic_payment_methods: { enabled: true, allow_redirects: 'never' },
            description: `Order by ${customerInfo.email}`,
            metadata: {
                browserId: browserId || 'unknown',
                customerEmail: customerInfo.email,
                customerName: `${customerInfo.firstName} ${customerInfo.lastName}`,
            },
            receipt_email: customerInfo.email,
            shipping: {
                name: `${customerInfo.firstName} ${customerInfo.lastName}`,
                address: {
                    line1: customerInfo.streetAddress1,
                    line2: customerInfo.streetAddress2 || undefined,
                    city: customerInfo.city,
                    state: customerInfo.state,
                    postal_code: customerInfo.zip,
                    country: customerInfo.country || 'DE',
                },
                phone: customerInfo.phone,
            },
        });

        if (paymentIntent.status === 'succeeded') {
            const existing = await Order.findOne({ stripeChargeId: paymentIntent.id });
            if (existing) {
                return res.status(200).json({ success: true, message: 'Payment successful!', paymentId: paymentIntent.id, amount: paymentIntent.amount, orderId: existing._id, orderNumber: existing.orderNumber, customerEmail: customerInfo.email });
            }

            const linkedUser = await findOrCreateUser(customerInfo, userId);

            const newOrder = new Order({
                userId: linkedUser ? linkedUser._id : null,
                customerInfo, items: mapItems(items), subtotal: serverSubtotal, finalTotal: serverSubtotal,
                note: note || '', paymentMethodId, paymentMethod: 'card', paymentStatus: 'succeeded',
                stripeChargeId: paymentIntent.id,
                shippingDetails: { country: customerInfo.country || 'DE', state: customerInfo.state, city: customerInfo.city, zip: customerInfo.zip },
                createdAt: new Date(), orderNumber: `ORD-${Date.now()}`,
            });
            await newOrder.save();
            const emailResults = await Promise.allSettled([
                sendAdminOrderNotification(newOrder, customerInfo, newOrder.items),
                sendCustomerConfirmation(newOrder, customerInfo, newOrder.items),
            ]);
            emailResults.forEach((r, i) => {
                if (r.status === 'rejected') console.error(`❌ Email ${i === 0 ? 'admin' : 'customer'} failed:`, r.reason);
            });
            return res.status(200).json({ success: true, message: 'Payment successful!', paymentId: paymentIntent.id, amount: paymentIntent.amount, orderId: newOrder._id, orderNumber: newOrder.orderNumber, customerEmail: customerInfo.email, userId: linkedUser ? linkedUser._id : null });
        } else {
            return res.status(400).json({ success: false, message: `Payment status: ${paymentIntent.status}` });
        }
    } catch (error) {
        console.error('❌ Payment Error:', error.message);
        return res.status(400).json({ success: false, message: error.message || 'Payment failed' });
    }
};

exports.getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, orders });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch orders.' });
    }
};

exports.getOrderById = async (req, res) => {
    try {
        const { id } = req.params;
        const order = await Order.findById(id);
        if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });
        res.status(200).json({ success: true, order });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch order.' });
    }
};

exports.getOrdersByEmail = async (req, res) => {
    try {
        const { email } = req.params;
        if (!email) return res.status(400).json({ success: false, message: 'Email required.' });

        const orders = await Order.find({ 'customerInfo.email': email.toLowerCase().trim() }).sort({ createdAt: -1 });
        const user = await User.findOne({ email: email.toLowerCase().trim() }).select('-password');

        res.status(200).json({ success: true, orders, user: user || null });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch orders.' });
    }
};

exports.placePaypalOrder = async (req, res) => {
    try {
        const { paypalOrderId, paypalPaymentId, amount, browserId, customerInfo, items, note, userId } = req.body;
        if (!paypalOrderId || !items || items.length === 0 || !customerInfo) {
            return res.status(400).json({ success: false, message: 'Missing required fields.' });
        }

        const dedupeId = paypalPaymentId || paypalOrderId;
        const existing = await Order.findOne({ stripeChargeId: dedupeId });
        if (existing) {
            return res.status(200).json({ success: true, message: 'Order already recorded.', paymentId: dedupeId, amount: Math.round(existing.finalTotal * 100), orderId: existing._id, orderNumber: existing.orderNumber, customerEmail: existing.customerInfo?.email });
        }

        const serverSubtotal = calcSubtotal(items);

        const linkedUser = await findOrCreateUser(customerInfo, userId);

        const newOrder = new Order({
            userId: linkedUser ? linkedUser._id : null,
            customerInfo, items: mapItems(items), subtotal: serverSubtotal, finalTotal: serverSubtotal,
            note: note || '', paymentMethod: 'paypal', paymentStatus: 'succeeded',
            stripeChargeId: dedupeId, orderNumber: `ORD-${Date.now()}`,
            shippingDetails: { country: customerInfo.country || '', state: customerInfo.state || '', city: customerInfo.city || '', zip: customerInfo.zip || '' },
            createdAt: new Date(),
        });
        await newOrder.save();
        const emailResults = await Promise.allSettled([
            sendAdminOrderNotification(newOrder, customerInfo, newOrder.items),
            sendCustomerConfirmation(newOrder, customerInfo, newOrder.items),
        ]);
        emailResults.forEach((r, i) => {
            if (r.status === 'rejected') console.error(`❌ Email ${i === 0 ? 'admin' : 'customer'} failed:`, r.reason);
        });
        return res.status(200).json({ success: true, message: 'PayPal order saved!', paymentId: dedupeId, amount: Math.round(serverSubtotal * 100), orderId: newOrder._id, orderNumber: newOrder.orderNumber, customerEmail: customerInfo.email, userId: linkedUser ? linkedUser._id : null });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message || 'Failed to save PayPal order' });
    }
};

exports.createKlarnaIntent = async (req, res) => {
    try {
        const { amount, customerInfo, items, note, browserId } = req.body;
        if (!amount || amount <= 0) return res.status(400).json({ error: 'Invalid amount.' });
        if (!customerInfo?.email) return res.status(400).json({ error: 'Customer email required for Klarna.' });
        if (!items || items.length === 0) return res.status(400).json({ error: 'Cart is empty.' });
        const serverSubtotal = calcSubtotal(items);
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(serverSubtotal * 100), currency: 'eur', payment_method_types: ['klarna'],
            description: `Barosche order by ${customerInfo.email}`,
            metadata: { browserId: browserId || 'unknown', customerEmail: customerInfo.email, customerName: `${customerInfo.firstName} ${customerInfo.lastName}` },
            receipt_email: customerInfo.email,
        });
        return res.status(200).json({
            clientSecret: paymentIntent.client_secret,
            intentId: paymentIntent.id,
        });
    } catch (error) {
        return res.status(500).json({ error: error.message || 'Failed to create Klarna payment' });
    }
};