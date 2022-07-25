import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { createPool } from '/services/contract/pools';
import { waitForTransaction } from '/services/contract/provider';
import { getPoolAddressFromTx } from '/services/contract/pools';
import { useRouter } from 'next/router';
import NewPoolConfigStep from './configStep';
import NewPoolInviteStep from './inviteStep';
import NewPoolVotingStep from './votingStep';
import NewPoolButtons from './buttons';
import TransactionFrame from '/components/utils/transactionFrame';
const FormData = require('form-data');


export default function NewPoolDialog(props) {
  const { open, setOpen, handleSuccess, handleInfo, handleError, user } = props;
  const [waitingForPool, setWaitingForPool] = useState(false);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [disabled, setDisabled] = useState(true);
  const router = useRouter();

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

  const [votingEnabled, setVotingEnabled] = useState(true);
  const [votingThreshold, setVotingThreshold] = useState('50');
  const [votingTime, setVotingTime] = useState('24');
  const [minYesVoters, setMinYesVoters] = useState('2');
  const [showCustomDuration, setShowCustomDuration] = useState(false);
  const [showCustomPercent, setShowCustomPercent] = useState(false);
  const [showCustomPerson, setShowCustomPerson] = useState(false);

  const [members, setMembers] = useState([]);

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

  //main functions
  const uploadToServer = async (address) => {

    const formData = new FormData()
    formData.append("pool_image", image)
    formData.append("poolAddress", address)

    axios({
      method: 'post',
      url: '/api/proxy/pools/setImage',
      data: formData,
    })
      .then(() => {
      })
      .catch((err) => {
        console.error(err);
      });
  };

  const handleClose = () => {
    setWaitingForPool(false);
    setLoading(false);
    setStep(1);
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
    setMinYesVoters('2');
    setShowCustomDuration(false);
    setShowCustomPercent(false);
    setShowCustomPerson(false);
    setMembers([]);
    setOpen(false);
  };

  const submit = () => {
    setStep((val) => val + 1);
    setLoading(true);
    setWaitingForPool(true);
    createPool(
      user.address,
      poolName,
      tokenName,
      tokenSymbol,
      minInvest || value,
      maxInvest || value,
      value,
      members.map((m) => m.address),
      maxMembers || 50,
      votingThreshold || 50,
      (Number(votingTime) || 72) * 3600,
      minYesVoters || 1
    )
      .then((res) => {
        handleClose();
        handleInfo('Waiting for Blockchain Transaction');
        waitForTransaction(res)
          .then((tx) => {
            handleSuccess(`Created Pool "${poolName}"`);
            getPoolAddressFromTx(res)
              .then(({ address, name }) => {
                user.fetchUsdBalance();
                router.push(`/pools/${address}?name=${name}`);
                uploadToServer(address);
                //upload image and description
              })
              .catch((err) => {
                console.log(err);
              });
          })
          .catch((err) => {
            console.log(err);
            handleError('Pool Creation failed');
          });
      })
      .catch((err) => {
        handleError(err);
        setWaitingForPool(false);
      });
  };

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
    <Dialog
      fullWidth
      maxWidth="sm"
      className="flex rounded-2xl w-full justify-center"
      open={open}
      onClose={handleClose}
      PaperProps={{
        style: { borderRadius: 12 },
      }}
    >
      <DialogTitle className="font-bold font-graphik tracking-tight w-full">
        Create a pool
      </DialogTitle>
      <DialogContent style={{ scrollbarwidth: 'none' }}>
        {step === 1 && <NewPoolConfigStep {...configProps} />}
        {step === 2 && <NewPoolVotingStep {...votingProps} />}
        {step === 3 && <NewPoolInviteStep {...inviteProps} />}
      </DialogContent>
      {waitingForPool ? (
        <></>
      ) : (
        <DialogActions className="flex items-center justify-center mx-4">
          <NewPoolButtons
            step={step}
            totalSteps={3}
            disabled={disabled}
            setStep={setStep}
            submit={submit}
          />
        </DialogActions>
      )}
      <TransactionFrame open={loading} />
    </Dialog>
  );
}
