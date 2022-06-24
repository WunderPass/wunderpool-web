import { useState } from 'react';
import DestroyPoolDialog from '/components/dialogs/destroyPool';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { useAlert } from 'react-alert';
import { currency, polyValueToUsd } from '/services/formatter';
import { MdOutlineKeyboardArrowDown } from 'react-icons/md';
import { MdOutlineKeyboardArrowUp } from 'react-icons/md';
import { MdContentCopy } from 'react-icons/md';
import { BsLink45Deg } from 'react-icons/bs';
import { BsImage } from 'react-icons/bs';
import { FaLongArrowAltDown } from 'react-icons/fa';
import Link from 'next/link';
import Image from 'next/image';
import ape from '/public/poolPictures/ape.png';
import { Typography, Collapse, Divider } from '@mui/material';

export default function PoolHeader(props) {
  const { name, address, wunderPool } = props;
  const [destroyDialog, setDestroyDialog] = useState(false);
  const [showMoreInfo, setShowMoreInfo] = useState(false);
  const alert = useAlert();

  const toggleAdvanced = () => {
    setShowMoreInfo(!showMoreInfo);
  };

  return (
    <>
      <div
        className={
          !showMoreInfo
            ? 'flex flex-col container-white-p-0 w-full sm:mt-6 md:max-h-72 '
            : 'flex flex-col container-white-p-0 w-full sm:mt-6 '
        }
      >
        <div className="flex flex-col border-solid text-black rounded-xl bg-kaico-extra-light-blue h-36 w-full items-center justify-center cursor-pointer">
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
              Cash: {currency(wunderPool.totalBalance, {})}
            </Typography>
          </div>

          <Divider className="my-6 mt-8 opacity-70" />

          <div className="mb-1">
            <Collapse in={!showMoreInfo}>
              <button
                className="text-black text-sm mt-0 opacity-40"
                onClick={toggleAdvanced}
              >
                <div className="flex flex-row items-center">
                  <Typography className="text-lg">Advanced Info</Typography>
                  <MdOutlineKeyboardArrowDown className="ml-3 text-2xl" />
                </div>
              </button>
            </Collapse>
            <Collapse in={showMoreInfo}>
              <div className="flex flex-row  items-center  justify-between">
                <button
                  className="text-black text-sm mt-2 opacity-40"
                  onClick={toggleAdvanced}
                >
                  <div className="flex flex-row items-center">
                    <Typography className="text-lg">Advanced Info</Typography>
                    <MdOutlineKeyboardArrowUp className="ml-3 text-2xl" />
                  </div>
                </button>
                <button
                  className={
                    wunderPool.isMember ? 'btn-danger p-3 px-4' : 'hidden'
                  }
                  onClick={() => setDestroyDialog(true)}
                >
                  Liquidate Pool
                </button>
              </div>

              <div className="lg:flex lg:flex-row lg:w-3/4 lg:justify-between">
                <div>
                  <Typography className="text-sm opacity-40 py-1 pt-6">
                    Created
                  </Typography>
                  <Typography className="text-sm opacity-90 py-1">-</Typography>
                </div>

                <div>
                  <Typography className="text-sm opacity-40 py-1 pt-6">
                    Min
                  </Typography>
                  <Typography className="text-sm opacity-90 py-1">
                    {wunderPool.governanceToken &&
                      currency(
                        polyValueToUsd(
                          wunderPool.governanceToken.entryBarrier,
                          {}
                        ),
                        {}
                      )}
                  </Typography>
                </div>
                <div>
                  <Typography className="text-sm opacity-40 py-1 pt-6">
                    Max
                  </Typography>
                  <Typography className="text-sm opacity-90 py-1">-</Typography>
                </div>
              </div>

              <Divider className="my-8 opacity-70" />
              <div>
                <Typography className="text-lg font-semi py-1">
                  Pool Description
                </Typography>
                <Typography className="text-sm opacity-40 py-1">
                  Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed
                  diam nonumy eirmod tempor invidunt ut labore et dolore magna
                  aliquyam erat, sed diam voluptua. At vero eos et accusam et
                  justo duo dolores et ea rebum. Stet clita kasd gubergren, no
                  sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem
                  ipsum dolor sit amet, consetetur sadipscing elitr, sed diam
                  nonumy eirmod tempor invidunt ut labore et dolore magna
                  aliquyam erat, sed diam voluptua. At vero eos et accusam et
                  justo duo dolores et ea rebum. Stet clita kasd gubergren, no
                  sea takimata sanctus est Lorem ipsum dolor sit amet.... Read
                  more
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
                      <div className="flex flex-row items-center justify-between">
                        <div className="truncate ...">{address && address}</div>
                        <MdContentCopy className="text-gray-500 text-2xl ml-2" />
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
                  <div className="lg:flex lg:flex-row lg:w-3/4 lg:justify-between">
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
                        {currency(
                          wunderPool.governanceToken.price / 1000000,
                          {}
                        )}
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
                  <div className="lg:flex lg:flex-row lg:w-3/4 lg:justify-between">
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
