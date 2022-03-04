import {ethers} from 'ethers';

export function fetchERC20Data(address) {
  return new Promise(async (resolve, reject) => {
    const abi = ["function name() public view returns(string)", "function symbol() public view returns(string)"];
    const provider = new ethers.providers.JsonRpcProvider("https://polygon-mainnet.g.alchemy.com/v2/TmNYkrTbVUgUS0rjsxLLMmav2iD5AJod");
    const token = new ethers.Contract(address, abi, provider);
    resolve({name: await token.name(), symbol: await token.symbol()});
  })
}

export function fetchPoolTokens(address) {
  return new Promise(async (resolve, reject) => {
    const abi = ["function getOwnedTokenAddresses() public view returns(address[] memory)"];
    const tokenAbi = ["function name() public view returns(string)", "function symbol() public view returns(string)", "function decimals() public view returns(uint)", "function balanceOf(address) public view returns(uint)"];
    const provider = new ethers.providers.JsonRpcProvider("https://polygon-mainnet.g.alchemy.com/v2/TmNYkrTbVUgUS0rjsxLLMmav2iD5AJod");
    const wunderPool = new ethers.Contract(address, abi, provider);
    const tokenAddresses = await wunderPool.getOwnedTokenAddresses();
    
    const tokens = await Promise.all(tokenAddresses.map(async (addr) => {
      const token = new ethers.Contract(addr, tokenAbi, provider);
      const balance = await token.balanceOf(address);
      const decimals = (await token.decimals()).toNumber();
      const weiBalance = balance.mul(ethers.BigNumber.from("10").pow(ethers.BigNumber.from(`${18 - decimals}`)));
      const formattedBalance = ethers.utils.formatEther(`${weiBalance}`);
      return {address: addr, name: await token.name(), symbol: await token.symbol(), balance: balance, decimals: decimals, weiBalance, formattedBalance: formattedBalance};
    }))
    resolve(tokens)
  })
}