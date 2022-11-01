import {
  CircularProgress,
  Container,
  Divider,
  Link,
  Typography,
} from '@mui/material';
import NextLink from 'next/link';
import RevealLoginCode from '/components/profile/revealLoginCode';
import { BiEdit } from 'react-icons/bi';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { validateEmail, validatePhone } from '/services/validator';
import { WalletBalance } from '../../components/profile/walletBalance';

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
  const [dataHasChanged, setDataHasChanged] = useState(false);

  const handleLogout = () => {
    user.logOut();
  };

  const uploadToServer = () => {
    if (!image) {
      setUploading(false);
      setDataHasChanged(false);
    } else {
      const { signedMessage, signature } = user.getSignedMillis();
      const formData = new FormData();
      formData.append('image', image);
      formData.append('wunderId', user?.wunderId);

      axios({
        method: 'post',
        url: '/api/users/setImage',
        headers: {
          signature,
          signed_message: signedMessage,
        },
        data: formData,
      })
        .then(() => {
          setImage(null);
          handleSuccess('messages.profile.saved');
        })
        .catch((err) => {
          handleError(err?.response?.data?.error);
        })
        .then(() => {
          setUploading(false);
          setDataHasChanged(false);
        });
    }
  };

  const handleChangeUserName = (event) => {
    setDataHasChanged(true);
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

  const updateUserInfo = () => {
    setUploading(true);
    const { signedMessage, signature } = user.getSignedMillis();
    const number = phoneNumber == '' ? null : phoneNumber;

    const reqData = {
      wunderId: user.wunderId,
      handle: userName,
      firstname: firstName,
      lastname: lastName,
      email: email,
      phone_number: number,
    };

    axios({
      method: 'put',
      url: '/api/users/setProfile',
      headers: {
        signature: signature,
        signed: signedMessage,
      },
      data: reqData,
    })
      .then(() => {
        handleSuccess('Your profile was saved!');
        user.getUserData();
      })
      .catch((err) => {
        handleError(err?.response?.data?.error);
      })
      .then(() => {
        uploadToServer();
      });
  };

  const handleSave = async () => {
    updateUserInfo();
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
                  {user.wunderId && (
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
                      placeholder="Wunder Id"
                      value={userName}
                      onChange={handleChangeUserName}
                    />
                  </div>
                </div>

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
              </div>
            </div>
            {dataHasChanged && (
              <div className="flex w-full justify-center">
                <button
                  className="btn-casama p-2 mt-3 mb-4 mx-6 w-full md:w-1/2 flex items-center justify-center"
                  disabled={
                    uploading ||
                    !(email || phoneNumber || image) ||
                    showEmailError ||
                    showPhoneError
                  }
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
                <div className="flex flex-row justify-between items-center py-2 pt-4">
                  <Typography className="font-semibold ">
                    Seed Phrase as QR
                  </Typography>
                  <RevealLoginCode {...props} />
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
      {/* <div className="flex items-center justify-center  my-4">
        <NextLink href="/feedback/report" passHref>
          <Link textAlign="center">Give us feedback</Link>
        </NextLink>
      </div> */}
    </Container>
  );
}
