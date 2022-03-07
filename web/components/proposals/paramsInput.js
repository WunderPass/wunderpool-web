import { Checkbox, FormControl, FormControlLabel, InputLabel, MenuItem, Select, Stack, TextField } from "@mui/material";

export default function ParamInput(props) {
  const {label, type, value, setValue, setType} = props;

  if (type == "") {
    return (
      <FormControl fullWidth>
        <InputLabel>Type</InputLabel>
        <Select value="" label="Type" onChange={(e) => setType(e.target.value)}>
          {['uint', 'uint[]', 'string', 'string[]', 'address', 'address[]', 'bytes', 'bytes[]', 'bool', 'bool[]'].map((typ) => {
            return <MenuItem value={typ}>{typ}</MenuItem>
          })}
        </Select>
      </FormControl>
    )
  } else if (type.match(/\[\]/)) {
    return <TextField label={label} value={value} onChange={(e) => setValue(e.target.value)} placeholder={type}/>
  } else if (type.match(/(string|bytes|address)/)) {
    return <TextField label={label} value={value} onChange={(e) => setValue(e.target.value)} placeholder={type}/>
  } else if (type.match(/uint/)) {
    return <TextField label={label} type="number" value={value} onChange={(e) => setValue(e.target.value)} placeholder={type}/>
  } else if (type.match(/bool/)) {
    return <FormControlLabel label={label} control={<Checkbox checked={value == 'true'} onChange={(e, val) => setValue(String(val))}/>}/>
  } else {
    return <TextField label={label} value={value} onChange={(e) => setValue(e.target.value)} placeholder={type}/>
  }
}