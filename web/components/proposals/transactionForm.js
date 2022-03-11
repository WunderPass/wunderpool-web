import { Autocomplete, Button, IconButton, InputAdornment, Paper, Stack, TextField, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import ParamInput from "./paramsInput";
import { fetchContractAbi } from "/services/contract/abi";
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';

export function TransactionForm(props) {
  const {index, transaction, updateTransaction, removeTransaction, poolAddress} = props;
  const [foundAbi, setFoundAbi] = useState(null);
  const [contractAbi, setContractAbi] = useState(null);
  const [action, setAction] = useState({});

  const handleActionChange = (val) => {
    setAction(val);
    const params = [val.inputs.map((input) => input.type), val.inputs.map((input) => "")]
    updateTransaction('params', params);
    updateTransaction('action', val?.name);
  }

  const handleParamChange = (index, value) => {
    transaction.params[1][index] = value;
    updateTransaction('params', transaction.params);
  }

  const handleTypeChange = (index, value) => {
    transaction.params[0][index] = value;
    if (transaction.action.match(/\(.*\)/)) {
      updateTransaction('action', transaction.action.replace(/\((.*)\)/, (_, grp) => `(${grp},${value})`));
    } else {
      updateTransaction('action', `${transaction.action}(${value})`);
    }
    updateTransaction('params', transaction.params);
  }

  const addParam = () => {
    transaction.params[0].push("");
    transaction.params[1].push("");
    updateTransaction('params', transaction.params);
  }

  const setCustomAbi = (type) => {
    if (type == 'custom') {
      setFoundAbi(true);
      setContractAbi([]);
    } else {
      fetch(`/api/abi?type=${type}`).then((res) => {
        res.json().then((json) => {
          const formattedAbi = json.map((elem) => ({name: `${elem.name}(${elem.inputs ? elem.inputs.map((input) => input.type) : ''})`, inputs: elem.inputs, payable: elem.stateMutability == 'payable'}))
          handleActionChange(formattedAbi[0]);
          setContractAbi(formattedAbi);
          setFoundAbi(true);
        })
      })
    }
  }

  useEffect(() => {
    if (transaction.address.length == 42) {
      fetchContractAbi(transaction.address).then((res) => {
        const filteredAbi = JSON.parse(res).filter((obj) => obj.type == 'function' && ['payable', 'nonpayable'].includes(obj.stateMutability))
        const formattedAbi = filteredAbi.map((elem) => ({name: `${elem.name}(${elem.inputs ? elem.inputs.map((input) => input.type) : ''})`, inputs: elem.inputs, payable: elem.stateMutability == 'payable'}))
        handleActionChange(formattedAbi[0]);
        setContractAbi(formattedAbi);
        setFoundAbi(true);
      }).catch((err) => {
        setFoundAbi(false);
      });
    }
  }, [transaction.address])

  return (
    <Paper elevation={2}>
      <Stack spacing={2} p={2}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="h5">Transaction #{index}</Typography>
          <IconButton onClick={() => removeTransaction(index)} color="error"><DeleteIcon /></IconButton>
        </Stack>
        <TextField label="Contract Address" value={transaction.address} onChange={(e) => updateTransaction('address', e.target.value)} placeholder="0x845812905256FFA8B16b355Bc11A3f3e63c55aB8"/>
        {foundAbi === true &&
          (contractAbi.length > 0 ?
            <>
              <Autocomplete 
                value={action} 
                onChange={(e, newVal) => handleActionChange(newVal)} 
                options={contractAbi} 
                getOptionLabel={(option) => {return option.name}}
                isOptionEqualToValue={(option, val) => option.name == val.name}
                renderInput={(params) => <TextField {...params} label="Function" inputProps={{...params.inputProps}}/>}
              />
              {action?.inputs?.length > 0 && action.inputs.map((input, i) => {
                return (
                  <ParamInput key={`param-input-${i}`} label={input.name} type={input.type} value={transaction.params[1][i]} setValue={(val) => handleParamChange(i, val)}/>
                )
              })}
              {action?.payable && <TextField type="number" value={transaction.value} onChange={(e) => updateTransaction('value', e.target.value)} label="Value" placeholder="1" fullWidth InputProps={{endAdornment: <InputAdornment position="end">MATIC</InputAdornment>}}/>}
            </> :
            <>
              <TextField label="Function" value={transaction.action} onChange={(e) => updateTransaction('action', e.target.value)} placeholder="mint"/>
              {transaction.params[0].length > 0 && <Typography variant="h6" m={1}>Params</Typography>}
              {transaction.params[0].map((type, i) => {
                return (
                  <ParamInput key={`param-input-${i}`} label={`Param ${i}`} type={type} value={transaction.params[1][i]} setType={(val) => handleTypeChange(i, val)} setValue={(val) => handleParamChange(i, val)}/>
                )
              })}
              <Button startIcon={<AddIcon />} onClick={addParam}>Add Function Param</Button>
              <TextField type="number" value={transaction.value} onChange={(e) => updateTransaction('value', e.target.value)} label="Value" placeholder="1" fullWidth InputProps={{endAdornment: <InputAdornment position="end">MATIC</InputAdornment>}}/>
            </>
        )}
        {foundAbi === false && transaction.address.length == 42 &&
          <>
            <Typography variant="subtitle1">ABI not found. Choose an Option:</Typography>
            <Stack direction="row" justifyContent="space-evenly">
              <Button onClick={() => setCustomAbi("erc20")} variant="contained">ERC20 (Token)</Button>
              <Button onClick={() => setCustomAbi("erc721")} variant="contained">ERC721 (NFT)</Button>
              <Button onClick={() => setCustomAbi("custom")} variant="contained">Custom</Button>
            </Stack>
          </>
        }
      </Stack>
    </Paper>
  )
}