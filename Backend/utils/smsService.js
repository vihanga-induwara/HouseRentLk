const twilio = require('twilio');

const sendSmsOtp = async (phone, otp) => {
    try {
        const accountSid = process.env.TWILIO_ACCOUNT_SID;
        const authToken = process.env.TWILIO_AUTH_TOKEN;
        const fromNumber = process.env.TWILIO_PHONE_NUMBER;

        if (!accountSid || !authToken || !fromNumber) {
            console.warn('Twilio credentials missing. Logging OTP instead:', otp);
            return true; // Mock success for development if no creds
        }

        const client = twilio(accountSid, authToken);

        await client.messages.create({
            body: `Your HouseRentLk verification code is: ${otp}`,
            from: fromNumber,
            to: phone,
        });

        return true;
    } catch (error) {
        console.error('SMS send error:', error);
        return false;
    }
};

module.exports = { sendSmsOtp };
