import {
  Dialog,
  DialogContent,
  DialogContentText,
  Divider,
  IconButton,
  Link,
  Typography,
} from '@mui/material';
import { currency } from '/services/formatter';
import Trend from 'react-trend';
import { useState, useEffect } from 'react';
import axios from 'axios';
import InfoIcon from '@mui/icons-material/Info';

function TokenInfo({ token, data }) {
  const [infoDialog, setInfoDialog] = useState(false);
  const {
    address,
    verified,
    name,
    usdValue,
    symbol,
    dollarPrice,
    formattedBalance,
  } = token;

  return (
    <div className="flex flex-col w-full justify-between">
      <div className="flex flex-row justify-between items-center mb-1">
        <Typography className="text-2xl">{name}</Typography>
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
          {verified && currency(usdValue, {})}
        </Typography>
      </div>
      <div className="flex flex-col sm:flex-row  justify-between items-center ">
        <Typography className="w-full sm:w-auto">
          {verified ? (
            `1 ${symbol} = ${currency(dollarPrice, {})}`
          ) : (
            <>
              Unverified Token
              <IconButton color="info" onClick={() => setInfoDialog(true)}>
                <InfoIcon fontSize="small" />
              </IconButton>
              <Dialog onClose={() => setInfoDialog(false)} open={infoDialog}>
                <DialogContent>
                  <DialogContentText>
                    This Token is not verified by Casama. Trading this token
                    might result in losses of funds.
                  </DialogContentText>
                  <Divider className="my-4" />
                  <DialogContentText>
                    We recommend to check out the Token Page here:{' '}
                    <Link
                      target="_blank"
                      href={`https://polygonscan.com/token/${address}`}
                    >
                      PolygonScan
                    </Link>
                  </DialogContentText>
                </DialogContent>
              </Dialog>
            </>
          )}
        </Typography>
        <Typography className="w-full sm:w-auto">
          {formattedBalance > 1
            ? parseFloat(formattedBalance).toFixed(3)
            : parseFloat(formattedBalance).toFixed(8)}{' '}
          {symbol}
        </Typography>
      </div>
    </div>
  );
}

export default function TokenCard(props) {
  const { token, handleSell, handleSwap } = props;
  const [data, setData] = useState(null);

  useEffect(() => {
    if (!token.verified) return;
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
            <TokenInfo token={token} data={data} />
          </div>
        </div>
      </div>
      <div className="flex flex-col items-center justify-center">
        <button
          className="btn-kaico w-full p-2 my-2 mt-4"
          onClick={() => handleSell(token)}
        >
          Sell
        </button>
        <button
          className="btn-neutral w-full p-2"
          onClick={() => handleSwap(token)}
        >
          Swap
        </button>
      </div>
    </div>
  );
}
