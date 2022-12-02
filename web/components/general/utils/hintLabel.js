import {
  Dialog,
  DialogContent,
  DialogContentText,
  IconButton,
} from '@mui/material';
import HelpIcon from '@mui/icons-material/Help';
import { useState } from 'react';

export default function HintLabel({ title, hint, className, htmlFor }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex items-baseline">
      <label className={className || 'label'} htmlFor={htmlFor}>
        {title}
      </label>
      {hint && (
        <IconButton
          sx={{ paddingLeft: 1, fontSize: '1rem' }}
          onClick={() => setOpen(true)}
        >
          <HelpIcon color="info" fontSize={'inherit'} />
        </IconButton>
      )}
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        PaperProps={{
          style: { borderRadius: 15 },
        }}
      >
        <DialogContent>
          <DialogContentText>{hint}</DialogContentText>
        </DialogContent>
      </Dialog>
    </div>
  );
}
