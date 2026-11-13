const nodemailer = require('nodemailer');
const hbs = require('nodemailer-express-handlebars');
const path = require('path');
const { BREVO_SMTP_USER, EMAIL_FROM, EMAIL_REPLY_TO } = require('../../../utils/emailUtils');
import { requireInternalOrAdmin } from '@/utils/auth';


export default async function handler(req, res) {
  if (!requireInternalOrAdmin(req, res)) return;

  // resetUrl : lien de réinitialisation (forgot-password.js) ; password : le
  // nouveau mot de passe, une fois le lien ouvert (reset-password.js).
  const { email, password, resetUrl } = req.body

  const transporter = nodemailer.createTransport({
    host: 'smtp-relay.brevo.com',
    port: 587,
    secure: false,
    auth: {
      user: BREVO_SMTP_USER,
      pass: process.env.BREVO_KEY
    },
    tls: {rejectUnauthorized: false}
  });

  transporter.use('compile', hbs({
    viewEngine: {
      extName: '.hbs',
      partialsDir: path.resolve('./views/emails'),
      defaultLayout: false,
    },
    viewPath: path.resolve('./views/emails'),
    extName: '.hbs',
  }));

  const mailOptions = {
    from: EMAIL_FROM,
    replyTo: EMAIL_REPLY_TO,
    to: email,
    subject: resetUrl ? "Réinitialisation de votre mot de passe" : "Votre nouveau mot de passe !",
    template: resetUrl ? 'resetpassword' : 'newpassword',
    context: {
        password: password,
        resetUrl: resetUrl,
        siteUrl: process.env.WEBSITE_URL,
    }
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      res.json(error)
      // return console.log(error);
    }
    console.log('Message sent: %s', info.messageId);
    res.status(200).json({ status: 'sended' })
  });

}