import { Container, Divider, Stack } from '@mui/material';
import axios from 'axios';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { AiOutlineDoubleRight, AiOutlineHistory } from 'react-icons/ai';
import { MdLiveTv } from 'react-icons/md';
import { currency, toFixed } from '../../services/formatter';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useMemo } from 'react';
import { compAddr } from '../../services/memberHelpers';
import Avatar from '../../components/general/members/avatar';

const timeFrames = [
  ['1d', 1],
  ['1w', 7],
  ['1m', 30],
  ['1y', 365],
];

function formatDate(dateStr) {
  const date = dateStr ? new Date(dateStr) : new Date();
  return date.toLocaleDateString('de', {
    dateStyle: 'short',
  });
}

function pluralize(num, word) {
  return Number(num) == 1 ? word : word == 'is' ? 'are' : `${word}s`;
}

function Diff({ live, historic, percent }) {
  if (live && historic && live != historic) {
    const increased = live > historic;
    return (
      <span
        className={`${
          increased ? 'text-green-500' : 'text-red-500'
        } text-xl ml-2`}
      >
        {percent
          ? `${increased ? '+' : '-'}${toFixed(
              (Math.abs(live - historic) / historic) * 100,
              1
            )}%`
          : `${increased ? '+' : '-'}${toFixed(Math.abs(live - historic), 0)}`}
      </span>
    );
  } else {
    return null;
  }
}

function MembersPerGameTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    return (
      <div className="container-white border border-casama-blue">
        <p className="label">
          {`There ${pluralize(payload[0].value, 'is')} `}
          <span className="text-casama-blue">{payload[0].value}</span>
          {` ${pluralize(payload[0].value, 'Game')} with `}
          <span className="text-casama-blue">{label}</span>
          {` ${pluralize(label, 'Member')}`}
        </p>
      </div>
    );
  }

  return null;
}

function GamesPerMemberTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    return (
      <div className="container-white border border-casama-blue">
        <p className="label">
          <span className="text-casama-blue">{payload[0].value}</span>
          {` ${pluralize(payload[0].value, 'Member')} betted in `}
          <span className="text-casama-blue">{label}</span>
          {` ${pluralize(label, 'Game')}`}
        </p>
      </div>
    );
  }

  return null;
}

export default function AdminStatsPage(props) {
  const { user } = props;
  const router = useRouter();
  const [historicData, setHistoricData] = useState(null);
  const [liveData, setLiveData] = useState(null);
  const [resolvedTopTen, setResolvedTopTen] = useState(null);
  const [timeFrame, setTimeFrame] = useState(1);

  const compareData = useMemo(() => {
    const lookupDate = new Date(new Date() - timeFrame * 86400000);
    const ts = `${lookupDate.getFullYear()}-${
      lookupDate.getMonth() + 1
    }-${lookupDate.getDate()}`;
    return historicData?.find((d) => d.date == ts);
  }, [timeFrame, historicData]);

  const fetchHistory = async () => {
    try {
      const { data } = await axios({
        url: '/api/betting/admin/statsHistory',
      });
      setHistoricData(data);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchData = async () => {
    try {
      const { data } = await axios({
        url: '/api/betting/admin/stats',
      });
      setLiveData(data);
      axios({
        method: 'post',
        url: '/api/users/find',
        data: { addresses: data.topTen.map(({ address }) => address) },
      }).then(({ data: resolved }) => {
        setResolvedTopTen(
          data.topTen.map(({ address, bets }) => ({
            address,
            bets,
            ...resolved.find((u) => compAddr(u.wallet_address, address)),
          }))
        );
      });
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (router.isReady && user.isReady) {
      if (!user.isAdmin) {
        router.push('/pools');
      } else {
        fetchHistory();
        fetchData();
        const interval = setInterval(() => {
          fetchData();
        }, 60000);
        return () => {
          clearInterval(interval);
        };
      }
    }
  }, [user.isReady, router.isReady]);

  return (
    <Container maxWidth="xl" className="mt-5">
      {liveData ? (
        <Stack spacing={2}>
          <div className="self-end">
            <div className="flex gap-2">
              {timeFrames.map(([text, days]) => {
                return (
                  <a
                    key={`timeframe-${text}`}
                    className={`${
                      days == timeFrame
                        ? 'text-casama-blue'
                        : 'text-gray-500 cursor-pointer'
                    } underline`}
                    onClick={() => setTimeFrame(days)}
                  >
                    {text}
                  </a>
                );
              })}
            </div>
          </div>
          <div className="container-gray">
            <h3 className="text-2xl mb-2 text-center">Number of Games</h3>
            <Divider />
            <div className="flex items-center justify-around gap-3 text-2xl mt-2">
              <div className="flex flex-col gap-2 items-center">
                <div className="flex items-center gap-2">
                  <AiOutlineHistory className="text-casama-blue" />
                  Historic
                </div>
                <p className="text-casama-blue">
                  {liveData.gameCount.historic}
                  <Diff
                    live={liveData.gameCount.historic}
                    historic={compareData?.gameCount?.historic}
                  />
                </p>
              </div>
              <div className="flex flex-col gap-2 items-center">
                <div className="flex items-center gap-2">
                  <MdLiveTv className="text-casama-blue" />
                  Live
                </div>
                <p className="text-casama-blue">{liveData.gameCount.live}</p>
              </div>
              <div className="flex flex-col gap-2 items-center">
                <div className="flex items-center gap-2">
                  <AiOutlineDoubleRight className="text-casama-blue" />
                  Upcoming
                </div>
                <p className="text-casama-blue">
                  {liveData.gameCount.upcoming}
                  <Diff
                    live={liveData.gameCount.upcoming}
                    historic={compareData?.gameCount?.upcoming}
                  />
                </p>
              </div>
            </div>
          </div>
          <div className="container-gray">
            <h3 className="text-2xl mb-2 text-center">Total Pot</h3>
            <Divider />
            <div className="flex items-center justify-around gap-3 text-2xl mt-2">
              <div className="flex flex-col gap-2 items-center">
                <div className="flex items-center gap-2">
                  <AiOutlineHistory className="text-casama-blue" />
                  Historic
                </div>
                <p className="text-casama-blue">
                  {currency(liveData.potSize.historic)}
                  <Diff
                    percent
                    live={liveData.potSize.historic}
                    historic={compareData?.potSize?.historic}
                  />
                </p>
              </div>
              <div className="flex flex-col gap-2 items-center">
                <div className="flex items-center gap-2">
                  <MdLiveTv className="text-casama-blue" />
                  Live
                </div>
                <p className="text-casama-blue">
                  {currency(liveData.potSize.live)}
                </p>
              </div>
              <div className="flex flex-col gap-2 items-center">
                <div className="flex items-center gap-2">
                  <AiOutlineDoubleRight className="text-casama-blue" />
                  Upcoming
                </div>
                <p className="text-casama-blue">
                  {currency(liveData.potSize.upcoming)}
                  <Diff
                    percent
                    live={liveData.potSize.upcoming}
                    historic={compareData?.potSize?.upcoming}
                  />
                </p>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap sm:flex-nowrap gap-3">
            <div className="container-gray w-full flex flex-col justify-between">
              <h3 className="text-2xl mb-2 text-center">Unique Users</h3>
              <p className="text-3xl text-center text-casama-blue">
                {liveData.uniqueUsers}
                <Diff
                  live={liveData.uniqueUsers}
                  historic={compareData?.uniqueUsers}
                />
              </p>
            </div>
            <div className="container-gray w-full flex flex-col justify-between">
              <h3 className="text-2xl mb-2 text-center">Total Bets</h3>
              <p className="text-3xl text-center text-casama-blue">
                {liveData.totalBets}
                <Diff
                  live={liveData.totalBets}
                  historic={compareData?.totalBets}
                />
              </p>
            </div>
            <div className="container-gray w-full flex flex-col justify-between">
              <h3 className="text-2xl mb-2 text-center">Fees Earned</h3>
              <p className="text-3xl text-center text-casama-blue">
                {currency(liveData.feesEarned)}
                <Diff
                  percent
                  live={liveData.feesEarned}
                  historic={compareData?.feesEarned}
                />
              </p>
            </div>
          </div>
          <div className="flex flex-wrap sm:flex-nowrap gap-3">
            <div className="container-gray w-full flex flex-col justify-between">
              <h3 className="text-2xl mb-2 text-center">Members per Game</h3>
              <p className="text-3xl text-center text-casama-blue">
                {toFixed(liveData.membersPerGame.count, 2)}
                <Diff
                  percent
                  live={liveData.membersPerGame.count}
                  historic={compareData?.membersPerGame?.count}
                />
              </p>
            </div>
            <div className="container-gray w-full flex flex-col justify-between">
              <h3 className="text-2xl mb-2 text-center">Games per Member</h3>
              <p className="text-3xl text-center text-casama-blue">
                {toFixed(liveData.gamesPerMember.count, 2)}
                <Diff
                  percent
                  live={liveData.gamesPerMember.count}
                  historic={compareData?.gamesPerMember?.count}
                />
              </p>
            </div>
          </div>
          <div className="grid grid-rows-2 md:grid-rows-none md:grid-cols-2 gap-3">
            <div className="container-white w-full">
              <p className="text-xl text-center">Unique Users</p>
              <div className="w-full h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={[...historicData, liveData].map((data) => ({
                      key: formatDate(data.date),
                      members: data.uniqueUsers,
                    }))}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="key" />
                    <YAxis type="number" domain={['dataMin', 'dataMax']} />
                    <Tooltip
                      formatter={(value, name, props) => [value, 'Members']}
                    />
                    <Line type="monotone" dataKey="members" stroke="#5F45FD" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="container-white w-full">
              <p className="text-xl text-center">Fees Earned</p>
              <div className="w-full h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={[...historicData, liveData].map((data) => ({
                      key: formatDate(data.date),
                      fees: toFixed(data.feesEarned, 2),
                    }))}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="key" />
                    <YAxis
                      type="number"
                      domain={['dataMin', 'dataMax']}
                      tickFormatter={(v) => currency(v)}
                    />
                    <Tooltip
                      formatter={(value, name, props) => [
                        currency(value),
                        'Fees',
                      ]}
                    />
                    <Line type="monotone" dataKey="fees" stroke="#5F45FD" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
          <div className="grid grid-rows-2 md:grid-rows-none md:grid-cols-2 gap-3">
            <div className="container-white w-full">
              <p className="text-xl text-center">Members Per Game</p>
              <div className="w-full h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={Object.entries(liveData.membersPerGame.data).map(
                      ([k, v]) => ({ key: k, games: v })
                    )}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="key" />
                    <YAxis />
                    <Tooltip
                      wrapperStyle={{ outline: 'none' }}
                      content={<MembersPerGameTooltip />}
                    />
                    <Line type="monotone" dataKey="games" stroke="#5F45FD" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="container-white w-full">
              <p className="text-xl text-center">Games Per Member</p>
              <div className="w-full h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={Object.entries(liveData.gamesPerMember.data).map(
                      ([k, v]) => ({ key: k, members: v })
                    )}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="key" />
                    <YAxis />
                    <Tooltip
                      wrapperStyle={{ outline: 'none' }}
                      content={<GamesPerMemberTooltip />}
                    />
                    <Line type="monotone" dataKey="members" stroke="#5F45FD" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
          {resolvedTopTen && (
            <div className="w-full">
              <h3 className="text-2xl mb-2 text-center">🐳 Whales</h3>
              {resolvedTopTen.map((usr, i) => {
                return (
                  <div
                    key={`participant-${usr.address}`}
                    className="container-white-p-0 p-2 flex flex-row items-center justify-between gap-2 my-2 w-full"
                  >
                    <p className="pl-3">#{i + 1}</p>
                    <div>
                      <Avatar
                        wunderId={usr.wunder_id}
                        tooltip={usr.handle}
                        text={usr.handle ? usr.handle : '0X'}
                        i={i}
                      />
                    </div>
                    <div className="flex items-center justify-start truncate flex-grow">
                      <div className="truncate">
                        {usr.firstname && usr.lastname
                          ? `${usr.firstname} ${usr.lastname}`
                          : usr.handle || usr.address}
                      </div>
                    </div>
                    <div className="flex flex-row justify-end items-center text-xl">
                      <p className="text-casama-blue">{usr.bets} Bets</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Stack>
      ) : (
        <h2 className="text-center text-2xl">Ladet...</h2>
      )}
    </Container>
  );
}
