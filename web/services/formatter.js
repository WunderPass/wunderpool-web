import { ethers } from 'ethers';

export function bytesToValue(bytes, types) {
  const abiCoder = new ethers.utils.AbiCoder();
  return abiCoder.decode(types, bytes);
}

export function decodeParams(action, params) {
  const types = action.match(/\((.*)\)/)[1].split(',');
  return bytesToValue(params, types);
}

export function encodeParams(types, values) {
  const abiCoder = new ethers.utils.AbiCoder();
  const vals = [];
  types.forEach((type, i) => {
    if (type.match(/bool/)) {
      vals.push(values[i]);
    } else if (type.match(/\[\]/)) {
      vals.push(JSON.parse(values[i]).map((val) => `${val}`));
    } else {
      vals.push(`${values[i]}`);
    }
  });
  console.log(types, vals);
  return abiCoder.encode(types, vals);
}

export function toEthString(num, decimals) {
  const weiBalance = ethers.BigNumber.from(num || 0).mul(
    ethers.BigNumber.from('10').pow(ethers.BigNumber.from(`${18 - decimals}`))
  );
  return ethers.utils.formatEther(`${weiBalance}`);
}

export function displayWithDecimalPlaces(num, decimals) {
  return (Math.round(num * 100) / 100).toFixed(decimals);
}

export function weiToMatic(wei) {
  return wei / 1000000000000000000;
}

export function matic(num) {
  num = typeof num == 'string' ? num : `${num}`;
  return ethers.utils.parseEther(num || '0');
}

export function usdc(num) {
  return ethers.utils.parseUnits(`${num || 0}`, 6);
}

export function round(num, precision = 0) {
  return Math.floor(Number(num) * 10 ** precision) / 10 ** precision;
}

const localeOptions = {
  en: { symbol: '$', separator: ',', decimals: '.' },
  de: { symbol: '€', separator: '.', decimals: ',' },
};

export function polyValueToUsd(balance) {
  return balance?.toString() / 1000000;
}

export function secondsToHours(seconds) {
  return seconds / 3600;
}

export function currency(num, { symbol, locale, seperator, decimalSeperator }) {
  const sep = seperator || localeOptions[locale]?.separator || ',';
  const decSep = decimalSeperator || localeOptions[locale]?.decimals || '.';
  const sym = symbol || localeOptions[locale]?.symbol || '$';

  const str = String(round(num, 2));
  const amount = str.split('.')[0] || '0';
  const decimals = str.split('.')[1] || '00';
  const formattedAmount = amount
    .split('')
    .reverse()
    .map((n, i) => n + (i % 3 == 0 ? sep : ''))
    .reverse()
    .join('')
    .slice(0, -1);

  return `${sym}${formattedAmount}${decSep}${decimals}${
    decimals.length == 1 ? '0' : ''
  }`;
}
