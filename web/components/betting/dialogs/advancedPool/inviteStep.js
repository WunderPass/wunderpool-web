import {
  DialogContentText,
  Divider,
  Stack,
  Typography,
  Alert,
} from '@mui/material';
import MemberInput from '/components/general/members/input';

export default function NewPoolInviteStep(props) {
  const { user, members, setMembers } = props;

  return (
    <Stack spacing={1}>
      <DialogContentText className="text-sm mb-7 font-graphik">
        Step 3 of 3 | Invite members
      </DialogContentText>

      <div>
        <label className="label sm:pr-52" htmlFor="poolName">
          Invite your friends via WunderPass
        </label>
        <MemberInput
          user={user}
          multiple
          selectedMembers={members}
          setSelectedMembers={setMembers}
        />
      </div>

      <Divider />

      <div className="flex justify-between items-center pt-4">
        <div className="flex flex-row justify-between items-center">
          <Alert severity="info">
            You can invite friends without a WunderPass after creating the Pool!
          </Alert>
        </div>
      </div>
    </Stack>
  );
}
