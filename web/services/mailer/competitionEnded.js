import { htmlWrapper, sendMail } from '.';
import { currency } from '/services/formatter';

function renderMember(member, to, stake) {
  return member.prediction?.[0] == undefined
    ? ''
    : `
    <div class="bg-casama text-white rounded-xl p-5 shadow-sm flex items-center justify-between mb-2" style="${
      member.email == to
        ? 'background: #5F45FD;color: white'
        : 'background: rgb(236, 238, 242)'
    }; padding: 1.25rem;margin-bottom: 0.5rem;border-radius: 0.75rem;box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);display: flex;align-items: center;justify-content: space-between;">
      <p class="m-0 font-bold" style="font-weight: 700;margin: 0;">${
        member.userName || 'Casama User'
      }</p>
      <div class="flex" style="display: flex;">
        <p class="m-0 pr-3" style="padding-right: 0.75rem;margin: 0;">${
          member.prediction?.[0]
        }:${member.prediction?.[1]}</p>
        <p class="m-0 text-green" style="${
          member.profit > 0
            ? 'color: rgb(34, 197, 94)'
            : 'color: rgb(239, 68, 68)'
        };margin: 0;">${currency(member.profit + stake)}</p>
      </div>
    </div>
  `;
}

export function sendCompetitionEndedMail({
  to,
  firstName,
  teamHome,
  teamAway,
  outcome,
  members,
  stake,
}) {
  const profit = members.find((m) => m.email == to)?.profit || 0;
  const text = `Hey ${firstName}! The Competition ${teamHome.name} vs. ${
    teamAway.name
  } has officially ended. ${
    profit > 0
      ? `Congrats! You have won ${currency(profit + stake)}!`
      : `Unfortunately, your bet did not win this time.`
  }`;
  const html = htmlWrapper(`
    <body class="bg-casama" style="margin: 0;padding: 0;box-sizing: border-box;font-family: Arial, Helvetica, sans-serif;background: #5F45FD;">
      <div class="bg-casama w-full flex items-center justify-center" style="background: #5F45FD;width: 100%;display: flex;align-items: center;justify-content: center;">
        <div class="mx-2 my-5 w-full" style="width: 100%;margin-left: 0.5rem;margin-right: 0.5rem;margin-top: 1.25rem;margin-bottom: 1.25rem;">
          <div class="card bg-white w-full" style="background: white;border-radius: 20px;box-shadow: 1px 3px 4px 0 rgb(58, 58, 58);width: 100%;">
            <div class="p-5" style="padding: 1.25rem;">
              <div class="w-full flex flex-col sm:flex-row-reverse items-center justify-between" style="width: 100%;display: flex;flex-direction: column;align-items: center;justify-content: space-between;">
                <img src="https://app.casama.io/casama_logo.png" class="w-full mb-5" style="max-width: 100px;width: 100%;margin-bottom: 1.25rem;">
                <div class="w-full" style="width: 100%;">
                  <h1 class="text-casama" style="color: #5F45FD;">Hey ${firstName}!</h1>
                  <h3>The Competition <span class="text-casama" style="color: #5F45FD;">${
                    teamHome.name
                  } vs. ${teamAway.name}</span> has officially ended.</h3>
                  <h3>${
                    profit > 0
                      ? `Congrats! You have won <span class="text-casama" style="color: #5F45FD;">${currency(
                          profit + stake
                        )}</span>!`
                      : `Unfortunately, your bet did not win this time.`
                  }</h3>
                </div>
              </div>
              <div class="divider" style="width: 100%;height: 1px;background: rgb(179, 179, 179);"></div>
              <h2>Here are the Results:</h2>
              <div class="flex items-center justify-center mb-5" style="margin-bottom: 1.25rem;display: flex;align-items: center;justify-content: center;">
              <div class="bg-gray rounded-xl p-5 shadow-sm" style="background: rgb(236, 238, 242);padding: 1.25rem;border-radius: 0.75rem;box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);">
                <h2 class="text-casama font-bold text-center m-0" style="text-align: center;color: #5F45FD;font-weight: 700;margin: 0;">Outcome</h2>
                <div class="flex items-center justify-center" style="display: flex;align-items: center;justify-content: center;">
                  <img src="https://app.casama.io/api/betting/events/teamImage?id=${
                    teamHome.id
                  }" class="w-16" style="width: 4rem;">
                  <h1 class="mx-5" style="margin-left: 1.25rem;margin-right: 1.25rem;">${
                    outcome[0]
                  }:${outcome[1]}</h1>
                  <img src="https://app.casama.io/api/betting/events/teamImage?id=${
                    teamAway.id
                  }" class="w-16" style="width: 4rem;">
                </div>
              </div>
              </div>
              ${members
                .sort((a, b) => b.profit - a.profit)
                .map((member) => renderMember(member, to, stake))
                .join('')}
            </div>
          </div>
        </div>
      </div>
    </body>
  `);
  return sendMail({
    to,
    subject: `⚽️ Competition ${teamHome.name} vs. ${teamAway.name} has ended`,
    text,
    html,
  });
}
