import ImageAvatar from '/components/utils/imageAvatar';
import InitialsAvatar from '/components/utils/initialsAvatar';
import { useState, useEffect } from 'react';
import axios from 'axios';

export default function Avatar(props) {
  const { tooltip, text, separator, wunderId, i } = props;
  const [hasPicture, setHasPicture] = useState(true);

  const checkIfPictureExists = () => {
    //if external Userr
    if (wunderId == null) {
      setHasPicture(false);
      return;
    }
    //check if its default picture
    //sorry for ugly code, but it works right :)
    axios({
      url: `/api/proxy/users/getImage?wunderId=${wunderId}`,
    }).then((res) => {
      if (typeof res.data != typeof '') {
        setHasPicture(false);
        return;
      }
    });
    setHasPicture(true);
  };

  useEffect(() => {
    checkIfPictureExists();
  }, [wunderId]);

  return hasPicture ? (
    <ImageAvatar wunderId={wunderId} tooltip={tooltip} />
  ) : (
    <InitialsAvatar
      tooltip={tooltip}
      text={text}
      separator={separator}
      color={['lime', 'pink', 'yellow', 'red', 'blue'][i % 5]}
    />
  );
}
