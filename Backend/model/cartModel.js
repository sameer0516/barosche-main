const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
    key: { type: String, required: true },
    productId: { type: String, required: true },
    slug: { type: String },
    title: { type: String, required: true },
    image: { type: String },
    price: { type: Number, required: true },
    stone: {
        name: { type: String },
        hex: { type: String },
    },
    metal: { type: String, enum: ['gold', 'silver'], default: 'gold' },
    qty: { type: Number, default: 1, min: 1 },
});

const cartSchema = new mongoose.Schema({
    sessionId: { type: String, required: true, unique: true },
    items: [cartItemSchema],
}, { timestamps: true });

// ── Virtual: total price ──
cartSchema.virtual('totalPrice').get(function () {
    return this.items.reduce((sum, item) => sum + item.price * item.qty, 0);
});

// ── Virtual: total items ──
cartSchema.virtual('totalItems').get(function () {
    return this.items.reduce((sum, item) => sum + item.qty, 0);
});

module.exports = mongoose.model('Cart', cartSchema);