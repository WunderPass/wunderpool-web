import { htmlWrapper, sendMail } from '.';

export function sendSignUpMail({ to, firstName }) {
  const text = `Welcome ${firstName}! You successfully signed up to Casama.`;
  const html = htmlWrapper(`
    <body class="bg-casama" style="margin: 0;padding: 0;box-sizing: border-box;font-family: Arial, Helvetica, sans-serif;background: #5F45FD;">
      <div class="bg-casama w-full flex items-center justify-center" style="background: #5F45FD;width: 100%;display: flex;align-items: center;justify-content: center;">
        <div class="mx-2 my-5 w-full" style="width: 100%;margin-left: 0.5rem;margin-right: 0.5rem;margin-top: 1.25rem;margin-bottom: 1.25rem;">
          <div class="card bg-white w-full" style="background: white;border-radius: 20px;box-shadow: 1px 3px 4px 0 rgb(58, 58, 58);width: 100%;">
            <div class="p-5" style="padding: 1.25rem;">
              <div class="w-full flex items-center justify-center" style="width: 100%;display: flex;align-items: center;justify-content: center;">
                <img src="https://app.casama.io/casama.svg" class="w-full mb-5" style="max-width: 300px;width: 100%;margin-bottom: 1.25rem;">
              </div>
              <h3 class="text-casama" style="color: #5F45FD;">Welcome ${firstName}!</h3>
              <p>You successfully signed up to Casama.</p>
              <div class="divider" style="width: 100%;height: 1px;background: rgb(179, 179, 179);"></div>
              <h3 class="text-casama" style="color: #5F45FD;">Next Steps</h3>
              <div style="margin-left: 8px; border-left: 1px solid rgb(179, 179, 179); padding-left: 16px">
                <h4 class="text-casama" style="color: #5F45FD;">Top Up Your Account</h4>
                <p>The main Currency on Casama is USDC, which is a stable cryptocurrency coupled to the USD, so it is always worth
                  1$</p>
                <p>To use Casama, you will need to buy USDC first. You can buy USDC yourself on an Exchange of your choice
                  or use Transak to buy and sell USDC directly on Casama</p>
                <div class="flex items-center" style="display: flex;align-items: center;"><a class="btn-casama" href="https://app.casama.io/balance" style="text-decoration: none;background: #5F45FD;color: white;border-radius: 10px;padding: 10px 16px;transition: background 200ms ease;">Top Up Now</a>
                </div>
                <div class="divider my-5" style="width: 100%;height: 1px;background: rgb(179, 179, 179);margin-top: 1.25rem;margin-bottom: 1.25rem;"></div>
                <h4 class="text-casama" style="color: #5F45FD;">Join a betting Game</h4>
                <p>At Casama you can bet on Sports Events against strangers in Public Competitions or create a private
                  Competition with your friends</p>
                <div class="flex items-center" style="display: flex;align-items: center;">
                  <a class="btn-casama" href="https://app.casama.io/betting" style="text-decoration: none;background: #5F45FD;color: white;border-radius: 10px;padding: 10px 16px;transition: background 200ms ease;">Discover Current Competitions</a>
                </div>
                <div class="divider my-5" style="width: 100%;height: 1px;background: rgb(179, 179, 179);margin-top: 1.25rem;margin-bottom: 1.25rem;"></div>
                <h4 class="text-casama" style="color: #5F45FD;">Save your Seed Phrase</h4>
                <p>
                  When your Account was created, we generated a random Seed Phrase to create your Wallet. With your Seed
                  Phrase, you can gain Access to your Wallet, i.e. your Funds.
                </p>
                <p>
                  Be aware that without your Seed Phrase you <b>will loose access to your Account</b> if your device is
                  lost or stolen.
                </p>
                <div class="flex items-center" style="display: flex;align-items: center;">
                  <a class="btn-casama" href="https://app.casama.io/profile" style="text-decoration: none;background: #5F45FD;color: white;border-radius: 10px;padding: 10px 16px;transition: background 200ms ease;">Backup Seed Phrase</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </body>
  `);
  return sendMail({ to, subject: 'Welcome to Casama!', text, html });
}
