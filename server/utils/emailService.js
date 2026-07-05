const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

/**
 * Core multi-provider email sender
 */
const sendEmail = async ({ to, subject, html, attachments = [] }) => {
    const provider = (process.env.EMAIL_PROVIDER || '').toLowerCase();
    const from = process.env.EMAIL_FROM || 'Eco-Hive <no-reply@eco-hive.com>';

    if (provider === 'brevo') {
        const apiKey = process.env.BREVO_API_KEY;
        if (!apiKey) {
            throw new Error("BREVO_API_KEY is not defined in environment variables");
        }

        // Map attachments to Brevo format
        const brevoAttachments = attachments.map(att => {
            const content = fs.readFileSync(att.path).toString('base64');
            return {
                name: att.filename,
                content: content
            };
        });

        const body = {
            sender: {
                name: from.includes('<') ? from.split('<')[0].trim() : 'Eco-Hive',
                email: from.includes('<') ? from.split('<')[1].replace('>', '').trim() : from
            },
            to: [{ email: to }],
            subject: subject,
            htmlContent: html
        };

        if (brevoAttachments.length > 0) {
            body.attachment = brevoAttachments;
        }

        const response = await fetch('https://api.brevo.com/v3/smtp/email', {
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'api-key': apiKey,
                'content-type': 'application/json'
            },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            const errBody = await response.text();
            throw new Error(`Brevo API error: ${response.status} - ${errBody}`);
        }

        return { success: true };
    }

    if (provider === 'resend') {
        const apiKey = process.env.RESEND_API_KEY;
        if (!apiKey) {
            throw new Error("RESEND_API_KEY is not defined in environment variables");
        }

        // Map attachments to Resend format
        const resendAttachments = attachments.map(att => {
            const content = fs.readFileSync(att.path).toString('base64');
            return {
                filename: att.filename,
                content: content
            };
        });

        const body = {
            from: from,
            to: to,
            subject: subject,
            html: html
        };

        if (resendAttachments.length > 0) {
            body.attachments = resendAttachments;
        }

        const response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            const errBody = await response.text();
            throw new Error(`Resend API error: ${response.status} - ${errBody}`);
        }

        return { success: true };
    }

    // Default/Fallback: Nodemailer (SMTP / Ethereal)
    let transporter;
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
        transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT || '587'),
            secure: process.env.SMTP_PORT === '465',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            },
            connectionTimeout: 8000,
            greetingTimeout: 8000,
            socketTimeout: 8000
        });
    } else {
        console.log("No EMAIL_PROVIDER, BREVO_API_KEY, or SMTP credentials found. Falling back to Ethereal Email.");
        const testAccount = await nodemailer.createTestAccount();
        transporter = nodemailer.createTransport({
            host: "smtp.ethereal.email",
            port: 587,
            secure: false,
            auth: {
                user: testAccount.user,
                pass: testAccount.pass
            },
            connectionTimeout: 8000,
            greetingTimeout: 8000,
            socketTimeout: 8000
        });
    }

    const info = await transporter.sendMail({
        from: from,
        to: to,
        subject: subject,
        html: html,
        attachments: attachments
    });

    if (!process.env.SMTP_HOST) {
        console.log("[Nodemailer Ethereal] Email sent. Preview URL: %s", nodemailer.getTestMessageUrl(info));
    }

    return info;
};

/**
 * Send receipt email for completed orders
 */
const sendReceiptEmail = async (customerEmail, orderDetails) => {
    try {
        const subject = `Receipt for your Eco-Hive Order #${orderDetails.id}`;
        const html = `
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
        `;

        return sendEmail({
            to: customerEmail,
            subject,
            html
        });
    } catch (error) {
        console.error("Failed to send receipt email:", error);
        throw error;
    }
};

/**
 * Send security verification code (OTP)
 */
const sendOtpEmail = async (toEmail, userName, otpCode) => {
    const subject = "Eco-Hive Security Verification";
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Eco-Hive Security Verification</title>
  <style>
    body {
      font-family: 'Inter', Helvetica, Arial, sans-serif;
      background-color: #f7f9fc;
      margin: 0;
      padding: 0;
      -webkit-font-smoothing: antialiased;
    }
    .wrapper {
      width: 100%;
      background-color: #f7f9fc;
      padding: 40px 20px;
      box-sizing: border-box;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
      border: 1px solid #e1e8ed;
    }
    .header {
      background-color: #1d9e75;
      padding: 30px;
      text-align: center;
      color: #ffffff;
    }
    .content {
      padding: 40px 30px;
      color: #333333;
      line-height: 1.6;
    }
    .greeting {
      font-size: 18px;
      font-weight: 600;
      margin-bottom: 20px;
      color: #1d9e75;
    }
    .code-container {
      background-color: #f0fdf4;
      border: 2px dashed #1d9e75;
      border-radius: 12px;
      padding: 24px;
      text-align: center;
      margin: 30px 0;
    }
    .code {
      font-size: 36px;
      font-weight: 700;
      letter-spacing: 6px;
      color: #1d9e75;
      margin: 0;
    }
    .expiry {
      font-size: 14px;
      color: #666666;
      margin-top: 10px;
    }
    .footer {
      background-color: #f8fafc;
      padding: 24px 30px;
      text-align: center;
      font-size: 12px;
      color: #888888;
      border-top: 1px solid #edf2f7;
    }
    .footer p {
      margin: 4px 0;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <img src="cid:logo" alt="Eco-Hive Logo" style="height: 50px; object-fit: contain; margin-bottom: 10px; display: inline-block;">
        <h1 style="margin: 0; font-size: 24px; font-weight: bold; color: #ffffff;">Eco-Hive Security Verification</h1>
      </div>
      <div class="content">
        <div class="greeting">Hello ${userName},</div>
        <p>Your Eco-Hive verification code is:</p>
        <div class="code-container">
          <div class="code">${otpCode}</div>
          <div class="expiry">This code expires in 5 minutes.</div>
        </div>
        <p>If you did not request this verification, you may safely ignore this email.</p>
        <p style="margin-top: 40px; margin-bottom: 0;">Thank you,<br>Eco-Hive Team</p>
      </div>
      <div class="footer">
        <p>This is an automated security notification from Eco-Hive.</p>
        <p>&copy; ${new Date().getFullYear()} Eco-Hive. All rights reserved.</p>
      </div>
    </div>
  </div>
</body>
</html>
    `;

    const attachments = [];
    const logoPath = path.join(__dirname, '../logo.png');
    if (fs.existsSync(logoPath)) {
        attachments.push({
            filename: 'logo.png',
            path: logoPath,
            cid: 'logo'
        });
    }

    return sendEmail({
        to: toEmail,
        subject,
        html,
        attachments
    });
};

module.exports = {
    sendReceiptEmail,
    sendOtpEmail
};
