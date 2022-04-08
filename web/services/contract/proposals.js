import {ethers} from 'ethers';
import { encodeParams, usdc } from '../formatter';
import { httpProvider, initPool, usdcAddress, wunderSwapperAddress } from './init';
import useWunderPass from '/hooks/useWunderPass';

export function fetchPoolProposals(address) {
  return new Promise(async (resolve, reject) => {
    const [wunderPool] = initPool(address);
    const proposalIds = await wunderPool.getAllProposalIds();
    const proposals = await Promise.all(proposalIds.map(async (id) => {
      const {title, description, transactionCount, deadline, yesVotes, noVotes, abstainVotes, createdAt, executed} = await wunderPool.getProposal(id);
      return {id: id, title, description, transactionCount, deadline, yesVotes, noVotes, abstainVotes, createdAt, executed}
    }))
    resolve(proposals)
  })
}

export function fetchTransactionData(address, id, transactionCount) {
  return new Promise(async (resolve, reject) => {
    const [wunderPool] = initPool(address);
    const transactions = await Promise.all([...Array(transactionCount).keys()].map(async (index) => {
      const {action, param, transactionValue, contractAddress} = await wunderPool.getProposalTransaction(id, index);
      return {action, params: param, transactionValue, contractAddress}
    }))
    resolve(transactions)
  })
}

export function createSingleActionProposal(poolAddress, title, description, contractAddress, action, params, transactionValue, deadline) {
  return new Promise(async (resolve, reject) => {
    const {smartContractTransaction} = useWunderPass({name: 'WunderPool', accountId: 'ABCDEF'});
    const [wunderPool, provider] = initPool(poolAddress);
    const gasPrice = await provider.getGasPrice();
    const tx = await wunderPool.populateTransaction.createProposal(title, description, contractAddress, action, params, transactionValue, deadline, {gasPrice: gasPrice.mul(5).div(4)});

    smartContractTransaction(tx).then(async (transaction) => {
      try {
        const receipt = await provider.waitForTransaction(transaction.hash);
        resolve(receipt);
      } catch (error) {
        reject(error?.error?.error?.error?.message || error);
      }
    })
  })
}

export function createMultiActionProposal(poolAddress, title, description, contractAddresses, actions, params, transactionValues, deadline) {
  return new Promise(async (resolve, reject) => {
    const {smartContractTransaction} = useWunderPass({name: 'WunderPool', accountId: 'ABCDEF'});
    const [wunderPool, provider] = initPool(poolAddress);
    const gasPrice = await provider.getGasPrice();
    const tx = await wunderPool.populateTransaction.createMultiActionProposal(title, description, contractAddresses, actions, params, transactionValues, deadline, {gasPrice: gasPrice.mul(5).div(4)});
    
    smartContractTransaction(tx).then(async (transaction) => {
      try {
        const receipt = await provider.waitForTransaction(transaction.hash);
        resolve(receipt);
      } catch (error) {
        reject(error?.error?.error?.error?.message || error);
      }
    })
  })
}

export function createCustomProposal(poolAddress, title, description, contractAddresses, actions, params, transactionValues, deadline) {
  if (contractAddresses?.length > 1 && actions?.length > 1 && params?.length > 1 && transactionValues?.length > 1) {
    const formattedValues = transactionValues.map((val) => ethers.utils.parseEther(String(val)));
    const encodedParams = params.map((param) => encodeParams(param[0], param[1].map((par) => {
      try{
        return JSON.parse(par)
      } catch {
        return par;
      }
    })));
    return createMultiActionProposal(poolAddress, title, description, contractAddresses, actions, encodedParams, formattedValues, deadline)
  } else if (contractAddresses?.length == 1 && actions?.length == 1 && params?.length == 1 && transactionValues?.length == 1) {
    const formattedValue = ethers.utils.parseEther(String(transactionValues[0] || 0));
    const encodedParams = encodeParams(params[0][0], params[0][1].map((par) => {
      try{
        return JSON.parse(par)
      } catch {
        return par;
      }
    }));
    return createSingleActionProposal(poolAddress, title, description, contractAddresses[0], actions[0], encodedParams, formattedValue, deadline)
  } else {
    return new Promise((resolve, reject) => reject('INVALID PROPOSAL'))
  }
}

export function createApeSuggestion(poolAddress, tokenAddress, title, description, value) {
  return createSwapSuggestion(poolAddress, usdcAddress, tokenAddress, title, description, usdc(value));
}

export function createFudSuggestion(poolAddress, tokenAddress, title, description, value) {
  return createSwapSuggestion(poolAddress, tokenAddress, usdcAddress, title, description, value);
}

export function createLiquidateSuggestion(poolAddress, title, description) {
  return createSingleActionProposal(poolAddress, title, description, poolAddress, 'liquidatePool()', '0x', 0, 1846183041);
}

export async function createSwapSuggestion(poolAddress, tokenIn, tokenOut, title, description, amount) {
  const [wunderPool] = initPool(poolAddress);
  const tokenAddresses = await wunderPool.getOwnedTokenAddresses();

  if (tokenAddresses.includes(tokenOut)) {
    return createMultiActionProposal(poolAddress, title, description, [tokenIn, wunderSwapperAddress], ["transfer(address,uint256)", "swapTokens(address,address,uint256)"], [encodeParams(["address", "uint256"], [wunderSwapperAddress, amount]), encodeParams(["address", "address", "uint256"], [tokenIn, tokenOut, amount])], [0, 0], 1846183041);
  } else {
    return createMultiActionProposal(poolAddress, title, description, [tokenIn, wunderSwapperAddress, poolAddress], ["transfer(address,uint256)", "swapTokens(address,address,uint256)", "addToken(address,bool,uint256)"], [encodeParams(["address", "uint256"], [wunderSwapperAddress, amount]), encodeParams(["address", "address", "uint256"], [tokenIn, tokenOut, amount]), encodeParams(["address", "bool", "uint256"], [tokenOut, false, 0])], [0, 0, 0], 1846183041);
  }
}

export function testExecute(poolAddress, contractAddress, action, params, transactionValue) {
  const abi = [`function ${action}${transactionValue == 0 ? '' : ' payable'}`];
  const provider = httpProvider;
  const contract = new ethers.Contract(contractAddress, abi, provider);
  const fun = contract.callStatic[action];
  const overrides = {from: poolAddress};
  if (transactionValue != 0) overrides.value = ethers.utils.parseEther(transactionValue);
  return new Promise((resolve, reject) => {
    fun.apply(null, [...params[1], overrides]).then((res) => {
      resolve(res);
    }).catch((err) => {
      reject(err?.error?.error?.message || err)
    })
  })
}

export function execute(poolAddress, id) {
  return new Promise(async (resolve, reject) => {
    const {smartContractTransaction} = useWunderPass({name: 'WunderPool', accountId: 'ABCDEF'});
    const [wunderPool, provider] = initPool(poolAddress);
    const gasPrice = await provider.getGasPrice();
    const tx = await wunderPool.populateTransaction.executeProposal(id, {gasPrice: gasPrice.mul(5).div(4)});

    smartContractTransaction(tx).then(async (transaction) => {
      try {
        const receipt = await provider.waitForTransaction(transaction.hash);
        resolve(receipt);
      } catch (error) {
        reject(error?.error?.error?.error?.message || error);
      }
    })
  })
}