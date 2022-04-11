import { useEffect, useState } from "react";
import { toEthString } from "../services/formatter";
import { initPoolSocket } from "/services/contract/init";

export default function usePoolListener(handleInfo) {
  const [poolAddress, setPoolAddress] = useState(null);

  const setupPoolListener = (address) => {
    setPoolAddress(address);
  }

  const startListener = async () => {
    const [wunderPool] = initPoolSocket(poolAddress);

    wunderPool.removeAllListeners();

    wunderPool.on("NewProposal", async (id, creator, title) => {
      console.log("NewProposal:", id, creator, title)
      handleInfo(`New Proposal: ${title}`);
    });

    wunderPool.on("NewMember", async (address, stake) => {
      console.log("NewMember:", address, stake)
      handleInfo(`${address} joined the Pool with ${stake}$`);
    });

    wunderPool.on("Voted", async (proposalId, voter, mode) => {
      console.log("Voted:", proposalId, voter, mode)
      const modeLookup = ["NONE", "YES", "NO"]
      handleInfo(`${voter} voted ${modeLookup[mode.toNumber()]} for Proposal #${proposalId.toNumber()}`);
    });

    wunderPool.on("ProposalExecuted", async (proposalId, executor, result) => {
      console.log("ProposalExecuted:", proposalId, executor, result)
      handleInfo(`Proposal #${proposalId.toNumber()} was executed by ${executor}`);
    });

    wunderPool.on("TokenAdded", async (tokenAddress, isERC721, tokenId) => {
      console.log("TokenAdded:", tokenAddress, isERC721, tokenId)
      handleInfo(`New ${isERC721 ? 'NFT' : 'Token'} Added to the Pool: ${tokenAddress}`);
    });

    wunderPool.on("MaticWithdrawed", async (receiver, amount) => {
      console.log("MaticWithdrawed:", receiver, amount)
      handleInfo(`${toEthString(amount, 18)} MATIC sent to ${receiver}`);
    });

    wunderPool.on("TokensWithdrawed", async (tokenAddress, receiver, amount) => {
      console.log("TokensWithdrawed:", tokenAddress, receiver, amount)
      handleInfo(`Token ${tokenAddress} sent to ${receiver}`);
    });
  }

  useEffect(() => {
    if(poolAddress && poolAddress.length == 42) {
      startListener();
    }
  }, [poolAddress])

  return setupPoolListener
}