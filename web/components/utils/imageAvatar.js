import { Tooltip } from '@mui/material';

export default function ImageAvatar(props) {
  const { wunderId, tooltip } = props;
  return (
    <>
      {tooltip ? (
        <Tooltip title={tooltip}>
          <div className="avatar" type="file" name="profilePicture">
            <img
              className="object-cover min-w-full min-h-full"
              src={`/api/proxy/users/getImage?wunderId=${wunderId}`}
            />
          </div>
        </Tooltip>
      ) : (
        <div className="avatar" type="file" name="profilePicture">
          <img
            className="object-cover min-w-full min-h-full"
            src={`/api/proxy/users/getImage?wunderId=${wunderId}`}
          />
        </div>
      )}
    </>
  );
}
