export default function useWunderPass(config) {
  const {name, image, accountId} = config;

  const sendSignatureRequest = (data) => {
    return new Promise((resolve, reject) => {
      try {
        const popup = window.open(encodeURI(`http://localhost:3000/sign?name=${name}&imageUrl=${image}`), 'WunderPassSign', 'popup');
      
        const requestInterval = setInterval(() => {
          popup.postMessage({accountId: accountId, data: data}, 'http://localhost:3000')
        }, 1000);
        
        window.addEventListener("message", (event) => {
          if (event.origin == 'http://localhost:3000') {
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
        const popup = window.open(encodeURI(`http://localhost:3000/smartContract?name=${name}&imageUrl=${image}`), 'WunderPassContract', 'popup');
      
        const requestInterval = setInterval(() => {
          popup.postMessage({accountId: accountId, data: contract}, 'http://localhost:3000')
        }, 1000);
        
        window.addEventListener("message", (event) => {
          if (event.origin == 'http://localhost:3000') {
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