const nodemailer = require("nodemailer");

function json(statusCode, payload) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
    },
    body: JSON.stringify(payload),
  };
}

function escapeHtml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return json(204, {});
  }

  if (event.httpMethod !== "POST") {
    return json(405, { message: "Method Not Allowed" });
  }

  const smtpConfig = {
    host: process.env.SMTP_HOST || "",
    port: Number(process.env.SMTP_PORT || 587),
    secure: String(process.env.SMTP_SECURE || "false").toLowerCase() === "true",
    user: process.env.SMTP_USER || "",
    pass: process.env.SMTP_PASS || "",
    fromEmail: process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER || "",
    fromName: process.env.SMTP_FROM_NAME || "Portfolio Contact Form",
    toEmail: process.env.CONTACT_TO_EMAIL || "cgbryle@gmail.com",
  };

  if (!smtpConfig.host || !smtpConfig.user || !smtpConfig.pass) {
    return json(500, {
      message: "SMTP is not configured in Netlify environment variables yet.",
      debug: {
        hasSMTP_HOST: Boolean(process.env.SMTP_HOST),
        hasSMTP_USER: Boolean(process.env.SMTP_USER),
        hasSMTP_PASS: Boolean(process.env.SMTP_PASS),
      },
    });
  }

  try {
    const data = JSON.parse(event.body || "{}");
    const fromName = String(data.from_name || "").trim();
    const replyTo = String(data.reply_to || "").trim();
    const subject = String(data.subject || "Portfolio Inquiry").trim();
    const message = String(data.message || "").trim();
    const source = String(data.source || "Portfolio Website").trim();

    if (!fromName || !replyTo || !message) {
      return json(400, {
        message: "Please complete your name, email, and message.",
      });
    }

    const transporter = nodemailer.createTransport({
      host: smtpConfig.host,
      port: smtpConfig.port,
      secure: smtpConfig.secure,
      auth: {
        user: smtpConfig.user,
        pass: smtpConfig.pass,
      },
    });

    const mailSubject = `New portfolio inquiry from ${fromName}: ${subject}`;
    const text = [
      `Source: ${source}`,
      `Name: ${fromName}`,
      `Email: ${replyTo}`,
      `Subject: ${subject}`,
      "",
      "Message:",
      message,
    ].join("\n");

    const html = `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111;max-width:680px;">
        <h2 style="margin-bottom:16px;">New Portfolio Inquiry</h2>
        <p><strong>Source:</strong> ${escapeHtml(source)}</p>
        <p><strong>Name:</strong> ${escapeHtml(fromName)}</p>
        <p><strong>Email:</strong> ${escapeHtml(replyTo)}</p>
        <p><strong>Subject:</strong> ${escapeHtml(subject)}</p>
        <p><strong>Message:</strong></p>
        <p>${escapeHtml(message).replace(/\n/g, "<br>")}</p>
      </div>
    `;

    await transporter.sendMail({
      from: `"${smtpConfig.fromName}" <${smtpConfig.fromEmail}>`,
      to: smtpConfig.toEmail,
      replyTo,
      subject: mailSubject,
      text,
      html,
    });

    return json(200, { message: "Message sent successfully." });
  } catch (error) {
    return json(500, {
      message: error && error.message
        ? `Mail send failed: ${error.message}`
        : "Unable to send your message right now. Please try again later or contact me directly.",
    });
  }
};
