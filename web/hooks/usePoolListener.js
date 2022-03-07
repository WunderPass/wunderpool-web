import { ethers } from "ethers";
import { useEffect, useState } from "react";

export default function usePoolListener(handleInfo) {
  const [poolAddress, setPoolAddress] = useState(null);

  const setupPoolListener = (address) => {
    setPoolAddress(address);
  }

  const startListener = async () => {
    const abi = ["event NewProposal(uint indexed id, address indexed creator, string title)", "event Voted(uint indexed proposalId, address indexed voter, uint mode)", "event ProposalExecuted(uint indexed proposalId, address indexed executor, bytes[] result)"]
    const provider = new ethers.providers.JsonRpcProvider("https://polygon-mainnet.g.alchemy.com/v2/0MP-IDcE4civg4aispshnYoOKIMobN-A");
    const wunderPool = new ethers.Contract(poolAddress, abi, provider);

    wunderPool.removeAllListeners();

    wunderPool.on("NewProposal", async (id, creator, title) => {
      console.log("NewProposal:", id, creator, title)
      handleInfo(`New Proposal: ${title}`);
    });

    wunderPool.on("Voted", async (proposalId, voter, mode) => {
      console.log("Voted:", proposalId, voter, mode)
      const modeLookup = ["YES", "NO", "ABSTAIN"]
      handleInfo(`${voter} voted ${modeLookup[mode.toNumber()]} for Proposal #${proposalId.toNumber()}`);
    });

    wunderPool.on("ProposalExecuted", async (proposalId, executor, result) => {
      console.log("ProposalExecuted:", proposalId, executor, result)
      handleInfo(`Proposal #${proposalId.toNumber()} was executed by ${executor}`);
    });
  }

  useEffect(() => {
    if(poolAddress && poolAddress.length == 42) {
      startListener();
    }
  }, [poolAddress])

  return setupPoolListener
}