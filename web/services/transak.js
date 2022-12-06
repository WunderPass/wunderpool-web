export function transakRampOnLink({
  network = 'polygon',
  crypto = 'USDC',
  amount,
  address,
}) {
  return `${process.env.TRANSAK_URL}${process.env.TRANSAK_API_KEY}&network=${network}&defaultPaymentMethod=credit_debit_card&fiatCurrency=EUR&defaultCryptoCurrency=${crypto}&cryptoCurrencyCode=${crypto}&fiatAmount=${amount}&productsAvailed=BUY&&walletAddress=${address}&themeColor=5F45FD&hideMenu=true&redirectURL=https://app.casama.io/betting`;
}

export function transakRampOffLink({
  network = 'polygon',
  crypto = 'USDC',
  amount,
  address,
}) {
  return `${process.env.TRANSAK_URL}${process.env.TRANSAK_API_KEY}&networks=${network}&defaultCryptoCurrency=${crypto}&defaultCryptoAmount=${amount}&productsAvailed=SELL&&walletAddress=${address}&isAutoFillUserData=true&themeColor=5F45FD&hideMenu=true&redirectURL=https://app.casama.io/balance`;
}
