## SMTP Setup

The contact form now sends through your own SMTP server using the Node backend in `serve.js`.

### Files

- `serve.js`: serves the site and handles `POST /api/contact`
- `.env`: holds your SMTP credentials
- `.env.example`: starter config
- `script.js`: sends form data to `/api/contact`

### 1. Install dependency

Run:

```powershell
npm.cmd install
```

This installs `nodemailer`.

### 2. Create your `.env`

Copy `.env.example` to `.env`, then fill in your real SMTP values.

Required values:

- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_SECURE`
- `SMTP_USER`
- `SMTP_PASS`
- `SMTP_FROM_EMAIL`
- `SMTP_FROM_NAME`
- `CONTACT_TO_EMAIL`

### Gmail example

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-google-app-password
SMTP_FROM_EMAIL=your-email@gmail.com
SMTP_FROM_NAME=Cañete CG Bryle C. Portfolio
CONTACT_TO_EMAIL=cgbryle@gmail.com
```

If you use Gmail, use an App Password, not your regular account password.

### 3. Start the site

Run:

```powershell
node serve.js
```

Open:

```text
http://localhost:4173
```

### 4. How sender info appears

With SMTP, the email will come from your configured mailbox in `SMTP_FROM_EMAIL`, but the visitor's email will be set as `Reply-To`.

The incoming email subject includes the sender's name:

```text
New portfolio inquiry from Jane Doe: Project inquiry
```

The message body also includes:

- sender name
n- sender email
- subject
- message

### 5. Deploying later

When you deploy this site, keep the SMTP credentials only on the server. Do not move them back into client-side JavaScript.

