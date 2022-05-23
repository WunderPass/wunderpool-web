import axios from 'axios';
import { ethers } from 'ethers';
import { currency } from '../formatter';
import { httpProvider, initPool, nftAbi, tokenAbi, usdcAddress } from './init';
import { fetchPoolMembers } from './pools';
import { toEthString } from '/services/formatter';

export function fetchERC20Data(address) {
  return new Promise(async (resolve, reject) => {
    const provider = httpProvider;
    const token = new ethers.Contract(address, tokenAbi, provider);
    resolve({ name: await token.name(), symbol: await token.symbol() });
  });
}

export function fetchPoolTokens(address) {
  return new Promise(async (resolve, reject) => {
    const [wunderPool, provider] = initPool(address);
    const tokenAddresses = await wunderPool.getOwnedTokenAddresses();

    const tokens = await Promise.all(
      tokenAddresses.map(async (addr) => {
        const token = new ethers.Contract(addr, tokenAbi, provider);
        const balance = await token.balanceOf(address);
        const decimals = await token.decimals();
        const formattedBalance = toEthString(balance, decimals);
        const { name, symbol, price, image_url } = (
          await axios({ url: `/api/tokens/data`, params: { address: addr } })
        ).data;

        const usdValue = balance
          .mul(price)
          .div(10000)
          .div(ethers.BigNumber.from(10).pow(decimals))
          .toNumber();

        return {
          address: addr,
          name: name,
          symbol: symbol,
          balance: balance.toString(),
          decimals: decimals,
          formattedBalance: formattedBalance,
          image: image_url,
          price: price,
          usdValue: currency(usdValue / 100, {}),
        };
      })
    );
    resolve(tokens);
  });
}

export function fetchPoolNfts(address) {
  return new Promise(async (resolve, reject) => {
    const [wunderPool, provider] = initPool(address);
    const tokenAddresses = await wunderPool.getOwnedNftAddresses();

    const nfts = await Promise.all(
      tokenAddresses.map(async (addr) => {
        const nft = new ethers.Contract(addr, nftAbi, provider);
        const tokenIds = await wunderPool.getOwnedNftTokenIds(addr);
        const tokens = await Promise.all(
          tokenIds.map(async (id) => {
            return { id: id, uri: await nft?.tokenURI(id) };
          })
        );
        return {
          address: addr,
          name: await nft.name(),
          symbol: await nft.symbol(),
          tokens: tokens,
        };
      })
    );
    // const nfts = [
    //   {
    //     address: "0x4109DE064763d38D757a68265df9F84A09988b30",
    //     name: "SlavasBeatsNFT",
    //     symbol: "SBN",
    //     tokens: [
    //       {
    //         id: 0,
    //         uri: "https://bafyreicrypii3xsarnbfshvictyjm2psmjwjc25nukumciou34pcv5jhxa.ipfs.dweb.link/metadata.json",
    //       },
    //       {
    //         id: 1,
    //         uri: "https://bafyreic2gnfnpt2stp2oi5py6rtxfu6tbhzsvuki6gr5aya3kzzde3yyuy.ipfs.dweb.link/metadata.json",
    //       },
    //       {
    //         id: 2,
    //         uri: "https://bafyreigeqbg5eoknctp6o7nfozdvvll4bd3p553g2yzuqfvl7aoggvtj2m.ipfs.dweb.link/metadata.json",
    //       },
    //     ],
    //   },
    //   {
    //     address: "0x845812905256FFA8B16b355Bc11A3f3e63c55aB8",
    //     name: "WunderPassNFT",
    //     symbol: "WPN",
    //     tokens: [
    //       {
    //         id: 201,
    //         uri: "https://bafyreigvet6igafbs7rmzaxtjtllohaujayzzmdlghvfhbg2mfarxafhfa.ipfs.dweb.link/metadata.json",
    //       },
    //     ],
    //   },
    // ];
    resolve(nfts);
  });
}

export function fetchPoolGovernanceToken(address) {
  return new Promise(async (resolve, reject) => {
    const [wunderPool, provider] = initPool(address);
    const govTokenAddress = await wunderPool.governanceToken();
    const govToken = new ethers.Contract(govTokenAddress, tokenAbi, provider);
    const totalSupply = await govToken.totalSupply();
    fetchPoolMembers(address).then(async (memberAddresses) => {
      const holders = await Promise.all(
        memberAddresses.map(async (addr) => {
          try {
            const tokens = await govToken.balanceOf(addr);
            return {
              address: addr,
              tokens: tokens,
              share: tokens.mul(100).div(totalSupply),
            };
          } catch (err) {
            return null;
          }
        })
      );
      resolve({
        address: govTokenAddress,
        name: await govToken.name(),
        symbol: await govToken.symbol(),
        price: await govToken.price(),
        entryBarrier: await wunderPool.entryBarrier(),
        totalSupply: totalSupply,
        holders: holders,
      });
    });
  });
}

export function tokenBalanceOf(address, tokenAddress, decimals = null) {
  return new Promise(async (resolve, reject) => {
    const token = new ethers.Contract(tokenAddress, tokenAbi, httpProvider);
    token
      .balanceOf(address)
      .then((balance) => {
        if (decimals) {
          resolve(toEthString(balance, decimals));
        } else {
          token
            .decimals()
            .then((dec) => {
              resolve(toEthString(balance, dec));
            })
            .catch((err) => {
              resolve(0);
            });
        }
      })
      .catch((err) => {
        resolve(0);
      });
  });
}

export async function usdcBalanceOf(address) {
  return await tokenBalanceOf(address, usdcAddress, 6);
}
