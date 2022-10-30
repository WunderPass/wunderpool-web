import { DialogActions, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { createPool } from '/services/contract/pools';
import { useRouter } from 'next/router';
import NewPoolConfigStep from './configStep';
import NewPoolInviteStep from './inviteStep';
import NewPoolVotingStep from './votingStep';
import NewPoolButtons from './buttons';
import TransactionFrame from '/components/utils/transactionFrame';
import { currency } from '/services/formatter';
import ResponsiveDialog from '../../utils/responsiveDialog';
import UseAdvancedRouter from '/hooks/useAdvancedRouter';

export default function AdvancedPoolDialog(props) {
  const {
    openAdvanced,
    setOpen,
    handleSuccess,
    handleInfo,
    handleError,
    user,
    newPoolEvent,
  } = props;
  const [waitingForPool, setWaitingForPool] = useState(false);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [disabled, setDisabled] = useState(true);
  const [retry, setRetry] = useState(false);
  const router = useRouter();
  const { removeQueryParam } = UseAdvancedRouter();

  const [poolName, setPoolName] = useState('');
  const [poolDescription, setPoolDescription] = useState('');
  const [image, setImage] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [value, setValue] = useState('');
  const [valueErrorMsg, setValueErrorMsg] = useState(null);
  const [tokenName, setTokenName] = useState('');
  const [tokenSymbol, setTokenSymbol] = useState('');
  const [tokenNameTouched, setTokenNameTouched] = useState(false);
  const [tokenSymbolTouched, setTokenSymbolTouched] = useState(false);
  const [minInvest, setMinInvest] = useState('');
  const [minInvestErrorMsg, setMinInvestErrorMsg] = useState(null);
  const [maxInvest, setMaxInvest] = useState('');
  const [maxInvestErrorMsg, setMaxInvestErrorMsg] = useState(null);
  const [maxMembers, setMaxMembers] = useState('50');
  const [isPublic, setIsPublic] = useState(false);
  const [autoLiquidateTs, setAutoLiquidateTs] = useState(0);

  const [votingEnabled, setVotingEnabled] = useState(true);
  const [votingThreshold, setVotingThreshold] = useState('50');
  const [votingTime, setVotingTime] = useState('24');
  const [minYesVoters, setMinYesVoters] = useState('1');
  const [showCustomDuration, setShowCustomDuration] = useState(false);
  const [showCustomPercent, setShowCustomPercent] = useState(false);
  const [showCustomPerson, setShowCustomPerson] = useState(false);

  const [members, setMembers] = useState([]);

  const [txHash, setTxHash] = useState(null);

  const configProps = {
    user,
    poolName,
    setPoolName,
    poolDescription,
    setPoolDescription,
    imageUrl,
    setImageUrl,
    setImage,
    value,
    setValue,
    valueErrorMsg,
    setValueErrorMsg,
    minInvest,
    setMinInvest,
    minInvestErrorMsg,
    setMinInvestErrorMsg,
    maxInvest,
    setMaxInvest,
    maxInvestErrorMsg,
    setMaxInvestErrorMsg,
    maxMembers,
    setMaxMembers,
    tokenName,
    setTokenName,
    tokenSymbol,
    setTokenSymbol,
    tokenNameTouched,
    setTokenNameTouched,
    tokenSymbolTouched,
    setTokenSymbolTouched,
    isPublic,
    setIsPublic,
    autoLiquidateTs,
    setAutoLiquidateTs,
  };

  const votingProps = {
    votingEnabled,
    setVotingEnabled,
    votingTime,
    setVotingTime,
    votingThreshold,
    setVotingThreshold,
    minYesVoters,
    setMinYesVoters,
    showCustomDuration,
    setShowCustomDuration,
    showCustomPercent,
    setShowCustomPercent,
    showCustomPerson,
    setShowCustomPerson,
  };

  const inviteProps = {
    members,
    setMembers,
  };

  const handleClose = () => {
    removeQueryParam('advancedPool');
    setWaitingForPool(false);
    setLoading(false);
    setStep(1);
    setRetry(false);
    setDisabled(true);
    setPoolName('');
    setPoolDescription('');
    setImage(null);
    setImageUrl(null);
    setValue('');
    setValueErrorMsg(null);
    setTokenName('');
    setTokenSymbol('');
    setTokenNameTouched(false);
    setTokenSymbolTouched(false);
    setMinInvest('');
    setMinInvestErrorMsg(null);
    setMaxInvest('');
    setMaxInvestErrorMsg(null);
    setMaxMembers('50');
    setVotingEnabled(true);
    setVotingThreshold('50');
    setVotingTime('24');
    setMinYesVoters('1');
    setShowCustomDuration(false);
    setShowCustomPercent(false);
    setShowCustomPerson(false);
    setMembers([]);
    setOpen(false);
  };

  const handleCloseKeepValues = () => {
    setWaitingForPool(false);
    setLoading(false);
    setStep(1);
    setOpen(false);
  };

  const submit = () => {
    setRetry(false);
    setStep((val) => val + 1);
    setLoading(true);
    setWaitingForPool(true);
    setTimeout(() => {
      createPool({
        creator: user.address,
        poolName,
        poolDescription,
        tokenName,
        tokenSymbol,
        minInvest,
        maxInvest,
        amount: value,
        members: members.map((m) => m.address),
        maxMembers,
        votingThreshold,
        votingTime: (Number(votingTime) || 72) * 3600,
        minYesVoters: minYesVoters || 1,
        isPublic,
        autoLiquidateTs,
        image: image,
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
      if (newPoolEvent?.hash?.toLowerCase() == txHash?.toLowerCase()) {
        handleSuccess(`Created Pool "${newPoolEvent.name}"`);
        user.fetchUsdBalance();
        router.push(`/pools/${newPoolEvent.address}`);
      }
    }
  }, [txHash, newPoolEvent?.hash]);

  useEffect(() => {
    setDisabled(false);
    switch (step) {
      case 1:
        if (
          !value ||
          valueErrorMsg ||
          poolName.length < 3 ||
          minInvestErrorMsg ||
          maxInvestErrorMsg
        ) {
          setDisabled(true);
        }
      case 2:
        if (!votingThreshold || !votingTime || !minYesVoters) setDisabled(true);
      default:
        break;
    }
  }, [
    step,
    value,
    minInvest,
    maxInvest,
    votingThreshold,
    votingTime,
    minYesVoters,
  ]);

  return (
    <ResponsiveDialog
      open={openAdvanced}
      onClose={handleCloseKeepValues}
      maxWidth="sm"
      disablePadding={loading}
      title="Create an advanced pool"
      actions={
        !waitingForPool && (
          <DialogActions className="flex items-center justify-center mx-4">
            <NewPoolButtons
              step={step}
              totalSteps={3}
              disabled={disabled}
              setStep={setStep}
              submit={submit}
              retry={retry}
            />
          </DialogActions>
        )
      }
    >
      {step === 1 && <NewPoolConfigStep {...configProps} />}
      {step === 2 && <NewPoolVotingStep {...votingProps} />}
      {step === 3 && <NewPoolInviteStep user={user} {...inviteProps} />}
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
    </ResponsiveDialog>
  );
}
