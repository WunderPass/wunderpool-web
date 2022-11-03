import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import { createFilterOptions } from '@mui/material/Autocomplete';
import Typography from '@mui/material/Typography';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Stack } from '@mui/material';
import { MdSportsSoccer } from 'react-icons/md';

export default function EventInput(props) {
  const { setEvent } = props;
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(true);

  const filterOptions = createFilterOptions({
    stringify: (option) => `${option.name}`,
  });

  const handleChange = (e, value, reason) => {
    if (reason == 'clear') {
      setEvent({});
    } else {
      setEvent(value);
    }
  };

  useEffect(() => {
    axios({ url: '/api/betting/events/registered' }).then((res) => {
      setOptions(
        res.data.sort((a, b) => new Date(a.startTime) - new Date(b.startTime))
      );
      setLoading(false);
    });
  }, []);

  return (
    <Autocomplete
      className=" w-full text-gray-700 leading-tight rounded-lg bg-[#F6F6F6] focus:bg-white focus:outline-none focus:border-casama-extra-light-blue"
      options={options}
      loading={loading}
      isOptionEqualToValue={(option, val) => option.id == val.id}
      getOptionLabel={(option) => {
        return option.name;
      }}
      filterOptions={filterOptions}
      onChange={handleChange}
      renderInput={(params) => (
        <TextField
          className="opacity-50 text-black rounded-lg"
          {...params}
          label="Event"
          inputProps={{ ...params.inputProps }}
        />
      )}
      renderOption={(props, option) => {
        return (
          <li {...props}>
            <Stack
              direction="row"
              alignItems="center"
              spacing={2}
              sx={{ height: '50px', width: '100%' }}
            >
              <MdSportsSoccer className="text-xl text-casama-blue" />
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
                  {new Date(option.startTime).toLocaleString()}
                </Typography>
              </Stack>
            </Stack>
          </li>
        );
      }}
    />
  );
}
