import { useState, useEffect } from 'react';
import ReceiveDialog from './receiveDialog';
import SendDialog from './sendDialog';
import { ImArrowUpRight2 } from 'react-icons/im';
import { ImArrowDownLeft2 } from 'react-icons/im';
import { GiPayMoney } from 'react-icons/gi';
import { GiReceiveMoney } from 'react-icons/gi';
import { currency } from '../../../services/formatter';
import TopUpAlert from '../dialogs/topUpAlert';
import RampOffDialog from './RampOffDialog';
import { transakRampOffLink } from '../../../services/transak';
import { UseUserType } from '../../../hooks/useUser';
import { UseNotification } from '../../../hooks/useNotification';

type WalletBalanceProps = {
  user: UseUserType;
  handleError: UseNotification.handleError;
};

export default function WalletBalance(props: WalletBalanceProps) {
  const { user } = props;
  const [receiveDialog, setReceiveDialog] = useState(false);
  const [sendDialog, setSendDialog] = useState(false);
  const [openTopUp, setOpenTopUp] = useState(false);
  const [openRampOff, setOpenRampOff] = useState(false);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    let userData = {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      mobileNumber: user.phoneNumber,
      dob: '-',
      address: {
        addressLine1: '-',
        addressLine2: '-',
        city: 'Berlin',
        state: '-',
        postCode: '10178',
        countryCode: 'GER',
      },
    };
    setUserData(userData);
  }, [user]);

  return (
    <div className="container-white mb-5">
      <div className="flex flex-col">
        <div className="opacity-70 text-xl font-medium">Account Balance</div>
        <div className="text-5xl font-semibold my-4 text-casama-blue tracking-wide">
          {currency(user.usdBalance)}
        </div>
      </div>

      <div className="mt-7 mx-3">
        <div className="flex flex-wrap sm:flex-nowrap items-center justify-between w-full gap-y-3 gap-x-0 sm:gap-x-3">
          <button
            className="w-1/2 sm:w-1/4"
            onClick={() => setSendDialog(true)}
          >
            <div className="flex w-full flex-col gap-3 justify-center items-center">
              <div className="btn-circle-light">
                <ImArrowUpRight2 className="text-xl" />
              </div>
              <p className="btn-circle-text-light">Send</p>
            </div>
          </button>
          <button
            className="w-1/2 sm:w-1/4"
            onClick={() => setReceiveDialog(true)}
          >
            <div className="flex w-full flex-col gap-3 justify-center items-center">
              <div className="btn-circle-light">
                <ImArrowDownLeft2 className=" text-xl" />
              </div>
              <p className="btn-circle-text-light">Receive</p>
            </div>
          </button>
          {/* <a
            href={`${process.env.TRANSAK_URL}${process.env.TRANSAK_API_KEY}&productsAvailed=BUY&network=polygon&cryptoCurrencyCode=USDC&walletAddress=${user.address}&defaultCryptoAmount=60&isAutoFillUserData=true&userData=${userData}&redirectURL=https://app.casama.io/balance`}
            target="_blank"
            className="w-1/2 sm:w-1/4"
          >
            <div className="flex w-full flex-col gap-3 justify-center items-center">
              <div className="btn-circle-light">
                <GiPayMoney className=" text-xl" />
              </div>
              <p className="btn-circle-text-light">Deposit</p>
            </div>
          </a> */}
          <button className="w-1/2 sm:w-1/4" onClick={() => setOpenTopUp(true)}>
            <div className="flex w-full flex-col gap-3 justify-center items-center">
              <div className="btn-circle-light">
                <GiPayMoney className=" text-xl" />
              </div>
              <p className="btn-circle-text-light">Deposit</p>
            </div>
          </button>
          <a
            href={transakRampOffLink({
              amount: user.usdBalance,
              address: user.address,
            })}
            target="_blank"
            className="w-1/2 sm:w-1/4"
          >
            <div className="flex w-full flex-col gap-3 justify-center items-center">
              <div className="btn-circle-light">
                <GiReceiveMoney className=" text-xl" />
              </div>
              <p className="btn-circle-text-light">Withdraw</p>
            </div>
          </a>
          {/* <button
            className="w-1/2 sm:w-1/4"
            onClick={() => setOpenRampOff(true)}
          >
            <div className="flex w-full flex-col gap-3 justify-center items-center">
              <div className="btn-circle-light">
                <GiReceiveMoney className=" text-xl" />
              </div>
              <p className="btn-circle-text-light">Withdraw</p>
            </div>
          </button> */}
        </div>
      </div>
      <ReceiveDialog
        setOpen={setReceiveDialog}
        open={receiveDialog}
        {...props}
      />
      <TopUpAlert open={openTopUp} setOpen={setOpenTopUp} {...props} />
      <SendDialog open={sendDialog} setOpen={setSendDialog} {...props} />
      <RampOffDialog open={openRampOff} setOpen={setOpenRampOff} {...props} />
    </div>
  );
}
