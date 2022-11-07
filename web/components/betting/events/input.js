import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import { createFilterOptions } from '@mui/material/Autocomplete';
import Typography from '@mui/material/Typography';
import { Stack } from '@mui/material';
import { MdSportsSoccer } from 'react-icons/md';

export default function EventInput(props) {
  const { setEvent, bettingService } = props;

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

  return (
    <Autocomplete
      className=" w-full text-gray-700 leading-tight rounded-lg bg-[#F6F6F6] focus:bg-white focus:outline-none focus:border-casama-extra-light-blue"
      options={bettingService.events}
      loading={!bettingService.isReady}
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
