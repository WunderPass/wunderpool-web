import { Collapse, Divider, IconButton, Link, Typography } from '@mui/material';
import { useEffect } from 'react';
import { useState } from 'react';
import { BsArrowDownLeft, BsArrowRight, BsArrowUpRight } from 'react-icons/bs';
import { IoIosArrowDown, IoIosArrowUp } from 'react-icons/io';
import {
  decodeError,
  decodeInputParams,
} from '../../services/contract/provider';
import { fetchErc20TokenData } from '../../services/contract/token';
import {
  currency,
  formatTokenBalance,
  weiToMatic,
} from '../../services/formatter';

const unixTimeToDate = (unixTime) => {
  const date = new Date(unixTime * 1000);
  return date.toLocaleDateString('de-DE');
};

const unixTimeToDateTime = (unixTime) => {
  const date = new Date(unixTime * 1000);
  return `${date.toLocaleDateString('de-DE')} ${date.toLocaleTimeString(
    'de-DE'
  )}`;
};

const calculateTrxFee = (gasUsed, gasPrice) => {
  const trxCost = gasUsed * gasPrice;
  return weiToMatic(trxCost);
};

function PolygonscanLink({ text, suffix = null }) {
  return (
    <Link
      className="no-underline"
      target="_blank"
      href={`https://polygonscan.com/${suffix || 'address/' + text}`}
    >
      <Typography className="opacity-90 text-kaico-blue">{text}</Typography>
    </Link>
  );
}

export default function TransactionCard({ wunderPool, transaction, number }) {
  const [errorMsg, setErrorMsg] = useState('');

  const renderContent = () => {
    if (transaction.type == 'TOKEN') {
      return TokenTransaction({ transaction, wunderPool, errorMsg });
    } else if (transaction.type == 'SWAP') {
      return SwapTransaction({ transaction, errorMsg });
    } else if (transaction.type == 'NORMAL') {
      return NormalTransaction({ transaction, wunderPool, errorMsg });
    } else {
      return UnknownTransaction({ transaction, errorMsg });
    }
  };

  const { isError, hash } = transaction;

  useEffect(() => {
    if (hash && isError) decodeError(hash).then(setErrorMsg);
  }, [hash, isError]);

  return (
    <div
      className={`${isError == '1' ? 'container-red' : 'container-gray'} mt-4`}
    >
      <div className="flex justify-between items-start max-w-screen overflow-x-auto">
        <Typography className="text-lg">
          Transaction #{number}{' '}
          {isError == '1' && <span className="text-red-700">[FAILED]</span>}
        </Typography>
        <Typography className="font-light">
          {unixTimeToDate(transaction.timeStamp)}
        </Typography>
      </div>
      <div className="max-w-screen overflow-x-auto">{renderContent()}</div>
    </div>
  );
}

function TokenTransaction({ transaction, wunderPool, errorMsg }) {
  const {
    from,
    to,
    value,
    tokenDecimal,
    contractAddress,
    gasUsed,
    gasPrice,
    timeStamp,
  } = transaction;
  const sentToken = from.toLowerCase() == wunderPool.poolAddress.toLowerCase();
  const formattedAmount = value / 10 ** tokenDecimal;
  const [expand, setExpand] = useState(false);
  const [tokenData, setTokenData] = useState({});

  const senderName = wunderPool.resolveMember(from);
  const receiverName = wunderPool.resolveMember(to);

  const isDeposit = wunderPool.members.find(
    (mem) => mem?.address?.toLowerCase() == from.toLowerCase()
  );
  const isWithdrawl = wunderPool.members.find(
    (mem) => mem?.address?.toLowerCase() == to.toLowerCase()
  );

  useEffect(() => {
    if (contractAddress) {
      fetchErc20TokenData(contractAddress)
        .then((data) => setTokenData(data))
        .catch((err) => setTokenData({}));
      return () => {
        setTokenData({});
      };
    }
  }, [contractAddress]);

  return (
    <>
      <div className="flex flex-col md:flex-row items-center gap-2">
        <div className="flex-grow w-full">
          <div className="flex items-center justify-evenly">
            <img className="w-12" src={tokenData?.image_url} alt="" />
            <Typography className="flex items-center gap-1">
              <span className="hidden sm:block">
                {sentToken ? 'Sent' : 'Received'}
              </span>
              {sentToken ? (
                <BsArrowUpRight className="text-lg text-red-400" />
              ) : (
                <BsArrowDownLeft className="text-lg text-green-400" />
              )}
            </Typography>
            <div>
              <Typography>{`${formattedAmount} ${tokenData?.symbol}`}</Typography>
              {tokenData?.dollar_price && (
                <Typography className="font-light">
                  ({currency(tokenData?.dollar_price * formattedAmount)})
                </Typography>
              )}
            </div>
          </div>
        </div>
        <IconButton className="p-0" onClick={() => setExpand((e) => !e)}>
          {expand ? (
            <IoIosArrowUp className="text-xl" />
          ) : (
            <IoIosArrowDown className="text-xl" />
          )}
        </IconButton>
      </div>
      <Collapse in={expand}>
        <Divider className="my-3" />
        {(isDeposit || isWithdrawl) && (
          <>
            <Typography className="text-center">
              {isDeposit
                ? `Deposit from ${isDeposit.wunderId}`
                : `Withdrawl from ${isWithdrawl.wunderId}`}
            </Typography>
            <Divider className="my-3" />
          </>
        )}
        <div className="flex flex-col gap-3">
          <div className="flex gap-1 items-center">
            <Typography>From:</Typography>
            <PolygonscanLink text={senderName} suffix={`address/${from}`} />
          </div>
          <div className="flex gap-1 items-center">
            <Typography>To:</Typography>
            <PolygonscanLink text={receiverName} suffix={`address/${to}`} />
          </div>
          {errorMsg && <Typography>Error: {errorMsg}</Typography>}
          <Typography>Date: {unixTimeToDateTime(timeStamp)}</Typography>
          <Typography>
            Fee: {calculateTrxFee(gasUsed, gasPrice).toFixed(6)} MATIC
          </Typography>
        </div>
      </Collapse>
    </>
  );
}

function SwapTransaction({ transaction, errorMsg }) {
  const { sentToken, receivedToken, gasUsed, gasPrice, timeStamp } =
    transaction;
  const [expand, setExpand] = useState(false);
  const [sentTokenData, setSentTokenData] = useState({});
  const [receivedTokenData, setReceivedTokenData] = useState({});

  const sentAmount = sentToken.value / 10 ** sentToken.tokenDecimal;
  const receivedAmount = receivedToken.value / 10 ** receivedToken.tokenDecimal;

  useEffect(() => {
    if (sentToken.contractAddress) {
      fetchErc20TokenData(sentToken.contractAddress)
        .then((data) => {
          setSentTokenData(data);
        })
        .catch((err) => setSentTokenData({}));
    }
    return () => {
      setSentTokenData({});
    };
  }, [sentToken.contractAddress]);

  useEffect(() => {
    if (receivedToken.contractAddress) {
      fetchErc20TokenData(receivedToken.contractAddress)
        .then((data) => {
          setReceivedTokenData(data);
        })
        .catch((err) => setReceivedTokenData({}));
    }
    return () => {
      setReceivedTokenData({});
    };
  }, [receivedToken.contractAddress]);

  return (
    <>
      <div className="flex flex-col mt-2 md:mt-1 md:flex-row items-center gap-2">
        <div className="flex-grow w-full">
          <div className="flex items-center">
            <div className="flex flex-col md:flex-row items-center gap-2 w-1/2">
              <img className="w-12" src={sentTokenData?.image_url} alt="" />
              <div className="text-center md:text-left">
                <Typography>
                  {formatTokenBalance(sentAmount)}
                  <Typography>{sentTokenData?.symbol}</Typography>
                </Typography>
                {sentTokenData?.dollar_price && (
                  <Typography className="font-light">
                    ({currency(sentTokenData?.dollar_price * sentAmount)})
                  </Typography>
                )}
              </div>
            </div>
            <BsArrowRight className="text-lg justify-self-center" />
            <div className="flex flex-col md:flex-row-reverse items-center gap-2 w-1/2">
              <img className="w-12" src={receivedTokenData?.image_url} alt="" />
              <div className="text-center md:text-left">
                <Typography>
                  {formatTokenBalance(receivedAmount)}
                  <Typography>{receivedTokenData?.symbol}</Typography>
                </Typography>
                {receivedTokenData?.dollar_price && (
                  <Typography className="font-light">
                    (
                    {currency(receivedTokenData?.dollar_price * receivedAmount)}
                    )
                  </Typography>
                )}
              </div>
            </div>
          </div>
        </div>
        <IconButton onClick={() => setExpand((e) => !e)}>
          {expand ? (
            <IoIosArrowUp className="text-xl" />
          ) : (
            <IoIosArrowDown className="text-xl" />
          )}
        </IconButton>
      </div>
      <Collapse in={expand}>
        <Divider className="my-3" />
        <Typography className="text-center">
          {`Swapped ${sentTokenData?.name} for ${receivedTokenData?.name}`}
        </Typography>
        <Divider className="my-3" />
        <div className="flex flex-col gap-3">
          {errorMsg && <Typography>Error: {errorMsg}</Typography>}
          <Typography>Date: {unixTimeToDateTime(timeStamp)}</Typography>
          <Typography>
            Fee: {calculateTrxFee(gasUsed, gasPrice).toFixed(6)} MATIC
          </Typography>
        </div>
      </Collapse>
    </>
  );
}

function NormalTransaction({ transaction, wunderPool, errorMsg }) {
  const { gasUsed, gasPrice, functionName, input, timeStamp } = transaction;
  const params = decodeInputParams(functionName, input);
  const [expand, setExpand] = useState(false);

  const transactionDescription = () => {
    if (/addToWhiteListForUser/.test(functionName)) {
      const [userAddress, newMember] = params;
      const wunderId = wunderPool.resolveMember(userAddress);
      const newMemberName = wunderPool.resolveMember(newMember);

      return `${newMemberName} was invited by ${wunderId} to join the Pool`;
    } else if (/addToWhiteListWithSecret/.test(functionName)) {
      const [userAddress, secret, validFor] = params;
      const wunderId = wunderPool.resolveMember(userAddress);

      return `${wunderId} created a Secret Invite Link for ${validFor.toString()} people`;
    } else if (/joinForUser/.test(functionName)) {
      const [amount, user] = params;
      const wunderId = wunderPool.resolveMember(user);

      return `${wunderId} joined the Pool with ${currency(
        amount.div(1000000).toString()
      )}`;
    } else if (/createProposalForUser/.test(functionName)) {
      const [userAddress, title, description] = params;
      const wunderId = wunderPool.resolveMember(userAddress);

      return `${wunderId} created Proposal ${title} // ${description}`;
    } else if (/voteForUser/.test(functionName)) {
      const [userAddress, proposalId, mode] = params;
      const wunderId = wunderPool.resolveMember(userAddress);
      const proposalTitle =
        wunderPool.resolveProposal(proposalId.toNumber())?.title ||
        `#${proposalId.toString()}`;

      return `${wunderId} voted ${
        mode.toNumber() == 2 ? 'NO' : 'YES'
      } for Proposal ${proposalTitle}`;
    } else if (/executeProposal/.test(functionName)) {
      const [proposalId] = params;
      const proposalTitle =
        wunderPool.resolveProposal(proposalId.toNumber())?.title ||
        `#${proposalId.toString()}`;

      return `Executed Proposal ${proposalTitle}`;
    } else {
      return '';
    }
  };

  return (
    <>
      <div className="flex flex-col md:flex-row items-center gap-2">
        <div className="flex-grow w-full">
          <div className="text-left">{transactionDescription()}</div>
        </div>
        <IconButton className="p-0" onClick={() => setExpand((e) => !e)}>
          {expand ? (
            <IoIosArrowUp className="text-xl" />
          ) : (
            <IoIosArrowDown className="text-xl" />
          )}
        </IconButton>
      </div>
      <Collapse in={expand}>
        <Divider className="my-3" />
        {errorMsg && (
          <Typography className="my-2">Error: {errorMsg}</Typography>
        )}
        <Typography className="my-2">
          Date: {unixTimeToDateTime(timeStamp)}
        </Typography>
        <Typography>
          Fee: {calculateTrxFee(gasUsed, gasPrice).toFixed(6)} MATIC
        </Typography>
      </Collapse>
    </>
  );
}

function UnknownTransaction({ transaction, errorMsg }) {
  const { hash, blockNumber, timeStamp, from, to, value, gasUsed, gasPrice } =
    transaction;
  return (
    <>
      <div className="flex flex-row truncate items-center">
        <Typography className="mr-1">Hash: </Typography>
        <PolygonscanLink text={hash} suffix={`tx/${hash}`} />
      </div>

      <div className="flex flex-row items-center">
        <Typography className="mr-1"> Block: </Typography>
        <PolygonscanLink text={blockNumber} suffix={`block/${blockNumber}`} />
      </div>
      <div className="flex flex-row">
        <Typography>Date: {unixTimeToDate(timeStamp)}</Typography>
      </div>
      <div className="flex flex-row  items-center">
        <Typography className="mr-1">From: </Typography>

        <PolygonscanLink text={from} />
      </div>
      <div className="flex flex-row  items-center">
        <Typography className="mr-1"> To: </Typography>

        <PolygonscanLink text={to} />
      </div>
      <div>
        <Typography>Value: {value}</Typography>
      </div>
      <div className="mb-1">
        <Typography>
          Fee: {calculateTrxFee(gasUsed, gasPrice).toFixed(6)} MATIC
        </Typography>
      </div>
    </>
  );
}
