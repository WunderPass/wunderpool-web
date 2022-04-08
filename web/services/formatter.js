import { ethers } from "ethers";

export function bytesToValue(bytes, types) {
  const abiCoder = new ethers.utils.AbiCoder();
  return abiCoder.decode(types, bytes);
}

export function decodeParams(action, params) {
  const types = action.match(/\((.*)\)/)[1].split(',')
  return bytesToValue(params, types);
}

export function encodeParams(types, values) {
  const abiCoder = new ethers.utils.AbiCoder();
  const vals = [];
  types.forEach((type, i) => {
    if (type.match(/bool/)) {
      vals.push(values[i])
    } else if (type.match(/\[\]/)) {
      vals.push(JSON.parse(values[i]).map(val => `${val}`))
    } else {
      vals.push(`${values[i]}`)
    }
  });
  return abiCoder.encode(types, vals);
}

export function toEthString(num, decimals) {
  const weiBalance = num.mul(ethers.BigNumber.from("10").pow(ethers.BigNumber.from(`${18 - decimals}`)));
  return ethers.utils.formatEther(`${weiBalance}`);
}

export function matic(num) {
  num = typeof(num) == 'string' ? num : `${num}`;
  return ethers.utils.parseEther(num || "0");
}

export function usdc(num) {
  return ethers.utils.parseUnits(`${num || 0}`, 6);
}