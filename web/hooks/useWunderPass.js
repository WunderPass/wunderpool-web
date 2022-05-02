export default function useWunderPass(config) {
  const { name, image, accountId } = config;

  const sendSignatureRequest = (data) => {
    return new Promise((resolve, reject) => {
      try {
        const popup = window.open(
          encodeURI(
            `${process.env.WUNDERPASS_URL}/smartContract?name=${name}&imageUrl=${image}`
          ),
          'transactionFrame'
        );

        const requestInterval = setInterval(() => {
          popup.postMessage(
            { accountId: accountId, data: data },
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
              resolve(event.data.response);
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
