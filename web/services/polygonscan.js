import axios from 'axios';

const treasuryAddresses = ['0x4d2ca400de2fc1b905197995e8b0a05f5fd3ee0d'];

export function fetchPolygonscanTransactions(poolAddress, action) {
  return new Promise(async (resolve, reject) => {
    axios({
      url: `https://api.polygonscan.com/api?module=account&action=${action}&address=${poolAddress}&startblock=0&endblock=99999999&page=1&offset=10&sort=desc&apikey=${process.env.POLYGONSCAN_API_KEY}`,
    })
      .then((res) => {
        resolve(res.data.result);
      })
      .catch((err) => {
        reject(err);
      });
  });
}

export function normalTransactions(poolAddress) {
  return fetchPolygonscanTransactions(poolAddress, 'txlist');
}

export function erc20Transactions(poolAddress) {
  return fetchPolygonscanTransactions(poolAddress, 'tokentx');
}

function formatErc20Transactions(transactions) {
  const formattedTransactions = [];
  const uniqueHashes = transactions
    .map(({ hash }) => hash)
    .filter((v, i, a) => a.indexOf(v) === i);
  uniqueHashes.forEach((hash) => {
    const hashTransactions = transactions.filter((trx) => trx.hash == hash);
    if (hashTransactions.length == 2) {
      const [first, second] = hashTransactions;
      if (
        treasuryAddresses.includes(first.to) ||
        treasuryAddresses.includes(second.to)
      ) {
        const feeTrx = hashTransactions.find((trx) =>
          treasuryAddresses.includes(trx.to)
        );
        const trxWithoutFee = hashTransactions.find(
          (trx) => !treasuryAddresses.includes(trx.to)
        );

        formattedTransactions.push({
          ...trxWithoutFee,
          type: 'TOKEN',
          value: trxWithoutFee.value - feeTrx.value,
        });
      } else {
        let swapTransaction = {
          type: 'SWAP',
          blockHash: first.blockHash,
          blockNumber: first.blockNumber,
          confirmations: first.confirmations,
          cumulativeGasUsed: first.cumulativeGasUsed,
          gas: first.gas,
          gasPrice: first.gasPrice,
          gasUsed: first.gasUsed,
          hash: first.hash,
          input: first.input,
          nonce: first.nonce,
          timeStamp: first.timeStamp,
          transactionIndex: first.transactionIndex,
        };

        const firstToken = {
          contractAddress: first.contractAddress,
          tokenDecimal: first.tokenDecimal,
          tokenName: first.tokenName,
          tokenSymbol: first.tokenSymbol,
          type: first.type,
          value: first.value,
        };

        const secondToken = {
          contractAddress: second.contractAddress,
          tokenDecimal: second.tokenDecimal,
          tokenName: second.tokenName,
          tokenSymbol: second.tokenSymbol,
          type: second.type,
          value: second.value,
        };

        if (first.from == second.to) {
          swapTransaction.sentToken = firstToken;
          swapTransaction.receivedToken = secondToken;
        } else {
          swapTransaction.sentToken = secondToken;
          swapTransaction.receivedToken = firstToken;
        }

        formattedTransactions.push(swapTransaction);
      }
    } else {
      formattedTransactions.push(
        ...hashTransactions.map((trx) => ({ type: 'TOKEN', ...trx }))
      );
    }
  });
  return formattedTransactions;
}

export function allPolygonscanTransactions(poolAddress) {
  let normalTrx = [],
    erc20Trx = [];

  return new Promise(async (resolve, reject) => {
    try {
      normalTrx = (await normalTransactions(poolAddress)).map((trx) => ({
        type: 'NORMAL',
        ...trx,
      }));
    } catch (error) {
      console.log(error);
    }
    try {
      erc20Trx = formatErc20Transactions(await erc20Transactions(poolAddress));
    } catch (error) {
      console.log(error);
    }
    resolve([...normalTrx, ...erc20Trx]);
  });
}
