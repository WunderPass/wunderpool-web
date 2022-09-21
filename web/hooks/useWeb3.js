import useMetaMask from './useMetaMask';
import useWalletConnect from './useWalletConnect';
import useWunderPass from './useWunderPass';

export default function useWeb3() {
  const address = localStorage.getItem('address');
  const loginMethod = localStorage.getItem('loginMethod');

  const sendSignatureRequest = (types, values, packed = true, popup = null) => {
    if (loginMethod == 'MetaMask') {
      return useMetaMask().sendSignatureRequest(types, values, packed);
    } else if (loginMethod == 'WalletConnect') {
      return useWalletConnect().sendSignatureRequest(types, values, packed);
    } else if (loginMethod == 'WunderPass') {
      return useWunderPass({
        name: 'Casama',
        accountId: 'ABCDE',
        userAddress: address,
      }).sendSignatureRequest(types, values, packed, popup);
    }
  };

  const smartContractTransaction = (
    tx,
    usdc = {},
    network = 'polygon',
    popup = null
  ) => {
    if (loginMethod == 'MetaMask') {
      return useMetaMask().smartContractTransaction(tx, usdc, network);
    } else if (loginMethod == 'WalletConnect') {
      return useWalletConnect().smartContractTransaction(tx, usdc, network);
    } else if (loginMethod == 'WunderPass') {
      return useWunderPass({
        name: 'Casama',
        accountId: 'ABCDE',
        userAddress: address,
      }).smartContractTransaction(tx, usdc, network, popup);
    }
  };

  const openPopup = (method) => {
    if (loginMethod == 'MetaMask') {
      return () => {};
    } else if (loginMethod == 'WalletConnect') {
      return () => {};
    } else if (loginMethod == 'WunderPass') {
      return useWunderPass({
        name: 'Casama',
        accountId: 'ABCDE',
        userAddress: address,
      }).openPopup(method);
    }
  };

  return {
    sendSignatureRequest,
    smartContractTransaction,
    openPopup,
  };
}
