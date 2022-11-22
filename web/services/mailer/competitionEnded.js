import { htmlWrapper, sendMail } from '.';
import { currency } from '/services/formatter';

function renderMember(member, to) {
  return member.prediction?.[0] == undefined
    ? ''
    : `
    <div class="${
      member.email == to ? 'bg-casama text-white' : 'bg-gray'
    } rounded-xl p-5 shadow-sm flex items-center justify-between mb-2">
      <p class="m-0 font-bold">${
        member.profileName || member.userName || 'Casama User'
      }</p>
      <div class="flex">
        <p class="m-0 pr-3">${member.prediction?.[0]}:${
        member.prediction?.[1]
      }</p>
        <p class="m-0 ${
          member.profit > 0 ? 'text-green' : 'text-red'
        }">${currency(member.profit)}</p>
      </div>
    </div>
  `;
}

export function sendCompetitionEndedMail({
  to,
  firstName,
  teamHome,
  teamAway,
  members,
}) {
  const profit = members.find((m) => m.email == to)?.profit || 0;
  const text = `Hey ${firstName}! The Competition ${teamHome.name} vs. ${
    teamAway.name
  } has officially ended. ${
    profit > 0
      ? `Congrats! You have won ${currency(profit)}!`
      : `Unfortunately, your bet did not win this time.`
  }`;
  const html = htmlWrapper(`
    <body class="bg-casama">
      <div class="bg-casama w-full flex items-center justify-center">
        <div class="mx-2 my-5 w-full">
          <div class="card bg-white w-full">
            <div class="p-5">
              <div class="w-full flex flex-col sm:flex-row-reverse items-center justify-between">
                <img src="https://app.casama.io/casama_logo.png" class="w-full mb-5" style="max-width: 100px" />
                <div class="w-full">
                  <h3 class="text-casama">Hey ${firstName}!</h3>
                  <h4>The Competition <span class="text-casama">${
                    teamHome.name
                  } vs. ${teamAway.name}</span> has officially ended.</h4>
                  <h4>${
                    profit > 0
                      ? `Congrats! You have won <span class="text-casama">${currency(
                          profit
                        )}</span>!`
                      : `Unfortunately, your bet did not win this time.`
                  }</h4>
                </div>
              </div>
              <div class="divider"></div>
              <h3>Here are the Results:</h3>
              <div class="flex items-center justify-center mb-5">
              <div class="bg-gray rounded-xl p-5 shadow-sm">
                <h3 class="text-casama font-bold text-center m-0">Outcome</h3>
                <div class="flex items-center justify-center">
                  <img src="https://app.casama.io/api/betting/events/teamImage?id=${
                    teamHome.id
                  }" class="w-16" />
                  <h1 class="mx-5">2:0</h1>
                  <img src="https://app.casama.io/api/betting/events/teamImage?id=${
                    teamAway.id
                  }" class="w-16" />
                </div>
              </div>
              </div>
              ${members
                .sort((a, b) => b.profit - a.profit)
                .map((member) => renderMember(member, to))
                .join('')}
            </div>
          </div>
        </div>
      </div>
    </body>
  `);
  return sendMail({
    to,
    subject: `Competition ${teamHome.name} vs. ${teamAway.name} has ended`,
    text,
    html,
  });
}
