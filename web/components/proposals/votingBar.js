import { Box } from "@mui/material";

export default function VotingBar(props) {
  const {yes, no, total} = props;
  const yesPercent = Math.round(yes * 100 / total);
  const noPercent = Math.round(no * 100 / total);
  const restPercent = 100 - yesPercent - noPercent;

  return (
    <Box sx={{width: '100%', height: 5, background: `linear-gradient(90deg, green ${yesPercent}%, lightgray ${yesPercent}%, lightgray ${yesPercent + restPercent}%, red ${noPercent}%)`}}></Box>
  )
}