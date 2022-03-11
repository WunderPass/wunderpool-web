import { Button, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle, FormControlLabel, LinearProgress, Stack, TextField, Typography } from "@mui/material";
import { useState } from "react";

export default function AddMemberDialog(props) {
  const {open, setOpen, poolAddress, handleSuccess, handleError} = props;
  const [address, setAddress] = useState("");
  const [isMember, setIsMember] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleClose = () => {
    setAddress("");
    setIsMember(true);
    setIsAdmin(false);
    setOpen(false);
  }

  const handleSubmit = () => {
    handleError("Deprecated")
  }

  const handleInput = (e) => {
    setAddress(e.target.value);
  }
  
  return(
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>New Member</DialogTitle>
      <DialogContent>
        <TextField sx={{minWidth: '32ch'}} autoFocus margin="dense" label="Address" placeholder="0x7E0b49362897706290b7312D0b0902a1629397D8" fullWidth variant="standard" value={address} onChange={handleInput}/>
        <FormControlLabel label="Member" control={<Checkbox checked={isMember} onChange={(e, val) => setIsMember(val)}/>}/>
        <FormControlLabel label="Admin" control={<Checkbox checked={isAdmin} onChange={(e, val) => setIsAdmin(val)}/>}/>
      </DialogContent>
      {loading ? 
        <Stack spacing={2} sx={{textAlign: 'center'}}>
          <Typography variant="subtitle1">Adding Member...</Typography>
          <LinearProgress />
        </Stack> :
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} color="success" disabled={(!isMember && !isAdmin) || address.length != 42}>Add</Button>
        </DialogActions>
      }
    </Dialog>
  )
}