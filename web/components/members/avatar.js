import ImageAvatar from '/components/members/imageAvatar';
import InitialsAvatar from '/components/members/initialsAvatar';
import { useState, useEffect } from 'react';
import { cacheImageByURL } from '/services/caching';

export default function Avatar(props) {
  const { tooltip, text, separator = '-', wunderId, loginMethod, i } = props;
  const [imageUrl, setImageUrl] = useState(null);

  useEffect(async () => {
    if (loginMethod == 'MetaMask') {
      setImageUrl('/images/metamask.png');
      return;
    }
    if (loginMethod == 'WalletConnect') {
      setImageUrl('/images/walletconnect.png');
      return;
    }
    setImageUrl(null);
    if (!wunderId) return null;
    try {
      setImageUrl(
        await cacheImageByURL(
          `user_image_${wunderId}`,
          `/api/proxy/users/getImage?wunderId=${wunderId}`
        )
      );
    } catch (error) {
      setImageUrl(null);
    }
  }, [wunderId]);

  return imageUrl ? (
    <ImageAvatar imageUrl={imageUrl} tooltip={tooltip} />
  ) : (
    <InitialsAvatar
      tooltip={tooltip}
      text={text}
      separator={separator}
      color={['lime', 'pink', 'yellow', 'red', 'blue'][i % 5]}
    />
  );
}
