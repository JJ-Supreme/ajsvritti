import { Resend } from "resend";

const FROM = process.env.RESEND_FROM_EMAIL || "Account Support <noreply@mailrelayhub.online>";

function client() {
  if (!process.env.RESEND_API_KEY) return null;
  return new Resend(process.env.RESEND_API_KEY);
}

export async function sendVerificationEmail(toEmail: string, otp: string, _baseUrl?: string) {
  const resend = client();
  if (!resend) {
    console.warn("RESEND_API_KEY not set — skipping verification email.");
    return;
  }
  const { error } = await resend.emails.send({
    from: FROM,
    to: toEmail,
    subject: "Your verification code – AJS Vision",
    html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px">
          <h2 style="margin-bottom:8px">Verify your email address</h2>
          <p style="color:#555;margin-bottom:24px">
            Use the code below to verify your account. It expires in <strong>10 minutes</strong>.
          </p>
          <div style="background:#f4f4f5;border-radius:8px;padding:24px;text-align:center;margin-bottom:24px">
            <span style="font-size:36px;font-weight:700;letter-spacing:12px;color:#111">${otp}</span>
          </div>
          <p style="color:#999;font-size:12px">
            If you didn't create an account, you can safely ignore this email.
          </p>
          <hr style="border:none;border-top:1px solid #eee;margin:24px 0">
          <p style="color:#bbb;font-size:11px">AJS Vision — ajsvision.shop</p>
        </div>
      `,
  });
  if (error) throw new Error(`Resend error: ${error.message}`);
}

interface OrderEmailParams {
  to: string;
  orderNumber: string;
  items: Array<{ product_name: string; unit_price: number; quantity: number }>;
  total: number;
  paymentMethod: string;
  address: string;
}

const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;

export async function sendOrderConfirmationEmail(p: OrderEmailParams) {
  const resend = client();
  if (!resend) {
    console.warn("RESEND_API_KEY not set — skipping order confirmation email.");
    return;
  }
  const rows = p.items
    .map(
      (i) => `<tr><td style="padding:8px 0;border-bottom:1px solid #eee;font-size:13px">${i.product_name} &times; ${i.quantity}</td><td style="padding:8px 0;border-bottom:1px solid #eee;font-size:13px;text-align:right">${inr(i.unit_price * i.quantity)}</td></tr>`
    )
    .join("");
  await resend.emails.send({
    from: FROM,
    to: p.to,
    subject: `Order Confirmed — #${p.orderNumber} | AJS Vision`,
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px 24px">
        <h2 style="margin-bottom:8px">Order Confirmed</h2>
        <p style="color:#555">Thanks for shopping with AJS Vritti Vision Marketing. Your order <strong>#${p.orderNumber}</strong> has been received.</p>
        <table style="width:100%;border-collapse:collapse;margin:16px 0">${rows}
          <tr><td style="padding:10px 0;font-weight:bold">Grand Total</td><td style="padding:10px 0;font-weight:bold;text-align:right">${inr(p.total)}</td></tr>
        </table>
        <p style="color:#555;font-size:13px">Payment: <strong>${p.paymentMethod === "cod" ? "Cash on Delivery" : "Online Payment"}</strong></p>
        <p style="color:#555;font-size:13px">Shipping to: ${p.address}</p>
        <hr style="border:none;border-top:1px solid #eee;margin:24px 0">
        <p style="color:#bbb;font-size:11px">AJS Vision — ajsvision.shop</p>
      </div>`,
  });
}
