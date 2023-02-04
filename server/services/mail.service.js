const nodemailer = require('nodemailer');

const { google } = require("googleapis");
const OAuth2 = google.auth.OAuth2;

const OAuth2Client = new OAuth2(
    process.env.GMAIL_CLIENT_ID,
    process.env.GMAIL_CLIENT_SECRET,
    process.env.GMAIL_REDIRECT_URI
)

OAuth2Client.setCredentials({
    refresh_token: process.env.GMAIL_REFRESH_TOKEN
});

class MailService {
    constructor() {
        this.myAccessToken = OAuth2Client.getAccessToken();
        this.transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                type: 'OAuth2',
                user: process.env.SMTP_USER,
                clientId: process.env.GMAIL_CLIENT_ID,
                clientSecret: process.env.GMAIL_CLIENT_SECRET,
                refreshToken: process.env.GMAIL_REFRESH_TOKEN,
                accessToken: this.myAccessToken,
            }
        })
    }

    sendActivationMail = async (to, link) => {
        await this.transporter.sendMail({
            from: process.env.SMTP_USER,
            to,
            subject: 'Account activation on ' + process.env.API_URL,
            text: '',
            html:
                `
                <div>
                   <h1>Follow the link to activate your account</h1>
                   <a href="${ link }">${link}</a>
                </div>
            `
        })
    }
}

module.exports = new MailService();