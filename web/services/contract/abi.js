import { ethers } from "ethers";
import { httpProvider } from "./init";

export function fetchContractAbi(address) {
  return new Promise((resolve, reject) => {
    try {
      fetch(
        `https://api.polygonscan.com/api?module=contract&action=getabi&address=${address}&apikey=${process.env.POLYGONSCAN_API_KEY}`
      )
        .then((res) => {
          res.json().then((json) => {
            const abi = JSON.parse(json.result);
            if (
              abi.filter((func) => func.name == "implementation").length >= 1
            ) {
              const proxyContract = new ethers.Contract(
                address,
                ["function implementation() public view returns(address)"],
                httpProvider
              );
              proxyContract.implementation().then((proxyAddress) => {
                resolve(fetchContractAbi(proxyAddress));
              });
            } else {
              resolve(abi);
            }
          });
        })
        .catch((err) => {
          reject(err);
        });
    } catch (error) {
      reject(error);
    }
  });
}
