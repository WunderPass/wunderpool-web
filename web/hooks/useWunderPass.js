export default function useWunderPass(config) {
  const { name, image, accountId, userAddress } = config;

  // method: sign or smartContract
  const openPopup = (method) => {
    const isSafari =
      navigator.userAgent.toLowerCase().match(/safari/) &&
      navigator.vendor.toLowerCase().match(/apple/);

    const popup = window.open(
      encodeURI(
        `${process.env.WUNDERPASS_URL}/${method}?name=${name}&imageUrl=${image}`
      ),
      isSafari ? 'newWindow' : 'transactionFrame'
    );
    return popup;
  };

  const sendSignatureRequest = (types, values, packed = true, popup = null) => {
    return new Promise((resolve, reject) => {
      try {
        const openPopup = popup || openPopup('sign');

        if (Array.isArray(types) && Array.isArray(types[0])) {
          if (!Array.isArray(packed)) {
            packed = new Array(types.length).fill(packed);
          }
          if (types.length != values.length) {
            openPopup.close();
            throw `Array lengths do not match: Types(${types.length}), Values(${values.length}), Packed(${packed.length})`;
          }
        }

        const requestInterval = setInterval(() => {
          openPopup.postMessage(
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

  const smartContractTransaction = (
    tx,
    usdc = {},
    network = 'polygon',
    popup = null
  ) => {
    return new Promise(async (resolve, reject) => {
      try {
        const openPopup = popup || openPopup('smartContract');

        const requestInterval = setInterval(() => {
          openPopup.postMessage(
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

  return { sendSignatureRequest, smartContractTransaction, openPopup };
}
