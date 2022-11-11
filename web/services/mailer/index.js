const sgMail = require('@sendgrid/mail');

export function htmlWrapper(body) {
  return `
  <html lang="en">
    <head>
      <style>
        html,body {margin: 0; padding: 0; box-sizing: border-box; font-family: Arial, Helvetica, sans-serif}
        a {text-decoration: none}
        .bg-casama {background: #5F45FD}
        .text-casama {color: #5F45FD}
        .bg-white {background: white}
        .btn-casama {background: #5F45FD; color: white; border-radius: 10px; padding: 10px 16px; transition: background 200ms ease}
        .btn-casama:hover {background: #492ef9}
        .card {border-radius: 20px; box-shadow: 1px 3px 4px 0px rgb(58, 58, 58)}
        .divider {width: 100%; height: 1px; background: rgb(179, 179, 179)}
        .w-full {width: 100%}
        .p-2 {padding: 0.5rem}
        .p-5 {padding: 1.25rem}
        .p-10 {padding: 2.5rem}
        .m-2 {margin: 0.5rem}
        .m-5 {margin: 1.25rem}
        .m-10 {margin: 2.5rem}
        .mx-2 {margin-left: 0.5rem; margin-right: 0.5rem}
        .mx-5 {margin-left: 1.25rem; margin-left: 1.25rem}
        .mx-10 {margin-left: 2.5rem; margin-right: 2.5rem}
        .my-2 {margin-top: 0.5rem; margin-bottom: 0.5rem}
        .my-5 {margin-top: 1.25rem; margin-bottom: 1.25rem}
        .my-10 {margin-top: 2.5rem; margin-bottom: 2.5rem}
        .mt-2 {margin-top: 0.5rem}
        .mt-5 {margin-top: 1.25rem}
        .mt-10 {margin-top: 2.5rem}
        .mb-2 {margin-bottom: 0.5rem}
        .mb-5 {margin-bottom: 1.25rem}
        .mb-10 {margin-bottom: 2.5rem}
        .flex {display: flex}
        .items-center {align-items: center}
        .justify-center {justify-content: center}
      </style>
    </head>
    ${body}
  </html>`;
}

export async function sendMail({
  to,
  from = 'Casama <notifications@casama.io>',
  cc,
  bcc,
  subject,
  text,
  html,
}) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  const msg = {
    from,
    to,
    cc,
    bcc,
    subject,
    text,
    html,
  };
  try {
    return await sgMail.send(msg);
  } catch (error) {
    console.log(error);
  }
}
