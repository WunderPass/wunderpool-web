import { Collapse, Divider, IconButton, Link, Typography } from '@mui/material';
import { useEffect } from 'react';
import { useState } from 'react';
import { BsArrowDownLeft, BsArrowRight, BsArrowUpRight } from 'react-icons/bs';
import { IoIosArrowDown, IoIosArrowUp } from 'react-icons/io';
import usePoolListener from '../../hooks/usePoolListener';
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
import { FaMoneyCheckAlt } from 'react-icons/fa';
import { FiCheckCircle } from 'react-icons/fi';
import { MdOutlineReportGmailerrorred } from 'react-icons/md';
import { AiOutlineUserAdd } from 'react-icons/ai';
import { AiOutlineUsergroupAdd } from 'react-icons/ai';
import { MdHowToVote } from 'react-icons/md';
import { ImEnter } from 'react-icons/im';
import { HiLockClosed } from 'react-icons/hi';
import Avatar from '/components/members/avatar';

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
      <Typography className="opacity-90 text-casama-blue">{text}</Typography>
    </Link>
  );
}

export default function TransactionCard({ wunderPool, transaction, number }) {
  const [errorMsg, setErrorMsg] = useState('');

  const renderContent = (isError) => {
    if (transaction.type == 'TOKEN') {
      return TokenTransaction({ transaction, wunderPool, errorMsg });
    } else if (transaction.type == 'SWAP') {
      return SwapTransaction({ transaction, errorMsg });
    } else if (transaction.type == 'NORMAL') {
      return NormalTransaction({ transaction, wunderPool, errorMsg, isError });
    } else {
      return UnknownTransaction({ transaction, errorMsg });
    }
  };

  const { isError, hash } = transaction;

  useEffect(() => {
    if (hash && isError == '1') decodeError(hash).then(setErrorMsg);
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
      <div className="max-w-screen overflow-x-auto">
        {renderContent(isError)}
      </div>
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
          <div className="flex items-center justify-between lg:justify-evenly mt-2">
            <img className="w-12" src={tokenData?.image_url} alt="" />
            <Typography className="flex items-center gap-1 lg:mx-10">
              {sentToken ? (
                <BsArrowUpRight className="text-3xl text-red-600 font-bold" />
              ) : (
                <BsArrowDownLeft className="text-3xl text-green-600 font-bold" />
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
      </div>
      <div className="flex justify-center mt-0">
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
              {isDeposit ? (
                <div className="flex flex-row items-center justify-center">
                  <div className="mr-3">Deposit from {isDeposit.wunderId}</div>
                  <Avatar
                    wunderId={isDeposit.wunderId}
                    text={isDeposit.wunderId || '0-X'}
                    i={1}
                  />
                </div>
              ) : (
                <div className="flex flex-row items-center justify-center">
                  <div className="mr-3">
                    Withdrawl from {isWithdrawl.wunderId}
                  </div>
                  <Avatar
                    wunderId={isWithdrawl.wunderId}
                    text={isWithdrawl.wunderId || '0-X'}
                    i={1}
                  />
                </div>
              )}
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
        <div className="flex-grow w-full ">
          <div className="flex items-center justify-between lg:justify-evenly">
            <div className="flex flex-col md:flex-row items-center gap-2 ">
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
            <div className="flex flex-col md:flex-row-reverse items-center ">
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
      </div>
      <div className="flex justify-center mt-0">
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

function NormalTransaction({ transaction, wunderPool, errorMsg, isError }) {
  const { gasUsed, gasPrice, functionName, input, timeStamp } = transaction;
  const params = decodeInputParams(functionName, input);
  const [expand, setExpand] = useState(false);

  const transactionDescription = () => {
    if (/createProposalForUser/.test(functionName)) {
      const [userAddress, title, description] = params;
      return `Description: ${description}`;
    } else {
      return '';
    }
  };

  const transactionInfo = () => {
    if (/addToWhiteListForUser/.test(functionName)) {
      const [userAddress, newMember] = params;
      const wunderId = wunderPool.resolveMember(userAddress);
      const newMemberName = wunderPool.resolveMember(newMember);

      return (
        <div className="flex flex-row items-center mt-1">
          <div>
            <AiOutlineUserAdd className="text-3xl mr-1" />
          </div>
          <div className="mx-2">
            <Avatar
              wunderId={newMemberName}
              text={newMemberName || '0-X'}
              i={1}
            />
          </div>
          <div className="text-ellipsis ... overflow-hidden">
            {newMemberName} was invited by {wunderId}{' '}
          </div>
          <div className="mx-2">
            <Avatar wunderId={wunderId} text={wunderId || '0-X'} i={1} />
          </div>
        </div>
      );
    } else if (/addToWhiteListWithSecret/.test(functionName)) {
      const [userAddress, secret, validFor] = params;
      const wunderId = wunderPool.resolveMember(userAddress);

      return (
        <div className="flex flex-row items-center mt-1">
          <div>
            <AiOutlineUsergroupAdd className="text-4xl " />
          </div>
          <div className="mx-2">
            <Avatar wunderId={wunderId} text={wunderId || '0-X'} i={1} />
          </div>
          <div>
            {wunderId} created a invite Link for {validFor.toString()} people.
          </div>
        </div>
      );
    } else if (/joinForUser/.test(functionName)) {
      const [amount, user] = params;
      const wunderId = wunderPool.resolveMember(user);

      return (
        <div className="flex flex-row items-center mt-1">
          <div>
            <ImEnter className="text-4xl mr-2" />
          </div>
          <div className="mx-2">
            <Avatar wunderId={wunderId} text={wunderId || '0-X'} i={1} />
          </div>
          <div>
            {wunderId} joined the Pool with{' '}
            {currency(amount.div(1000000).toString())}
          </div>
        </div>
      );
    } else if (/createProposalForUser/.test(functionName)) {
      const [userAddress, title, description] = params;
      const wunderId = wunderPool.resolveMember(userAddress);
      let isClosePool = false;
      let color = 'text-4xl text-black';
      if (
        /Sell/.test(title + description) ||
        /sell/.test(title + description)
      ) {
        color = 'text-4xl text-red-600 ';
      } else if (
        /Buy/.test(title + description) ||
        /buy/.test(title + description)
      ) {
        color = 'text-4xl text-green-600';
      } else if (
        /Close/.test(title + description) ||
        /close/.test(title + description)
      ) {
        isClosePool = true;
        color = 'text-4xl text-red-600 ';
      }

      return (
        <div className="flex flex-row items-center mt-2 ">
          {isClosePool ? (
            <div className="mr-2">
              <HiLockClosed className={color} />
            </div>
          ) : (
            <div className="mr-2">
              <FaMoneyCheckAlt className={color} />
            </div>
          )}

          <div className="mx-2">
            <Avatar wunderId={wunderId} text={wunderId || '0-X'} i={1} />
          </div>
          <div className="text-ellipsis overflow-hidden ...">
            {wunderId} created Proposal "{title}"
          </div>
        </div>
      );
    } else if (/voteForUser/.test(functionName)) {
      const [userAddress, proposalId, mode] = params;
      const wunderId = wunderPool.resolveMember(userAddress);
      const proposalTitle =
        wunderPool.resolveProposal(proposalId.toNumber())?.title ||
        `#${proposalId.toString()}`;

      return (
        <div className="flex flex-row items-center mt-1">
          <div className="mr-1">
            <MdHowToVote
              className={
                mode.toNumber() == 2
                  ? 'text-4xl text-red-600'
                  : 'text-4xl text-green-600'
              }
            />
          </div>
          <div className="mx-2">
            <Avatar wunderId={wunderId} text={wunderId || '0-X'} i={1} />
          </div>
          <div>
            {wunderId} voted {mode.toNumber() == 2 ? 'NO' : 'YES'} for Proposal{' '}
            {proposalTitle}
          </div>
        </div>
      );
    } else if (/executeProposal/.test(functionName)) {
      const [proposalId] = params;
      const proposalTitle =
        wunderPool.resolveProposal(proposalId.toNumber())?.title ||
        `#${proposalId.toString()}`;

      return (
        <div className="flex flex-row items-center justify-start mt-2">
          {isError == '1' ? (
            <MdOutlineReportGmailerrorred className="text-6xl mr-2  text-red-600" />
          ) : (
            <FiCheckCircle className="text-4xl mr-2  text-green-600" />
          )}
          <div>Executed Proposal "{proposalTitle}"</div>
        </div>
      );
    } else {
      return '';
    }
  };

  return (
    <>
      <div className="flex flex-col md:flex-row items-center gap-2">
        <div className="flex-grow w-full">
          <div className="text-left">{transactionInfo()}</div>
        </div>
      </div>
      <div className="flex justify-center mt-1">
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
        <Typography className="my-2">{transactionDescription()}</Typography>
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
