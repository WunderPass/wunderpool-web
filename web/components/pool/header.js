import { useState } from 'react';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import DangerousIcon from '@mui/icons-material/Dangerous';
import DestroyPoolDialog from '/components/dialogs/destroyPool';
import PoolInfoDialog from '/components/dialogs/poolInfo';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { useAlert } from 'react-alert';
import { currency, usdc } from '/services/formatter';
import { MdOutlineKeyboardArrowDown } from 'react-icons/md';
import { MdOutlineKeyboardArrowUp } from 'react-icons/md';
import { MdContentCopy } from 'react-icons/md';
import { toEthString } from '../../services/formatter';
import { BsLink45Deg } from 'react-icons/bs';
import { GrGroup } from 'react-icons/gr';
import { BsImage } from 'react-icons/bs';
import { FaLongArrowAltDown } from 'react-icons/fa';
import Link from 'next/link';
import Image from 'next/image';
import ape from '/public/poolPictures/ape.png';
import { Typography, Collapse, Divider } from '@mui/material';

export default function PoolHeader(props) {
  const { name, address, wunderPool } = props;
  const [poolInfo, setPoolInfo] = useState(false);
  const [destroyDialog, setDestroyDialog] = useState(false);
  const [showMoreInfo, setShowMoreInfo] = useState(false);
  const alert = useAlert();

  const toggleAdvanced = () => {
    setShowMoreInfo(!showMoreInfo);
  };

  return (
    <>
      <div className="flex flex-col container-white-p-0 w-full mb-8">
        <div className="flex flex-col border-solid text-black  rounded-2xl bg-kaico-extra-light-blue h-36  w-full items-center justify-center cursor-pointer">
          <div className="border-solid bg-kaico-blue rounded-full text-gray-300 p-2 my-2 mb-2">
            <FaLongArrowAltDown className="text-2xl" />
          </div>
          <Typography className="opacity-30">Add Pool banner image</Typography>
        </div>
        <div className="flex flex-col container-white w-full">
          {false ? (
            <div className="flex-col w-20 container-image-round -mt-14 rounded-full ">
              <Image
                src={ape}
                alt="poolIcon"
                layout="responsive"
                className="rounded-full"
              />
            </div>
          ) : (
            <div className="flex-col w-20 container-image-round -mt-14 rounded-full items-center justify-center bg-white cursor-pointer">
              <div className="flex items-center justify-center w-full bg-white rounded-full">
                <BsImage className="text-kaico-light-blue text-4xl m-5 bg-white " />
              </div>
            </div>
          )}
          <div className="flex flex-col sm:flex-row sm:justify-between">
            <Typography className="text-2xl mt-4 sm:ml-24 sm:-mt-5">
              {name}
            </Typography>
            <Typography className="text-2xl mt-4 font-bold sm:-mt-5 sm:mr-2 ">
              {currency(wunderPool.usdcBalance?.toString() / 1000000, {})}
            </Typography>
          </div>

          <div className="mt-10">
            <Collapse className="" in={!showMoreInfo}>
              <button
                className="text-black text-sm mt-2 opacity-40"
                onClick={toggleAdvanced}
              >
                <div className="flex flex-row items-center ">
                  <Typography className="text-lg">Advanced Info</Typography>
                  <MdOutlineKeyboardArrowDown className="ml-3 text-xl" />
                </div>
              </button>
            </Collapse>
            <Collapse in={showMoreInfo}>
              <button
                className="text-black text-sm mt-2 opacity-40"
                onClick={toggleAdvanced}
              >
                <div className="flex flex-row items-center">
                  <Typography className="text-lg">Advanced Info</Typography>
                  <MdOutlineKeyboardArrowUp className="ml-3 text-2xl" />
                </div>
              </button>

              <div>
                <Typography className="text-sm opacity-40 py-1 pt-6">
                  Created
                </Typography>
                <Typography className="text-sm opacity-90 py-1">-</Typography>
              </div>
              <div>
                <Typography className="text-sm opacity-40 py-1 pt-6">
                  End Time
                </Typography>
                <Typography className="text-sm opacity-90 py-1">-</Typography>
              </div>
              <div>
                <Typography className="text-sm opacity-40 py-1 pt-6">
                  Min
                </Typography>
                <Typography className="text-sm opacity-90 py-1">
                  {wunderPool.governanceToken &&
                    toEthString(
                      wunderPool.governanceToken.entryBarrier,
                      6
                    )}{' '}
                  $
                </Typography>
              </div>
              <div>
                <Typography className="text-sm opacity-40 py-1 pt-6">
                  Max
                </Typography>
                <Typography className="text-sm opacity-90 py-1">-</Typography>
              </div>
              <Divider className="my-8 opacity-70" />
              <div>
                <Typography className="text-lg font-semi py-1">
                  Pool Description
                </Typography>
                <Typography className="text-sm opacity-40 py-1">
                  150Sol will be converted into a Polygon Matic token. I'm
                  looking forward to welcoming everyone who wishes to join the
                  pool. The current 100 Solana to Polygon exchange rate is 0
                  MATIC. There are no limits to SOL to MATIC swaps here, so feel
                  free to use ChangeNOW no matter how many coins you need to
                  exch... Read more
                </Typography>
              </div>
              <div>
                <Typography className="text-lg py-1 pt-6">
                  Pool Address
                </Typography>
                <div className=" border-solid text-kaico-blue truncate rounded-lg bg-gray-200 p-3 mt-2">
                  <CopyToClipboard
                    text={address}
                    onCopy={() => alert.show('address copied!')}
                  >
                    <span className=" cursor-pointer text-md">
                      <div className="flex flex-row items-center">
                        <div className="truncate ...">{address && address}</div>
                        <MdContentCopy className="text-gray-500 text-3xl ml-2" />
                      </div>
                    </span>
                  </CopyToClipboard>
                </div>
              </div>
              <Divider className="my-8 opacity-70" />
              {wunderPool.governanceToken && (
                <>
                  <div>
                    <Typography className="text-lg font-semi py-1">
                      Token details
                    </Typography>
                  </div>
                  <div>
                    <Typography className="text-sm opacity-40 py-1 pt-6">
                      Pool Token Name
                    </Typography>
                    <Typography className="text-sm opacity-90 py-1">
                      {wunderPool.governanceToken.name} (
                      {wunderPool.governanceToken.symbol})
                    </Typography>
                  </div>
                  <div>
                    <Typography className="text-sm opacity-40 py-1 pt-6">
                      Price per Token
                    </Typography>
                    <Typography className="text-sm opacity-90 py-1">
                      {toEthString(wunderPool.governanceToken.price, 6)} USD
                    </Typography>
                  </div>
                  <div>
                    <Typography className="text-sm opacity-40 py-1 pt-6">
                      Total Supply
                    </Typography>
                    <Typography className="text-sm opacity-90 py-1">
                      {wunderPool.governanceToken.totalSupply.toString()}
                    </Typography>
                  </div>
                  <div>
                    <Typography className="text-sm opacity-40 py-1 pt-6">
                      Token Pool Address
                    </Typography>
                    <Link
                      className="cursor-pointer"
                      target="_blank"
                      href={`https://polygonscan.com/token/${wunderPool.governanceToken.address}`}
                    >
                      <div className="flex flex-row items-center">
                        <Typography>
                          <BsLink45Deg className="text-lg opacity-60 mr-1" />
                        </Typography>
                        <Typography className="text-sm opacity-90 py-1 truncate ... text-kaico-blue cursor-pointer">
                          {wunderPool.governanceToken.address}
                        </Typography>
                      </div>
                    </Link>
                  </div>
                  <Divider className="my-8 opacity-70" />
                  <div>
                    <Typography className="text-lg font-semi py-1">
                      Voting rules
                    </Typography>
                  </div>
                  <div>
                    <Typography className="text-sm opacity-40 py-1 pt-6">
                      Duration of Voting
                    </Typography>
                    <Typography className="text-sm opacity-90 py-1">
                      -
                    </Typography>
                  </div>
                  <div>
                    <Typography className="text-sm opacity-40 py-1 pt-6">
                      Min % vor win
                    </Typography>
                    <Typography className="text-sm opacity-90 py-1">
                      -
                    </Typography>
                  </div>
                  <div>
                    <Typography className="text-sm opacity-40 py-1 pt-6">
                      Type of Voting
                    </Typography>
                    <Typography className="text-sm opacity-90 py-1">
                      -
                    </Typography>
                  </div>
                  <div>
                    <Typography className="text-sm opacity-40 py-1 pt-6">
                      Available answers
                    </Typography>
                    <Typography className="text-sm opacity-90 py-1">
                      -
                    </Typography>
                  </div>
                </>
              )}
            </Collapse>
          </div>
        </div>
      </div>
      <DestroyPoolDialog
        open={destroyDialog}
        setOpen={setDestroyDialog}
        address={address}
        name={name}
        wunderPool={wunderPool}
        {...props}
      />
    </>
  );
}
