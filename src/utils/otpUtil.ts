import { createTransport } from "nodemailer";

// transporter to send mail 
const transporter = createTransport({
    service: "Gmail",
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
        user: process.env.USER_EMAIL,
        pass: process.env.APP_PASS
    },
});

// generate a random 6 digit otp
const generateOtp = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// otp sender function
const sendOtp = async (mailToSend: string, otp: string): Promise<boolean> => {
    // mail sender configuration
    const mailOptions = {
        from: process.env.USER_EMAIL,
        to: mailToSend,
        subject: "Blog API OTP",
        text: `Your email verification otp for Blog API\nIt's valid for only 2 minutes`,
		html: `<h1>${otp}</h1>`
    };

    // sending mail and returning true or false according to success of process
    try {
        await transporter.sendMail(mailOptions);
        return true;
    } catch (error) {
        console.error("❌ Error sending email: ", error);
        return false;
    }
}

export { generateOtp, sendOtp };