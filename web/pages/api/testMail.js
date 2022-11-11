// import { sendSignUpMail } from '../../services/mailer/signUp';

// export default function handler(req, res) {
//   sendSignUpMail({
//     to: req.query.to,
//     firstName: req.query.firstName,
//     bcc: req.query.bcc,
//   })
//     .then(() => {
//       res.status(200).json({ message: 'Email sent' });
//     })
//     .catch((error) => {
//       console.log(error);
//       res.status(500).json({ error });
//     });
// }
