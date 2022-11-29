import { useEffect, useState } from 'react';
import {
  Container,
  Select,
  MenuItem,
  Collapse,
  LinearProgress,
  CircularProgress,
  FormControl,
  InputLabel,
  Divider,
} from '@mui/material';
import axios from 'axios';
import { useRouter } from 'next/router';
import CurrencyInput from '/components/general/utils/currencyInput';
import MemberInput from '../../components/general/members/input';
import { currency, pluralize } from '../../services/formatter';
import { useMemo } from 'react';

function unique(array) {
  return array && array?.length > 0 ? [...new Set(array)] : [];
}

function CreateRewardForm({
  allRewardTypes,
  user,
  handleSuccess,
  handleError,
}) {
  const [members, setMembers] = useState([]);
  const [rewardType, setRewardType] = useState('');
  const [description, setDescription] = useState('');
  const [rewardAmount, setRewardAmount] = useState('');

  const [loading, setLoading] = useState(null);
  const [results, setResults] = useState(null);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const results = await Promise.all(
        members.map(async ({ wunderId, handle }) => {
          try {
            await axios({
              method: 'POST',
              url: '/api/users/rewards/admin/create',
              data: { wunderId, rewardType, description, rewardAmount },
            });
            return { wunderId, handle, success: true };
          } catch (error) {
            console.log(error);
            return { wunderId, handle, success: false, error };
          }
        })
      );
      setResults(results);
      handleSuccess(
        `${results.filter(({ success }) => success).length}/${
          results.length
        } Rewards were created!`
      );
    } catch (error) {
      console.log(error);
      handleError('Something went wrong. (Look at the console)');
    }
    setLoading(false);
  };

  useEffect(() => {
    setDescription(
      allRewardTypes.find(({ key }) => key == rewardType)?.descriptions?.[0]
    );
  }, [rewardType]);

  return (
    <div className="my-5">
      <div className="container-white flex flex-col gap-5 my-8">
        <MemberInput
          selectedMembers={members}
          setSelectedMembers={setMembers}
          multiple
          user={user}
        />
        <FormControl fullWidth>
          <InputLabel>Reward Type</InputLabel>
          <Select
            label="Reward Type"
            value={rewardType}
            onChange={(e) => setRewardType(e.target.value)}
          >
            {allRewardTypes.map(({ key }) => {
              return (
                <MenuItem key={`reward-type-${key}`} value={key}>
                  {key}
                </MenuItem>
              );
            })}
          </Select>
        </FormControl>
        <div>
          <label>Description</label>
          <input
            className="textfield py-4 px-3"
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <div>
          <label>Reward Amount</label>
          <CurrencyInput
            value={rewardAmount}
            placeholder="$ 5"
            onChange={(val) => setRewardAmount(val)}
          />
        </div>

        {loading ? (
          <div className="w-full">
            <LinearProgress color="casamaBlue" />
            <p className="text-xl text-center my-3">Creating Rewards</p>
          </div>
        ) : (
          <button
            disabled={
              members.length == 0 ||
              !rewardType ||
              !description ||
              !rewardAmount
            }
            className="btn-casama px-3 py-2"
            onClick={handleSubmit}
          >
            Create {members.length} {pluralize(members.length, 'Reward')}
          </button>
        )}
        {results && results.length > 0 && (
          <div className="w-full flex flex-col gap-3">
            <h3 className="text-lg">The following Rewards were created</h3>
            <table className="table-auto">
              <tbody>
                {results.map((r) => {
                  return (
                    <tr
                      key={`result-${r.wunderId}-${r.success}`}
                      className="border-b last:border-b-0"
                    >
                      <td className="p-2">{r.success ? '✅' : '⚠️'}</td>
                      <td className="p-2 whitespace-nowrap">{r.handle}</td>
                      <td className="p-2 text-red-500">
                        {typeof r.error == 'string'
                          ? r.error
                          : JSON.stringify(r.error)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <Divider />
    </div>
  );
}

function RewardTable({ rewards, typeFilter, wunderIdFilter }) {
  if (!rewards)
    return (
      <div className="flex items-center justify-center gap-3">
        <CircularProgress size={20} color="casamaBlue" />
        <p className="text-2xl">Ladet...</p>
      </div>
    );

  const filteredRewards = rewards
    .filter((r) => (typeFilter == 'All' ? true : r.reward_type == typeFilter))
    .filter((r) =>
      wunderIdFilter.length > 0 ? wunderIdFilter.includes(r.wunder_id) : true
    );
  if (filteredRewards.length == 0)
    return <p className="text-center text-2xl">No Results</p>;
  return (
    <table className="table-auto rounded-xl overflow-hidden">
      <thead className="bg-casama-extra-light-blue">
        <tr className="text-left">
          <th className="p-2">Type</th>
          <th className="p-2">Wunder ID</th>
          <th className="p-2">Description</th>
          <th className="p-2 text-right">Amount</th>
        </tr>
      </thead>
      <tbody>
        {filteredRewards.map((r) => {
          return (
            <tr
              key={`reward-${r.reward_type}-${r.wunder_id}-${r.description}-${r.reward_amount}`}
              className="even:bg-casama-extra-light-blue"
            >
              <td className="p-2">{r.reward_type}</td>
              <td className="p-2">{r.wunder_id}</td>
              <td className="p-2">{r.description}</td>
              <td className="p-2 text-right">{currency(r.reward_amount)}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

export default function AdminRewardsPage(props) {
  const { user, handleSuccess, handleError } = props;
  const router = useRouter();
  const [claimedRewards, setClaimedRewards] = useState(null);
  const [pendingRewards, setPendingRewards] = useState(null);
  const [createReward, setCreateReward] = useState(false);
  const [loading, setLoading] = useState(false);

  const [isPending, setIsPending] = useState(true);
  const [typeFilter, setTypeFilter] = useState('All');
  const [filteredMembers, setFilteredMembers] = useState([]);

  const allRewardTypes = useMemo(() => {
    if (pendingRewards && claimedRewards) {
      const keys = unique(
        [...pendingRewards, ...claimedRewards].map((rew) => rew.reward_type)
      );
      return keys.map((key) => ({
        key,
        descriptions: unique(
          [...pendingRewards, ...claimedRewards]
            .filter((r) => r.reward_type == key)
            .map((r) => r.description)
        ),
      }));
    } else {
      return [];
    }
  }, [pendingRewards?.length, claimedRewards?.length]);

  const typeOptions = useMemo(() => {
    const newOptions = unique(
      ((isPending ? pendingRewards : claimedRewards) || []).map(
        (rew) => rew.reward_type
      )
    );
    if (!newOptions.includes(typeFilter)) setTypeFilter('All');
    return newOptions;
  }, [isPending, pendingRewards, claimedRewards]);

  const wunderIdFilter = useMemo(() => {
    return filteredMembers.map((m) => m.wunderId);
  }, [filteredMembers]);

  const fetchRewards = () => {
    axios({
      url: '/api/users/rewards/admin/pending',
    })
      .then((res) => {
        setPendingRewards(res.data);
      })
      .catch((err) => {
        console.log(err);
        handleError('Pending Rewards could not be loaded');
      });
    axios({
      url: '/api/users/rewards/admin/claimed',
    })
      .then((res) => {
        setClaimedRewards(res.data);
      })
      .catch((err) => {
        console.log(err);
        handleError('Claimed Rewards could not be loaded');
      });
  };

  useEffect(() => {
    if (router.isReady && user.isReady) {
      if (!user.isAdmin) {
        router.push('/betting');
      } else {
        fetchRewards();
      }
    }
  }, [user.isReady, router.isReady]);

  return (
    <Container maxWidth="xl">
      <div className="flex flex-col gap-3 mt-5">
        <h1 className="text-xl font-semibold text-center relative">
          Reward Manager
          <span
            onClick={() => setCreateReward((c) => !c)}
            className="btn-casama px-3 py-2 block w-full sm:absolute sm:w-auto right-0 top-0"
          >
            Create
          </span>
        </h1>
        <Collapse in={createReward}>
          <CreateRewardForm allRewardTypes={allRewardTypes} {...props} />
        </Collapse>
        <h3 className="text-xl">{isPending ? 'Pending' : 'Claimed'} Rewards</h3>
        <div className="flex items-center gap-2">
          <Select
            value={isPending}
            onChange={(e) => setIsPending(e.target.value)}
          >
            <MenuItem value={true}>Pending</MenuItem>
            <MenuItem value={false}>Claimed</MenuItem>
          </Select>
          <Select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <MenuItem value={'All'}>All Types</MenuItem>
            {typeOptions.map((type) => {
              return (
                <MenuItem key={`filter-by-type-${type}`} value={type}>
                  {type}
                </MenuItem>
              );
            })}
          </Select>
          <MemberInput
            selectedMembers={filteredMembers}
            setSelectedMembers={setFilteredMembers}
            multiple
            user={user}
          />
        </div>
        <RewardTable
          rewards={isPending ? pendingRewards : claimedRewards}
          typeFilter={typeFilter}
          wunderIdFilter={wunderIdFilter}
        />
      </div>
    </Container>
  );
}
