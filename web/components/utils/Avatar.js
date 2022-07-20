import ImageAvatar from '/components/utils/imageAvatar';
import InitialsAvatar from '/components/utils/initialsAvatar';
import { useState, useEffect } from 'react';
import ape from '/public/poolPictures/ape.png';
import FileBase64 from 'react-file-base64';
import axios from 'axios';

export default function Avatar(props) {
  const { tooltip, text, separator, wunderId, i } = props;

  const [hasPicture, setHasPicture] = useState(true);

  const checkIfPictureExists = () => {
    //if external User
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
