import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import { createFilterOptions } from '@mui/material/Autocomplete';
import Typography from '@mui/material/Typography';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Stack } from '@mui/material';
import { currency } from '/services/formatter';

let timer;
export default function TokenInput(props) {
  const {
    setTokenAddress,
    setTokenName,
    setTokenSymbol,
    setTokenImage,
    setTokenPrice,
  } = props;
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(true);

  const filterOptions = createFilterOptions({
    stringify: (option) => `${option.address} ${option.name}`,
  });

  const handleInput = (e, value, reason) => {
    clearTimeout(timer);
    if (reason == 'input' && value.length > 2) {
      setLoading(true);
      timer = setTimeout(() => {
        axios({
          method: 'get',
          url: '/api/tokens/search',
          params: { param: value },
        }).then((res) => {
          const newOptions = [
            ...new Map(
              [...res.data, ...options].map((item) => [item['address'], item])
            ).values(),
          ];
          setOptions(newOptions);
          setLoading(false);
        });
      }, 800);
    }
  };

  const handleChange = (e, value, reason) => {
    if (reason == 'clear') {
      setTokenAddress('');
      setTokenName(null);
      setTokenSymbol(null);
      setTokenImage(null);
      if (setTokenPrice) setTokenPrice(null);
    } else {
      setTokenAddress(value.address);
      setTokenName(value.name);
      setTokenSymbol(value.symbol);
      setTokenImage(value.image_url);
      if (setTokenPrice) setTokenPrice(value.dollar_price);
    }
  };

  useEffect(() => {
    axios({ url: '/api/tokens/all' }).then((res) => {
      setOptions(res.data.filter((tkn) => tkn.tradable));
      setLoading(false);
    });
  }, []);

  return (
    <Autocomplete
      className=" w-full text-gray-700 leading-tight rounded-lg bg-[#F6F6F6] focus:bg-white focus:outline-none focus:border-kaico-extra-light-blue"
      options={options}
      loading={loading}
      isOptionEqualToValue={(option, val) => option.address == val.address}
      getOptionLabel={(option) => {
        return option.name;
      }}
      filterOptions={filterOptions}
      onChange={handleChange}
      onInputChange={handleInput}
      renderInput={(params) => (
        <TextField
          className="opacity-50 text-black rounded-lg"
          {...params}
          label="Token"
          inputProps={{ ...params.inputProps }}
        />
      )}
      getOptionDisabled={(option) => !option.tradable}
      renderOption={(props, option) => {
        return (
          <li {...props}>
            <Stack
              direction="row"
              alignItems="center"
              spacing={2}
              sx={{ height: '50px', width: '100%' }}
            >
              <img
                className="w-8 sm:w-12"
                src={option.image_url || '/favicon.ico'}
                alt="TKN"
              />
              <Stack flexGrow={1} overflow="hidden">
                <Typography
                  variant="subtitle1"
                  whiteSpace="nowrap"
                  textOverflow="ellipsis"
                  overflow="hidden"
                >
                  {option.name}
                </Typography>
                <Typography
                  variant="subtitle2"
                  color="GrayText"
                  textOverflow="ellipsis"
                  overflow="hidden"
                >
                  <div className="hidden sm:block">{option.address}</div>
                  <div className="block sm:hidden">
                    {currency(option.dollar_price, {})}
                  </div>
                </Typography>
              </Stack>
              <Typography
                className="hidden sm:block"
                variant="h6"
                textAlign="end"
                whiteSpace="nowrap"
              >
                {currency(option.dollar_price, {})}
              </Typography>
            </Stack>
          </li>
        );
      }}
    />
  );
}
