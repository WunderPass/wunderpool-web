// const sgMail = require('@sendgrid/mail');
// export default function handler(req, res) {
//   sgMail.setApiKey(process.env.SENDGRID_API_KEY);
//   const msg = {
//     to: 'g.fricke@wunderpass.io',
//     from: 'notifications@casama.io',
//     subject: 'Your Betting Game is done!',
//     text: 'Click here to view your results',
//     html: '<strong>Click here to view your results</strong>',
//   };
//   sgMail
//     .send(msg)
//     .then(() => {
//       res.status(200).json({ message: 'Email sent' });
//     })
//     .catch((error) => {
//       console.log(error);
//       res.status(500).json({ error });
//     });
// }
