import nodemailer from 'nodemailer';
import hbs from 'nodemailer-express-handlebars';
import path from 'path';
import { createMailOptions } from '../../../utils/emailUtils.js';
import { BREVO_SMTP_USER, EMAIL_FROM, EMAIL_REPLY_TO } from '../../../utils/emailUtils';
import { requireInternalOrAdmin } from '@/utils/auth';

export default async function handler(req, res) {
  if (!requireInternalOrAdmin(req, res)) return;
  const { prenom, email, nomRencontre, dateRencontre, lieuRencontre, nbJours, mail_referent, isFirstEmailInLoop } = req.body;

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
    subject: "Vous avez participé à une Rencontre Territoire Engagé il y a quelques mois ... Quel impact sur votre métier ?",
    template: 'questionnaire_impact',
    context: {
      prenom: prenom,
      siteUrl: process.env.WEBSITE_URL,
      nomRencontre: nomRencontre,
      dateRencontre: dateRencontre,
      lieuRencontre: lieuRencontre,
      nbJours: nbJours,
      mail_referent: mail_referent,
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
