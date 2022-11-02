import ImageAvatar from '/components/general/members/imageAvatar';
import InitialsAvatar from '/components/general/members/initialsAvatar';
import { useState, useEffect } from 'react';
import { cacheImageByURL } from '/services/caching';

export default function Avatar(props) {
  const {
    shiftRight = false,
    tooltip,
    text,
    separator = '-',
    wunderId,
    loginMethod,
    walletConnectUrl,
    i,
  } = props;
  const [imageUrl, setImageUrl] = useState(null);

  useEffect(async () => {
    if (loginMethod == 'MetaMask') {
      setImageUrl('/images/metamask.png');
      return;
    }
    if (loginMethod == 'WalletConnect') {
      setImageUrl(walletConnectUrl || '/images/walletconnect.png');
      return;
    }
    setImageUrl(null);
    if (!wunderId) return null;
    try {
      setImageUrl(
        await cacheImageByURL(
          `user_image_${wunderId}`,
          `/api/users/getImage?wunderId=${wunderId}`
        )
      );
    } catch (error) {
      setImageUrl(null);
    }
  }, [wunderId]);

  return imageUrl ? (
    <ImageAvatar
      imageUrl={imageUrl}
      tooltip={tooltip}
      shiftRight={shiftRight}
    />
  ) : (
    <InitialsAvatar
      tooltip={tooltip}
      text={text}
      separator={separator}
      color={['lime', 'pink', 'yellow', 'red', 'blue'][i % 5]}
      shiftRight={shiftRight}
    />
  );
}
