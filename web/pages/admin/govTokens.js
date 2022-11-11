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
import { getNameFor } from '/services/memberHelpers';
import { currency, toFixed } from '/services/formatter';
import Avatar from '../../components/general/members/avatar';

const admins = [
  '0x7e0b49362897706290b7312d0b0902a1629397d8', // Moritz
  '0xac4c7c8c3a2cfffd889c1fb78b7468e281032284', // Despot
  '0x1a8459f9ddecabe92281ebdfa62874010a53fdc6', // Gerwin
  '0x097bf9d9a2c838e12fe153e4d7f83b48adb572c6', // Slava
  '0x466274eefdd3265e3d8085933e69890f33023048', // Max
];

export default function AdminBettingPage(props) {
  const { user } = props;
  const router = useRouter();
  const [pools, setPools] = useState([]);
  const [selected, setSelected] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMembers, setLoadingMembers] = useState(false);

  const fetchPools = () => {
    setLoading(true);
    axios({ url: '/api/pools/all' }).then((res) => {
      setPools(
        res.data.sort(
          (a, b) =>
            b?.pool_treasury?.act_balance - a?.pool_treasury?.act_balance
        )
      );
      setLoading(false);
    });
  };

  const handleChange = (e, value, reason) => {
    setSelected(value);
  };

  const filterOptions = createFilterOptions({
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
    if (router.isReady && user.address) {
      if (!admins.includes(user.address.toLowerCase())) {
        router.push('/pools');
      } else {
        fetchPools();
      }
    }
  }, [user.address, router.isReady]);

  return (
    <Container maxWidth="xl">
      <Stack spacing={2}>
        <h2 className="text-2xl font-bold text-center mt-5">
          Distribute Governance Tokens
        </h2>
        <Autocomplete
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
                          text={member.wunderId ? member.wunderId : '0-X'}
                          color={
                            ['lime', 'pink', 'yellow', 'red', 'blue'][i % 5]
                          }
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
