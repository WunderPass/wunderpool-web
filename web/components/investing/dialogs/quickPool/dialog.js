import { DialogActions, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { createPool } from '/services/contract/pools';
import { useRouter } from 'next/router';
import CreatePoolStep from './createStep';
import QuickPoolButtons from './buttons';
import TransactionFrame from '/components/general/utils/transactionFrame';
import { currency } from '/services/formatter';
import ResponsiveDialog from '/components/general/utils/responsiveDialog';
import UseAdvancedRouter from '/hooks/useAdvancedRouter';
import { compAddr } from '../../../../services/memberHelpers';

export default function AdvancedPoolDialog(props) {
  const {
    openQuick,
    setOpen,
    handleSuccess,
    handleInfo,
    handleError,
    user,
    newPoolEvent,
  } = props;
  const [waitingForPool, setWaitingForPool] = useState(false);
  const [loading, setLoading] = useState(false);
  const [retry, setRetry] = useState(false);
  const router = useRouter();
  const { removeQueryParam } = UseAdvancedRouter();

  const [poolName, setPoolName] = useState('');
  const [value, setValue] = useState('');
  const [valueErrorMsg, setValueErrorMsg] = useState(null);
  const [tokenName, setTokenName] = useState('');
  const [tokenSymbol, setTokenSymbol] = useState('');
  const [members, setMembers] = useState([]);

  const [txHash, setTxHash] = useState(null);

  const configProps = {
    user,
    members,
    setMembers,
    poolName,
    setPoolName,
    value,
    setValue,
    valueErrorMsg,
    setValueErrorMsg,
    setTokenName,
    setTokenSymbol,
  };

  const handleClose = () => {
    removeQueryParam('quickPool');
    setWaitingForPool(false);
    setLoading(false);
    setRetry(false);
    setPoolName('');
    setValue('');
    setValueErrorMsg(null);
    setTokenName('');
    setTokenSymbol('');
    setMembers([]);
    setOpen(false);
  };

  const handleCloseKeepValues = () => {
    setWaitingForPool(false);
    setLoading(false);
    setOpen(false);
  };

  const submit = () => {
    setRetry(false);
    setLoading(true);
    setWaitingForPool(true);
    setTimeout(() => {
      createPool({
        creator: user.address,
        poolName,
        tokenName,
        tokenSymbol,
        amount: value,
        members: members.map((m) => m.address),
        votingThreshold: 1,
        votingTime: 600,
        minYesVoters: 1,
      })
        .then((res) => {
          handleClose();
          handleInfo('Waiting for Blockchain Transaction');
          setTxHash(res);
        })
        .catch((err) => {
          setLoading(false);
          setRetry(true);
          handleError(err);
          setWaitingForPool(false);
        });
    }, 10);
  };

  useEffect(() => {
    if (txHash) {
      if (compAddr(newPoolEvent?.hash, txHash)) {
        handleSuccess(`Created Pool "${newPoolEvent.name}"`);
        user.fetchUsdBalance();
        router.push(`/investing/pools/${newPoolEvent.address}`);
      }
    }
  }, [txHash, newPoolEvent?.hash]);

  return (
    <>
      <ResponsiveDialog
        open={openQuick}
        onClose={handleCloseKeepValues}
        maxWidth="sm"
        disablePadding={loading}
        title="Create a quick pool"
        actions={
          !waitingForPool && (
            <DialogActions className="flex items-center justify-center mx-4">
              <QuickPoolButtons
                submit={submit}
                retry={retry}
                disabled={!value || valueErrorMsg || poolName.length < 3}
              />
            </DialogActions>
          )
        }
      >
        {!loading ? (
          <CreatePoolStep {...configProps} />
        ) : (
          <>
            {waitingForPool && (
              <div className="flex flex-row justify-between items-center gap-1 w-full px-6">
                <Typography className="text-md" color="GrayText">
                  {poolName}
                </Typography>
                <Typography className="text-md" color="GrayText">
                  {currency(value)}
                </Typography>
              </div>
            )}
            {retry &&
              'We could not create your Pool. This could be due to Blockchain issues. Do you want to try again?'}
            <TransactionFrame open={loading} />
          </>
        )}
      </ResponsiveDialog>
    </>
  );
}
