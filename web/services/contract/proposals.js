import {ethers} from 'ethers';
import { initPool } from './init';
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
  const abiCoder = new ethers.utils.AbiCoder();
  if (contractAddresses?.length > 1 && actions?.length > 1 && params?.length > 1 && transactionValues?.length > 1) {
    const formattedValues = transactionValues.map((val) => ethers.utils.parseEther(String(val)));
    const encodedParams = params.map((param) => abiCoder.encode(param[0], param[1].map((par) => JSON.parse(par))));
    return createMultiActionProposal(poolAddress, title, description, contractAddresses, actions, encodedParams, formattedValues, deadline)
  } else if (contractAddresses?.length == 1 && actions?.length == 1 && params?.length == 1 && transactionValues?.length == 1) {
    const formattedValue = ethers.utils.parseEther(String(transactionValues[0] || 0));
    const encodedParams = abiCoder.encode(params[0][0], params[0][1].map((par) => JSON.parse(par)));
    return createSingleActionProposal(poolAddress, title, description, contractAddresses[0], actions[0], encodedParams, formattedValue, deadline)
  } else {
    return new Promise((resolve, reject) => reject('INVALID PROPOSAL'))
  }
}

export function createApeSuggestion(poolAddress, tokenAddress, title, description, value) {
  const wunderSwapperAddress = '0xbD4b2807dDaBF2bCb7A8555D98861A958c11435b';
  const abiCoder = new ethers.utils.AbiCoder();
  return createMultiActionProposal(poolAddress, title, description, [wunderSwapperAddress, poolAddress], ["buyTokens(address)", "addToken(address)"], [abiCoder.encode(["address"], [tokenAddress]), abiCoder.encode(["address"], [tokenAddress])], [ethers.utils.parseEther(String(value)), 0], 1846183041);
}

export function createFudSuggestion(poolAddress, tokenAddress, title, description, value) {
  const wunderSwapperAddress = '0xbD4b2807dDaBF2bCb7A8555D98861A958c11435b';
  const abiCoder = new ethers.utils.AbiCoder();
  return createMultiActionProposal(poolAddress, title, description, [tokenAddress, wunderSwapperAddress], ["transfer(address,uint256)", "sellTokens(address,uint256)"], [abiCoder.encode(["address", "uint256"], [wunderSwapperAddress, value]), abiCoder.encode(["address", "uint"], [tokenAddress, value])], [0, 0], 1846183041);
}

export function createLiquidateSuggestion(poolAddress, title, description) {
  return createSingleActionProposal(poolAddress, title, description, poolAddress, 'liquidatePool()', '0x', 0, 1846183041);
}

export async function createSwapSuggestion(poolAddress, tokenIn, tokenOut, title, description, amount) {
  const wunderSwapperAddress = '0xbD4b2807dDaBF2bCb7A8555D98861A958c11435b';
  const abiCoder = new ethers.utils.AbiCoder();
  const [wunderPool] = initPool(poolAddress);
  const tokenAddresses = await wunderPool.getOwnedTokenAddresses();

  if (tokenAddresses.includes(tokenOut)) {
    return createMultiActionProposal(poolAddress, title, description, [tokenIn, wunderSwapperAddress], ["transfer(address,uint256)", "swapTokens(address,address,uint256)"], [abiCoder.encode(["address", "uint256"], [wunderSwapperAddress, amount]), abiCoder.encode(["address", "address", "uint256"], [tokenIn, tokenOut, amount])], [0, 0], 1846183041);
  } else {
    return createMultiActionProposal(poolAddress, title, description, [tokenIn, wunderSwapperAddress, poolAddress], ["transfer(address,uint256)", "swapTokens(address,address,uint256)", "addToken(address)"], [abiCoder.encode(["address", "uint256"], [wunderSwapperAddress, amount]), abiCoder.encode(["address", "address", "uint256"], [tokenIn, tokenOut, amount]), abiCoder.encode(["address"], [tokenOut])], [0, 0, 0], 1846183041);
  }
}

export function testExecute(poolAddress, contractAddress, action, params, transactionValue) {
  const abi = [`function ${action}${transactionValue == 0 ? '' : ' payable'}`];
  const provider = new ethers.providers.AlchemyProvider("matic", "0MP-IDcE4civg4aispshnYoOKIMobN-A");
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