import { htmlWrapper, sendMail } from '.';

export function sendSignUpMail({ to, firstName }) {
  const text = `Welcome ${firstName}! You successfully signed up to Casama.`;
  const html = htmlWrapper(`
    <body class="bg-casama">
      <div class="bg-casama w-full flex items-center justify-center">
        <div class="mx-2 my-5 w-full">
          <div class="card bg-white w-full">
            <div class="p-5">
              <div class="w-full flex items-center justify-center">
                <img src="https://app.casama.io/casama.svg" class="w-full mb-5" style="max-width: 300px" />
              </div>
              <h3 class="text-casama">Welcome ${firstName}!</h3>
              <p>You successfully signed up to Casama.</p>
              <div class="divider"></div>
              <h3 class="text-casama">Next Steps</h3>
              <div style="margin-left: 8px; border-left: 1px solid rgb(179, 179, 179); padding-left: 16px">
                <h4 class="text-casama">Top Up Your Account</h4>
                <p>The main Currency on Casama is USDC, which is a stable cryptocurrency coupled to the USD, so it is always worth
                  1$</p>
                <p>To use Casama, you will need to buy USDC first. You can buy USDC yourself on an Exchange of your choice
                  or use Transak to buy and sell USDC directly on Casama</p>
                <div class="flex items-center"><a class="btn-casama" href="https://app.casama.io/balance">Top Up Now</a>
                </div>
                <div class="divider my-5"></div>
                <h4 class="text-casama">Join a betting Game</h4>
                <p>At Casama you can bet on Sports Events against strangers in Public Competitions or create a private
                  Competition with your friends</p>
                <div class="flex items-center">
                  <a class="btn-casama" href="https://app.casama.io/betting">Discover Current Competitions</a>
                </div>
                <div class="divider my-5"></div>
                <h4 class="text-casama">Save your Seed Phrase</h4>
                <p>
                  When your Account was created, we generated a random Seed Phrase to create your Wallet. With your Seed
                  Phrase, you can gain Access to your Wallet, i.e. your Funds.
                </p>
                <p>
                  Be aware that without your Seed Phrase you <b>will loose access to your Account</b> if your device is
                  lost or stolen.
                </p>
                <div class="flex items-center">
                  <a class="btn-casama" href="https://app.casama.io/profile">Backup Seed Phrase</a>
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
