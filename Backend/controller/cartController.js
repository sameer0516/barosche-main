const Cart = require('../model/cartModel');

const getOrCreateCart = async (sessionId) => {
    let cart = await Cart.findOne({ sessionId });
    if (!cart) {
        cart = await Cart.create({ sessionId, items: [] });
    }
    return cart;
};

const cartResponse = (cart) => ({
    success: true,
    cart: cart.items,
    totalItems: cart.items.reduce((s, i) => s + i.qty, 0),
    totalPrice: cart.items.reduce((s, i) => s + i.price * i.qty, 0),
});


const getCart = async (req, res) => {
    try {
        const sessionId = req.headers['x-session-id'] || req.sessionID || 'guest';
        const cart = await getOrCreateCart(sessionId);
        res.json(cartResponse(cart));
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

const addToCart = async (req, res) => {
    try {
        const sessionId = req.headers['x-session-id'] || req.sessionID || 'guest';
        const { productId, slug, title, image, price, stone, metal = 'gold', qty = 1 } = req.body;

        if (!productId || !title || !price) {
            return res.status(400).json({ success: false, message: 'productId, title aur price required hain' });
        }

        const key = `${productId}_${stone?.name || ''}_${metal}`;
        const cart = await getOrCreateCart(sessionId);

        const existingItem = cart.items.find(i => i.key === key);

        if (existingItem) {
            existingItem.qty += Number(qty);
        } else {
            cart.items.push({ key, productId, slug, title, image, price: Number(price), stone, metal, qty: Number(qty) });
        }

        await cart.save();
        res.json({ ...cartResponse(cart), message: 'Item cart me add ho gaya!' });

    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

const updateCartItem = async (req, res) => {
    try {
        const sessionId = req.headers['x-session-id'] || req.sessionID || 'guest';
        const { key, qty } = req.body;

        if (!key) return res.status(400).json({ success: false, message: 'key required hai' });

        const cart = await getOrCreateCart(sessionId);
        const item = cart.items.find(i => i.key === key);

        if (!item) return res.status(404).json({ success: false, message: 'Item cart me nahi mila' });

        if (Number(qty) < 1) {
            cart.items = cart.items.filter(i => i.key !== key);
        } else {
            item.qty = Number(qty);
        }

        await cart.save();
        res.json(cartResponse(cart));

    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

const removeFromCart = async (req, res) => {
    try {
        const sessionId = req.headers['x-session-id'] || req.sessionID || 'guest';
        const { key } = req.body;

        if (!key) return res.status(400).json({ success: false, message: 'key required hai' });

        const cart = await getOrCreateCart(sessionId);
        cart.items = cart.items.filter(i => i.key !== key);

        await cart.save();
        res.json({ ...cartResponse(cart), message: 'Item remove ho gaya' });

    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};


// ─────────────────────────────────────────
// DELETE /api/cart/clear
// ─────────────────────────────────────────
const clearCart = async (req, res) => {
    try {
        const sessionId = req.headers['x-session-id'] || req.sessionID || 'guest';
        const cart = await getOrCreateCart(sessionId);
        cart.items = [];
        await cart.save();
        res.json({ success: true, message: 'Cart khali ho gayi', cart: [], totalItems: 0, totalPrice: 0 });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};


module.exports = { getCart, addToCart, updateCartItem, removeFromCart, clearCart };