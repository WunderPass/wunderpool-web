export function fetchContractAbi(address) {
  return new Promise((resolve, reject) => {
    try {
      fetch(`https://api.polygonscan.com/api?module=contract&action=getsourcecode&address=${address}`).then((res) => {
        res.json().then((json) => {
          resolve(json.result[0].ABI);
        })
      }).catch((err) => {
        reject(err);
      })
    } catch (error) {
      reject(error);
    }
  })
}