import nodemailer from "nodemailer";
import dotenv from "dotenv"
dotenv.config()

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});


const sendEmail = async (to, subject, payload = {}) => {
  const {
    html,
    fromName = "MTL Dispatch",
    fromEmail = process.env.GMAIL_USER,
    replyTo = null,
  } = payload || {};

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

  if (!process.env.GMAIL_USER || !process.env.GMAIL_PASS) {
    console.error("[sendEmail] SMTP credentials are missing");
    throw new Error("SMTP credentials are missing");
  }

  if (!html) {
    console.error("[sendEmail] HTML content is required");
    throw new Error("HTML content is required");
  }

  console.log(`[sendEmail] Sending → "${subject}" to: ${recipients.join(", ")}`);

  try {
    const info = await transporter.sendMail({
      from: `${fromName} <${fromEmail}>`,
      to: recipients.join(", "),
      replyTo: replyTo || fromEmail,
      subject: subject,
      html: html,
      text: `View this email in an HTML-enabled client. ${subject}`,
    });

    console.log(`[sendEmail] Email sent. ID: ${info.messageId}`);

    return {
      success: true,
      emailId: info.messageId,
      provider: "smtp",
      fromEmail,
      to: recipients,
    };

  } catch (error) {
    console.error("[sendEmail] Exception:", error.message);
    console.error("[sendEmail] Stack:", error.stack);

    return {
      success: false,
      error: error.message,
      skipped: true,
    };
  }
};

export default sendEmail;