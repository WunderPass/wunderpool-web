import {
  Dialog,
  DialogContent,
  IconButton,
  Stack,
  Typography,
  useMediaQuery,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useTheme } from '@mui/system';

export default function ResponsiveDialog(props) {
  const {
    open,
    onClose,
    onCloseDialog,
    onCloseButton,
    maxWidth,
    dialogClass,
    contentClass,
    disablePadding,
    customTitle,
    title,
    actionButtons,
    children,
    actions,
  } = props;

  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down(maxWidth || 'md'));

  return (
    <Dialog
      fullWidth={Boolean(maxWidth)}
      fullScreen={fullScreen}
      maxWidth={maxWidth || 'sm'}
      className={dialogClass || 'w-full'}
      open={Boolean(open)}
      onClose={onCloseDialog || onClose}
      PaperProps={{
        style: {
          borderRadius: fullScreen ? 0 : 15,
          paddingTop: 'env(safe-area-inset-top)',
          paddingBottom: 'env(safe-area-inset-bottom)',
        },
      }}
    >
      <DialogContent
        className={`flex flex-col ${disablePadding ? 'p-0 ' : ''}${
          contentClass || ''
        }`}
      >
        {customTitle || (
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            sx={disablePadding ? { paddingX: 3, paddingTop: '20px' } : {}}
          >
            <Typography className="text-xl">{title}</Typography>
            <Stack direction="row" alignItems="center">
              {actionButtons}
              <IconButton onClick={onCloseButton || onClose}>
                <CloseIcon />
              </IconButton>
            </Stack>
          </Stack>
        )}
        {children}
      </DialogContent>
      {actions}
    </Dialog>
  );
}
