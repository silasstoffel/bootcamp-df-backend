const secure =
    typeof process.env.MAIL_SECURE !== 'undefined' &&
    process.env.MAIL_SECURE === 'true';

const port =
    typeof process.env.MAIL_PORT !== 'undefined' && process.env.MAIL_PORT === ''
        ? parseInt(process.env.MAIL_PORT, 10)
        : 2525;

export default {
    host: process.env.MAIL_HOST,
    port,
    secure,
    auth: {
        user: process.env.MAIL_AUTH_USER,
        pass: process.env.MAIL_AUTH_PWD,
    },
    default: {
        from: process.env.MAIL_SEND_FROM,
    },
};
