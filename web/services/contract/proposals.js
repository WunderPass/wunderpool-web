import {ethers} from 'ethers';
import useWunderPass from '/hooks/useWunderPass';

export function fetchPoolProposals(address) {
  return new Promise(async (resolve, reject) => {
    const abi = ["function getAllProposalIds() public view returns(uint[] memory)", "function getProposal(uint _proposalId) public view returns(string memory title, string memory description, uint transactionCount, uint deadline, uint yesVotes, uint noVotes, uint abstainVotes, uint createdAt, bool executed)"];
    const provider = new ethers.providers.JsonRpcProvider("https://polygon-mainnet.g.alchemy.com/v2/TmNYkrTbVUgUS0rjsxLLMmav2iD5AJod");
    const wunderPool = new ethers.Contract(address, abi, provider);
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
    const abi = ["function getProposalTransaction(uint _proposalId, uint _transactionIndex) public view returns(string memory action, bytes memory param, uint transactionValue, address contractAddress)"];
    const provider = new ethers.providers.JsonRpcProvider("https://polygon-mainnet.g.alchemy.com/v2/TmNYkrTbVUgUS0rjsxLLMmav2iD5AJod");
    const wunderPool = new ethers.Contract(address, abi, provider);
    const transactions = await Promise.all([...Array(transactionCount).keys()].map(async (index) => {
      const {action, param, transactionValue, contractAddress} = await wunderPool.getProposalTransaction(id, index);
      return {action, params: param, transactionValue, contractAddress}
    }))
    resolve(transactions)
  })
}

export function createMultiActionProposal(poolAddress, title, description, contractAddresses, actions, params, transactionValues, deadline) {
  return new Promise(async (resolve, reject) => {
    const {smartContractTransaction} = useWunderPass({name: 'WunderPool', accountId: 'ABCDEF'});
    const abi = ["function createMultiActionProposal(string memory _title, string memory _description, address[] memory _contractAddresses, string[] memory _actions, bytes[] memory _params, uint[] memory _transactionValues, uint _deadline) public"];
    const provider = new ethers.providers.JsonRpcProvider("https://polygon-mainnet.g.alchemy.com/v2/TmNYkrTbVUgUS0rjsxLLMmav2iD5AJod");
    const wunderPool = new ethers.Contract(poolAddress, abi, provider);
    smartContractTransaction(false).then(async (privKey) => {
      try {
        const gasPrice = await provider.getGasPrice();
        const wallet = new ethers.Wallet(privKey, provider);
        const tx = await wunderPool.connect(wallet).createMultiActionProposal(title, description, contractAddresses, actions, params, transactionValues, deadline, {gasPrice: gasPrice.mul(5).div(4)});
        const receipt = await tx.wait();
        resolve(receipt);
      } catch (error) {
        reject(error?.error?.error?.error?.message || error)
      }
    })
  })
}

export function createApeSuggestion(poolAddress, tokenAddress, title, description, value) {
  const wunderSwapperAddress = '0x7c23a323600a58D160800cDe2bdDBc507e0bf20A';
  const abiCoder = new ethers.utils.AbiCoder();
  return createMultiActionProposal(poolAddress, title, description, [wunderSwapperAddress, poolAddress], ["buyTokens(address)", "addToken(address)"], [abiCoder.encode(["address"], [tokenAddress]), abiCoder.encode(["address"], [tokenAddress])], [ethers.utils.parseEther(String(value)), 0], 1846183041);
}

export function createFudSuggestion(poolAddress, tokenAddress, title, description, value) {
  const wunderSwapperAddress = '0x7c23a323600a58D160800cDe2bdDBc507e0bf20A';
  const abiCoder = new ethers.utils.AbiCoder();
  return createMultiActionProposal(poolAddress, title, description, [tokenAddress, wunderSwapperAddress], ["transfer(address,uint256)", "sellToken(address,uint256)"], [abiCoder.encode(["address", "uint"], [wunderSwapperAddress, value]), abiCoder.encode(["address", "uint"], [tokenAddress, value])], [0, 0], 1846183041);
}

export function execute(poolAddress, id) {
  return new Promise(async (resolve, reject) => {
    const {smartContractTransaction} = useWunderPass({name: 'WunderPool', accountId: 'ABCDEF'});
    const abi = ["function executeProposal(uint _proposalId) public"];
    const provider = new ethers.providers.JsonRpcProvider("https://polygon-mainnet.g.alchemy.com/v2/TmNYkrTbVUgUS0rjsxLLMmav2iD5AJod");
    const wunderPool = new ethers.Contract(poolAddress, abi, provider);
    smartContractTransaction(false).then(async (privKey) => {
      try {
        const gasPrice = await provider.getGasPrice();
        const wallet = new ethers.Wallet(privKey, provider);
        const tx = await wunderPool.connect(wallet).executeProposal(id, {gasPrice: gasPrice.mul(5).div(4)});
        const receipt = await tx.wait();
        resolve(receipt);
      } catch (error) {
        reject(error?.error?.error?.error?.message || error)
      }
    })
  })
}