import { createTheme } from '@mui/material/styles';

const colors = {
  wunderBlue: '#0096FE',
  wunderLightBlue: '#01BFFF',
  wunderDarkBlue: '#020D30',
  casamaBlue: '#5F45FD',
  casamaDarkBlue: '#462cf1',
  casamaLightBlue: '#7560ff',
  casamaExtraLightBlue: '#E4DFFF',
  brown: '#d6a34a',
  purple: '#551fbd',
  powderBlue: '#a0b6f7',
};

export default createTheme({
  palette: {
    red: { main: '#ef4444' },
  },
  typography: {
    fontFamily: `"Graphik", sans-serif`,
    fontSize: 14,
    fontWeightLight: 300,
    fontWeightRegular: 400,
    fontWeightMedium: 500,
  },
  components: {
    MuiFab: {
      styleOverrides: {
        root: {
          backgroundColor: `${colors.casamaDarkBlue} !important`,
        },
      },
    },
  },
});
