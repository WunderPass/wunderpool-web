import { useState, useEffect } from 'react';
import ReceiveDialog from '/components/general/profile/receiveDialog';
import SendDialog from '/components/general/profile/sendDialog';
import { ImArrowUpRight2 } from 'react-icons/im';
import { ImArrowDownLeft2 } from 'react-icons/im';
import { GiPayMoney } from 'react-icons/gi';
import { GiReceiveMoney } from 'react-icons/gi';
import { currency } from '/services/formatter';

export default function WalletBalance(props) {
  const { user } = props;
  const [receiveDialog, setReceiveDialog] = useState(false);
  const [sendDialog, setSendDialog] = useState(false);
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
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between w-full gap-3">
          <button onClick={() => setSendDialog(true)} className="">
            <div className="flex flex-row sm:flex-col gap-3 justify-center items-center">
              <div className="btn-circle-light">
                <ImArrowUpRight2 className="text-xl" />
              </div>
              <p className="btn-circle-text-light">Send</p>
            </div>
          </button>
          <button onClick={() => setReceiveDialog(true)}>
            <div className="flex flex-row sm:flex-col gap-3 justify-center items-center">
              <div className="btn-circle-light">
                <ImArrowDownLeft2 className=" text-xl" />
              </div>
              <p className="btn-circle-text-light">Receive</p>
            </div>
          </button>
          <a
            href={`${process.env.TRANSAK_URL}${process.env.TRANSAK_API_KEY}&productsAvailed=BUY&network=polygon&cryptoCurrencyCode=USDC&walletAddress=${user.address}&defaultCryptoAmount=60&isAutoFillUserData=true&userData=${userData}&redirectURL=https://app.wunderpass.org/balance`}
            target="_blank"
          >
            <div className="flex flex-row sm:flex-col gap-3 justify-center items-center">
              <div className="btn-circle-light">
                <GiPayMoney className=" text-xl" />
              </div>
              <p className="btn-circle-text-light">Deposit</p>
            </div>
          </a>
          <a
            href={`${process.env.TRANSAK_URL}${process.env.TRANSAK_API_KEY}&network=polygon&productsAvailed=SELL&&walletAddress=${user.address}&defaultCryptoAmount=52&isAutoFillUserData=true&userData=${userData}redirectURL=https://app.wunderpass.org/balance`}
            target="_blank"
          >
            <div className="flex flex-row sm:flex-col gap-3 justify-center items-center">
              <div className="btn-circle-light">
                <GiReceiveMoney className=" text-xl" />
              </div>
              <p className="btn-circle-text-light">Withdraw</p>
            </div>
          </a>
        </div>
      </div>
      <ReceiveDialog
        setOpen={setReceiveDialog}
        open={receiveDialog}
        {...props}
      />
      <SendDialog setOpen={setSendDialog} open={sendDialog} {...props} />
    </div>
  );
}
