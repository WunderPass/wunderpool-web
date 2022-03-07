import {ethers} from 'ethers';
import useWunderPass from '/hooks/useWunderPass';

export function createPool(name) {
  return new Promise(async (resolve, reject) => {
    const {smartContractTransaction} = useWunderPass({name: 'WunderPool', accountId: 'ABCDEF'});
    const address = "0x841397120D672F8C84FC19DDF1477666855bBB8A"
    const abi = ["function createNewPool(string memory _poolName) public"]
    const provider = new ethers.providers.JsonRpcProvider("https://polygon-mainnet.g.alchemy.com/v2/0MP-IDcE4civg4aispshnYoOKIMobN-A");
    const poolLauncher = new ethers.Contract(address, abi, provider);
    const gasPrice = await provider.getGasPrice();
    const tx = await poolLauncher.populateTransaction.createNewPool(name, {gasPrice: gasPrice.mul(5).div(4)});
    
    smartContractTransaction(tx).then(async (transaction) => {
      try {
        const resp = await provider.getTransaction(transaction.hash)
        const receipt = await resp.wait();
        resolve(receipt);
      } catch (error) {
        reject(error?.error?.error?.error?.message || error);
      }
    })
  })
}

export function fetchUserPools(address) {
  return new Promise(async (resolve, reject) => {
    const address = "0x841397120D672F8C84FC19DDF1477666855bBB8A"
    const abi = ["function allPools() public view returns(address[])"];
    const poolAbi = ["function poolName() public view returns(string)"];
    const provider = new ethers.providers.JsonRpcProvider("https://polygon-mainnet.g.alchemy.com/v2/0MP-IDcE4civg4aispshnYoOKIMobN-A");
    const poolLauncher = new ethers.Contract(address, abi, provider);
    const poolAddresses = await poolLauncher.allPools();
    const pools = await Promise.all(poolAddresses.map(async (addr) => {
      const wunderPool = new ethers.Contract(addr, poolAbi, provider);
      try {
        return {address: addr, name: await wunderPool.poolName()};
      } catch (err) {
        return null;
      }
    }))
    resolve(pools.filter((elem) => elem))
  })
}

export function fetchPoolMembers(poolAddress) {
  return new Promise(async (resolve, reject) => {
    const abi = ["function poolMembers() public view returns(address[])"];
    const provider = new ethers.providers.JsonRpcProvider("https://polygon-mainnet.g.alchemy.com/v2/0MP-IDcE4civg4aispshnYoOKIMobN-A");
    const wunderPool = new ethers.Contract(poolAddress, abi, provider);
    resolve(await wunderPool.poolMembers())
  })
}

export function fetchPoolBalance(poolAddress) {
  return new Promise(async (resolve, reject) => {
    const provider = new ethers.providers.JsonRpcProvider("https://polygon-mainnet.g.alchemy.com/v2/0MP-IDcE4civg4aispshnYoOKIMobN-A");
    resolve(await provider.getBalance(poolAddress))
  })
}

export function fundPool(poolAddress, amount) {
  return new Promise(async (resolve, reject) => {
    const {smartContractTransaction} = useWunderPass({name: 'WunderPool', accountId: 'ABCDEF'});
    const provider = new ethers.providers.JsonRpcProvider("https://polygon-mainnet.g.alchemy.com/v2/0MP-IDcE4civg4aispshnYoOKIMobN-A");
    const gasPrice = await provider.getGasPrice();
    const tx = {to: poolAddress, value: ethers.utils.parseEther(amount), gasPrice: gasPrice.mul(5).div(4)}
    
    smartContractTransaction(tx).then(async (transaction) => {
      try {
        const resp = await provider.getTransaction(transaction.hash)
        const receipt = await resp.wait();
        resolve(receipt);
      } catch (error) {
        reject(error?.error?.error?.error?.message || error);
      }
    })
  })
}

export function liquidatePool(poolAddress) {
  return new Promise(async (resolve, reject) => {
    const {smartContractTransaction} = useWunderPass({name: 'WunderPool', accountId: 'ABCDEF'});
    const abi = ["function liquidatePool() external"]
    const provider = new ethers.providers.JsonRpcProvider("https://polygon-mainnet.g.alchemy.com/v2/0MP-IDcE4civg4aispshnYoOKIMobN-A");
    const poolLauncher = new ethers.Contract(poolAddress, abi, provider);
    const gasPrice = await provider.getGasPrice();
    const tx = await poolLauncher.populateTransaction.liquidatePool({gasPrice: gasPrice.mul(5).div(4)});
    
    smartContractTransaction(tx).then(async (transaction) => {
      try {
        const resp = await provider.getTransaction(transaction.hash)
        const receipt = await resp.wait();
        resolve(receipt);
      } catch (error) {
        reject(error?.error?.error?.error?.message || error);
      }
    })
  })
}