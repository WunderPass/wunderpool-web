import { Tooltip } from '@mui/material';

export default function ImageAvatar(props) {
  const { imageUrl, tooltip, shiftRight } = props;
  return (
    <>
      {tooltip ? (
        <Tooltip title={tooltip}>
          <div
            className={`avatar ${
              shiftRight ? '-ml-2' : ''
            } min-h-[2.5rem] bg-white`}
          >
            <img
              className="object-cover min-w-full min-h-full"
              src={imageUrl}
            />
          </div>
        </Tooltip>
      ) : (
        <div
          className={`avatar ${
            shiftRight ? '-ml-2' : ''
          } min-h-[2.5rem] bg-white`}
          type="file"
          name="profilePicture"
        >
          <img className="object-cover min-w-full min-h-full" src={imageUrl} />
        </div>
      )}
    </>
  );
}
