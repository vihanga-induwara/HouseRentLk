const twilio = require('twilio');

// Twilio is configured through env vars. Without credentials, messages are logged
// to the console in development and rejected in production.
let client = null;

const getClient = () => {
    if (client) return client;
    const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN } = process.env;
    if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) return null;
    client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
    return client;
};

// Normalise Sri Lankan numbers to E.164 (+94XXXXXXXXX). Returns null if invalid.
const normalizePhone = (raw) => {
    if (!raw) return null;
    let digits = String(raw).replace(/[^\d+]/g, '');
    if (digits.startsWith('+')) digits = digits.slice(1);
    if (digits.startsWith('0')) digits = '94' + digits.slice(1);
    if (!digits.startsWith('94')) digits = '94' + digits;
    return /^94\d{9}$/.test(digits) ? `+${digits}` : null;
};

const sendSms = async (to, body) => {
    const sms = getClient();

    if (!sms) {
        if (process.env.NODE_ENV === 'production') {
            throw new Error('SMS service is not configured');
        }
        console.log(`[SmsService] (dev, not sent) To: ${to} | ${body}`);
        return { dev: true };
    }

    return sms.messages.create({ from: process.env.TWILIO_PHONE_NUMBER, to, body });
};

module.exports = { sendSms, normalizePhone };
