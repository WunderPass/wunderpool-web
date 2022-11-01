import { Box } from '@mui/material';

export default function VotingBar(props) {
  const { yes, no, total } = props;
  const yesPercent = Math.round((yes * 100) / total);
  const noPercent = Math.round((no * 100) / total);
  const restPercent = 100 - yesPercent - noPercent;

  return (
    <Box
      className="py-1 rounded-full"
      sx={{
        width: '100%',
        height: 5,
        background: `linear-gradient(90deg, #04CB5A ${yesPercent}%, #F5F5F5 ${yesPercent}%, #F5F5F5 ${
          yesPercent + restPercent
        }%, #ff3d00 ${yesPercent + restPercent}%, #ff3d00 ${noPercent}%)`,
      }}
    ></Box>
  );
}
