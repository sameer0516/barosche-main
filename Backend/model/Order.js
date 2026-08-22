const mongoose = require('mongoose');

const productItemSchema = new mongoose.Schema({
    productId: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    image: {
        type: String,
        default: '',
    },
    price: {
        type: Number,
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
        min: 1,
    },
    size: {
        type: String,
    },
    variantName: {
        type: String,
    },
});

const orderSchema = new mongoose.Schema({
    customerInfo: {
        firstName: { type: String, required: true },
        lastName: { type: String, required: true },
        email: { type: String, required: true },
        phone: { type: String, required: true },
        country: { type: String, required: true },
        streetAddress1: { type: String, required: true },
        streetAddress2: { type: String },
        city: { type: String, required: true },
        state: { type: String },
        zip: { type: String, required: true },
    },

    items: [productItemSchema],

    subtotal: { type: Number, required: true },
    finalTotal: { type: Number, required: true },

    note: { type: String },

    paymentMethodId: { type: String },

    paymentMethod: {
        type: String,
        enum: [
            'card',
            'klarna',
            'paypal',
            'google_pay',
            'apple_pay',
            'bitcoin_lightning',
        ],
        default: 'card',
    },

    paymentStatus: {
        type: String,
        enum: ['pending', 'succeeded', 'failed', 'refunded'],
        default: 'pending',
    },

    stripePaymentIntentId: { type: String, default: null, index: true },

    stripeChargeId: { type: String },

    paypalOrderId: { type: String, default: null, index: true },

    speedPaymentId: { type: String, default: null, index: true },

    orderNumber: { type: String, index: true },

    shippingDetails: {
        country: { type: String },
        state: { type: String },
        city: { type: String },
        zip: { type: String },
    },

    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

orderSchema.pre('save', function () {
    this.updatedAt = new Date();
});

module.exports = mongoose.model('Order', orderSchema);