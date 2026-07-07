import nodemailer from "nodemailer";

interface EmailOptions {
  email: string;
  subject: string;
  message: string;
}

export const sendEmail = async (options: EmailOptions) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    const mailOptions = {
      from: `"${process.env.FROM_NAME}" <${process.env.FROM_EMAIL}>`,
      to: options.email,
      subject: options.subject,
      text: options.message,
      html: `
        <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: auto; padding: 40px; border: 1px solid #2a2a2a; border-radius: 16px; background-color: #121212; color: #ffffff;">
          <div style="display: flex; align-items: center; margin-bottom: 30px;">
            <div style="background-color: #3ecf8e; width: 40px; height: 40px; border-radius: 8px; display: flex; align-items: center; justify-center; margin-right: 15px;">
              <span style="color: #000; font-weight: bold; font-size: 20px;">🎓</span>
            </div>
            <h1 style="color: #ffffff; margin: 0; font-size: 24px; letter-spacing: -1px;">NSTI <span style="color: #3ecf8e;">KANPUR</span></h1>
          </div>
          
          <h2 style="color: #3ecf8e; font-size: 20px; margin-bottom: 20px;">${options.subject}</h2>
          
          <div style="background-color: #1c1c1c; padding: 25px; border-radius: 12px; border: 1px solid #2a2a2a; line-height: 1.6; color: #e5e7eb;">
            ${options.message.replace(/\n/g, "<br>")}
          </div>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #2a2a2a; text-align: center;">
            <p style="font-size: 14px; color: #666;">This is an automated notification from the NSTI Kanpur LMS Portal.</p>
            <p style="font-size: 12px; color: #444;">&copy; 2025 NSTI Kanpur • Ministry of Skill Development & Entrepreneurship</p>
          </div>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent: %s", info.messageId);
    return info;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};
