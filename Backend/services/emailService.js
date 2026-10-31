const nodemailer = require('nodemailer');

// SMTP is configured through env vars. Without SMTP_HOST, emails are logged to the
// console in development and rejected in production so failures are never silent.
let transporter = null;

const getTransporter = () => {
    if (transporter) return transporter;
    if (!process.env.SMTP_HOST) return null;

    transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT || 587),
        secure: process.env.SMTP_SECURE === 'true',
        auth: process.env.SMTP_USER
            ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
            : undefined,
    });
    return transporter;
};

const escapeHtml = (str) => String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

// In tests, messages are collected here instead of being sent
const outbox = [];

const sendEmail = async ({ to, subject, text, html }) => {
    if (process.env.NODE_ENV === 'test') {
        outbox.push({ to, subject, text, html });
        return { test: true };
    }

    const transport = getTransporter();

    if (!transport) {
        if (process.env.NODE_ENV === 'production') {
            throw new Error('Email service is not configured');
        }
        console.log(`[EmailService] (dev, not sent) To: ${to} | ${subject}\n${text}`);
        return { dev: true };
    }

    return transport.sendMail({
        from: process.env.EMAIL_FROM || process.env.SMTP_USER,
        to,
        subject,
        text,
        html,
    });
};

// Simple branded layout with a single call-to-action button
const actionEmail = ({ heading, message, actionText, actionUrl }) => ({
    text: `${heading}\n\n${message}\n\n${actionText}: ${actionUrl}\n\nIf you did not request this, you can ignore this email.`,
    html: `
        <div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;padding:24px;color:#0f172a">
            <h2 style="margin:0 0 12px">${escapeHtml(heading)}</h2>
            <p style="line-height:1.5">${escapeHtml(message)}</p>
            <p style="margin:24px 0">
                <a href="${escapeHtml(actionUrl)}" style="background:#2563eb;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;display:inline-block">${escapeHtml(actionText)}</a>
            </p>
            <p style="font-size:12px;color:#64748b">If the button does not work, copy this link: ${escapeHtml(actionUrl)}</p>
            <p style="font-size:12px;color:#64748b">If you did not request this, you can ignore this email.</p>
        </div>`,
});

module.exports = { sendEmail, actionEmail, escapeHtml, outbox };
