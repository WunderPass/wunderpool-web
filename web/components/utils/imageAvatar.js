import { Tooltip } from '@mui/material';

export default function ImageAvatar(props) {
  const { imageUrl, tooltip } = props;
  return (
    <>
      {tooltip ? (
        <Tooltip title={tooltip}>
          <div className="avatar" type="file" name="profilePicture">
            <img
              className="object-cover min-w-full min-h-full"
              src={imageUrl}
            />
          </div>
        </Tooltip>
      ) : (
        <div className="avatar" type="file" name="profilePicture">
          <img className="object-cover min-w-full min-h-full" src={imageUrl} />
        </div>
      )}
    </>
  );
}
