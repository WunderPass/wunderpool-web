export default function useWunderPass(config) {
  const { name, image, accountId, userAddress } = config;

  const sendSignatureRequest = (types, values, packed = true) => {
    return new Promise((resolve, reject) => {
      try {
        const popup = window.open(
          encodeURI(
            `${process.env.WUNDERPASS_URL}/sign?name=${name}&imageUrl=${image}`
          ),
          'transactionFrame'
        );

        const requestInterval = setInterval(() => {
          popup.postMessage(
            JSON.parse(
              JSON.stringify({
                accountId: accountId,
                userAddress: userAddress,
                types: types,
                values: values,
                packed: packed,
              })
            ),
            process.env.WUNDERPASS_URL
          );
        }, 1000);

        window.addEventListener('message', (event) => {
          if (event.origin == process.env.WUNDERPASS_URL) {
            clearInterval(requestInterval);

            if (event.data && typeof event.data == 'object') {
              event.source.window.close();
              resolve(event.data);
            }
          }
        });
      } catch (error) {
        reject(error?.error?.error?.error?.message || error);
      }
    });
  };

  const smartContractTransaction = (tx, usdc = {}, network = 'polygon') => {
    return new Promise(async (resolve, reject) => {
      try {
        const popup = window.open(
          encodeURI(
            `${process.env.WUNDERPASS_URL}/smartContract?name=${name}&imageUrl=${image}`
          ),
          'transactionFrame'
        );

        const requestInterval = setInterval(() => {
          popup.postMessage(
            JSON.parse(
              JSON.stringify({
                accountId: accountId,
                userAddress: userAddress,
                tx: tx,
                network: network,
                usdc: usdc,
              })
            ),
            process.env.WUNDERPASS_URL
          );
        }, 1000);

        window.addEventListener('message', (event) => {
          if (event.origin == process.env.WUNDERPASS_URL) {
            clearInterval(requestInterval);

            if (event.data && typeof event.data == 'object') {
              event.source.window.close();
              if (event.data.response) {
                resolve(event.data.response);
              } else if (event.data.error) {
                reject(event.data.error);
              }
            }
          }
        });
      } catch (error) {
        reject(error?.error?.error?.error?.message || error);
      }
    });
  };

  return { sendSignatureRequest, smartContractTransaction };
}
