const nodemailer = require('nodemailer');

const gmailTransporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
    },
});

const smtpTransporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '465', 10),
    secure: parseInt(process.env.SMTP_PORT || '465', 10) === 465,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

const API_URL = process.env.API_URL || 'https://api.barosche.com';
const SITE_URL = process.env.SITE_URL || 'https://barosche.com';

const formatPrice = (val) =>
    new Intl.NumberFormat('en-DE', {
        style: 'currency',
        currency: 'EUR',
        maximumFractionDigits: 2,
    }).format(val || 0);

const getAbsoluteImgSrc = (path) => {
    if (!path) return `${API_URL}/placeholder.jpg`;
    return path.startsWith('http') ? path : `${API_URL}${path}`;
};

const formatAddress = (info) => {
    if (!info) return '';
    return `
        ${info.firstName || ''} ${info.lastName || ''}<br/>
        ${info.streetAddress1 || ''}${info.streetAddress2 ? ', ' + info.streetAddress2 : ''}<br/>
        ${info.city || ''}, ${info.state || ''} ${info.zip || ''}<br/>
        ${info.country || ''}
    `;
};

const buildOrderEmailHTML = (order, customerInfo, items, isAdmin = false) => {

    const itemsRows = items.map((item) => `
        <tr>
            <td style="padding:16px 0;border-bottom:1px solid #f0f0f0;vertical-align:top;">
                <table style="border-collapse:collapse;">
                    <tr>
                        <td style="padding-right:14px;vertical-align:top;">
                            <img src="${getAbsoluteImgSrc(item.image)}" alt="${item.name}" width="56" height="56" style="width:56px;height:56px;object-fit:cover;border-radius:4px;border:1px solid #eaeaea;display:block;" />
                        </td>
                        <td style="vertical-align:top;padding-top:4px;">
                            <span style="font-size:14px;color:#1a1a1a;">${item.name} &times; ${item.quantity}</span>
                            ${item.variantName ? `<br/><span style="font-size:12px;color:#888;">Variant: ${item.variantName}</span>` : ''}
                            ${item.size ? `<br/><span style="font-size:12px;color:#888;">Size: ${item.size}</span>` : ''}
                        </td>
                    </tr>
                </table>
            </td>
            <td style="padding:16px 0;border-bottom:1px solid #f0f0f0;text-align:right;vertical-align:top;font-size:14px;color:#1a1a1a;">
                ${formatPrice(item.price * item.quantity)}
            </td>
        </tr>
    `).join('');

    const subtotal = order.subtotal ?? items.reduce((sum, i) => sum + (i.price * i.quantity), 0);
    const discountAmount = order.discountAmount || 0;
    const promoCode = order.promoCode || order.couponCode || '';
    const shippingCost = order.shippingCost ?? 0;
    const taxAmount = order.taxAmount ?? 0;
    const finalTotal = order.finalTotal ?? subtotal - discountAmount + shippingCost + taxAmount;

    const paymentMethodLabel = {
        card: 'Card',
        klarna: 'Klarna',
        paypal: 'PayPal',
        google_pay: 'Google Pay',
        apple_pay: 'Apple Pay',
        bitcoin_lightning: 'Bitcoin Lightning',
    }[order.paymentMethod] || order.paymentMethod || 'Card';

    const shippingMethodLabel = order.shippingMethod || 'Standard Shipping';

    return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width, initial-scale=1.0"/></head>
    <body style="margin:0;padding:0;background:#f4f4f4;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
        <div style="max-width:600px;margin:0 auto;background:#ffffff;padding:40px 40px 20px;">

            <!-- Brand + Order number -->
            <table style="width:100%;border-collapse:collapse;margin-bottom:36px;">
                <tr>
                    <td style="font-size:20px;color:#1a1a1a;letter-spacing:0.5px;">Barosche</td>
                    <td style="text-align:right;font-size:12px;color:#999;letter-spacing:0.5px;">ORDER #${order.orderNumber}</td>
                </tr>
            </table>

            ${isAdmin ? `
            <!-- Admin heading -->
            <h1 style="font-size:24px;font-weight:600;color:#1a1a1a;margin:0 0 32px;">You have received a new order!</h1>
            ` : `
            <!-- Customer heading -->
            <h1 style="font-size:24px;font-weight:600;color:#1a1a1a;margin:0 0 12px;">Thank you for your order!</h1>
            <p style="font-size:14px;color:#666;line-height:1.6;margin:0 0 24px;">
                We're getting your order ready to be shipped. We will notify you when it has been sent.
            </p>

            <!-- Buttons -->
            <table style="border-collapse:collapse;margin-bottom:36px;">
                <tr>
                    <td>
                        <a href="${SITE_URL}/orders/${order.orderNumber}" style="display:inline-block;background:#1a1a1a;color:#ffffff;text-decoration:none;font-size:13px;font-weight:600;padding:13px 28px;border-radius:4px;">
                            View your order
                        </a>
                    </td>
                    <td style="padding-left:14px;font-size:13px;color:#666;">
                        or <a href="${SITE_URL}" style="color:#1a6bb8;text-decoration:none;">Visit our store</a>
                    </td>
                </tr>
            </table>
            `}

            <hr style="border:none;border-top:1px solid #eaeaea;margin:0 0 32px;"/>

            <!-- Order summary -->
            <h3 style="font-size:15px;font-weight:600;color:#1a1a1a;margin:0 0 16px;">Order Summary</h3>

            <table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
                <tbody>${itemsRows}</tbody>
            </table>

            <table style="width:100%;border-collapse:collapse;font-size:13px;color:#444;">
                <tr>
                    <td style="padding:5px 0;">Subtotal</td>
                    <td style="padding:5px 0;text-align:right;font-weight:600;color:#1a1a1a;">${formatPrice(subtotal)}</td>
                </tr>
                ${discountAmount > 0 ? `
                <tr>
                    <td style="padding:5px 0;">Order Discount</td>
                    <td style="padding:5px 0;text-align:right;font-weight:600;color:#1a1a1a;">-${formatPrice(discountAmount)}</td>
                </tr>
                ${promoCode ? `
                <tr>
                    <td colspan="2" style="padding:2px 0 5px;">
                        <span style="display:inline-block;background:#f4f4f4;color:#666;font-size:11px;padding:3px 10px;border-radius:12px;">
                            🏷️ ${promoCode} (-${formatPrice(discountAmount)})
                        </span>
                    </td>
                </tr>` : ''}` : ''}
                <tr>
                    <td style="padding:5px 0;">Shipping</td>
                    <td style="padding:5px 0;text-align:right;font-weight:600;color:#1a1a1a;">${formatPrice(shippingCost)}</td>
                </tr>
                <tr>
                    <td style="padding:5px 0;">Taxes</td>
                    <td style="padding:5px 0;text-align:right;font-weight:600;color:#1a1a1a;">${formatPrice(taxAmount)}</td>
                </tr>
            </table>

            <hr style="border:none;border-top:1px solid #eaeaea;margin:16px 0;"/>

            <table style="width:100%;border-collapse:collapse;margin-bottom:6px;">
                <tr>
                    <td style="font-size:14px;color:#444;">Total</td>
                    <td style="text-align:right;font-size:20px;font-weight:700;color:#1a1a1a;">${formatPrice(finalTotal)}</td>
                </tr>
            </table>
            ${discountAmount > 0 ? `
            <p style="text-align:right;font-size:12px;color:#2e7d32;margin:0 0 32px;">You saved ${formatPrice(discountAmount)}</p>
            ` : `<div style="margin-bottom:32px;"></div>`}

            <hr style="border:none;border-top:1px solid #eaeaea;margin:0 0 32px;"/>

            <!-- Customer information -->
            <h3 style="font-size:15px;font-weight:600;color:#1a1a1a;margin:0 0 20px;">Customer Information</h3>

            <table style="width:100%;border-collapse:collapse;margin-bottom:28px;">
                <tr>
                    <td style="width:50%;vertical-align:top;font-size:13px;color:#444;line-height:1.7;">
                        <div style="font-weight:600;color:#1a1a1a;margin-bottom:8px;">Shipping Address</div>
                        ${formatAddress(customerInfo)}
                    </td>
                    <td style="width:50%;vertical-align:top;font-size:13px;color:#444;line-height:1.7;">
                        <div style="font-weight:600;color:#1a1a1a;margin-bottom:8px;">Billing Address</div>
                        ${formatAddress(customerInfo)}
                    </td>
                </tr>
            </table>

            <table style="width:100%;border-collapse:collapse;margin-bottom:8px;">
                <tr>
                    <td style="width:50%;vertical-align:top;font-size:13px;">
                        <div style="font-weight:600;color:#1a1a1a;margin-bottom:6px;">Payment Method</div>
                        <div style="color:#444;">${paymentMethodLabel}</div>
                    </td>
                    <td style="width:50%;vertical-align:top;font-size:13px;">
                        <div style="font-weight:600;color:#1a1a1a;margin-bottom:6px;">Shipping Method</div>
                        <div style="color:#444;">${shippingMethodLabel}</div>
                    </td>
                </tr>
            </table>

            <div style="height:40px;"></div>
            <hr style="border:none;border-top:1px solid #eaeaea;margin:0 0 20px;"/>
            <p style="text-align:center;font-size:11px;color:#aaa;letter-spacing:0.5px;margin:0;">
                BAROSCHE · Fine Jewellery · barosche.com
            </p>
        </div>
    </body>
    </html>
    `;
};

// Admin ko notification (Gmail se)
const sendAdminOrderNotification = async (order, customerInfo, items) => {
    try {
        await gmailTransporter.sendMail({
            from: `"Barosche Orders" <${process.env.GMAIL_USER}>`,
            to: process.env.GMAIL_USER,
            subject: `🛍️ New Order #${order.orderNumber} — ${customerInfo.firstName} ${customerInfo.lastName} — ${formatPrice(order.finalTotal)}`,
            html: buildOrderEmailHTML(order, customerInfo, items, true),
        });
        console.log(' Admin order email sent (Gmail)');
    } catch (err) {
        console.error("❌ Admin email failed:");
        console.error(err);
    }
};

// Customer ko confirmation (Hostinger SMTP se — admin@barosche.com)
const sendCustomerConfirmation = async (order, customerInfo, items) => {
    try {
        await smtpTransporter.sendMail({
            from: `"Barosche" <${process.env.SMTP_USER}>`,
            to: customerInfo.email,
            subject: `Order Confirmed — #${order.orderNumber}`,
            html: buildOrderEmailHTML(order, customerInfo, items, false),
        });
        console.log(' Customer confirmation email sent (SMTP) to:', customerInfo.email);
    } catch (err) {
        console.error("❌ Customer email failed:");
        console.error(err);
    }
};

module.exports = { sendAdminOrderNotification, sendCustomerConfirmation };