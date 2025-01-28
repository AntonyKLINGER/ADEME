import nodemailer from 'nodemailer';
import hbs from 'nodemailer-express-handlebars';
import path from 'path';

export default async function handler(req, res) {
  const { prenom, email, nomRencontre, dateRencontre, lieuRencontre, nbJours, mail_referent, firstDayStartTime } = req.body;

  const startTime = firstDayStartTime.split('-')[0].trim();

  const transporter = nodemailer.createTransport({
    host: 'smtp-relay.brevo.com',
    port: 587,
    secure: false,
    auth: {
      user: 'contact@territoiresentransitions.fr',
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

  const mailOptions = {
    from: '"ADEME" <contact@territoiresentransitions.fr>',
    to: email,
    subject: "[Rappel] : "+dateRencontre+" - Rencontre Territoire Engagé Transition Ecologique",
    template: 'session_relance_days',
    context: {
      prenom: prenom,
      siteUrl: process.env.WEBSITE_URL,
      nomRencontre: nomRencontre,
      lieuRencontre: lieuRencontre,
      nbJours: nbJours,
      dateRencontre: dateRencontre,
      mail_referent: mail_referent,
      firstDayStartTime: startTime,
    }
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      res.json(error);
      return console.log(error);
    }
    console.log('Message sent: %s', info.messageId);
    res.status(200).json({ status: 'sended' });
  });
}
