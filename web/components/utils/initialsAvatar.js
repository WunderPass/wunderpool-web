import { Tooltip, Typography } from '@mui/material';

export default function InitialsAvatar(props) {
  const { tooltip, text, separator, color } = props;
  let className = 'initials-avatar ';

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
    case 'casama':
      className += 'bg-kaico-blue';
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

  const initials = separator
    ? text
        ?.match(
          new RegExp(
            `([\u00C0-\u017FA-Za-z])${separator}([\u00C0-\u017FA-Za-z])`
          )
        )
        ?.slice(1, 3)
        ?.join('')
    : text.substr(0, 2);

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
