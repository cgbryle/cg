const http = require("http");
const fs = require("fs");
const path = require("path");
const nodemailer = require("nodemailer");

const port = Number(process.env.PORT || 4173);
const root = __dirname;
const env = loadEnv(path.join(root, ".env"));

const smtpConfig = {
  host: process.env.SMTP_HOST || env.SMTP_HOST || "",
  port: Number(process.env.SMTP_PORT || env.SMTP_PORT || 587),
  secure: String(process.env.SMTP_SECURE || env.SMTP_SECURE || "false").toLowerCase() === "true",
  user: process.env.SMTP_USER || env.SMTP_USER || "",
  pass: process.env.SMTP_PASS || env.SMTP_PASS || "",
  fromEmail: process.env.SMTP_FROM_EMAIL || env.SMTP_FROM_EMAIL || process.env.SMTP_USER || env.SMTP_USER || "",
  fromName: process.env.SMTP_FROM_NAME || env.SMTP_FROM_NAME || "Portfolio Contact Form",
  toEmail: process.env.CONTACT_TO_EMAIL || env.CONTACT_TO_EMAIL || "cgbryle@gmail.com",
};

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
};

let transporter = null;
if (smtpConfig.host && smtpConfig.user && smtpConfig.pass) {
  transporter = nodemailer.createTransport({
    host: smtpConfig.host,
    port: smtpConfig.port,
    secure: smtpConfig.secure,
    auth: {
      user: smtpConfig.user,
      pass: smtpConfig.pass,
    },
  });
}

function loadEnv(filePath) {
  if (!fs.existsSync(filePath)) {
    return {};
  }

  const file = fs.readFileSync(filePath, "utf8");
  const result = {};

  for (const line of file.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const separatorIndex = trimmed.indexOf("=");
    if (separatorIndex === -1) {
      continue;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    const value = trimmed.slice(separatorIndex + 1).trim().replace(/^['"]|['"]$/g, "");
    result[key] = value;
  }

  return result;
}

function sendJson(res, statusCode, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(body),
  });
  res.end(body);
}

function escapeHtml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function handleStatic(req, res) {
  const urlPath = req.url === "/" ? "/index.html" : req.url;
  const safePath = path.normalize(urlPath).replace(/^(\.\.[/\\])+/, "");
  const filePath = path.join(root, safePath);

  fs.readFile(filePath, (error, data) => {
    if (error) {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("Not Found");
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, {
      "Content-Type": mimeTypes[ext] || "application/octet-stream",
    });
    res.end(data);
  });
}

async function handleContact(req, res) {
  if (!transporter) {
    sendJson(res, 500, {
      message: "SMTP is not configured yet. Add your SMTP credentials to the .env file.",
    });
    return;
  }

  let rawBody = "";
  req.on("data", (chunk) => {
    rawBody += chunk;
    if (rawBody.length > 1_000_000) {
      req.destroy();
    }
  });

  req.on("end", async () => {
    try {
      const data = JSON.parse(rawBody || "{}");
      const fromName = String(data.from_name || "").trim();
      const replyTo = String(data.reply_to || "").trim();
      const subject = String(data.subject || "Portfolio Inquiry").trim();
      const message = String(data.message || "").trim();
      const source = String(data.source || "Portfolio Website").trim();

      if (!fromName || !replyTo || !message) {
        sendJson(res, 400, { message: "Please complete your name, email, and message." });
        return;
      }

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

      sendJson(res, 200, { message: "Message sent successfully." });
    } catch (error) {
      sendJson(res, 500, {
        message: "Unable to send your message right now. Please try again later or email me directly.",
      });
    }
  });
}

http
  .createServer((req, res) => {
    if (req.method === "POST" && req.url === "/api/contact") {
      handleContact(req, res);
      return;
    }

    if (req.method === "GET") {
      handleStatic(req, res);
      return;
    }

    res.writeHead(405, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Method Not Allowed");
  })
  .listen(port, () => {
    console.log(`Portfolio server running at http://localhost:${port}`);
  });
