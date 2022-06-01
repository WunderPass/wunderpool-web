import { Tooltip, Typography } from '@mui/material';

export default function InitialsAvatar(props) {
  const { tooltip, text, separator, color } = props;
  const className = color
    ? `initials-avatar bg-${color}-300`
    : 'initials-avatar bg-blue-300';
  const initials = separator
    ? text
        .match(new RegExp(`(\\w)${separator}(\\w)`))
        .slice(1, 3)
        .join('')
    : text.substr(0, 2);

  return (
    <div className={className}>
      {tooltip ? (
        <Tooltip title={tooltip}>
          <Typography>{initials}</Typography>
        </Tooltip>
      ) : (
        <Typography>{initials}</Typography>
      )}
    </div>
  );
}
