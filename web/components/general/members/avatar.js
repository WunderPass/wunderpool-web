import ImageAvatar from '/components/general/members/imageAvatar';
import InitialsAvatar from '/components/general/members/initialsAvatar';
import { useState, useEffect } from 'react';
import { cacheImageByURL } from '/services/caching';

const winners = [
  'e-eickhoff', // e-eickhoff
  'WUNDER_OfkhzVSuvR5z9', // Manja Bennewitz
  't-romulo', // t-romulo
  'a-sors', // Amélie Sors
  'a-fricke', // a-fricke
  'WUNDER_YAHIltc7ZPdAB', // Mariandy Lennon
  'WUNDER_oC7AXudPwD9kH', // Robert Boer
  'g-roeder', // g-roeder
  'j-conde', // j-conde
  'WUNDER_zLGrZJuo3rJdC', // pele santos
];

export default function Avatar(props) {
  const {
    shiftRight = false,
    tooltip,
    text,
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
      special={winners.includes(wunderId)}
      imageUrl={imageUrl}
      tooltip={tooltip}
      shiftRight={shiftRight}
    />
  ) : (
    <InitialsAvatar
      special={winners.includes(wunderId)}
      tooltip={tooltip}
      text={text}
      color={['lime', 'pink', 'yellow', 'red', 'blue'][i % 5]}
      shiftRight={shiftRight}
    />
  );
}
