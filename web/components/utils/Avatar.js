import ImageAvatar from '/components/utils/imageAvatar';
import InitialsAvatar from '/components/utils/imageAvatar';
import { useState, useEffect } from 'react';

export default function Avatar(props) {
  const { tooltip, text, separator, wunderId } = props;

  const [hasPicture, setHasPicture] = useState(true);

  useEffect(() => {
    //if external User
    if (wunderId == null) {
      setHasPicture(false);
    }
  }, [wunderId]);

  return hasPicture ? (
    <ImageAvatar wunderId={wunderId} />
  ) : (
    <InitialsAvatar
      tooltip={tooltip}
      text={text}
      separator={separator}
      color={['lime', 'pink', 'yellow', 'red', 'blue'][i % 5]}
    />
  );
}
