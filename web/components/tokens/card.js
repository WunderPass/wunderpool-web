import { Typography } from '@mui/material';
import { currency } from '/services/formatter';
import Trend from 'react-trend';
import { useEffect } from 'react';
import axios from 'axios';
import { useState } from 'react';

export default function TokenCard(props) {
  const { token, handleSell, handleSwap } = props;
  const [data, setData] = useState(null);

  useEffect(() => {
    axios({
      url: '/api/tokens/history',
      params: { address: token.address, time: 'week' },
    })
      .then((res) => {
        setData(res.data.map((d) => d.price));
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  return (
    <div className="container-gray">
      <div className="flex flex-col">
        <div className="flex flex-row justify-between items-center">
          <div className="flex flex-row items-center w-full">
            <img
              className="mr-4"
              width="50"
              src={token.image || '/favicon.ico'}
              alt="TKN"
            />

            <div className="flex flex-col w-full justify-between">
              <div className="flex flex-row justify-between items-center mb-1">
                <Typography className="text-2xl">{token.name}</Typography>
                {data && (
                  <Trend
                    data={data}
                    gradient={
                      data[0] < data[data.length - 1]
                        ? ['#462cf1', '#01BFFF']
                        : ['#F00', '#F0C']
                    }
                    width={100}
                    height={30}
                    autoDraw
                    autoDrawDuration={2000}
                    strokeWidth={2}
                    autoDrawEasing="ease-in"
                  />
                )}
                <Typography
                  className="text-2xl flex-grow text-right"
                  width="fit-content"
                >
                  {currency(token.usdValue, {})}
                </Typography>
              </div>
              <div className="flex flex-col sm:flex-row  justify-between items-center ">
                <Typography className="w-full sm:w-auto">
                  1 {token.symbol} = {currency(token.dollarPrice, {})}
                </Typography>
                <Typography className="w-full sm:w-auto">
                  {token.formattedBalance > 1
                    ? parseFloat(token.formattedBalance).toFixed(3)
                    : parseFloat(token.formattedBalance).toFixed(8)}{' '}
                  {token.symbol}
                </Typography>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-col items-center justify-center">
        <button
          className="rounded-xl btn-kaico w-full p-2 my-2 mt-4"
          onClick={() => handleSell(token)}
        >
          Sell
        </button>
        <button
          className="border-kaico-blue rounded-xl btn-neutral w-full p-2 border"
          onClick={() => handleSwap(token)}
        >
          Swap
        </button>
      </div>
    </div>
  );
}
