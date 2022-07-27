import { useState, useEffect } from 'react';
import DestroyPoolDialog from '/components/dialogs/destroyPool';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { useAlert } from 'react-alert';
import { currency, polyValueToUsd, secondsToHours } from '/services/formatter';
import { MdOutlineKeyboardArrowDown } from 'react-icons/md';
import { MdOutlineKeyboardArrowUp } from 'react-icons/md';
import { MdContentCopy } from 'react-icons/md';
import { BsLink45Deg } from 'react-icons/bs';
import { BsImage } from 'react-icons/bs';
import { FaLongArrowAltDown } from 'react-icons/fa';
import Link from 'next/link';
import { Typography, Collapse, Divider, Box } from '@mui/material';
import axios from 'axios';
const FormData = require('form-data');

export default function PoolHeader(props) {
  const { name, address, wunderPool } = props;
  const [destroyDialog, setDestroyDialog] = useState(false);
  const [showMoreInfo, setShowMoreInfo] = useState(false);
  const [image, setImage] = useState(null);
  const [banner, setBanner] = useState(null);
  const [bannerUrl, setBannerUrl] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [hasPicture, setHasPicture] = useState(false);
  const [hasBanner, setHasBanner] = useState(false);
  const [showSaveButton, setShowSaveButton] = useState(false);
  const [description, setDescription] = useState(null);

  const alert = useAlert();

  const toggleAdvanced = () => {
    setShowMoreInfo(!showMoreInfo);
  };

  const uploadImageToClient = (event) => {
    if (event.target.files && event.target.files[0]) {
      const i = event.target.files[0];
      setImage(i);
      setImageUrl(URL.createObjectURL(i));
      setHasPicture(true);
      setShowSaveButton(true);
    }
  };

  const uploadBannerToClient = (event) => {
    if (event.target.files && event.target.files[0]) {
      const i = event.target.files[0];
      setBanner(i);
      setBannerUrl(URL.createObjectURL(i));
      setHasBanner(true);
      setShowSaveButton(true);
    }
  };

  const uploadImageToServer = async () => {
    const formData = new FormData();
    formData.append('pool_image', image);
    formData.append('poolAddress', address.toLowerCase());
    axios({
      method: 'post',
      url: '/api/proxy/pools/setImage',
      data: formData,
    })
      .then(() => {
        setShowSaveButton(false);
      })
      .catch((err) => {
        console.error(err);
      });
  };

  const uploadBannerToServer = async () => {
    const formData = new FormData();
    formData.append('pool_banner', banner);
    formData.append('poolAddress', address.toLowerCase());
    axios({
      method: 'post',
      url: '/api/proxy/pools/setBanner',
      data: formData,
    })
      .then(() => {
        setShowSaveButton(false);
      })
      .catch((err) => {
        console.error('Error in Upload server');
      });
  };

  const checkIfPictureExists = () => {
    axios({
      url: `/api/proxy/pools/getImage?poolAddress=${address.toLowerCase()}`,
    })
      .then((res) => {
        if (res.data === '') {
          setHasPicture(false);
          return;
        }
        setImage(
          `/api/proxy/pools/getImage?poolAddress=${address.toLowerCase()}`
        );
        setHasPicture(true);
      })
      .catch((err) => {
        console.error(err);
      });
  };

  const checkIfBannerExists = () => {
    axios({
      url: `/api/proxy/pools/getBanner?poolAddress=${address.toLowerCase()}`,
    })
      .then((res) => {
        if (res.data === '') {
          setHasBanner(false);
          return;
        }
        setBanner(
          `/api/proxy/pools/getBanner?poolAddress=${address.toLowerCase()}`
        );
        setHasBanner(true);
      })
      .catch((err) => {
        console.error(err);
      });
  };

  const getDescription = () => {
    axios({
      url: `/api/proxy/pools/getPoolInfos?poolAddress=${address.toLowerCase()}`,
    })
      .then((res) => {
        setDescription(res.data.resp.pool_description);
      })
      .catch((err) => {
        console.error(err);
      });
  };

  const save = () => {
    uploadBannerToServer();
    uploadImageToServer();
  };

  useEffect(() => {
    if (address != null) {
      checkIfPictureExists();
      checkIfBannerExists();
      getDescription();
    }
  }, [address]);

  return (
    <>
      <div className="flex flex-col container-white-p-0 max-w-full sm:mt-6 ">
        <label htmlFor="bannerUpload" className="cursor-pointer">
          <div className="flex flex-col border-solid text-black rounded-xl bg-kaico-extra-light-blue h-36 w-full items-center justify-center cursor-pointer">
            {hasBanner ? (
              <img
                className="object-cover min-w-full min-h-full rounded-xl "
                src={bannerUrl ? bannerUrl : banner}
                type="file"
              />
            ) : (
              <>
                <div className="border-solid bg-kaico-blue rounded-full text-gray-300 p-2 my-2 mb-2">
                  <FaLongArrowAltDown className="text-2xl" />
                </div>
                <Typography className="opacity-30">
                  Add Pool banner image
                </Typography>
              </>
            )}
          </div>
        </label>
        <input
          className="hidden"
          id="bannerUpload"
          type="file"
          name="banner"
          accept="image/*"
          onChange={uploadBannerToClient}
        />

        <div className="flex flex-col container-white w-full">
          {hasPicture ? (
            <div
              className="flex-col w-20 h-20 container-image-round -mt-14 rounded-full "
              type="file"
            >
              <label htmlFor="imageUpload" className="cursor-pointer">
                <img
                  className="object-cover w-20 h-20 rounded-full"
                  src={imageUrl ? imageUrl : image}
                  type="file"
                />
              </label>

              <input
                className="hidden"
                id="imageUpload"
                type="file"
                name="image"
                accept="image/*"
                onChange={uploadImageToClient}
              />
            </div>
          ) : (
            <div className="flex-col w-20 h-20 container-image-round -mt-14 rounded-full items-center justify-center bg-white ">
              <label htmlFor="imageUpload">
                <div
                  className="flex items-center justify-center w-full bg-white rounded-full cursor-pointer"
                  type="file"
                >
                  <BsImage className="text-kaico-light-blue text-4xl m-5 bg-white " />
                </div>
              </label>
              <input
                className="hidden"
                id="imageUpload"
                type="file"
                name="image"
                accept="image/*"
                onChange={uploadImageToClient}
              />
            </div>
          )}

          <div className="flex flex-row justify-between">
            <Typography className="text-2xl mt-4 sm:ml-24 sm:-mt-5">
              {name}
            </Typography>
            <div className="flex flex-row justify-end ">
              <Typography className="text-2xl mt-4 font-bold sm:-mt-5 sm:mr-2 pl-2 text-right">
                Cash:{' '}
                {currency(
                  polyValueToUsd(Number(wunderPool.usdcBalance), {}),
                  {}
                )}
              </Typography>
            </div>
          </div>
          <button
            onClick={save}
            className={
              showSaveButton
                ? 'btn-primary p-1 px-4 w-20 mt-3 sm:mt-0'
                : 'hidden'
            }
          >
            Save
          </button>
          <Divider className="my-6 mt-8 opacity-70" />
          <div className="mb-1">
            <div className="flex flex-row items-center justify-between">
              <button className="mt-2 opacity-60" onClick={toggleAdvanced}>
                <div className="text-black flex flex-row items-center">
                  <Typography className="text-lg text-black">
                    Advanced Info
                  </Typography>
                  <div
                    style={{
                      transform: showMoreInfo
                        ? 'rotateX(180deg)'
                        : 'rotateX(0deg)',
                      transition:
                        'transform 300ms cubic-bezier(0.4, 0, 0.2, 1) 0ms',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    <MdOutlineKeyboardArrowDown className="ml-3 text-2xl" />
                  </div>
                </div>
              </button>
              <button
                style={{
                  transition: 'transform 200ms ease',
                  transform:
                    wunderPool.isMember && showMoreInfo
                      ? 'scaleY(1)'
                      : 'scaleY(0)',
                }}
                className="btn-danger p-3 px-4"
                onClick={() => setDestroyDialog(true)}
              >
                Liquidate Pool
              </button>
            </div>
            <Collapse in={showMoreInfo}>
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
                    {wunderPool.minInvest
                      ? currency(wunderPool.minInvest, {})
                      : '-'}
                  </Typography>
                </div>
                <div>
                  <Typography className="text-sm opacity-40 py-1 pt-6">
                    Max
                  </Typography>
                  <Typography className="text-sm opacity-90 py-1">
                    {wunderPool.maxInvest
                      ? currency(wunderPool.maxInvest, {})
                      : '-'}
                  </Typography>
                </div>
              </div>

              <Divider className="my-8 opacity-70" />
              <div>
                <Typography className="text-lg font-semi py-1">
                  Pool Description
                </Typography>
                <Typography className="text-sm opacity-40 py-1 ">
                  {description != null ? description : '-'}
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
                        {wunderPool.votingTime
                          ? `${secondsToHours(wunderPool.votingTime)}h`
                          : '-'}
                      </Typography>
                    </div>
                    <div>
                      <Typography className="text-sm opacity-40 py-1 pt-6">
                        Min % to win
                      </Typography>
                      <Typography className="text-sm opacity-90 py-1">
                        {'> '}
                        {wunderPool.votingThreshold &&
                          wunderPool.votingThreshold}
                        %
                      </Typography>
                    </div>
                    <div>
                      <Typography className="text-sm opacity-40 py-1 pt-6">
                        Min voters needed
                      </Typography>
                      <Typography className="text-sm opacity-90 py-1">
                        {wunderPool.minYesVoters && wunderPool.minYesVoters}
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
