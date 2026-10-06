require('dotenv').config();

const nodemailer = require('nodemailer');

async function main() {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(
      process.env.SMTP_PORT || 465,
    ),
    secure:
      String(
        process.env.SMTP_SECURE,
      ).toLowerCase() === 'true',

    auth: {
      user:
        process.env.SMTP_USER,

      pass:
        process.env.SMTP_APP_PASSWORD,
    },
  });

  console.log(
    'Test connexion SMTP Gmail...',
  );

  await transporter.verify();

  console.log(
    '✅ SMTP Gmail connecté avec succès',
  );
}

main().catch((error) => {
  console.error(
    '❌ Erreur SMTP :',
    error.message,
  );

  process.exit(1);
});