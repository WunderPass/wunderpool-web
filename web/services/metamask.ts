import { SupportedChain } from './contract/types';

export function getMetamaskChainParams(chain: SupportedChain) {
  switch (chain) {
    case 'polygon':
      return {
        chainId: '0x89',
        chainName: 'Polygon',
        rpcUrls: ['https://polygon-rpc.com'],
        blockExplorerUrls: ['https://polygonscan.com/'],
        nativeCurrency: {
          symbol: 'MATIC',
          decimals: 18,
        },
      };
    case 'gnosis':
      return {
        chainId: '0x64',
        chainName: 'Gnosis',
        rpcUrls: ['https://rpc.gnosischain.com'],
        blockExplorerUrls: ['https://gnosisscan.io'],
        nativeCurrency: {
          symbol: 'xDai',
          decimals: 18,
        },
      };
    default:
      return null;
  }
}

export async function switchMetamaskChain(chain: SupportedChain) {
  const chainParams = getMetamaskChainParams(chain);
  try {
    await (window as any).ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: chainParams.chainId }],
    });
  } catch (switchError) {
    if (switchError.code === 4902) {
      try {
        await (window as any).ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [chainParams],
        });
        await (window as any).ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: chainParams.chainId }],
        });
      } catch (addError) {
        throw `Could not add ${chain}`;
      }
    }
    throw `Failed to switch to ${chain}`;
  }
  return true;
}
