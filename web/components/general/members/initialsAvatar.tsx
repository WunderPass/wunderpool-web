import { Tooltip, Typography } from '@mui/material';

type InitialsAvatarProps = {
  text: string;
  color?: string;
  tooltip?: string;
  shiftRight?: boolean;
  special?: boolean;
};

export default function InitialsAvatar(props: InitialsAvatarProps) {
  const { tooltip, text, color, shiftRight = false, special = false } = props;
  let className = `initials-avatar ${special ? 'special' : ''} ${
    shiftRight ? '-ml-2 ' : ' '
  }`;

  switch (color) {
    case 'red':
      className += 'bg-red-300';
      break;
    case 'orange':
      className += 'bg-orange-300';
      break;
    case 'yellow':
      className += 'bg-yellow-300';
      break;
    case 'lime':
      className += 'bg-lime-300';
      break;
    case 'green':
      className += 'bg-green-300';
      break;
    case 'teal':
      className += 'bg-teal-300';
      break;
    case 'blue':
      className += 'bg-blue-300';
      break;
    case 'purple':
      className += 'bg-purple-300';
      break;
    case 'pink':
      className += 'bg-pink-300';
      break;
    case 'rose':
      className += 'bg-rose-300';
      break;
    case 'powder':
      className += 'bg-powder-blue';
      break;
    case 'casama':
      className += 'bg-casama-blue';
      break;
    case 'casama-light':
      className += 'bg-casama-light-blue';
      break;
    case 'casama-extra-light':
      className += 'bg-casama-extra-light-blue';
      break;
    default:
      className += [
        'bg-red-300',
        'bg-orange-300',
        'bg-yellow-300',
        'bg-lime-300',
        'bg-green-300',
        'bg-teal-300',
        'bg-blue-300',
        'bg-purple-300',
        'bg-pink-300',
        'bg-rose-300',
        'bg-blue-300',
      ][
        text?.charCodeAt(text?.length - 1) % 10 ||
          Math.round(Math.random() * 10)
      ];
      break;
  }

  let initials;
  if (text.match(/^[A-Za-z]+/)) {
    const names = text.match(/([A-Za-z]+)(-| |_|\.)([A-Za-z]+)/)?.slice(1, 4);
    initials = names
      ? `${names?.[0]?.[0]}${names?.[2]?.[0]}`
      : text.slice(0, 2);
  } else {
    initials = text;
  }

  return (
    <div className={className}>
      {tooltip ? (
        <Tooltip title={tooltip}>
          <Typography>{initials || '0X'}</Typography>
        </Tooltip>
      ) : (
        <Typography>{initials || '0X'}</Typography>
      )}
    </div>
  );
}
