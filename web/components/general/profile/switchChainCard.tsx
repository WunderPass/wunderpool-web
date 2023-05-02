import { Divider, MenuItem, Select } from '@mui/material';
import { UseUserType } from '../../../hooks/useUser';
import { SupportedChain } from '../../../services/contract/types';

export default function SwitchChainCard({ user }: { user: UseUserType }) {
  return (
    <div className="container-white my-5">
      <div className="text-left w-full">
        <div className="flex flex-row justify-between items-center">
          <h3 className="text-lg p-1 font-semibold">Blockchain</h3>
        </div>
        <Divider className="w-full mt-2 mb-4" />
        <p className="">
          Chose the chain, you want to use. You can switch between chains at any
          time. Tokens, i.e. your wallet balance, and games are chain specific.
          You can only use tokens from the chain you are currently connected to.
        </p>
      </div>
      <div className="mt-3 w-full max-w-md mx-auto">
        <Select
          value={user.preferredChain || 'gnosis'}
          onChange={(e) =>
            user.updatePreferredChain(e.target.value as SupportedChain)
          }
          fullWidth
        >
          <MenuItem value="gnosis">Gnosis</MenuItem>
          <MenuItem value="polygon">Polygon</MenuItem>
        </Select>
      </div>
    </div>
  );
}
