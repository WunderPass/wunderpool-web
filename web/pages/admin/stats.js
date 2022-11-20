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

const admins = [
  '0x7e0b49362897706290b7312d0b0902a1629397d8', // Moritz
  '0xac4c7c8c3a2cfffd889c1fb78b7468e281032284', // Despot
  '0x1a8459f9ddecabe92281ebdfa62874010a53fdc6', // Gerwin
  '0x097bf9d9a2c838e12fe153e4d7f83b48adb572c6', // Slava
  '0x466274eefdd3265e3d8085933e69890f33023048', // Max
];

const timeFrames = [
  ['1d', 1],
  ['1w', 7],
  ['1m', 30],
  ['1y', 365],
];

function Diff({ live, historic }) {
  if (live && historic && live != historic) {
    let color;
    if (live < historic) color = 'text-red-500';
    if (live > historic) color = 'text-green-500';
    return (
      <span className={`${color} text-xl ml-2`}>
        {toFixed(((live - historic) / historic) * 100, 1)}%
      </span>
    );
  } else {
    return null;
  }
}

export default function AdminBettingPage(props) {
  const { user } = props;
  const router = useRouter();
  const [historicData, setHistoricData] = useState(null);
  const [liveData, setLiveData] = useState(null);
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
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (router.isReady && user.address) {
      if (!admins.includes(user.address.toLowerCase())) {
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
  }, [user.address, router.isReady]);

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
                <p className="text-casama-blue">
                  {liveData.gameCount.live}
                  <Diff
                    live={liveData.gameCount.live}
                    historic={compareData?.gameCount?.live}
                  />
                </p>
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
                  <Diff
                    live={liveData.potSize.live}
                    historic={compareData?.potSize?.live}
                  />
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
              <h3 className="text-2xl mb-2 text-center">Fees Earned</h3>
              <p className="text-3xl text-center text-casama-blue">
                {currency(liveData.feesEarned)}
                <Diff
                  live={liveData.feesEarned}
                  historic={compareData?.feesEarned}
                />
              </p>
            </div>
            <div className="container-gray w-full flex flex-col justify-between">
              <h3 className="text-2xl mb-2 text-center">Members per Game</h3>
              <p className="text-3xl text-center text-casama-blue">
                {toFixed(liveData.membersPerGame.count, 2)}
                <Diff
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
                  live={liveData.gamesPerMember.count}
                  historic={compareData?.gamesPerMember?.count}
                />
              </p>
            </div>
          </div>
          <div className="grid grid-rows-2 md:grid-rows-none md:grid-cols-2 gap-3">
            <div className="container-white w-full">
              <p className="text-xl text-center">Members Per Game</p>
              <div className="w-full h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={Object.entries(liveData.membersPerGame.data).map(
                      ([k, v]) => ({ key: k, members: v })
                    )}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="key" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="members" stroke="#5F45FD" />
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
                    <Tooltip />
                    <Line type="monotone" dataKey="members" stroke="#5F45FD" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </Stack>
      ) : (
        <h2 className="text-center text-2xl">Ladet...</h2>
      )}
    </Container>
  );
}
