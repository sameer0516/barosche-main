const express = require('express');
const router = express.Router();
const checkoutController = require('../controller/checkoutController');

router.post('/payment/create-intent', checkoutController.createPaymentIntent);
router.post('/payment/confirm-intent', checkoutController.confirmAndSaveOrder);
router.post('/payment', checkoutController.placeOrder);
router.post('/payment/paypal-capture', checkoutController.placePaypalOrder);
router.post('/payment/klarna-intent', checkoutController.createKlarnaIntent);
router.get('/orders', checkoutController.getAllOrders);
router.get('/orders/:id', checkoutController.getOrderById);

router.get('/orders-by-email/:email', checkoutController.getOrdersByEmail);

module.exports = router;