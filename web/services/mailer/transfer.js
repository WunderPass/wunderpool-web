import { htmlWrapper, sendMail } from '.';
import { currency } from '/services/formatter';

export function sendTransferReceiverMail({
  to,
  firstName,
  sender,
  amount,
  txHash,
}) {
  const text = `${sender} sent you ${currency(amount)} 💸`;
  const html = htmlWrapper(`
    <body class="bg-casama">
      <div class="w-full flex items-center justify-center">
        <div class="mx-2 my-5 w-full">
          <div class="card bg-white w-full">
            <div class="p-5">
              <div class="w-full flex flex-col sm:flex-row-reverse items-center justify-between">
                <img src="https://app.casama.io/casama_logo.png" class="w-full mb-5" style="max-width: 100px" />
                <div class="w-full">
                  <h1 class="text-casama">Hey ${firstName}!</h1>
                </div>
              </div>
              <h2 class="text-center">
                <span class="text-casama">${sender}</span>
                just sent you 
                <span class="text-casama">${currency(amount)}</span> 
                on Casama!
              </h2>
              <div class="my-5 flex justify-center">
                <a href="https://app.casama.io" class="btn-casama">
                  <h3 class="my-2">Start Betting</h3>
                </a>
              </div>
              <div class="divider"></div>
              <p>
                <a class="text-casama underline" href="https://polygonscan.com/tx/${txHash}">
                  View Transaction on Chain
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </body>
  `);
  return sendMail({
    to,
    subject: `${sender} sent you ${currency(amount)} on Casama!`,
    text,
    html,
  });
}
