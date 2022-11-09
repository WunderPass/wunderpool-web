import { initPoolGamma } from '/services/contract/gamma/init';
import { fetchErc20TokenData } from '../token';

export function fetchPoolTokensGamma(address) {
  return new Promise(async (resolve, reject) => {
    const [wunderPool] = initPoolGamma(address);
    const tokenAddresses = await wunderPool.getOwnedTokenAddresses();

    const tokens = await Promise.all(
      tokenAddresses.map(async (addr) => {
        const {
          name,
          symbol,
          decimals,
          price,
          image_url,
          dollar_price,
          tradable,
          balance,
          formattedBalance,
          usdValue,
        } = await fetchErc20TokenData(addr, address);

        return {
          address: addr,
          name: name,
          symbol: symbol,
          balance: balance.toString(),
          decimals: decimals,
          formattedBalance: formattedBalance,
          image: image_url,
          price: price,
          dollarPrice: dollar_price,
          usdValue: usdValue / 100,
          verified: Boolean(dollar_price),
          tradable,
        };
      })
    );
    resolve(tokens);
  });
}
