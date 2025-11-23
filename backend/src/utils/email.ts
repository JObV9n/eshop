import nodemailer from 'nodemailer';
import { Order } from '@vue-eshop/shared';

interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

// Create reusable transporter
let transporter: nodemailer.Transporter | null = null;

// Initialize transporter with Ethereal or production SMTP
const getTransporter = async (): Promise<nodemailer.Transporter> => {
  if (transporter) {
    return transporter;
  }

  let config: EmailConfig;

  if (process.env.NODE_ENV === 'production') {
    // Production SMTP configuration
    config = {
      host: process.env.SMTP_HOST!,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER!,
        pass: process.env.SMTP_PASS!,
      },
    };
  } else {
    // Development: Create Ethereal test account
    const testAccount = await nodemailer.createTestAccount();
    config = {
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    };
    console.log('📧 Ethereal Email Account Created:');
    console.log('   User:', testAccount.user);
    console.log('   Pass:', testAccount.pass);
  }

  transporter = nodemailer.createTransport(config);
  return transporter;
};

// Generate order receipt email HTML
const generateOrderReceiptHTML = (order: any): string => {
  const orderItems = order.items
    .map(
      (item: any) => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">
          <img src="${item.image}" alt="${item.name}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px;" />
        </td>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">
          <strong>${item.name}</strong>
        </td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">
          ${item.qty}
        </td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">
          $${item.price}
        </td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">
          <strong>$${(item.qty * parseFloat(item.price)).toFixed(2)}</strong>
        </td>
      </tr>
    `
    )
    .join('');

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Order Receipt - ${order.id}</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <h1 style="color: #2c3e50; margin: 0;">Thank You for Your Order!</h1>
        <p style="color: #7f8c8d; margin: 10px 0 0 0;">Order #${order.id}</p>
      </div>

      <div style="background-color: #fff; padding: 20px; border: 1px solid #dee2e6; border-radius: 8px; margin-bottom: 20px;">
        <h2 style="color: #2c3e50; margin-top: 0;">Order Summary</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background-color: #f8f9fa;">
              <th style="padding: 10px; text-align: left; border-bottom: 2px solid #dee2e6;">Image</th>
              <th style="padding: 10px; text-align: left; border-bottom: 2px solid #dee2e6;">Product</th>
              <th style="padding: 10px; text-align: center; border-bottom: 2px solid #dee2e6;">Qty</th>
              <th style="padding: 10px; text-align: right; border-bottom: 2px solid #dee2e6;">Price</th>
              <th style="padding: 10px; text-align: right; border-bottom: 2px solid #dee2e6;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${orderItems}
          </tbody>
        </table>
      </div>

      <div style="background-color: #fff; padding: 20px; border: 1px solid #dee2e6; border-radius: 8px; margin-bottom: 20px;">
        <h2 style="color: #2c3e50; margin-top: 0;">Order Details</h2>
        <table style="width: 100%;">
          <tr>
            <td style="padding: 8px 0;"><strong>Items Price:</strong></td>
            <td style="text-align: right; padding: 8px 0;">$${order.itemsPrice}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0;"><strong>Shipping Price:</strong></td>
            <td style="text-align: right; padding: 8px 0;">$${order.shippingPrice}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0;"><strong>Tax Price:</strong></td>
            <td style="text-align: right; padding: 8px 0;">$${order.taxPrice}</td>
          </tr>
          <tr style="border-top: 2px solid #dee2e6;">
            <td style="padding: 12px 0;"><strong style="font-size: 1.2em;">Total Price:</strong></td>
            <td style="text-align: right; padding: 12px 0;"><strong style="font-size: 1.2em; color: #28a745;">$${order.totalPrice}</strong></td>
          </tr>
        </table>
      </div>

      <div style="background-color: #fff; padding: 20px; border: 1px solid #dee2e6; border-radius: 8px; margin-bottom: 20px;">
        <h2 style="color: #2c3e50; margin-top: 0;">Shipping Address</h2>
        <p style="margin: 5px 0;"><strong>${order.shippingAddress.fullName}</strong></p>
        <p style="margin: 5px 0;">${order.shippingAddress.streetAddress}</p>
        <p style="margin: 5px 0;">${order.shippingAddress.city}, ${order.shippingAddress.postalCode}</p>
        <p style="margin: 5px 0;">${order.shippingAddress.country}</p>
      </div>

      <div style="background-color: #fff; padding: 20px; border: 1px solid #dee2e6; border-radius: 8px; margin-bottom: 20px;">
        <h2 style="color: #2c3e50; margin-top: 0;">Payment Information</h2>
        <p style="margin: 5px 0;"><strong>Payment Method:</strong> ${order.paymentMethod}</p>
        <p style="margin: 5px 0;">
          <strong>Payment Status:</strong> 
          <span style="color: ${order.isPaid ? '#28a745' : '#dc3545'}; font-weight: bold;">
            ${order.isPaid ? 'Paid' : 'Not Paid'}
          </span>
        </p>
        ${order.isPaid && order.paidAt ? `<p style="margin: 5px 0;"><strong>Paid At:</strong> ${new Date(order.paidAt).toLocaleString()}</p>` : ''}
      </div>

      <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center;">
        <p style="margin: 0; color: #7f8c8d;">
          Thank you for shopping with us!<br>
          If you have any questions, please contact our support team.
        </p>
      </div>

      <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #dee2e6; text-align: center; color: #7f8c8d; font-size: 0.9em;">
        <p>&copy; ${new Date().getFullYear()} eshop. All rights reserved.</p>
      </div>
    </body>
    </html>
  `;
};

// Send order receipt email
export const sendOrderReceipt = async (
  order: any,
  customerEmail: string,
  customerName: string
): Promise<boolean> => {
  try {
    const transport = await getTransporter();

    const mailOptions = {
      from: process.env.SENDER_EMAIL || 'noreply@eshop.com',
      to: customerEmail,
      subject: `Order Confirmation - Order #${order.id}`,
      html: generateOrderReceiptHTML(order),
    };

    const info = await transport.sendMail(mailOptions);

    if (process.env.NODE_ENV !== 'production') {
      console.log('📧 Order Receipt Email Sent!');
      console.log('   Preview URL:', nodemailer.getTestMessageUrl(info));
      console.log('   To:', customerEmail);
      console.log('   Order ID:', order.id);
    }

    return true;
  } catch (error) {
    console.error('❌ Error sending order receipt email:', error);
    return false;
  }
};

// Send welcome email
export const sendWelcomeEmail = async (
  email: string,
  name: string
): Promise<boolean> => {
  try {
    const transport = await getTransporter();

    const mailOptions = {
      from: process.env.SENDER_EMAIL || 'noreply@eshop.com',
      to: email,
      subject: 'Welcome to eshop!',
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to eshop</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #f8f9fa; padding: 30px; border-radius: 8px; text-align: center; margin-bottom: 20px;">
            <h1 style="color: #2c3e50; margin: 0;">Welcome to eshop!</h1>
            <p style="color: #7f8c8d; margin: 10px 0 0 0; font-size: 1.1em;">Hi ${name}, we're excited to have you!</p>
          </div>

          <div style="background-color: #fff; padding: 20px; border: 1px solid #dee2e6; border-radius: 8px; margin-bottom: 20px;">
            <p>Thank you for creating an account with eshop. You now have access to:</p>
            <ul style="line-height: 2;">
              <li>Fast and secure checkout</li>
              <li>Order tracking and history</li>
              <li>Exclusive deals and offers</li>
              <li>Personalized shopping experience</li>
            </ul>
          </div>

          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center;">
            <p style="margin: 0; color: #7f8c8d;">
              Happy shopping!<br>
              The eshop Team
            </p>
          </div>

          <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #dee2e6; text-align: center; color: #7f8c8d; font-size: 0.9em;">
            <p>&copy; ${new Date().getFullYear()} eshop. All rights reserved.</p>
          </div>
        </body>
        </html>
      `,
    };

    const info = await transport.sendMail(mailOptions);

    if (process.env.NODE_ENV !== 'production') {
      console.log('📧 Welcome Email Sent!');
      console.log('   Preview URL:', nodemailer.getTestMessageUrl(info));
      console.log('   To:', email);
    }

    return true;
  } catch (error) {
    console.error('❌ Error sending welcome email:', error);
    return false;
  }
};

// Test email configuration
export const testEmailConnection = async (): Promise<boolean> => {
  try {
    const transport = await getTransporter();
    await transport.verify();
    console.log('✅ Email server is ready to send messages');
    return true;
  } catch (error) {
    console.error('❌ Email server connection failed:', error);
    return false;
  }
};
