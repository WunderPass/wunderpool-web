import ImageAvatar from '/components/utils/imageAvatar';
import InitialsAvatar from '/components/utils/initialsAvatar';
import { useState, useEffect } from 'react';
import { cacheImage, getCachedImage } from '../../services/caching';

export default function Avatar(props) {
  const { tooltip, text, separator, wunderId, i } = props;
  const [imageUrl, setImageUrl] = useState(null);

  useEffect(async () => {
    if (!wunderId) return null;
    try {
      const blob =
        (await getCachedImage(`user_image_${wunderId}`)) ||
        (await cacheImage(
          `user_image_${wunderId}`,
          await (
            await fetch(`/api/proxy/users/getImage?wunderId=${wunderId}`)
          ).blob()
        ));

      setImageUrl(/image/.test(blob.type) ? URL.createObjectURL(blob) : null);
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
