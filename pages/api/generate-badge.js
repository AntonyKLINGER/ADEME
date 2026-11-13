import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fs from 'fs';
import path from 'path';
import { requireSession } from '@/utils/auth';

export default async (req, res) => {
  if (!requireSession(req, res)) return;

  if (req.method === 'POST') {
    try {
      const { nom, prenom, program, organisation } = req.body
      // `role` compose un chemin de fichier : liste fermée.
      const role = ['participant', 'intervenant', 'organisateur'].includes(req.body.role) ? req.body.role : 'participant'

      function wrapText(text, font, fontSize, maxWidth) {
        const words = text.split(' ');
        const lines = [];
        let currentLine = '';

        words.forEach(word => {
          const width = font.widthOfTextAtSize(currentLine + word, fontSize);
          if (width < maxWidth) {
            currentLine += word + ' ';
          } else {
            lines.push(currentLine.trim());
            currentLine = word + ' ';
          }
        });

        if (currentLine.length > 0) {
          lines.push(currentLine.trim());
        }

        return lines;
      }

      // Create a new PDF document
      const pdfDoc = await PDFDocument.create();

      // Add a page of A4 size (595 x 842 points)
      const page = pdfDoc.addPage([595, 842]);

      // Load a standard font
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

      // Define colors
      const blackColor = rgb(0, 0, 0);
      const blueColor = rgb(0, 0.33, 0.71);
      const lightBlueColor = rgb(0.9, 0.94, 1); // Light blue background color

      // Read the background image from file
      const backgroundBytes = fs.readFileSync(path.resolve(`public/medias/background-pdf-${role}.png`));

      // Embed the background image into the PDF
      const backgroundImage = await pdfDoc.embedPng(backgroundBytes);

      // Draw the background image on the page
      page.drawImage(backgroundImage, {
        x: 0,
        y: 0,
        width: 595,
        height: 842,
      });

      // Define the right section dimensions (adjust as necessary)
      const rightSectionX = 300;
      const rightSectionWidth = 270;
      const maxWidth = 240;

      // Center the name and organization text within the right section
      const nameText = `${prenom}\n${nom}\n${organisation}`;
      const nameLines = nameText.split('\n');
      const fontSize = 16;
      const lineHeight = fontSize * 1.5; // Increased line height for more spacing
      let currentY = 650;

      nameLines.forEach(line => {
        const wrappedLines = wrapText(line, font, fontSize, maxWidth); // Wrap the text
        wrappedLines.forEach(wrappedLine => {
          const textWidth = font.widthOfTextAtSize(wrappedLine, fontSize);
          const textX = rightSectionX + (rightSectionWidth - textWidth) / 2;
          page.drawText(wrappedLine, {
            x: textX,
            y: currentY,
            size: fontSize,
            font,
            color: blackColor,
          });
          currentY -= lineHeight;
        });
      });


      // Draw the "PROGRAMME" header on the left
      const programmeHeaderX = 20;
      const programmeHeaderWidth = 250;
      const programmeHeaderHeight = 30;

      // Draw the program items
      const programStartY = 770; // Adjusted starting position
      let programY = programStartY;

      program.forEach((item, index) => {

        const textY = programY - 5; // Center text vertically within the rectangle

        page.drawText(item.titre, {
          x: programmeHeaderX + 10,
          y: textY,
          size: 8,
          font,
          color: blueColor,
          maxWidth: 230,
          lineHeight: 10,
        });

        programY -= 40; // Adjust spacing between program items
      });

      // Save the PDF document as bytes
      const pdfBytes = await pdfDoc.save();

      // Send the PDF as response
      res.setHeader('Content-Type', 'application/pdf');
      res.send(Buffer.from(pdfBytes));
    } catch (error) {
      console.error('Error creating PDF:', error);
      res.status(500).send('Internal Server Error');
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};
