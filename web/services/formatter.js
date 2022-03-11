import { ethers } from "ethers";

export function bytesToValue(bytes, types) {
  const abiCoder = new ethers.utils.AbiCoder();
  return abiCoder.decode(types, bytes);
}

export function decodeParams(action, params) {
  const types = action.match(/\((.*)\)/)[1].split(',')
  return bytesToValue(params, types);
}

export function toEthString(num, decimals) {
  const weiBalance = num.mul(ethers.BigNumber.from("10").pow(ethers.BigNumber.from(`${18 - decimals}`)));
  return ethers.utils.formatEther(`${weiBalance}`);
}

export function matic(num) {
  num = typeof(num) == 'string' ? num : `${num}`;
  return ethers.utils.parseEther(num || "0");
}