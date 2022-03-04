export default function useWunderPass(config) {
  const {name, image, accountId} = config;

  const sendSignatureRequest = (data) => {
    return new Promise((resolve, reject) => {
      try {
        const popup = window.open(encodeURI(`https://app.wunderpass.org/sign?name=${name}&imageUrl=${image}`), 'WunderPassSign', 'popup');
      
        const requestInterval = setInterval(() => {
          popup.postMessage({accountId: accountId, data: data}, 'https://app.wunderpass.org')
        }, 1000);
        
        window.addEventListener("message", (event) => {
          if (event.origin == 'https://app.wunderpass.org') {
            clearInterval(requestInterval);
  
            if (event.data && typeof(event.data) == 'object') {
              event.source.window.close();
              resolve(event.data);
            }
          }
        })
      } catch (error) {
        reject(error?.error?.error?.error?.message || error)
      }
    })
  }

  const smartContractTransaction = (contract) => {
    return new Promise((resolve, reject) => {
      try {
        const popup = window.open(encodeURI(`https://app.wunderpass.org/smartContract?name=${name}&imageUrl=${image}`), 'WunderPassContract', 'popup');
      
        const requestInterval = setInterval(() => {
          popup.postMessage({accountId: accountId, data: contract}, 'https://app.wunderpass.org')
        }, 1000);
        
        window.addEventListener("message", (event) => {
          if (event.origin == 'https://app.wunderpass.org') {
            clearInterval(requestInterval);
  
            if (event.data && typeof(event.data) == 'object') {
              event.source.window.close();
              resolve(event.data.privateKey)
            }
          }
        })
      } catch (error) {
        reject(error?.error?.error?.error?.message || error)
      }
    })
  }

  return {sendSignatureRequest, smartContractTransaction}
}