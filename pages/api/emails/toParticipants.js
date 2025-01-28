const nodemailer = require('nodemailer');
const hbs = require('nodemailer-express-handlebars');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

export default async function handler(req, res) {
  const { sujet, content, sessionId } = req.body;

  try {
    // Récupérer les inscriptions des utilisateurs standards
    const registrations = await prisma.registration.findMany({
      where: {
        sessionId: parseInt(sessionId),
      },
      include: {
        user: true, // Relation avec la table user pour obtenir l'email
      },
    });

    // Récupérer les inscriptions des comptes spéciaux
    const accountRegistrations = await prisma.accountRegistration.findMany({
      where: {
        sessionId: parseInt(sessionId),
      },
      include: {
        account: true, // Relation avec la table account pour obtenir l'email
      },
    });

    // Extraire les emails des utilisateurs standards et des comptes spéciaux
    const userEmails = registrations.map(registration => registration.user.mail);
    const accountEmails = accountRegistrations.map(registration => registration.account.email);

    // Combiner les deux listes d'emails
    const emails = [...userEmails, ...accountEmails];

    const transporter = nodemailer.createTransport({
      host: 'smtp-relay.brevo.com',
      port: 587,
      secure: false,
      auth: {
        user: 'contact@territoiresentransitions.fr',
        pass: process.env.BREVO_KEY,
      },
      tls: { rejectUnauthorized: false },
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

    // Envoyer un email à chaque participant
    for (const email of emails) {
      const mailOptions = {
        from: '"ADEME" <contact@territoiresentransitions.fr>',
        to: email,
        subject: sujet,
        template: 'base',
        context: {
          content: content,
          siteUrl: process.env.WEBSITE_URL,
        },
      };

      await transporter.sendMail(mailOptions);
    }

    res.status(200).json({ status: 'sended' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while sending emails' });
  }
}
