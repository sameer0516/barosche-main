const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
    },
});

const formatPrice = (val) =>
    new Intl.NumberFormat('en-DE', {
        style: 'currency',
        currency: 'EUR',
        maximumFractionDigits: 0,
    }).format(val);

const buildOrderEmailHTML = (order, customerInfo, items) => {
    const itemsRows = items.map((item) => `
        <tr>
            <td style="padding:10px 8px;border-bottom:1px solid #f0f0f0;">
                <strong>${item.name}</strong>
                ${item.size ? `<br/><span style="font-size:12px;color:#767676;">Size: ${item.size}</span>` : ''}
            </td>
            <td style="padding:10px 8px;border-bottom:1px solid #f0f0f0;text-align:center;">${item.quantity}</td>
            <td style="padding:10px 8px;border-bottom:1px solid #f0f0f0;text-align:right;">${formatPrice(item.price * item.quantity)}</td>
        </tr>
    `).join('');

    return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="UTF-8"/></head>
    <body style="margin:0;padding:0;background:#f9f9f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
        <div style="max-width:600px;margin:40px auto;background:#ffffff;border:1px solid #e5e5e5;">
            
            <!-- Header -->
            <div style="background:#000;padding:28px 32px;text-align:center;">
                <h1 style="color:#fff;margin:0;font-size:22px;letter-spacing:4px;font-weight:300;">BAROSCHE</h1>
            </div>

            <!-- Title -->
            <div style="padding:32px 32px 0;text-align:center;">
                <div style="font-size:32px;margin-bottom:12px;">✦</div>
                <h2 style="font-size:20px;font-weight:400;letter-spacing:1px;margin:0 0 8px;">New Order Received</h2>
                <p style="color:#767676;font-size:13px;margin:0;">Order #${order.orderNumber}</p>
            </div>

            <!-- Customer Info -->
            <div style="padding:24px 32px;">
                <h3 style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#767676;margin:0 0 12px;border-bottom:1px solid #e5e5e5;padding-bottom:8px;">Customer Details</h3>
                <table style="width:100%;font-size:13px;border-collapse:collapse;">
                    <tr>
                        <td style="padding:4px 0;color:#767676;width:40%;">Name</td>
                        <td style="padding:4px 0;"><strong>${customerInfo.firstName} ${customerInfo.lastName}</strong></td>
                    </tr>
                    <tr>
                        <td style="padding:4px 0;color:#767676;">Email</td>
                        <td style="padding:4px 0;">${customerInfo.email}</td>
                    </tr>
                    <tr>
                        <td style="padding:4px 0;color:#767676;">Phone</td>
                        <td style="padding:4px 0;">${customerInfo.phone}</td>
                    </tr>
                    <tr>
                        <td style="padding:4px 0;color:#767676;">Address</td>
                        <td style="padding:4px 0;">
                            ${customerInfo.streetAddress1}
                            ${customerInfo.streetAddress2 ? ', ' + customerInfo.streetAddress2 : ''}<br/>
                            ${customerInfo.city}, ${customerInfo.state} ${customerInfo.zip}<br/>
                            ${customerInfo.country}
                        </td>
                    </tr>
                    ${order.note ? `<tr><td style="padding:4px 0;color:#767676;">Note</td><td style="padding:4px 0;">${order.note}</td></tr>` : ''}
                </table>
            </div>

            <!-- Order Items -->
            <div style="padding:0 32px 24px;">
                <h3 style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#767676;margin:0 0 12px;border-bottom:1px solid #e5e5e5;padding-bottom:8px;">Order Items</h3>
                <table style="width:100%;font-size:13px;border-collapse:collapse;">
                    <thead>
                        <tr style="background:#f9f9f9;">
                            <th style="padding:8px;text-align:left;font-weight:600;font-size:11px;letter-spacing:1px;text-transform:uppercase;">Product</th>
                            <th style="padding:8px;text-align:center;font-weight:600;font-size:11px;letter-spacing:1px;text-transform:uppercase;">Qty</th>
                            <th style="padding:8px;text-align:right;font-weight:600;font-size:11px;letter-spacing:1px;text-transform:uppercase;">Price</th>
                        </tr>
                    </thead>
                    <tbody>${itemsRows}</tbody>
                </table>
            </div>

            <!-- Total -->
            <div style="padding:0 32px 32px;">
                <div style="border-top:2px solid #000;padding-top:16px;display:flex;justify-content:space-between;">
                    <table style="width:100%;">
                        <tr>
                            <td style="font-size:13px;color:#767676;">Payment Method</td>
                            <td style="text-align:right;font-size:13px;text-transform:capitalize;">${order.paymentMethod}</td>
                        </tr>
                        <tr>
                            <td style="font-size:13px;color:#767676;padding-top:8px;">Payment ID</td>
                            <td style="text-align:right;font-size:11px;padding-top:8px;">${order.stripeChargeId || '-'}</td>
                        </tr>
                        <tr>
                            <td style="font-size:16px;font-weight:700;padding-top:12px;">TOTAL</td>
                            <td style="text-align:right;font-size:16px;font-weight:700;padding-top:12px;">${formatPrice(order.finalTotal)}</td>
                        </tr>
                    </table>
                </div>
            </div>

            <!-- Footer -->
            <div style="background:#f9f9f9;padding:20px 32px;text-align:center;border-top:1px solid #e5e5e5;">
                <p style="font-size:11px;color:#aaaaaa;margin:0;letter-spacing:1px;">BAROSCHE · Fine Jewellery · barosche.com</p>
            </div>
        </div>
    </body>
    </html>
    `;
};

// Admin ko notification
const sendAdminOrderNotification = async (order, customerInfo, items) => {
    try {
        await transporter.sendMail({
            from: `"Barosche Orders" <${process.env.GMAIL_USER}>`,
            to: process.env.GMAIL_USER,
            subject: `🛍️ New Order #${order.orderNumber} — ${customerInfo.firstName} ${customerInfo.lastName} — ${formatPrice(order.finalTotal)}`,
            html: buildOrderEmailHTML(order, customerInfo, items),
        });
        console.log('Admin order email sent');
    } catch (err) {
        console.error("❌ Admin email failed:");
        console.error(err);
    }
};

// Customer ko confirmation
const sendCustomerConfirmation = async (order, customerInfo, items) => {
    try {
        await transporter.sendMail({
            from: `"Barosche" <${process.env.GMAIL_USER}>`,
            to: customerInfo.email,
            subject: `Order Confirmed — #${order.orderNumber}`,
            html: buildOrderEmailHTML(order, customerInfo, items),
        });
        console.log('Customer confirmation email sent to:', customerInfo.email);
    } catch (err) {
        console.error("❌ Customer email failed:");
        console.error(err);
    }
};

module.exports = { sendAdminOrderNotification, sendCustomerConfirmation };