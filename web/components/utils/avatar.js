import ImageAvatar from '/components/utils/imageAvatar';
import InitialsAvatar from '/components/utils/initialsAvatar';
import { useState, useEffect } from 'react';
import {
  cacheImage,
  cacheImageByURL,
  getCachedImage,
} from '../../services/caching';

export default function Avatar(props) {
  const { tooltip, text, separator, wunderId, i } = props;
  const [imageUrl, setImageUrl] = useState(null);

  useEffect(async () => {
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
