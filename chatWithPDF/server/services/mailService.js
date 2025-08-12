import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config({ path: "../.env" });

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });


const sendMailForVerification = async (email, verificationLink) => {
    try {
        const mailOptions = {
            from: `Authentication System <${process.env.SENDER_EMAIL}>`,
            to: email,
            subject:  "Verify your account",
            text:`Thank you for the registration! Please verify your account to complete your account setup.
            This verification link will expire in 10 minutes, if you did not create an account, please ignore this email.
            Click here to verify your account: ${verificationLink}`,
            html: `<p>Please click on the following link to verify your account: ${verificationLink} </p>`
        }

        const response =  await transporter.sendMail(mailOptions);
        console.log("Verification email sent successfully:", response.messageId);
        return true;
    }
    catch(err){
        console.log("Error sending verification email:", err);
        return false;
    }
    
};

export { sendMailForVerification };