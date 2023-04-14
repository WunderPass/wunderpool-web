import { Tooltip } from '@mui/material';

type ImageAvatarProps = {
  imageUrl: string;
  tooltip?: string;
  shiftRight?: boolean;
  special?: boolean;
};

export default function ImageAvatar(props: ImageAvatarProps) {
  const { imageUrl, tooltip, shiftRight = false, special = false } = props;
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
