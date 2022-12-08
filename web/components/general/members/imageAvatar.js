import { Tooltip } from '@mui/material';

export default function ImageAvatar(props) {
  const { imageUrl, tooltip, shiftRight, special } = props;
  return (
    <>
      {tooltip ? (
        <Tooltip title={tooltip}>
          <div
            className={`avatar ${special ? 'special' : ''} ${
              shiftRight ? '-ml-2' : ''
            } min-h-[2.5rem] bg-white`}
          >
            <img
              className="p-[2px] rounded-full object-cover min-w-full min-h-full max-h-full max-w-full"
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
          <img
            className="p-[2px] rounded-full object-cover min-w-full min-h-full max-h-full max-w-full"
            src={imageUrl}
          />
        </div>
      )}
    </>
  );
}
