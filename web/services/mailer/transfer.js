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
    <body class="bg-casama" style="margin: 0;padding: 0;box-sizing: border-box;font-family: Arial, Helvetica, sans-serif;background: #5F45FD;">
      <div class="w-full flex items-center justify-center" style="width: 100%;display: flex;align-items: center;justify-content: center;">
        <div class="mx-2 my-5 w-full" style="width: 100%;margin-left: 0.5rem;margin-right: 0.5rem;margin-top: 1.25rem;margin-bottom: 1.25rem;">
          <div class="card bg-white w-full" style="background: white;border-radius: 20px;box-shadow: 1px 3px 4px 0 rgb(58, 58, 58);width: 100%;">
            <div class="p-5" style="padding: 1.25rem;">
              <div class="w-full flex flex-col sm:flex-row-reverse items-center justify-between" style="width: 100%;display: flex;flex-direction: column;align-items: center;justify-content: space-between;">
                <img src="https://app.casama.io/casama_logo.png" class="w-full mb-5" style="max-width: 100px;width: 100%;margin-bottom: 1.25rem;">
                <div class="w-full" style="width: 100%;">
                  <h1 class="text-casama" style="color: #5F45FD;">Hey ${firstName}!</h1>
                </div>
              </div>
              <h2 class="text-center" style="text-align: center;">
                <span class="text-casama" style="color: #5F45FD;">${sender}</span>
                just sent you 
                <span class="text-casama" style="color: #5F45FD;">${currency(
                  amount
                )}</span> 
                on Casama!
              </h2>
              <div class="my-5 flex justify-center" style="margin-top: 1.25rem;margin-bottom: 1.25rem;display: flex;justify-content: center;">
                <a href="https://app.casama.io" class="btn-casama" style="text-decoration: none;background: #5F45FD;color: white;border-radius: 10px;padding: 10px 16px;transition: background 200ms ease;">
                  <h3 class="my-2" style="margin-top: 0.5rem;margin-bottom: 0.5rem;">Start Betting</h3>
                </a>
              </div>
              <div class="divider" style="width: 100%;height: 1px;background: rgb(179, 179, 179);"></div>
              <p>
                <a class="text-casama underline" href="https://polygonscan.com/tx/${txHash}" style="text-decoration: none;color: #5F45FD;text-decoration-line: underline;">
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
