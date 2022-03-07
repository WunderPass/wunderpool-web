import {ethers} from 'ethers';
import { toEthString } from '/services/formatter';

export function fetchERC20Data(address) {
  return new Promise(async (resolve, reject) => {
    const abi = ["function name() public view returns(string)", "function symbol() public view returns(string)"];
    const provider = new ethers.providers.JsonRpcProvider("https://polygon-mainnet.g.alchemy.com/v2/0MP-IDcE4civg4aispshnYoOKIMobN-A");
    const token = new ethers.Contract(address, abi, provider);
    resolve({name: await token.name(), symbol: await token.symbol()});
  })
}

export function fetchPoolTokens(address) {
  return new Promise(async (resolve, reject) => {
    const abi = ["function getOwnedTokenAddresses() public view returns(address[] memory)"];
    const tokenAbi = ["function name() public view returns(string)", "function symbol() public view returns(string)", "function decimals() public view returns(uint)", "function balanceOf(address) public view returns(uint)"];
    const provider = new ethers.providers.JsonRpcProvider("https://polygon-mainnet.g.alchemy.com/v2/0MP-IDcE4civg4aispshnYoOKIMobN-A");
    const wunderPool = new ethers.Contract(address, abi, provider);
    const tokenAddresses = await wunderPool.getOwnedTokenAddresses();
    
    const tokens = await Promise.all(tokenAddresses.map(async (addr) => {
      const token = new ethers.Contract(addr, tokenAbi, provider);
      const balance = await token.balanceOf(address);
      const formattedBalance = toEthString(balance, decimals);
      return {address: addr, name: await token.name(), symbol: await token.symbol(), balance: balance, decimals: decimals, formattedBalance: formattedBalance};
    }))
    resolve(tokens)
  })
}