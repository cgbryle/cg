## EmailJS Setup

Use this setup in your EmailJS dashboard so the contact form on your portfolio sends correctly.

### 1. Create an Email Service

In EmailJS, connect the email account where you want to receive messages:

- Recipient email: `cgbryle@gmail.com`

After creating it, copy your:

- `Service ID`

### 2. Create an Email Template

Use these template variables exactly:

- `{{from_name}}`
- `{{reply_to}}`
- `{{subject}}`
- `{{message}}`
- `{{to_name}}`
- `{{to_email}}`
- `{{source}}`

Suggested template:

Subject:

```text
New portfolio inquiry: {{subject}}
```

Email body:

```text
Hello {{to_name}},

You received a new message from your {{source}} contact form.

Name: {{from_name}}
Email: {{reply_to}}
Subject: {{subject}}

Message:
{{message}}
```

Set these template fields if EmailJS asks for them:

- `To email`: `{{to_email}}`
- `Reply to`: `{{reply_to}}`

After saving, copy your:

- `Template ID`

### 3. Get Your Public Key

From EmailJS account settings, copy your:

- `Public Key`

### 4. Paste the Keys Into Your Site

Open:

- `index.html`

Find:

```html
window.emailjsConfig = {
  publicKey: "YOUR_EMAILJS_PUBLIC_KEY",
  serviceId: "YOUR_EMAILJS_SERVICE_ID",
  templateId: "YOUR_EMAILJS_TEMPLATE_ID"
};
```

Replace those placeholder values with your real EmailJS values.

### 5. Test

Submit the form from your portfolio site and confirm:

- You receive the email at `cgbryle@gmail.com`
- The sender email appears as the reply-to address
- The subject and message show correctly

### Notes

- EmailJS public keys are meant to be used on the client side.
- For better spam protection, enable EmailJS rate limiting or reCAPTCHA in your EmailJS dashboard.
