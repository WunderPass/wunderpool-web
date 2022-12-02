import {
  Dialog,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Alert,
  AlertTitle,
  CircularProgress,
  Container,
  Divider,
  Link,
  Typography,
  Chip,
} from '@mui/material';
import NextLink from 'next/link';
import { BiEdit } from 'react-icons/bi';
import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  validateEmail,
  validatePhone,
  validateUserName,
} from '/services/validator';
import PasswordRequiredAlert from '../../components/general/dialogs/passwordRequiredAlert';
import { decryptSeed } from '../../services/crypto';
import RevealLoginCode from '/components/general/profile/revealLoginCode';
import { useRouter } from 'next/router';
import QrCode from '/components/general/utils/qrCode';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { AiOutlineQrcode } from 'react-icons/ai';
import { MdContentCopy } from 'react-icons/md';

export default function Profile(props) {
  const { user, handleSuccess, handleError } = props;
  const [image, setImage] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [userName, setUserName] = useState('');
  const [email, setEmail] = useState(null);
  const [showEmailError, setShowEmailError] = useState(null);
  const [phoneNumber, setPhoneNumber] = useState(null);
  const [showPhoneError, setShowPhoneError] = useState(null);
  const [showUserNameError, setShowUserNameError] = useState(false);
  const [dataHasChanged, setDataHasChanged] = useState(false);
  const [showQrCode, setShowQrCode] = useState(false);

  const [seedPhrase, setSeedPhrase] = useState(null);
  const [passwordRequired, setPasswordRequired] = useState(false);
  const router = useRouter();

  const handleLogout = () => {
    user.logOut();
  };

  const toggleShowSeedPhrase = () => {
    if (seedPhrase) {
      setSeedPhrase(null);
    } else {
      setPasswordRequired(true);
    }
  };

  const handlePassword = (password) => {
    try {
      const seed = decryptSeed(password);
      if (!seed) throw 'Invalid Password';
      setSeedPhrase(seed);
      setPasswordRequired(false);
    } catch (error) {
      throw error;
    }
  };

  const uploadToServer = async () => {
    if (!image) {
      setUploading(false);
      setDataHasChanged(false);
    } else {
      try {
        const { signedMessage, signature } = await user.getSignedMillis();
        const formData = new FormData();
        formData.append('image', image);
        formData.append('wunderId', user?.wunderId);

        await axios({
          method: 'post',
          url: '/api/users/setImage',
          headers: {
            signature,
            signed_message: signedMessage,
          },
          data: formData,
        });
        setImage(null);
        setUploading(false);
        setDataHasChanged(false);
      } catch (error) {
        handleError(error?.response?.data?.error || error);
        setUploading(false);
        setDataHasChanged(false);
      }
    }
  };

  const handleChangeUserName = (event) => {
    setDataHasChanged(true);
    setShowUserNameError(!validateUserName(event.target.value));
    setUserName(event.target.value);
  };

  const handleChangeFirstName = (event) => {
    setDataHasChanged(true);
    setFirstName(event.target.value);
  };

  const handleChangeLastName = (event) => {
    setDataHasChanged(true);
    setLastName(event.target.value);
  };

  const handleChangePhone = (event) => {
    setDataHasChanged(true);
    if (event.target.value == '') {
      setShowPhoneError(false);
      setPhoneNumber(null);
      return;
    }

    setShowPhoneError(!validatePhone(event.target.value));
    setPhoneNumber(event.target.value);
  };

  const handleChangeEmail = (event) => {
    setDataHasChanged(true);
    setShowEmailError(!validateEmail(event.target.value));
    setEmail(event.target.value);
  };

  const updateUserInfo = async () => {
    setUploading(true);
    try {
      const { signedMessage, signature } = await user.getSignedMillis();
      const number = phoneNumber == '' ? null : phoneNumber;
      console.log({ signedMessage, signature });
      const reqData = {
        wunderId: user.wunderId,
        handle: userName,
        firstname: firstName,
        lastname: lastName,
        email: email == '' ? null : email,
        phone_number: number == '' ? null : number,
      };

      await axios({
        method: 'put',
        url: '/api/users/setProfile',
        headers: {
          signature: signature,
          signed: signedMessage,
        },
        data: reqData,
      });
      await uploadToServer();
      handleSuccess('Your profile was saved!');
      user.getUserData();
    } catch (error) {
      console.log(error);
      handleError(error?.response?.data?.error || error);
      setUploading(true);
    }
  };

  const handleSave = async () => {
    await updateUserInfo();
  };

  const handleClose = () => {
    setShowQrCode(false);
  };

  const uploadToClient = (event) => {
    if (event.target.files && event.target.files[0]) {
      const i = event.target.files[0];
      setImage(i);
      setImageUrl(URL.createObjectURL(i));
      setDataHasChanged(true);
    }
  };

  useEffect(() => {
    setUserName(user.userName);
    setFirstName(user.firstName);
    setLastName(user.lastName);
    setPhoneNumber(user.phoneNumber);
    setEmail(user.email);
  }, [
    user.userName,
    user.firstName,
    user.lastName,
    user.phoneNumber,
    user.email,
  ]);

  useEffect(() => {
    user.getUserData();
  }, []);

  return (
    <Container className="mt-5" maxWidth="lg">
      <div className="flex md:flex-row flex-col justify-center font-graphik">
        <div className="container-white-p-0 flex justify-center md:w-full">
          <div className="flex flex-col w-full items-center">
            <div>
              <label htmlFor="fileUpload">
                <div
                  className={`flex rounded-full overflow-hidden border-solid text-black bg-gray-200 shadow-sm w-40 h-40 cursor-pointer mt-6 items-center justify-center ${
                    imageUrl ? 'border-gray-400' : 'border-gray-300'
                  }`}
                  type="file"
                  name="profilePicture"
                >
                  <img
                    className="object-cover min-w-full min-h-full"
                    src={imageUrl || user.image}
                  />
                </div>
              </label>

              <input
                className="hidden"
                id="fileUpload"
                type="file"
                name="myImage"
                accept="image/*"
                onChange={uploadToClient}
              />
            </div>

            <div className="text-left w-full ">
              <Typography className="text-lg ml-4 mt-7 p-1 font-semibold ">
                My Profile
              </Typography>
              <Divider className="w-full mt-2 mb-4" />

              <div className="flex flex-col m-4 gap-2">
                <div className="flex flex-row justify-between">
                  {user.userName && (
                    <div className="flex flex-row items-center justify-between w-full">
                      <label
                        className={'text-black py-2 px-3 mt-2 font-semibold'}
                      >
                        Username
                      </label>
                    </div>
                  )}
                  <div className="flex flex-row justify-between w-full">
                    <input
                      className="textfield py-2 px-3 mx-2"
                      type="text"
                      placeholder="userName"
                      value={userName?.toLowerCase()}
                      onChange={handleChangeUserName}
                    />
                  </div>
                </div>
                {showUserNameError && (
                  <p className="text-red-700 text-right mr-3">
                    Username is not valid! Please only use letters and numbers!
                  </p>
                )}

                <div className="flex flex-row justify-between ">
                  <div className="flex flex-row items-center justify-between w-full">
                    <label
                      className={'text-black py-2 px-3 mt-2 font-semibold'}
                    >
                      First Name
                    </label>
                  </div>
                  <div className="flex flex-row justify-between w-full">
                    <input
                      className="textfield py-2 px-3 mx-2"
                      type="name"
                      autoComplete="name"
                      placeholder="First Name"
                      value={firstName}
                      onChange={handleChangeFirstName}
                    />
                  </div>
                </div>

                <div className="flex flex-row justify-between ">
                  <div className="flex flex-row items-center justify-between w-full">
                    <label
                      className={'text-black py-2 px-3 mt-2 font-semibold'}
                    >
                      Last Name
                    </label>
                  </div>
                  <div className="flex flex-row justify-between w-full">
                    <input
                      className="textfield py-2 px-3 mx-2"
                      type="name"
                      autoComplete="name"
                      placeholder="Last Name"
                      value={lastName}
                      onChange={handleChangeLastName}
                    />
                  </div>
                </div>

                <div className="flex flex-row justify-between ">
                  <div className="flex flex-row items-center justify-between w-full">
                    <label
                      className={'text-black py-2 px-3 mt-2 font-semibold'}
                    >
                      Phone Number
                    </label>
                  </div>
                  <div className="flex flex-row justify-between w-full">
                    <input
                      className="textfield py-2 px-3 mx-2"
                      type="tel"
                      autoComplete="tel"
                      placeholder="+1 202-123-4567"
                      value={phoneNumber}
                      onChange={handleChangePhone}
                    />
                  </div>
                </div>
                {showPhoneError && (
                  <p className="text-red-700 text-right mr-3">
                    Phone number is not valid!
                  </p>
                )}

                <div className="flex flex-row justify-between ">
                  <div className="flex flex-row items-center justify-between w-full">
                    <label
                      className={'text-black py-2 px-3 mt-2 font-semibold'}
                    >
                      Email
                    </label>
                  </div>
                  <div className="flex flex-row justify-between w-full">
                    <input
                      className="textfield py-2 px-3 mx-2"
                      type="email"
                      autoComplete="email"
                      placeholder="j.doe@gmail.com"
                      value={email}
                      onChange={handleChangeEmail}
                    />
                  </div>
                </div>
                {showEmailError && (
                  <p className="text-red-700 text-right mr-3">
                    Email is not valid!
                  </p>
                )}
                <div className="flex flex-row justify-between ">
                  <div className="flex flex-row items-center justify-between w-full">
                    <label
                      className={'text-black py-2 px-3 mt-2 font-semibold'}
                    >
                      Address
                    </label>
                  </div>
                  <div className="flex flex-row justify-between w-full cursor-disabled">
                    <CopyToClipboard
                      text={user?.address}
                      onCopy={() => handleSuccess('address copied!')}
                    >
                      <input
                        className="textfield py-2 px-3 mx-2 cursor-pointer truncate"
                        type="address"
                        autoComplete="address"
                        value={user?.address}
                      />
                    </CopyToClipboard>
                    <button onClick={() => setShowQrCode(!showQrCode)}>
                      <AiOutlineQrcode className="text-2xl" />
                    </button>
                    <Dialog
                      PaperProps={{
                        style: { borderRadius: 15 },
                      }}
                      open={showQrCode}
                      onClose={handleClose}
                      className="w-full"
                    >
                      <DialogTitle>Public address as QrCode</DialogTitle>
                      <DialogContent>
                        <DialogContentText>
                          <div className="flex items-center justify-center my-6 mt-8">
                            <div className="">
                              <QrCode
                                text={user?.address}
                                dark="text.primary"
                                size={7}
                                {...props}
                              />
                            </div>
                          </div>
                        </DialogContentText>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </div>
            </div>
            {dataHasChanged && (
              <div className="flex w-full justify-center">
                <button
                  className="btn-casama p-2 mt-3 mb-4 mx-6 w-full md:w-1/2 flex items-center justify-center"
                  disabled={uploading || showEmailError || showPhoneError}
                  onClick={handleSave}
                >
                  {uploading ? (
                    <CircularProgress size="1.5rem" color="inherit" />
                  ) : (
                    'Save'
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
        {/* <div className="flex w-full">
          <div className="flex flex-col container-white-p-0 justify-between py-2 m-2 md:m-4 mb-4 w-full">
            <div>
              <div>
                <Typography className="text-lg ml-4 mt-2 p-1 font-semibold">
                  Settings
                </Typography>
                <Divider className="w-full mt-2 mb-4" />
              </div>
              <div className="p-5">
                <div className="flex flex-row justify-between items-center">
                  <Typography className="font-semibold">Password</Typography>
                  <NextLink href="/profile/changePassword" passHref>
                    <button className="rounded-md py-1.5 ">
                      <div className="flex flex-row justify-between items-center py-2 ">
                        Change Password
                        <BiEdit className="ml-2 mt-1 text-lg" />
                      </div>
                    </button>
                  </NextLink>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-center">
              <button
                className="btn-danger p-2  mb-4 mx-6 w-full md:w-1/2"
                onClick={handleLogout}
              >
                Log out
              </button>
            </div>
          </div>
        </div> */}
      </div>
      <div className="container-white my-5">
        <div className="text-left w-full ">
          <div className="flex flex-row justify-between items-center mt-7">
            <Typography className="text-lg p-1 font-semibold">
              Casama Tutorial
            </Typography>
          </div>
          <Divider className="w-full mt-2 mb-4" />
          <p className="">
            Click here to see how Casama works in an interactive Demo
          </p>
          <div className="w-full">
            <button
              onClick={() => router.push('/onboarding')}
              className="btn-casama px-5 py-2 block mx-auto mt-3"
            >
              Start Tutorial
            </button>
          </div>
        </div>
      </div>
      {user.loginMethod == 'Casama' && (
        <div className="container-white my-5">
          <div className="text-left w-full ">
            <div className="flex flex-row justify-between items-center mt-7">
              <Typography className="text-lg p-1 font-semibold">
                Seed Phrase
              </Typography>
              {seedPhrase && (
                <Chip
                  className="bg-casama-extra-light-blue text-casama-blue px-2"
                  size="medium"
                  label={<RevealLoginCode privKey={seedPhrase} />}
                />
              )}
            </div>
            <Divider className="w-full mt-2 mb-4" />
            <Alert severity="warning" className="items-center">
              <AlertTitle>Kepp your Seed Phrase to yourself!</AlertTitle> Anyone
              with access to this Phrase can login to your Account and steal
              your funds.
            </Alert>
            {seedPhrase && (
              <div className="bg-gray-100 border-gray-300 border-2 rounded-xl p-3 my-3">
                {seedPhrase}
              </div>
            )}
            <div className="w-full">
              <button
                onClick={toggleShowSeedPhrase}
                className="btn-warning px-5 py-2 block mx-auto mt-3"
              >
                {seedPhrase ? 'Hide' : 'Reveal'} Seed Phrase
              </button>
            </div>
          </div>
        </div>
      )}
      <PasswordRequiredAlert
        passwordRequired={passwordRequired}
        onSuccess={handlePassword}
      />
      <div className="flex items-center justify-center mt-5">
        <button
          className="btn-danger p-2 mx-6 w-full md:w-1/2"
          onClick={handleLogout}
        >
          Log out
        </button>
      </div>
      {/* <div className="flex items-center justify-center  my-4">
        <NextLink href="/feedback/report" passHref>
          <Link textAlign="center">Give us feedback</Link>
        </NextLink>
      </div> */}
    </Container>
  );
}
