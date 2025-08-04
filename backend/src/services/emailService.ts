import nodemailer from "nodemailer";

let testTransporter: nodemailer.Transporter | null = null;

const createRealTransporter = () => {
  console.log("📦 Using real SMTP transporter with:", {
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: process.env.EMAIL_SECURE,
    user: process.env.EMAIL_USER ? "[redacted]" : undefined,
  });

  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT),
    secure: process.env.EMAIL_SECURE === "true",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

const getTestTransporter = async () => {
  if (testTransporter) return testTransporter;
  const testAccount = await nodemailer.createTestAccount();
  testTransporter = nodemailer.createTransport({
    host: testAccount.smtp.host,
    port: testAccount.smtp.port,
    secure: testAccount.smtp.secure,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });
  console.log("📦 Using Ethereal test account. Preview emails from console.");
  return testTransporter;
};

export const sendEmail = async (to: string, subject: string, html: string) => {
  const useEthereal = process.env.USE_ETHEREAL === "true";
  let transporter: nodemailer.Transporter;

  if (useEthereal) {
    transporter = await getTestTransporter();
  } else {
    transporter = createRealTransporter();
  }

  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || '"No Reply" <no-reply@example.com>',
      to,
      subject,
      html,
    });

    if (useEthereal) {
      console.log(
        "🟢 Ethereal preview URL:",
        nodemailer.getTestMessageUrl(info)
      );
    } else {
      console.log("✅ Email sent via real SMTP, messageId:", info.messageId);
    }
  } catch (err) {
    console.warn("Email send failed (non-blocking):", err);
    throw err; // or swallow depending on your flow
  }
};
