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
  return abiCoder.encode(types, vals);
}

export function toEthString(num, decimals) {
  const weiBalance = ethers.BigNumber.from(num || 0).mul(
    ethers.BigNumber.from('10').pow(ethers.BigNumber.from(`${18 - decimals}`))
  );
  return ethers.utils.formatEther(`${weiBalance}`);
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

export function formatNumber(num, options = {}) {
  const { locale, seperator, decimalSeperator, precision = 0 } = options;

  const sep = seperator || localeOptions[locale]?.separator || ',';
  const decSep = decimalSeperator || localeOptions[locale]?.decimals || '.';
  if (!num) return `0${decSep}00`;

  const str = String(round(num, precision));
  const amount = str.split('.')[0] || '0';
  const decimals = str.split('.')[1] || '';
  const formattedAmount = amount
    .split('')
    .reverse()
    .map((n, i) => n + (i % 3 == 0 ? sep : ''))
    .reverse()
    .join('')
    .slice(0, -1);

  const formattedDecimals = `${decimals}${'0'.repeat(
    precision - decimals.length
  )}`;

  return `${formattedAmount}${
    formattedDecimals.length > 0 ? decSep : ''
  }${formattedDecimals}`;
}

export function currency(num, options = {}) {
  const {
    symbol,
    locale,
    seperator,
    decimalSeperator,
    precision = 2,
  } = options;

  const sym = symbol || localeOptions[locale]?.symbol || '$';
  const formattedNum = formatNumber(num, {
    locale,
    seperator,
    decimalSeperator,
    precision,
  });

  return `${sym}${formattedNum}`;
}

export function formatTokenBalance(balance) {
  const float = parseFloat(balance);
  // When Balance is 1.00 or 1,000,000
  if (float === Math.round(float) || float > 10000) return formatNumber(float);
  // When Balance is between 10 and 10,000
  if (float > 10) return formatNumber(float, { precision: 2 });
  // When Balance is between 0.1 and 10
  if (float > 0.1) return formatNumber(float, { precision: 3 });
  // When Balance is between 0.01 and 0.1
  if (float > 0.01) return formatNumber(float, { precision: 4 });
  // When Balance is between 0.001 and 0.01
  if (float > 0.001) return formatNumber(float, { precision: 5 });
  // When Balance is between 0.0001 and 0.001
  if (float > 0.0001) return formatNumber(float, { precision: 6 });
  // When Balance is between 0.00001 and 0.0001
  if (float > 0.00001) return formatNumber(float, { precision: 7 });
  return formatNumber(float, { precision: 8 });
}
