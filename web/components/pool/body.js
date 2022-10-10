import { Skeleton, Divider } from '@mui/material';
import ProposalList from '/components/proposals/list';
import TokenList from '/components/tokens/list';
import NftList from '/components/tokens/nfts';
import TransactionsList from '/components/pool/transactions';
import { useState, useEffect } from 'react';
import TabBar from '/components/utils/tabBar';
import GameList from '../games/list';

export default function body(props) {
  const { wunderPool, tokenAddedEvent, newProposalEvent } = props;
  const [tabOptions, setTabOptions] = useState({
    0: 'Betting',
    1: 'Investing',
    2: 'Assets',
    3: 'Transactions',
    // 4: "NFT's",
  });
  const [tab, setTab] = useState(0);

  useEffect(() => {
    if (!tokenAddedEvent) return;

    if (tokenAddedEvent.nft) {
      setTab(2);
    } else {
      setTab(1);
    }
  }, [tokenAddedEvent]);

  useEffect(() => {
    if (!newProposalEvent) return;
    setTab(0);
  }, [newProposalEvent]);

  useEffect(() => {
    if (wunderPool.bettingGames.length == 0) return;
    setTabOptions({
      0: 'Betting',
      1: 'Investing',
      2: 'Assets',
      3: 'Transactions',
      // 4: "NFT's",
    });
  }, [wunderPool.bettingGames.length]);

  return (
    <div className="">
      {wunderPool.isMember &&
        (!wunderPool.loadingState.init ? (
          <Skeleton
            variant="rectangular"
            width="100%"
            sx={{ height: '100px', borderRadius: 3 }}
          />
        ) : (
          <div className="flex container-white ">
            <div className="flex flex-col w-full">
              <TabBar
                tabs={Object.values(tabOptions)}
                tab={tab}
                setTab={setTab}
                parent="body"
              />
              <Divider className="mb-1 mt-1 opacity-70" />
              {tabOptions[tab] == 'Betting' && <GameList {...props} />}
              {tabOptions[tab] == 'Investing' && <ProposalList {...props} />}
              {tabOptions[tab] == 'Assets' && (
                <TokenList tokens={wunderPool.tokens} {...props} />
              )}
              {/* {tabOptions[tab] == 'NFTs' && (
                <NftList nfts={wunderPool.nfts} {...props} />
              )} */}
              {tabOptions[tab] == 'Transactions' && (
                <TransactionsList {...props} />
              )}
            </div>
          </div>
        ))}
    </div>
  );
}
