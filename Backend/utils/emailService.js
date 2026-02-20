const axios = require('axios');

const OTP_SERVICE_URL = 'http://localhost:5001/api';

const sendEmailOtp = async (email) => {
    try {
        const response = await axios.post(`${OTP_SERVICE_URL}/otp/generate`, {
            email,
            type: 'numeric',
            organization: 'HouseRentLk',
            subject: 'HouseRentLk Verification Code'
        });
        return true;
    } catch (error) {
        console.error('Email OTP send error:', error.response?.data || error.message);
        return false;
    }
};

const verifyEmailOtp = async (email, otp) => {
    try {
        await axios.post(`${OTP_SERVICE_URL}/otp/verify`, { email, otp });
        return true;
    } catch (error) {
        console.error('Email OTP verify error:', error.response?.data || error.message);
        return false;
    }
};

module.exports = { sendEmailOtp, verifyEmailOtp };
