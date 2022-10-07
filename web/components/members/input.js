import { Autocomplete, Stack, TextField, Typography } from '@mui/material';
import { useState } from 'react';
import { searchMembers, getNameFor } from '/services/memberHelpers';
import Avatar from '/components/members/avatar';

let timer;
export default function MemberInput({
  selectedMembers,
  setSelectedMembers,
  multiple = false,
  user,
}) {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [inputTrue, setInputTrue] = useState(false);
  const friends = Object.values(user.friends);

  {
    console.log(friends);
  }
  {
    console.log(members);
  }
  const handleChange = (e, value, reason) => {
    setSelectedMembers(value);
  };

  const filterOptions = (options) => (loading ? [] : options);

  const handleInput = (e, value, reason) => {
    clearTimeout(timer);
    setInputTrue(value.length > 0);
    if (reason == 'input' && value.length > 0) {
      setLoading(true);
      timer = setTimeout(() => {
        searchMembers(value).then((mems) => {
          setMembers(mems);
          setLoading(false);
        });
      }, 800);
    } else {
      setMembers(friends);
      setLoading(false);
    }
  };

  return (
    <>
      <Autocomplete
        className="w-full text-gray-700 my-4 leading-tight rounded-lg bg-[#F6F6F6] focus:outline-none"
        multiple={multiple}
        loading={loading}
        options={inputTrue ? members : friends}
        value={selectedMembers}
        onChange={handleChange}
        onInputChange={handleInput}
        filterOptions={filterOptions}
        isOptionEqualToValue={
          inputTrue
            ? (option, val) => option.address == val.address
            : (option, val) => option.wallet_address == val.wallet_address
        }
        getOptionLabel={(option) => getNameFor(option)}
        renderInput={(params) => (
          <TextField
            {...params}
            className="w-full text-gray-700 leading-tight rounded-lg bg-[#F6F6F6] focus:outline-none"
            label="WunderPass Users"
            placeholder="Search your Friends..."
          />
        )}
        renderOption={(props, option) => {
          return (
            <li {...props}>
              <Stack
                direction="row"
                alignItems="center"
                spacing={2}
                sx={{ width: '100%' }}
              >
                <Avatar wunderId={option.handle} text={option.handle} />
                <div>
                  <Typography
                    variant="subtitle1"
                    whiteSpace="nowrap"
                    textOverflow="ellipsis"
                    overflow="hidden"
                  >
                    {getNameFor(option)}
                  </Typography>
                  <Typography
                    variant="subtitle2"
                    whiteSpace="nowrap"
                    textOverflow="ellipsis"
                    overflow="hidden"
                  >
                    {option.email}
                  </Typography>
                </div>
              </Stack>
            </li>
          );
        }}
      />
    </>
  );
}
