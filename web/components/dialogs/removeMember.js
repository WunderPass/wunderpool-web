import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Divider, IconButton, LinearProgress, List, ListItem, ListItemText, Stack, Typography } from "@mui/material";
import { Fragment, useState } from "react";
import { removeMemberAndAdmin } from "/services/contract/members";
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';

export default function RemoveMemberDialog(props) {
  const {open, setOpen, poolAddress, members, handleError, handleSuccess} = props;
  const [loading, setLoading] = useState(false);

  const handleClose = () => {
    setOpen(false);
  }

  const handleRemove = (address) => {
    setLoading(true);
    removeMemberAndAdmin(poolAddress, address).then((res) => {
      setMembers(members.filter((addr) => addr != address));
      handleSuccess(`Removed ${address} from Pool`)
      handleClose();
    }).catch((err) => {
      handleError(err);
    }).then(() => {
      setLoading(false);
    })
  }
  
  return(
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Remove Member</DialogTitle>
      <DialogContent sx={{maxHeight: '50vh'}}>
        <List dense>
          {members.map((addr, i) => {
            return (
              <Fragment key={`member-${i}`}>
                <ListItem secondaryAction={<IconButton edge="end" color="error" onClick={() => handleRemove(addr)}><RemoveCircleOutlineIcon /></IconButton>}>
                  <ListItemText primary={addr}/>
                </ListItem>
                <Divider />
              </Fragment>
            )
          })}
        </List>
      </DialogContent>
      {loading ? 
        <Stack spacing={2} sx={{textAlign: 'center'}}>
          <Typography variant="subtitle1">Removing Member...</Typography>
          <LinearProgress />
        </Stack> :
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
        </DialogActions>
      }
    </Dialog>
  )
}