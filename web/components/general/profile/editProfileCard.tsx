import {
  Dialog,
  DialogContent,
  DialogContentText,
  DialogTitle,
  CircularProgress,
  Divider,
} from '@mui/material';
import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  validateEmail,
  validatePhone,
  validateUserName,
} from '../../../services/validator';
import QrCode from '../utils/qrCode';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { AiOutlineQrcode } from 'react-icons/ai';
import { UseUserType } from '../../../hooks/useUser';
import { UseNotification } from '../../../hooks/useNotification';

type EditProfileCardProps = {
  user: UseUserType;
  handleSuccess: UseNotification.handleSuccess;
  handleError: UseNotification.handleError;
};

export default function EditProfileCard(props: EditProfileCardProps) {
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
            signed_message: `${signedMessage}`,
          },
          data: formData,
        });
        setImage(null);
        setUploading(false);
        setDataHasChanged(false);
      } catch (error) {
        handleError(error, user.wunderId, user.userName);
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
      const reqData = {
        wunderId: user.wunderId,
        handle: userName,
        firstname: firstName,
        lastname: lastName,
        email: email || null,
        phone_number: phoneNumber || null,
      };

      await axios({
        method: 'put',
        url: '/api/users/setProfile',
        headers: {
          signature: signature,
          signed: `${signedMessage}`,
        },
        data: reqData,
      });
      handleSuccess('Your profile was saved!');
      user.getUserData();
    } catch (error) {
      handleError(error);
    }
    try {
      await uploadToServer();
    } catch (error) {
      console.log('IMAGE', error);
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

  return (
    <div className="container-white-p-0 flex justify-center md:w-full">
      <div className="flex flex-col w-full items-center">
        <div>
          <label htmlFor="fileUpload">
            <div
              className={`flex rounded-full overflow-hidden border-solid text-black bg-gray-200 shadow-sm w-40 h-40 cursor-pointer mt-6 items-center justify-center ${
                imageUrl ? 'border-gray-400' : 'border-gray-300'
              }`}
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
          <h3 className="text-lg ml-4 mt-7 p-1 font-semibold ">My Profile</h3>
          <Divider className="w-full mt-2 mb-4" />

          <div className="flex flex-col m-4 gap-2">
            <div className="flex flex-row justify-between">
              {user.userName && (
                <div className="flex flex-row items-center justify-between w-full">
                  <label className={'text-black py-2 px-3 mt-2 font-semibold'}>
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
                <label className={'text-black py-2 px-3 mt-2 font-semibold'}>
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
                <label className={'text-black py-2 px-3 mt-2 font-semibold'}>
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
                <label className={'text-black py-2 px-3 mt-2 font-semibold'}>
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
                <label className={'text-black py-2 px-3 mt-2 font-semibold'}>
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
                <label className={'text-black py-2 px-3 mt-2 font-semibold'}>
                  Address
                </label>
              </div>
              <div className="flex flex-row justify-between w-full">
                <CopyToClipboard
                  text={user?.address}
                  onCopy={() => handleSuccess('address copied!')}
                >
                  <div className="textfield py-2 px-3 mx-2 flex items-center cursor-copy">
                    {user?.address}
                  </div>
                </CopyToClipboard>
                <button onClick={() => setShowQrCode(!showQrCode)}>
                  <AiOutlineQrcode className="text-2xl" />
                </button>
                <Dialog
                  PaperProps={{
                    style: { borderRadius: 12 },
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
                          <QrCode text={user?.address} size={7} {...props} />
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
  );
}
