const nodemailer = require('nodemailer');

// Utility to create a testing transporter using Ethereal Email
// In production, you would replace this with SendGrid, AWS SES, or real SMTP
const createTransporter = async () => {
    // Generate test SMTP service account from ethereal.email
    const testAccount = await nodemailer.createTestAccount();

    const transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: testAccount.user, // generated ethereal user
            pass: testAccount.pass, // generated ethereal password
        },
    });

    return transporter;
};

const sendReceiptEmail = async (customerEmail, orderDetails) => {
    try {
        const transporter = await createTransporter();

        const mailOptions = {
            from: '"Eco-Hive Store" <noreply@eco-hive.com>',
            to: customerEmail,
            subject: `Receipt for your Eco-Hive Order #${orderDetails.id}`,
            html: `
                <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f5f5f7; padding: 40px; border-radius: 18px;">
                    <div style="text-align: center; margin-bottom: 30px;">
                        <h2 style="color: #1d1d1f; font-weight: 600; margin: 0;">Eco-Hive</h2>
                        <p style="color: #86868b; margin-top: 5px;">Thank you for shopping sustainably.</p>
                    </div>
                    
                    <div style="background-color: #ffffff; padding: 30px; border-radius: 12px; box-shadow: 0 4px 24px rgba(0,0,0,0.04);">
                        <h3 style="color: #1d1d1f; font-weight: 600; margin-top: 0;">Order Receipt</h3>
                        <p style="color: #1d1d1f; font-size: 14px;"><strong>Order ID:</strong> ${orderDetails.id}</p>
                        <p style="color: #1d1d1f; font-size: 14px;"><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
                        
                        <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 20px 0;" />
                        
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr>
                                <td style="padding: 10px 0; color: #1d1d1f; font-weight: 600;">Total Amount Paid</td>
                                <td style="padding: 10px 0; color: #0071e3; font-weight: bold; text-align: right; font-size: 18px;">$${orderDetails.totalAmount.toFixed(2)}</td>
                            </tr>
                        </table>
                        
                        <div style="margin-top: 30px; padding: 15px; background-color: #f0fdf4; border-radius: 8px; color: #166534; font-size: 14px; text-align: center;">
                            🌿 This order was processed with 100% carbon-neutral shipping.
                        </div>
                    </div>
                    
                    <div style="text-align: center; margin-top: 30px; color: #86868b; font-size: 12px;">
                        <p>If you have any questions about your order, please reply to this email.</p>
                        <p>&copy; ${new Date().getFullYear()} Eco-Hive Inc. All rights reserved.</p>
                    </div>
                </div>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        
        console.log("Email sent successfully!");
        console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
        
        return info;
    } catch (error) {
        console.error("Failed to send receipt email:", error);
        throw error;
    }
};

module.exports = {
    sendReceiptEmail
};
