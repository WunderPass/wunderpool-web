import { DialogContentText, Divider, Stack, Typography } from '@mui/material';
import MemberInput from '/components/members/input';

export default function NewPoolInviteStep(props) {
  const { members, setMembers } = props;

  return (
    <Stack spacing={1}>
      <DialogContentText className="text-sm mb-7 font-graphik">
        Step 3 of 3 | Invite members
      </DialogContentText>

      <div>
        <label className="label pr-52" htmlFor="poolName">
          Invite your friends via WunderPass
        </label>
        <MemberInput
          multiple
          selectedMembers={members}
          setSelectedMembers={setMembers}
        />
      </div>

      <Divider />

      <div className="flex justify-between items-center pt-4">
        <div className="flex flex-row justify-between items-center">
          <Typography className="mr-3">
            You can invite friends without a WunderPass after creating the Pool!
          </Typography>
        </div>
      </div>
    </Stack>
  );
}
