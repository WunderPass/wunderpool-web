import { ethers } from 'ethers';
import { encodeParams, usdc } from '/services/formatter';
import useWunderPass from '/hooks/useWunderPass';
import {
  initPoolConfigEpsilon,
  initPoolEpsilon,
  initProposalEpsilon,
} from './init';
import {
  gasPrice,
  usdcAddress,
  wunderSwapperAddress,
  connectContract,
} from '/services/contract/init';
import { hasVotedEpsilon } from './vote';

function determineDeclined(
  noVotes,
  totalVotes,
  votingThreshold,
  minYesVoters,
  memberCount,
  deadline,
  address,
  id
) {
  return new Promise(async (resolve, reject) => {
    if (
      noVotes
        .mul(100)
        .div(totalVotes)
        .gt(ethers.BigNumber.from(100).sub(votingThreshold))
    ) {
      resolve(true);
    } else {
      const [wunderProposal] = initProposalEpsilon();
      const { noVoters, yesVoters } = await wunderProposal.calculateVotes(
        address,
        id
      );
      resolve(
        ethers.BigNumber.from(memberCount).sub(noVoters).lt(minYesVoters) ||
          (yesVoters.lt(minYesVoters) &&
            deadline.lte(Math.floor(Number(new Date()) / 1000)))
      );
    }
  });
}

export function fetchPoolProposalsEpsilon(address, userAddress = null) {
  return new Promise(async (resolve, reject) => {
    const [wunderPool] = initPoolEpsilon(address);
    const [wunderProposal] = initProposalEpsilon();
    const [poolConfig] = initPoolConfigEpsilon();
    const { votingThreshold, minYesVoters } = await poolConfig.getConfig(
      address
    );
    const members = await wunderPool.poolMembers();
    const proposalIds = await wunderPool.getAllProposalIds();
    const proposals = await Promise.all(
      proposalIds.map(async (id) => {
        const {
          title,
          description,
          transactionCount,
          deadline,
          yesVotes,
          noVotes,
          totalVotes,
          createdAt,
          executed,
          creator,
        } = await wunderProposal.getProposal(address, id);

        const { executable } = executed
          ? { executable: false }
          : await wunderProposal.proposalExecutable(address, id);
        const declined =
          executable || executed
            ? false
            : await determineDeclined(
                noVotes,
                totalVotes,
                votingThreshold,
                minYesVoters,
                members.length,
                deadline,
                address,
                id
              );
        const hasVoted = userAddress
          ? await hasVotedEpsilon(address, id, userAddress)
          : null;

        return {
          id: id.toNumber(),
          title,
          description,
          transactionCount,
          deadline,
          yesVotes,
          noVotes,
          totalVotes,
          createdAt,
          executed,
          executable,
          declined,
          creator,
          hasVoted,
        };
      })
    );
    resolve(proposals);
  });
}

export function fetchTransactionDataEpsilon(address, id, transactionCount) {
  return new Promise(async (resolve, reject) => {
    const [wunderProposal] = initProposalEpsilon();
    const transactions = await Promise.all(
      [...Array(transactionCount).keys()].map(async (index) => {
        const { action, param, transactionValue, contractAddress } =
          await wunderProposal.getProposalTransaction(address, id, index);
        return { action, params: param, transactionValue, contractAddress };
      })
    );
    resolve(transactions);
  });
}

export function createMultiActionProposalEpsilon(
  poolAddress,
  title,
  description,
  contractAddresses,
  actions,
  params,
  transactionValues,
  userAddress,
  popupWindow = null
) {
  return new Promise(async (resolve, reject) => {
    const { openPopup, sendSignatureRequest } = useWunderPass({
      name: 'Casama',
      accountId: 'ABCDEF',
      userAddress,
    });
    const popup = popupWindow || openPopup('sign');
    const [wunderPool] = initPoolEpsilon(poolAddress);
    const proposalId = (await wunderPool.getAllProposalIds()).length;
    const types = [
      'address',
      'address',
      'string',
      'string',
      'address[]',
      'string[]',
      'bytes[]',
      'uint[]',
      'uint',
    ];
    const values = [
      userAddress,
      poolAddress,
      title,
      description,
      contractAddresses,
      actions,
      params,
      transactionValues,
      proposalId,
    ];
    sendSignatureRequest(types, values, false, popup)
      .then(async (signature) => {
        const tx = await connectContract(wunderPool).createProposalForUser(
          userAddress,
          title,
          description,
          contractAddresses,
          actions,
          params,
          transactionValues,
          signature.signature,
          { gasPrice: await gasPrice() }
        );

        const result = await tx.wait();
        resolve(result);
      })
      .catch((err) => {
        reject(err);
      });
  });
}

export function createApeSuggestionEpsilon(
  poolAddress,
  tokenAddress,
  title,
  description,
  value,
  userAddress
) {
  return createSwapSuggestionEpsilon(
    poolAddress,
    usdcAddress,
    tokenAddress,
    title,
    description,
    usdc(value),
    userAddress
  );
}

export function createFudSuggestionEpsilon(
  poolAddress,
  tokenAddress,
  title,
  description,
  value,
  userAddress
) {
  return createSwapSuggestionEpsilon(
    poolAddress,
    tokenAddress,
    usdcAddress,
    title,
    description,
    value,
    userAddress
  );
}

export function createLiquidateSuggestionEpsilon(
  poolAddress,
  title,
  description,
  userAddress
) {
  return createMultiActionProposalEpsilon(
    poolAddress,
    title,
    description,
    [poolAddress],
    ['liquidatePool()'],
    ['0x'],
    [0],
    userAddress
  );
}

export async function createSwapSuggestionEpsilon(
  poolAddress,
  tokenIn,
  tokenOut,
  title,
  description,
  amount,
  userAddress
) {
  const { openPopup } = useWunderPass({
    name: 'Casama',
    accountId: 'ABCDEF',
    userAddress,
  });
  const popup = openPopup('sign');
  const [wunderPool] = initPoolEpsilon(poolAddress);
  const tokenAddresses = await wunderPool.getOwnedTokenAddresses();

  if (tokenAddresses.includes(tokenOut)) {
    return createMultiActionProposalEpsilon(
      poolAddress,
      title,
      description,
      [tokenIn, wunderSwapperAddress],
      ['transfer(address,uint256)', 'swapTokens(address,address,uint256)'],
      [
        encodeParams(['address', 'uint256'], [wunderSwapperAddress, amount]),
        encodeParams(
          ['address', 'address', 'uint256'],
          [tokenIn, tokenOut, amount]
        ),
      ],
      [0, 0],
      userAddress,
      popup
    );
  } else {
    return createMultiActionProposalEpsilon(
      poolAddress,
      title,
      description,
      [tokenIn, wunderSwapperAddress, poolAddress],
      [
        'transfer(address,uint256)',
        'swapTokens(address,address,uint256)',
        'addToken(address,bool,uint256)',
      ],
      [
        encodeParams(['address', 'uint256'], [wunderSwapperAddress, amount]),
        encodeParams(
          ['address', 'address', 'uint256'],
          [tokenIn, tokenOut, amount]
        ),
        encodeParams(['address', 'bool', 'uint256'], [tokenOut, false, 0]),
      ],
      [0, 0, 0],
      userAddress,
      popup
    );
  }
}

export async function createNftBuyProposalEpsilon(
  poolAddress,
  nftAddress,
  tokenId,
  title,
  description,
  amount,
  userAddress
) {
  return createMultiActionProposalEpsilon(
    poolAddress,
    title,
    description,
    [usdcAddress, nftAddress],
    [
      'transferFrom(address,address,uint256)',
      'transferFrom(address,address,uint256)',
    ],
    [
      encodeParams(
        ['address', 'address', 'uint256'],
        [userAddress, poolAddress, amount]
      ),
      encodeParams(
        ['address', 'address', 'uint256'],
        [poolAddress, userAddress, tokenId]
      ),
    ],
    [0, 0],
    userAddress
  );
}

export async function createNftSellProposalEpsilon(
  poolAddress,
  nftAddress,
  tokenId,
  title,
  description,
  amount,
  userAddress
) {
  return createMultiActionProposalEpsilon(
    poolAddress,
    title,
    description,
    [usdcAddress, nftAddress],
    [
      'transferFrom(address,address,uint256)',
      'transferFrom(address,address,uint256)',
    ],
    [
      encodeParams(
        ['address', 'address', 'uint256'],
        [poolAddress, userAddress, amount]
      ),
      encodeParams(
        ['address', 'address', 'uint256'],
        [userAddress, poolAddress, tokenId]
      ),
    ],
    [0, 0],
    userAddress
  );
}

export function proposalExecutableEpsilon(poolAddress, id) {
  return new Promise(async (resolve, reject) => {
    const [wunderProposal] = initProposalEpsilon(poolAddress);

    try {
      const { executable, errorMessage } =
        await wunderProposal.proposalExecutable(poolAddress, id);
      resolve([executable, errorMessage]);
    } catch (error) {
      resolve([false, 'Proposal does not exist']);
    }
  });
}

export function isLiquidateProposalEpsilon(poolAddress, id) {
  return new Promise(async (resolve, reject) => {
    try {
      const [wunderProposal] = initProposalEpsilon();
      const { transactionCount } = await wunderProposal.getProposal(
        poolAddress,
        id
      );
      const transactions = await fetchTransactionDataEpsilon(
        poolAddress,
        id,
        transactionCount
      );
      if (
        transactions.find(
          (trx) =>
            trx.action == 'liquidatePool()' &&
            trx.contractAddress.toLowerCase() == poolAddress.toLowerCase()
        )
      ) {
        resolve(true);
      } else {
        resolve(false);
      }
    } catch (error) {
      resolve(false);
    }
  });
}

export async function createJoinProposalEpsilon(
  poolAddress,
  userAddress,
  amount,
  govTokens
) {}
