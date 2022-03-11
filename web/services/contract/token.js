import {ethers} from 'ethers';
import { initPool } from './init';
import { fetchPoolMembers } from './pools';
import { toEthString } from '/services/formatter';

export function fetchERC20Data(address) {
  return new Promise(async (resolve, reject) => {
    const abi = ["function name() public view returns(string)", "function symbol() public view returns(string)"];
    const provider = new ethers.providers.AlchemyProvider("matic", "0MP-IDcE4civg4aispshnYoOKIMobN-A");
    const token = new ethers.Contract(address, abi, provider);
    resolve({name: await token.name(), symbol: await token.symbol()});
  })
}

export function fetchPoolTokens(address) {
  return new Promise(async (resolve, reject) => {
    const tokenAbi = ["function name() public view returns(string)", "function symbol() public view returns(string)", "function decimals() public view returns(uint)", "function balanceOf(address) public view returns(uint)"];
    const [wunderPool, provider] = initPool(address);
    const tokenAddresses = await wunderPool.getOwnedTokenAddresses();
    
    const tokens = await Promise.all(tokenAddresses.map(async (addr) => {
      const token = new ethers.Contract(addr, tokenAbi, provider);
      const balance = await token.balanceOf(address);
      const decimals = await token.decimals();
      const formattedBalance = toEthString(balance, decimals);
      return {address: addr, name: await token.name(), symbol: await token.symbol(), balance: balance, decimals: decimals, formattedBalance: formattedBalance};
    }))
    resolve(tokens)
  })
}

export function fetchPoolGovernanceToken(address) {
  return new Promise(async (resolve, reject) => {
    const tokenAbi = ["function name() public view returns(string)", "function symbol() public view returns(string)", "function totalSupply() public view returns(uint)", "function balanceOf(address) public view returns(uint)", "function price() public view returns(uint)"];
    const [wunderPool, provider] = initPool(address);
    const govTokenAddress = await wunderPool.governanceToken();
    const govToken = new ethers.Contract(govTokenAddress, tokenAbi, provider);
    const totalSupply = await govToken.totalSupply();
    fetchPoolMembers(address).then(async (memberAddresses) => {
      const holders = await Promise.all(memberAddresses.map(async (addr) => {
        try {
          const tokens = await govToken.balanceOf(addr);
          return {address: addr, tokens: tokens, share: tokens.mul(100).div(totalSupply)};
        } catch (err) {
          return null;
        }
      }))
      resolve({address: govTokenAddress, name: await govToken.name(), symbol: await govToken.symbol(), price: await govToken.price(), entryBarrier: await wunderPool.entryBarrier(), totalSupply: totalSupply, holders: holders});
    })
  })
}