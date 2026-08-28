import { Resend } from "resend";
import dotenv from "dotenv";

dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);
const EMAIL_FROM = process.env.EMAIL_FROM || "onboarding@resend.dev";

export const emailService = {
  sendEmail: async ({
    to,
    subject,
    html,
  }: {
    to: string | string[];
    subject: string;
    html: string;
  }) => {
    try {
      const data = await resend.emails.send({
        from: EMAIL_FROM,
        to,
        subject,
        html,
      });
      return data;
    } catch (error: any) {
      console.error("Resend Email Error:", error.message);
      // We don't throw here to avoid failing the main transaction (e.g. order creation)
      return null;
    }
  },

  sendOrderConfirmationEmail: async (
    to: string,
    customerName: string,
    orderId: string,
    totalAmount: number,
    orderDate: Date,
    items: any[]
  ) => {
    const itemsHtml = items
      .map(
        (item) =>
          `<li>${item.product.name} (x${item.quantity}) - $${item.price.toFixed(2)}</li>`
      )
      .join("");

    const html = `
      <h2>Order Confirmation</h2>
      <p>Hi ${customerName},</p>
      <p>Your order <strong>#${orderId}</strong> has been placed successfully.</p>
      <p><strong>Date:</strong> ${new Date(orderDate).toLocaleDateString()}</p>
      <p><strong>Total Amount:</strong> $${totalAmount.toFixed(2)}</p>
      <h3>Order Items:</h3>
      <ul>
        ${itemsHtml}
      </ul>
      <p>Thank you for shopping with us!</p>
    `;

    return await emailService.sendEmail({
      to,
      subject: "Order Confirmation - Your Order has been received",
      html,
    });
  },

  sendOrderStatusEmail: async (
    to: string,
    customerName: string,
    orderId: string,
    status: string
  ) => {
    const html = `
      <h2>Order Update</h2>
      <p>Hi ${customerName},</p>
      <p>The status of your order <strong>#${orderId}</strong> has been updated to: <strong>${status}</strong>.</p>
      <p>Thank you!</p>
    `;

    return await emailService.sendEmail({
      to,
      subject: `Order Update - Status: ${status}`,
      html,
    });
  },

  sendPaymentStatusEmail: async (
    to: string,
    customerName: string,
    orderId: string,
    paymentStatus: string
  ) => {
    const html = `
      <h2>Payment Update</h2>
      <p>Hi ${customerName},</p>
      <p>The payment status for your order <strong>#${orderId}</strong> is now: <strong>${paymentStatus}</strong>.</p>
      <p>Thank you!</p>
    `;

    return await emailService.sendEmail({
      to,
      subject: `Payment ${paymentStatus} - Order #${orderId}`,
      html,
    });
  },
};
