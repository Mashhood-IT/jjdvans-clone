// import { Resend } from 'resend';

// const resend = new Resend(process.env.RESEND_API_KEY);

// function toPlain(obj) {
//   if (!obj) return obj;
//   if (typeof obj?.toObject === "function") {
//     return obj.toObject({
//       depopulate: true,
//       getters: false,
//       virtuals: false,
//       flattenMaps: true,
//     });
//   }
//   try {
//     return JSON.parse(JSON.stringify(obj));
//   } catch {
//     return obj;
//   }
// }

// const escapeHtml = (v = "") =>
//   String(v).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");


// const sendEmail = async (to, subject, payload = {}) => {
//   const {
//     html,
//     fromName = "MTL Dispatch",
//     fromEmail = "noreply@mtldispatch.com",
//     replyTo = null
//   } = payload || {};

//   if (!to || (Array.isArray(to) && to.length === 0)) {
//     console.log("Invalid recipient:", to);
//     throw new Error("Invalid recipient email address");
//   }

//   const recipients = Array.isArray(to) ? to : [to];
//   for (const recipient of recipients) {
//     if (!recipient || !recipient.includes("@")) {
//       console.log("Invalid email address:", recipient);
//       throw new Error("Invalid email address format");
//     }
//   }

//   if (!process.env.RESEND_API_KEY) {
//     console.error("RESEND_API_KEY is not set in environment variables");
//     throw new Error("Resend API key is missing");
//   }

//   if (!html) {
//     console.error("HTML content is required for email templates");
//     throw new Error("HTML content is required");
//   }

//   try {
//     const { data: response, error } = await resend.emails.send({
//       from: `${fromName} <${fromEmail}>`,
//       to: recipients,
//       replyTo: replyTo || fromEmail,
//       subject: subject,
//       html: html,
//       text: `View this email in an HTML-enabled client. ${subject}`,
//     });

//     if (error) {
//       console.error("Resend Error:", error);
//       throw new Error(`Email sending failed: ${error.message}`);
//     }

//     return {
//       success: true,
//       emailId: response?.id,
//       provider: 'resend',
//       fromEmail: fromEmail,
//       to: recipients
//     };

//   } catch (error) {
//     console.error("Email sending failed:", error.message);
//     return {
//       success: false,
//       error: error.message,
//       skipped: true
//     };
//   }
// };

// export default sendEmail;

import nodemailer from "nodemailer";
import dotenv from "dotenv"
dotenv.config()

// ─── Create transporter (Gmail SMTP) ──────────────────────────────────────────
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // true for 465, false for 587
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS, // App password
  },
});

// ─────────────────────────────────────────────────────────────────────────────

const sendEmail = async (to, subject, payload = {}) => {
  const {
    html,
    fromName = "MTL Dispatch",
    fromEmail = process.env.GMAIL_USER,
    replyTo = null,
  } = payload || {};

  // ── Validate recipient ──────────────────────────────────────────────────────
  if (!to || (Array.isArray(to) && to.length === 0)) {
    console.error("[sendEmail] Invalid recipient:", to);
    throw new Error("Invalid recipient email address");
  }

  const recipients = Array.isArray(to) ? to : [to];
  for (const recipient of recipients) {
    if (!recipient || !recipient.includes("@")) {
      console.error("[sendEmail] Invalid email address:", recipient);
      throw new Error("Invalid email address format");
    }
  }

  // ── Validate SMTP credentials ───────────────────────────────────────────────
  if (!process.env.GMAIL_USER || !process.env.GMAIL_PASS) {
    console.error("[sendEmail] SMTP credentials are missing");
    throw new Error("SMTP credentials are missing");
  }

  // ── Validate HTML ───────────────────────────────────────────────────────────
  if (!html) {
    console.error("[sendEmail] HTML content is required");
    throw new Error("HTML content is required");
  }

  console.log(`[sendEmail] Sending → "${subject}" to: ${recipients.join(", ")}`);

  // ── Send email ──────────────────────────────────────────────────────────────
  try {
    const info = await transporter.sendMail({
      from: `${fromName} <${fromEmail}>`,
      to: recipients.join(", "),
      replyTo: replyTo || fromEmail,
      subject: subject,
      html: html,
      text: `View this email in an HTML-enabled client. ${subject}`,
    });

    console.log(`[sendEmail] ✅ Email sent. ID: ${info.messageId}`);

    return {
      success: true,
      emailId: info.messageId,
      provider: "smtp",
      fromEmail,
      to: recipients,
    };

  } catch (error) {
    console.error("[sendEmail] ❌ Exception:", error.message);
    console.error("[sendEmail]    Stack:", error.stack);

    return {
      success: false,
      error: error.message,
      skipped: true,
    };
  }
};

export default sendEmail;