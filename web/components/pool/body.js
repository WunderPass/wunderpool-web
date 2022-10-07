import { Skeleton, Divider } from '@mui/material';
import ProposalList from '/components/proposals/list';
import TokenList from '/components/tokens/list';
import NftList from '/components/tokens/nfts';
import TransactionsList from '/components/pool/transactions';
import { useState, useEffect } from 'react';
import TabBar from '/components/utils/tabBar';
import GameList from '../games/list';

function setBadgeFor(options, title, badge) {
  return options.map((opt) =>
    opt.title == title ? { ...opt, badge: badge } : opt
  );
}

export default function body(props) {
  const { wunderPool, tokenAddedEvent, newProposalEvent } = props;
  const [tabOptions, setTabOptions] = useState([
    { title: 'Proposals', index: 0 },
    { title: 'Assets', index: 1 },
    { title: 'Betting', index: 2 },
    { title: 'Transactions', index: 3 },
  ]);
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
    if (wunderPool.bettingGames.length == 0) {
      setTabOptions((opts) => setBadgeFor(opts, 'Betting', 0));
    } else {
      setTabOptions((opts) =>
        setBadgeFor(
          opts,
          'Betting',
          wunderPool.bettingGames.filter((g) => !g.closed).length
        )
      );
    }
  }, [wunderPool.bettingGames]);

  useEffect(() => {
    if (wunderPool.proposals.length == 0) {
      setTabOptions((opts) => setBadgeFor(opts, 'Proposals', 0));
    } else {
      setTabOptions((opts) =>
        setBadgeFor(
          opts,
          'Proposals',
          wunderPool.proposals.filter(
            (p) => !(p.executed || p.declined || p.hasVoted)
          ).length
        )
      );
    }
    console.log(
      wunderPool.proposals.filter((p) => !(p.executed || p.declined))
    );
  }, [wunderPool.proposals]);

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
                tabs={tabOptions}
                tab={tab}
                setTab={setTab}
                parent="body"
              />
              <Divider className="mb-1 mt-1 opacity-70" />

              {tabOptions[tab].title == 'Proposals' && (
                <ProposalList {...props} />
              )}
              {tabOptions[tab].title == 'Assets' && (
                <TokenList tokens={wunderPool.tokens} {...props} />
              )}
              {tabOptions[tab].title == 'NFTs' && (
                <NftList nfts={wunderPool.nfts} {...props} />
              )}
              {tabOptions[tab].title == 'Betting' && <GameList {...props} />}
              {tabOptions[tab].title == 'Transactions' && (
                <TransactionsList {...props} />
              )}
            </div>
          </div>
        ))}
    </div>
  );
}
