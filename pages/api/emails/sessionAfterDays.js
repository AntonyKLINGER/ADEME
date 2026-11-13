import nodemailer from 'nodemailer';
import hbs from 'nodemailer-express-handlebars';
import path from 'path';
import { createMailOptions } from '../../../utils/emailUtils.js';
import { BREVO_SMTP_USER, EMAIL_FROM, EMAIL_REPLY_TO } from '../../../utils/emailUtils';
import { requireInternalOrAdmin } from '@/utils/auth';

export default async function handler(req, res) {
  if (!requireInternalOrAdmin(req, res)) return;
  const { prenom, email, isFirstEmailInLoop } = req.body;

  const transporter = nodemailer.createTransport({
    host: 'smtp-relay.brevo.com',
    port: 587,
    secure: false,
    auth: {
      user: BREVO_SMTP_USER,
      pass: process.env.BREVO_KEY
    },
    tls: { rejectUnauthorized: false }
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

  const baseMailOptions = {
    from: EMAIL_FROM,
    replyTo: EMAIL_REPLY_TO,
    to: email,
    subject: "Merci pour votre présence à la Rencontre Territoire Engagé Transition Ecologique",
    template: 'session_after_day',
    context: {
      prenom: prenom,
      siteUrl: process.env.WEBSITE_URL,
    }
  };

  const mailOptions = createMailOptions(baseMailOptions, isFirstEmailInLoop);

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      res.json(error);
      return console.log(error);
    }
    console.log('Message sent: %s', info.messageId);
    res.status(200).json({ status: 'sended' });
  });
}
