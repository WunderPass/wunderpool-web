export function fetchContractAbi(address) {
  return new Promise((resolve, reject) => {
    try {
      fetch(`https://api.polygonscan.com/api?module=contract&action=getabi&address=${address}`).then((res) => {
        res.json().then((json) => {
          resolve(json.result);
        })
      }).catch((err) => {
        reject(err);
      })
    } catch (error) {
      reject(error);
    }
  })
}