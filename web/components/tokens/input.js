import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import { createFilterOptions } from "@mui/material/Autocomplete";
import Typography from "@mui/material/Typography";
import { useEffect, useState } from "react";
import axios from "axios";
import { Stack } from "@mui/material";

let timer;
export default function TokenInput(props) {
  const { setTokenAddress, setTokenName, setTokenSymbol, setTokenImage } =
    props;
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(true);

  const filterOptions = createFilterOptions({
    stringify: (option) => `${option.address} ${option.name}`,
  });

  const handleInput = (e, value, reason) => {
    clearTimeout(timer);
    if (reason == "input" && value.length > 2) {
      setLoading(true);
      timer = setTimeout(() => {
        axios({
          method: "get",
          url: "/api/tokens/search",
          params: { param: value },
        }).then((res) => {
          const newOptions = [
            ...new Map(
              [...res.data, ...options].map((item) => [item["address"], item])
            ).values(),
          ];
          setOptions(newOptions);
          setLoading(false);
        });
      }, 800);
    }
  };

  const handleChange = (e, value, reason) => {
    if (reason == "clear") {
      setTokenAddress("");
      setTokenName(null);
      setTokenSymbol(null);
      setTokenImage(null);
    } else {
      setTokenAddress(value.address);
      setTokenName(value.name);
      setTokenSymbol(value.symbol);
      setTokenImage(value.image_url);
    }
  };

  useEffect(() => {
    axios({ url: "/api/tokens/all" }).then((res) => {
      setOptions(res.data.filter((tkn) => tkn.tradable));
      setLoading(false);
    });
  }, []);

  return (
    <Autocomplete
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
              sx={{ height: "50px" }}
            >
              <img
                height="100%"
                src={option.image_url || "/favicon.ico"}
                alt="TKN"
              />
              <Stack>
                <Typography variant="subtitle1">{option.name}</Typography>
                <Typography variant="subtitle2" color="GrayText">
                  {option.address}
                </Typography>
              </Stack>
            </Stack>
          </li>
        );
      }}
    />
  );
}