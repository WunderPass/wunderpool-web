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
    0: 'Proposals',
    1: 'Assets',
    2: 'NFTs',
    3: 'Transactions',
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
      0: 'Proposals',
      1: 'Assets',
      2: 'NFTs',
      3: 'Betting',
      4: 'Transactions',
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

              {tabOptions[tab] == 'Proposals' && <ProposalList {...props} />}
              {tabOptions[tab] == 'Assets' && (
                <TokenList tokens={wunderPool.tokens} {...props} />
              )}
              {tabOptions[tab] == 'NFTs' && (
                <NftList nfts={wunderPool.nfts} {...props} />
              )}
              {tabOptions[tab] == 'Betting' && <GameList {...props} />}
              {tabOptions[tab] == 'Transactions' && (
                <TransactionsList {...props} />
              )}
            </div>
          </div>
        ))}
    </div>
  );
}
