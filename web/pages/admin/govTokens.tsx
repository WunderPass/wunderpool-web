import {
  Autocomplete,
  Container,
  createFilterOptions,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import axios from 'axios';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { formatMembers } from '../../services/contract/pools';
import { getNameFor } from '../../services/memberHelpers';
import { currency, toFixed } from '../../services/formatter';
import Avatar from '../../components/general/members/avatar';
import { UseUserType } from '../../hooks/useUser';
import { AllPoolsResponse } from '../api/pools/all';
import { ShowPoolResponse } from '../api/pools/show';

type AdminGovTokensPageProps = {
  user: UseUserType;
};

export default function AdminGovTokensPage(props: AdminGovTokensPageProps) {
  const { user } = props;
  const router = useRouter();
  const [pools, setPools] = useState<AllPoolsResponse>();
  const [selected, setSelected] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMembers, setLoadingMembers] = useState(false);

  const fetchPools = async () => {
    setLoading(true);
    try {
      const { data }: { data: AllPoolsResponse } = await axios({
        url: '/api/pools/all',
      });
      setPools(
        data.sort(
          (a, b) =>
            b?.pool_treasury?.act_balance - a?.pool_treasury?.act_balance
        )
      );
    } catch (error) {
      console.log(error);
    }
    setLoading(false);
  };

  const handleChange = (e, value, reason) => {
    setSelected(value);
  };

  const filterOptions = createFilterOptions<AllPoolsResponse[number]>({
    stringify: (option) => `${option.pool_address} ${option.pool_name}`,
  });

  const calculateDistribution = async () => {
    setLoadingMembers(true);
    try {
      const { data } = await axios({
        url: '/api/pools/admin/distributeGovTokens',
        params: { poolAddress: selected.pool_address },
      });
      formatMembers(data, selected?.pool_shares?.emmited_shares)
        .then((mems) => {
          setMembers(mems);
        })
        .catch(console.log)
        .then(() => setLoadingMembers(false));
    } catch (error) {
      console.log(error);
      setLoadingMembers(false);
    }
  };

  useEffect(() => {
    if (selected?.pool_address) {
      setLoadingMembers(true);
      formatMembers(
        selected.pool_members,
        selected?.pool_shares?.emmited_shares
      )
        .then((mems) => {
          setMembers(mems);
        })
        .catch(console.log)
        .then(() => setLoadingMembers(false));
    } else {
      setMembers([]);
    }
  }, [selected?.pool_address]);

  useEffect(() => {
    if (router.isReady && user.isReady) {
      if (!user.isAdmin) {
        router.push('/pools');
      } else {
        fetchPools();
      }
    }
  }, [user.isReady, router.isReady]);

  return (
    <Container maxWidth="xl">
      <Stack spacing={2}>
        <h2 className="text-2xl font-bold text-center mt-5">
          Distribute Governance Tokens
        </h2>
        <Autocomplete<ShowPoolResponse>
          className="w-full text-gray-700 my-4 leading-tight rounded-lg bg-[#F6F6F6] focus:outline-none"
          loading={loading}
          options={pools}
          value={selected}
          onChange={handleChange}
          filterOptions={filterOptions}
          isOptionEqualToValue={(option, val) =>
            option.pool_address == val.pool_address
          }
          getOptionLabel={(option) =>
            `${option.pool_name} (${option.pool_address})`
          }
          renderInput={(params) => (
            <TextField
              {...params}
              className="w-full text-gray-700 leading-tight rounded-lg bg-[#F6F6F6] focus:outline-none"
              label="Pools"
              placeholder="Search a Pool..."
            />
          )}
          renderOption={(props, option) => {
            return (
              <li {...props}>
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                  spacing={2}
                  sx={{ width: '100%' }}
                >
                  <Typography className="text-casama-blue">
                    {option.pool_name}
                  </Typography>
                  <Typography
                    variant="subtitle2"
                    whiteSpace="nowrap"
                    textOverflow="ellipsis"
                    overflow="hidden"
                  >
                    {option.pool_address}
                  </Typography>
                </Stack>
              </li>
            );
          }}
        />
        {loadingMembers ? (
          <div>Loading Members...</div>
        ) : (
          <table className="table-auto">
            <thead>
              <tr>
                <th className="text-left pb-4">
                  <Typography className="opacity-50">Member</Typography>
                </th>
                <th className="pb-4">
                  <Typography className="text-left opacity-50 md:text-center">
                    Share
                  </Typography>
                </th>
                <th className="text-right pb-4">
                  <Typography className="opacity-50">Stake</Typography>
                </th>
              </tr>
            </thead>
            <tbody>
              {members.map((member, i) => {
                return (
                  <tr key={`member-${i}`}>
                    <td className="pb-2">
                      <div className="flex flex-row items-center md:ml-2">
                        <Avatar
                          wunderId={member.wunderId}
                          tooltip={`${getNameFor(member)}: ${toFixed(
                            member.share,
                            2
                          )}%`}
                          text={member.wunderId ? member.wunderId : '0X'}
                          i={i}
                        />

                        <Typography className="ml-1">
                          {member.wunderId ? member.wunderId : 'External User'}
                        </Typography>
                      </div>
                    </td>
                    <td className="pb-2">
                      <div className="flex flex-row items-center justify-center">
                        <Typography>{toFixed(member.tokens, 2)}</Typography>
                        <Typography className="opacity-50 ml-1">
                          ({toFixed(member.share, 2)}%)
                        </Typography>
                      </div>
                    </td>

                    <td className="text-right pb-2">
                      <Typography className="">
                        {currency(
                          (member.share *
                            selected?.pool_treasury?.act_balance) /
                            100
                        )}
                      </Typography>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
        {selected?.pool_address && (
          <button
            onClick={calculateDistribution}
            disabled={loadingMembers}
            className="btn-casama mt-5 px-5 py-2 font-bold"
          >
            Calculate New Distribution
          </button>
        )}
      </Stack>
    </Container>
  );
}
