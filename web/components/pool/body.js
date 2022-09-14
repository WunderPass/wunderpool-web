import { Skeleton, Divider } from '@mui/material';
import ProposalList from '/components/proposals/list';
import TokenList from '/components/tokens/list';
import NftList from '/components/tokens/nfts';
import TransactionsList from '/components/pool/transactions';
import { useState, useEffect } from 'react';
import TabBar from '/components/utils/tabBar';

export default function body(props) {
  const { wunderPool, tokenAddedEvent, newProposalEvent } = props;
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

  return (
    <div className="mt-4 mb-8 ">
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
                tabs={['Proposals', 'Assets', "NFT's", 'Transactions']}
                tab={tab}
                setTab={setTab}
                parent="body"
              />
              <Divider className="mb-1 mt-1 opacity-70" />

              {tab == 0 && <ProposalList wunderPool={wunderPool} {...props} />}
              {tab == 1 && <TokenList tokens={wunderPool.tokens} {...props} />}
              {tab == 2 && <NftList nfts={wunderPool.nfts} {...props} />}
              {tab == 3 && (
                <TransactionsList wunderPool={wunderPool} {...props} />
              )}
            </div>
          </div>
        ))}
    </div>
  );
}
