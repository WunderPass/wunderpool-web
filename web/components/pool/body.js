import { Skeleton, Divider } from '@mui/material';
import ProposalList from '/components/proposals/list';
import { useRouter } from 'next/router';
import TokenList from '/components/tokens/list';
import NftList from '/components/tokens/nfts';
import TransactionsList from '/components/pool/transactions';
import { useState, useEffect } from 'react';
import TabBar from '/components/utils/tabBar';
import GameList from '../games/list';
import UseAdvancedRouter from '/hooks/useAdvancedRouter';

function setBadgeFor(options, title, badge) {
  return options.map((opt) => (opt.title == title ? { ...opt, badge } : opt));
}

export default function body(props) {
  const router = useRouter();
  const { wunderPool, tokenAddedEvent, newProposalEvent } = props;
  const [tab, setTab] = useState(router.query.tab || 0);
  const { addQueryParam, removeQueryParam } = UseAdvancedRouter();
  const [tabOptions, setTabOptions] = useState([
    { index: 0, title: 'Betting' },
    { index: 1, title: 'Investing' },
    { index: 2, title: 'Assets' },
    { index: 3, title: 'Transactions' },
  ]);

  useEffect(() => {
    if (router.query?.tab == tab) return;
    setTab(Number(router.query?.tab || 0));
  }, [router.query]);

  const handleClick = (index) => {
    if (tab == index) return;
    index === 0 ? removeQueryParam('tab') : addQueryParam({ tab: index });
  };

  useEffect(() => {
    if (!tokenAddedEvent) return;
    removeQueryParam('tab');
    addQueryParam({ tab: 2 });
  }, [tokenAddedEvent]);

  useEffect(() => {
    //DOESNT WORK CURRENTLY
    if (!newProposalEvent) return;
    setTimeout(() => {
      removeQueryParam('tab');
      addQueryParam({ tab: 1 });
    }, 1000);
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
          'Investing',
          wunderPool.proposals.filter(
            (p) => !(p.executed || p.declined || p.hasVoted)
          ).length
        )
      );
    }
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
                handleClick={handleClick}
              />
              <Divider className="mb-1 mt-1 opacity-70" />

              {tabOptions[tab].title == 'Betting' && <GameList {...props} />}

              {tabOptions[tab].title == 'Investing' && (
                <ProposalList {...props} />
              )}
              {tabOptions[tab].title == 'Assets' && (
                <TokenList tokens={wunderPool.tokens} {...props} />
              )}
              {tabOptions[tab].title == 'NFTs' && (
                <NftList nfts={wunderPool.nfts} {...props} />
              )}
              {tabOptions[tab].title == 'Transactions' && (
                <TransactionsList {...props} />
              )}
            </div>
          </div>
        ))}
    </div>
  );
}
