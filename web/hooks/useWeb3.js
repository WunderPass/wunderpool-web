import useMetaMask from './useMetaMask';
import useWunderPass from './useWunderPass';

export default function useWeb3() {
  const address = localStorage.getItem('address');
  const loginMethod = localStorage.getItem('loginMethod');

  const sendSignatureRequest = (types, values, packed = true, popup = null) => {
    if (loginMethod == 'MetaMask') {
      return useMetaMask().sendSignatureRequest(types, values, packed);
    } else if (loginMethod == 'WunderPass') {
      return useWunderPass({
        name: 'Casama',
        accountId: 'ABCDE',
        userAddress: address,
      }).sendSignatureRequest(types, values, packed, popup);
    } else {
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
    } else if (loginMethod == 'WunderPass') {
      return useWunderPass({
        name: 'Casama',
        accountId: 'ABCDE',
        userAddress: address,
      }).smartContractTransaction(tx, usdc, network, popup);
    } else {
    }
  };

  const openPopup = (method) => {
    if (loginMethod == 'MetaMask') {
      return () => {};
    } else if (loginMethod == 'WunderPass') {
      return useWunderPass({
        name: 'Casama',
        accountId: 'ABCDE',
        userAddress: address,
      }).openPopup(method);
    } else {
    }
  };

  return {
    sendSignatureRequest,
    smartContractTransaction,
    openPopup,
  };
}
