exports.handler = async () => {
  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Access-Control-Allow-Origin": "*"
    },
    body: JSON.stringify({
      hasSMTP_HOST: Boolean(process.env.SMTP_HOST),
      hasSMTP_PORT: Boolean(process.env.SMTP_PORT),
      hasSMTP_SECURE: Boolean(process.env.SMTP_SECURE),
      hasSMTP_USER: Boolean(process.env.SMTP_USER),
      hasSMTP_PASS: Boolean(process.env.SMTP_PASS),
      hasSMTP_FROM_EMAIL: Boolean(process.env.SMTP_FROM_EMAIL),
      hasSMTP_FROM_NAME: Boolean(process.env.SMTP_FROM_NAME),
      hasCONTACT_TO_EMAIL: Boolean(process.env.CONTACT_TO_EMAIL),
      nodeVersion: process.version
    })
  };
};
