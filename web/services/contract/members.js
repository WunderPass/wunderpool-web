import { ethers } from "ethers";
import useWunderPass from "/hooks/useWunderPass";

export function addMember(poolAddress, memberAddress) {
  return new Promise((resolve, reject) => {
    const {smartContractTransaction} = useWunderPass({name: 'WunderPool', accountId: 'ABCDEF'});
    const abi = ["function addMember(address _newMember) external"]
    const provider = new ethers.providers.JsonRpcProvider("https://polygon-mainnet.g.alchemy.com/v2/0MP-IDcE4civg4aispshnYoOKIMobN-A");
    const wunderPool = new ethers.Contract(poolAddress, abi, provider);
    
    smartContractTransaction(false).then(async (privKey) => {
      try {
        const gasPrice = await provider.getGasPrice();
        const wallet = new ethers.Wallet(privKey, provider);
        const tx = await wunderPool.connect(wallet).addMember(memberAddress, {gasPrice: gasPrice.mul(5).div(4)});
        const receipt = await tx.wait();
        resolve(receipt);
      } catch(err) {
        reject(err?.error?.error?.error?.message || err);
      }
    })
  })
}

export function removeMember(poolAddress, memberAddress) {
  return new Promise((resolve, reject) => {
    const {smartContractTransaction} = useWunderPass({name: 'WunderPool', accountId: 'ABCDEF'});
    const abi = ["function removeMember(address _member) external"]
    const provider = new ethers.providers.JsonRpcProvider("https://polygon-mainnet.g.alchemy.com/v2/0MP-IDcE4civg4aispshnYoOKIMobN-A");
    const wunderPool = new ethers.Contract(poolAddress, abi, provider);
    
    smartContractTransaction(false).then(async (privKey) => {
      try {
        const gasPrice = await provider.getGasPrice();
        const wallet = new ethers.Wallet(privKey, provider);
        const tx = await wunderPool.connect(wallet).removeMember(memberAddress, {gasPrice: gasPrice.mul(5).div(4)});
        const receipt = await tx.wait();
        resolve(receipt);
      } catch(err) {
        reject(err?.error?.error?.error?.message || err);
      }
    })
  })
}

export function addAdmin(poolAddress, adminAddress) {
  return new Promise((resolve, reject) => {
    const {smartContractTransaction} = useWunderPass({name: 'WunderPool', accountId: 'ABCDEF'});
    const abi = ["function addAdmin(address _newAdmin) external"]
    const provider = new ethers.providers.JsonRpcProvider("https://polygon-mainnet.g.alchemy.com/v2/0MP-IDcE4civg4aispshnYoOKIMobN-A");
    const wunderPool = new ethers.Contract(poolAddress, abi, provider);
    
    smartContractTransaction(false).then(async (privKey) => {
      try {
        const gasPrice = await provider.getGasPrice();
        const wallet = new ethers.Wallet(privKey, provider);
        const tx = await wunderPool.connect(wallet).addAdmin(adminAddress, {gasPrice: gasPrice.mul(5).div(4)});
        const receipt = await tx.wait();
        resolve(receipt);
      } catch(err) {
        reject(err?.error?.error?.error?.message || err);
      }
    })
  })
}

export function removeAdmin(poolAddress, adminAddress) {
  return new Promise((resolve, reject) => {
    const {smartContractTransaction} = useWunderPass({name: 'WunderPool', accountId: 'ABCDEF'});
    const abi = ["function removeAdmin(address _admin) external"]
    const provider = new ethers.providers.JsonRpcProvider("https://polygon-mainnet.g.alchemy.com/v2/0MP-IDcE4civg4aispshnYoOKIMobN-A");
    const wunderPool = new ethers.Contract(poolAddress, abi, provider);
    
    smartContractTransaction(false).then(async (privKey) => {
      try {
        const gasPrice = await provider.getGasPrice();
        const wallet = new ethers.Wallet(privKey, provider);
        const tx = await wunderPool.connect(wallet).removeAdmin(adminAddress, {gasPrice: gasPrice.mul(5).div(4)});
        const receipt = await tx.wait();
        resolve(receipt);
      } catch(err) {
        reject(err?.error?.error?.error?.message || err);
      }
    })
  })
}

export function removeMemberAndAdmin(poolAddress, memberAddress) {
  return new Promise((resolve, reject) => {
    const {smartContractTransaction} = useWunderPass({name: 'WunderPool', accountId: 'ABCDEF'});
    const abi = ["function removeAdmin(address _admin) external", "function removeMember(address _member) external"]
    const provider = new ethers.providers.JsonRpcProvider("https://polygon-mainnet.g.alchemy.com/v2/0MP-IDcE4civg4aispshnYoOKIMobN-A");
    const wunderPool = new ethers.Contract(poolAddress, abi, provider);
    
    smartContractTransaction(false).then(async (privKey) => {
      try {
        const gasPrice = await provider.getGasPrice();
        const wallet = new ethers.Wallet(privKey, provider);
        const admTx = await wunderPool.connect(wallet).removeAdmin(memberAddress, {gasPrice: gasPrice.mul(5).div(4)});
        await admTx.wait();
        
        const memTx = await wunderPool.connect(wallet).removeMember(memberAddress, {gasPrice: gasPrice.mul(5).div(4)});
        const receipt = await memTx.wait();
        resolve(receipt);
      } catch(err) {
        reject(err?.error?.error?.error?.message || err);
      }
    })
  })
}

export function addMemberOrAdmin(poolAddress, address, member, admin) {
  return new Promise((resolve, reject) => {
    const {smartContractTransaction} = useWunderPass({name: 'WunderPool', accountId: 'ABCDEF'});
    const abi = ["function addAdmin(address _newAdmin) external", "function addMember(address _newMember) external"]
    const provider = new ethers.providers.JsonRpcProvider("https://polygon-mainnet.g.alchemy.com/v2/0MP-IDcE4civg4aispshnYoOKIMobN-A");
    const wunderPool = new ethers.Contract(poolAddress, abi, provider);
    
    smartContractTransaction(false).then(async (privKey) => {
      try {
        const gasPrice = await provider.getGasPrice();
        const wallet = new ethers.Wallet(privKey, provider);

        let tx, receipt;
        if (member) {
          tx = await wunderPool.connect(wallet).addMember(address, {gasPrice: gasPrice.mul(5).div(4)});
          receipt = await tx.wait();
        }
        if (admin) {
          tx = await wunderPool.connect(wallet).addAdmin(address, {gasPrice: gasPrice.mul(5).div(4)});
          receipt = await tx.wait();
        }
        resolve(receipt);
      } catch(err) {
        reject(err?.error?.error?.error?.message || err);
      }
    })
  })
}