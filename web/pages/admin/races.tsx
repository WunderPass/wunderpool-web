import { useEffect, useState } from 'react';
import { Container } from '@mui/material';
import axios from 'axios';
import { useRouter } from 'next/router';
import { compAddr } from '../../services/memberHelpers';
import Avatar from '../../components/general/members/avatar';

export default function AdminRacesPage(props) {
  const { user, handleSuccess, handleError } = props;
  const [events, setEvents] = useState([]);
  const [selectedEvents, setSelectedEvents] = useState([]);
  const [competitions, setCompetitions] = useState([]);
  const router = useRouter();

  // const fetchCompetitions = async () => {
  //   const { data } = await axios({
  //     url: '/api/betting/competitions',
  //     params: {
  //       states: 'LIVE,UPCOMING,HISTORIC',
  //       sort: 'endTimestamp,desc',
  //       size: 100,
  //     },
  //   });
  //   console.log(data?.content);
  //   setCompetitions(data?.content);
  // };

  // useEffect(() => {
  //   if (router.isReady && user.isReady) {
  //     if (!user.isAdmin) {
  //       router.push('/betting');
  //     } else {
  //       fetchCompetitions();
  //     }
  //   }
  // }, [user.isReady, router.isReady]);

  const results = [
    {
      name: 'FIFA World Cup - QF - England vs. France',
      stake: 50,
      results: [
        {
          address: '0x097bf9d9a2c838e12fe153e4d7f83b48adb572c6',
          prediction: [1, 1],
          wunderId: 's-tschurilin',
          userName: 's-tschurilin',
          profileName: 'Slava Tschurilin',
          points: 0,
          winnings: 0,
        },
        {
          address: '0x0a94e06f980103c6e17473dbc41750af78e2f617',
          prediction: [0, 2],
          wunderId: 'e-eickhoff',
          userName: 'e-eickhoff',
          profileName: null,
          points: 1,
          winnings: 150,
        },
        {
          address: '0xb46b2a2d49ee2b051daa77bd28eb0af685cfbff8',
          prediction: [1, 0],
          wunderId: 'a-fricke',
          userName: 'a-fricke',
          profileName: 'A F',
          points: 0,
          winnings: 0,
        },
      ],
    },
    {
      name: 'FIFA World Cup - QF - England vs. France',
      stake: 5,
      results: [
        {
          address: '0x03a2a3dfa9d2c1b3ec7990fff95d1fb94f85a143',
          prediction: [1, 3],
          wunderId: 'WUNDER_OfkhzVSuvR5z9',
          userName: 'ma-bennewitz',
          profileName: 'Manja Bennewitz',
          points: 1,
          winnings: 0,
        },
        {
          address: '0x097bf9d9a2c838e12fe153e4d7f83b48adb572c6',
          prediction: [2, 2],
          wunderId: 's-tschurilin',
          userName: 's-tschurilin',
          profileName: 'Slava Tschurilin',
          points: 0,
          winnings: 0,
        },
        {
          address: '0x0a94e06f980103c6e17473dbc41750af78e2f617',
          prediction: [0, 2],
          wunderId: 'e-eickhoff',
          userName: 'e-eickhoff',
          profileName: null,
          points: 1,
          winnings: 0,
        },
        {
          address: '0x1a8459f9ddecabe92281ebdfa62874010a53fdc6',
          prediction: [1, 1],
          wunderId: 'g-fricke',
          userName: 'encierro',
          profileName: 'Ger Win ',
          points: 0,
          winnings: 0,
        },
        {
          address: '0x264f7e9024aa559b56aba2a3aedd43adba49abff',
          prediction: [1, 1],
          wunderId: 'a-sors',
          userName: 'a-sors',
          profileName: 'Amélie Sors',
          points: 0,
          winnings: 0,
        },
        {
          address: '0x3c782466d0560b05928515cf31def4ff308b947a',
          prediction: [1, 1],
          wunderId: 't-bäckendß2',
          userName: 'mstahl',
          profileName: 'Max Stahl',
          points: 0,
          winnings: 0,
        },
        {
          address: '0x48dee6415987d51cdf6c9c7b53185afad0e4502c',
          prediction: [2, 1],
          wunderId: 't-romulo',
          userName: 't-romulo',
          profileName: null,
          points: 0,
          winnings: 0,
        },
        {
          address: '0x51b33d9e2a34990c9c2e9a0dc29e70b73baed035',
          prediction: [1, 2],
          wunderId: 'WUNDER_YAHIltc7ZPdAB',
          userName: 'ma-lennon',
          profileName: 'Mariandy Lennon',
          points: 3,
          winnings: 23.75,
        },
        {
          address: '0x6c87ca930f7dba3953516953b2dc566988047c4e',
          prediction: [2, 1],
          wunderId: 'c-burston',
          userName: 'c-burston',
          profileName: null,
          points: 0,
          winnings: 0,
        },
        {
          address: '0x7d6990242a44f0e3aa79ef56e218437ddab99f1f',
          prediction: [1, 0],
          wunderId: 'WUNDER_zLGrZJuo3rJdC',
          userName: 'ps',
          profileName: 'pele santos',
          points: 0,
          winnings: 0,
        },
        {
          address: '0x7e0b49362897706290b7312d0b0902a1629397d8',
          prediction: [1, 2],
          wunderId: 'm-loechner',
          userName: 'm-loechner',
          profileName: 'Moritz Löchner',
          points: 3,
          winnings: 23.75,
        },
        {
          address: '0xa00571cff19956e1d89d56e30028d036904ea085',
          prediction: [1, 2],
          wunderId: 'n-hintzen',
          userName: 'n-hintzen',
          profileName: 'Nina Hintzen',
          points: 3,
          winnings: 23.75,
        },
        {
          address: '0xa091f10b3896141c09d9aa4da82c44ebc8935421',
          prediction: [0, 1],
          wunderId: 'WUNDER_ndGCdt0WzUZIn',
          userName: 'he-lafleche',
          profileName: 'Helena Lafleche',
          points: 2,
          winnings: 0,
        },
        {
          address: '0xac4c7c8c3a2cfffd889c1fb78b7468e281032284',
          prediction: [2, 1],
          wunderId: 't-bitschnau',
          userName: 'despot',
          profileName: 'Despot Bitschnau',
          points: 0,
          winnings: 0,
        },
        {
          address: '0xb46b2a2d49ee2b051daa77bd28eb0af685cfbff8',
          prediction: [1, 1],
          wunderId: 'a-fricke',
          userName: 'a-fricke',
          profileName: 'A F',
          points: 0,
          winnings: 0,
        },
        {
          address: '0xb7fae9727e2459999e58dc064c5f65825d8d13ea',
          prediction: [1, 2],
          wunderId: 'WUNDER_WT4EEZscGhgON',
          userName: 'ch-sors',
          profileName: 'Chloé Sors',
          points: 3,
          winnings: 23.75,
        },
        {
          address: '0xc5e63465528f193fba1849e8d31222deeecd99f5',
          prediction: [0, 0],
          wunderId: 'f-eucalipto',
          userName: 'f-eucalipto',
          profileName: null,
          points: 0,
          winnings: 0,
        },
        {
          address: '0xe01f74c4e40eaabfcfec0ec5d1d5e320b9025a6c',
          prediction: [1, 3],
          wunderId: 'g-roeder',
          userName: 'g-roeder',
          profileName: null,
          points: 1,
          winnings: 0,
        },
        {
          address: '0xe4ec023f6a3fedd4b7f4a5f460aaf5dafd554603',
          prediction: [2, 2],
          wunderId: 's-hartmann',
          userName: 's-hartmann',
          profileName: null,
          points: 0,
          winnings: 0,
        },
      ],
    },
    {
      name: 'FIFA World Cup - QF - England vs. France',
      stake: 10,
      results: [
        {
          address: '0x097bf9d9a2c838e12fe153e4d7f83b48adb572c6',
          prediction: [2, 1],
          wunderId: 's-tschurilin',
          userName: 's-tschurilin',
          profileName: 'Slava Tschurilin',
          points: 0,
          winnings: 0,
        },
        {
          address: '0x0a94e06f980103c6e17473dbc41750af78e2f617',
          prediction: [0, 2],
          wunderId: 'e-eickhoff',
          userName: 'e-eickhoff',
          profileName: null,
          points: 1,
          winnings: 0,
        },
        {
          address: '0x1a8459f9ddecabe92281ebdfa62874010a53fdc6',
          prediction: [2, 3],
          wunderId: 'g-fricke',
          userName: 'encierro',
          profileName: 'Ger Win ',
          points: 2,
          winnings: 110,
        },
        {
          address: '0x22cba5dc22f9611bf834f333ea276d7bc2148d5f',
          prediction: [1, 1],
          wunderId: 'WUNDER_yD7PXKiqPFmna',
          userName: 'thelongtalong',
          profileName: 't l',
          points: 0,
          winnings: 0,
        },
        {
          address: '0x264f7e9024aa559b56aba2a3aedd43adba49abff',
          prediction: [1, 3],
          wunderId: 'a-sors',
          userName: 'a-sors',
          profileName: 'Amélie Sors',
          points: 1,
          winnings: 0,
        },
        {
          address: '0x3c782466d0560b05928515cf31def4ff308b947a',
          prediction: [0, 3],
          wunderId: 't-bäckendß2',
          userName: 'mstahl',
          profileName: 'Max Stahl',
          points: 1,
          winnings: 0,
        },
        {
          address: '0x7d6990242a44f0e3aa79ef56e218437ddab99f1f',
          prediction: [1, 1],
          wunderId: 'WUNDER_zLGrZJuo3rJdC',
          userName: 'ps',
          profileName: 'pele santos',
          points: 0,
          winnings: 0,
        },
        {
          address: '0x7e0b49362897706290b7312d0b0902a1629397d8',
          prediction: [1, 1],
          wunderId: 'm-loechner',
          userName: 'm-loechner',
          profileName: 'Moritz Löchner',
          points: 0,
          winnings: 0,
        },
        {
          address: '0x7f997782a4342ecdc5e566b30d30b98fe3b57a90',
          prediction: [2, 2],
          wunderId: 'j-mueller',
          userName: 'j-mueller',
          profileName: 'Jens Mueller',
          points: 0,
          winnings: 0,
        },
        {
          address: '0xc5e63465528f193fba1849e8d31222deeecd99f5',
          prediction: [2, 1],
          wunderId: 'f-eucalipto',
          userName: 'f-eucalipto',
          profileName: null,
          points: 0,
          winnings: 0,
        },
        {
          address: '0xeb724b0a006389ccc4a6e86d92ddb8b68eeb79c5',
          prediction: [2, 2],
          wunderId: 'WUNDER_OPhA8gpYOysiw',
          userName: 'da-bitschnau',
          profileName: 'Danilo Bitschnau',
          points: 0,
          winnings: 0,
        },
      ],
    },
    {
      name: 'FIFA World Cup - QF - Morocco vs. Portugal',
      stake: 5,
      results: [
        {
          address: '0x03a2a3dfa9d2c1b3ec7990fff95d1fb94f85a143',
          prediction: [1, 3],
          wunderId: 'WUNDER_OfkhzVSuvR5z9',
          userName: 'ma-bennewitz',
          profileName: 'Manja Bennewitz',
          points: 0,
          winnings: 0,
        },
        {
          address: '0x097bf9d9a2c838e12fe153e4d7f83b48adb572c6',
          prediction: [1, 3],
          wunderId: 's-tschurilin',
          userName: 's-tschurilin',
          profileName: 'Slava Tschurilin',
          points: 0,
          winnings: 0,
        },
        {
          address: '0x0a94e06f980103c6e17473dbc41750af78e2f617',
          prediction: [0, 2],
          wunderId: 'e-eickhoff',
          userName: 'e-eickhoff',
          profileName: null,
          points: 0,
          winnings: 0,
        },
        {
          address: '0x1a8459f9ddecabe92281ebdfa62874010a53fdc6',
          prediction: [1, 0],
          wunderId: 'g-fricke',
          userName: 'encierro',
          profileName: 'Ger Win ',
          points: 3,
          winnings: 75,
        },
        {
          address: '0x264f7e9024aa559b56aba2a3aedd43adba49abff',
          prediction: [0, 2],
          wunderId: 'a-sors',
          userName: 'a-sors',
          profileName: 'Amélie Sors',
          points: 0,
          winnings: 0,
        },
        {
          address: '0x48dee6415987d51cdf6c9c7b53185afad0e4502c',
          prediction: [1, 4],
          wunderId: 't-romulo',
          userName: 't-romulo',
          profileName: null,
          points: 0,
          winnings: 0,
        },
        {
          address: '0x7d6990242a44f0e3aa79ef56e218437ddab99f1f',
          prediction: [2, 2],
          wunderId: 'WUNDER_zLGrZJuo3rJdC',
          userName: 'ps',
          profileName: 'pele santos',
          points: 0,
          winnings: 0,
        },
        {
          address: '0x7e0b49362897706290b7312d0b0902a1629397d8',
          prediction: [3, 2],
          wunderId: 'm-loechner',
          userName: 'm-loechner',
          profileName: 'Moritz Löchner',
          points: 2,
          winnings: 0,
        },
        {
          address: '0x7f997782a4342ecdc5e566b30d30b98fe3b57a90',
          prediction: [0, 0],
          wunderId: 'j-mueller',
          userName: 'j-mueller',
          profileName: 'Jens Mueller',
          points: 0,
          winnings: 0,
        },
        {
          address: '0xa00571cff19956e1d89d56e30028d036904ea085',
          prediction: [0, 3],
          wunderId: 'n-hintzen',
          userName: 'n-hintzen',
          profileName: 'Nina Hintzen',
          points: 0,
          winnings: 0,
        },
        {
          address: '0xa091f10b3896141c09d9aa4da82c44ebc8935421',
          prediction: [1, 2],
          wunderId: 'WUNDER_ndGCdt0WzUZIn',
          userName: 'he-lafleche',
          profileName: 'Helena Lafleche',
          points: 0,
          winnings: 0,
        },
        {
          address: '0xac4c7c8c3a2cfffd889c1fb78b7468e281032284',
          prediction: [1, 3],
          wunderId: 't-bitschnau',
          userName: 'despot',
          profileName: 'Despot Bitschnau',
          points: 0,
          winnings: 0,
        },
        {
          address: '0xb7fae9727e2459999e58dc064c5f65825d8d13ea',
          prediction: [1, 1],
          wunderId: 'WUNDER_WT4EEZscGhgON',
          userName: 'ch-sors',
          profileName: 'Chloé Sors',
          points: 0,
          winnings: 0,
        },
        {
          address: '0xe01f74c4e40eaabfcfec0ec5d1d5e320b9025a6c',
          prediction: [1, 2],
          wunderId: 'g-roeder',
          userName: 'g-roeder',
          profileName: null,
          points: 0,
          winnings: 0,
        },
        {
          address: '0xe4ec023f6a3fedd4b7f4a5f460aaf5dafd554603',
          prediction: [1, 1],
          wunderId: 's-hartmann',
          userName: 's-hartmann',
          profileName: null,
          points: 0,
          winnings: 0,
        },
      ],
    },
    {
      name: 'FIFA World Cup - QF - Morocco vs. Portugal',
      stake: 10,
      results: [
        {
          address: '0x034aa038118f45fbfc2c074c4cd8e8f012b31e82',
          prediction: [1, 2],
          wunderId: 'j-conde',
          userName: 'j-conde',
          profileName: null,
          points: 0,
          winnings: 0,
        },
        {
          address: '0x097bf9d9a2c838e12fe153e4d7f83b48adb572c6',
          prediction: [0, 0],
          wunderId: 's-tschurilin',
          userName: 's-tschurilin',
          profileName: 'Slava Tschurilin',
          points: 0,
          winnings: 0,
        },
        {
          address: '0x0a94e06f980103c6e17473dbc41750af78e2f617',
          prediction: [0, 2],
          wunderId: 'e-eickhoff',
          userName: 'e-eickhoff',
          profileName: null,
          points: 0,
          winnings: 0,
        },
        {
          address: '0x1a8459f9ddecabe92281ebdfa62874010a53fdc6',
          prediction: [1, 1],
          wunderId: 'g-fricke',
          userName: 'encierro',
          profileName: 'Ger Win ',
          points: 0,
          winnings: 0,
        },
        {
          address: '0x3c782466d0560b05928515cf31def4ff308b947a',
          prediction: [2, 0],
          wunderId: 't-bäckendß2',
          userName: 'mstahl',
          profileName: 'Max Stahl',
          points: 1,
          winnings: 0,
        },
        {
          address: '0x7d6990242a44f0e3aa79ef56e218437ddab99f1f',
          prediction: [2, 3],
          wunderId: 'WUNDER_zLGrZJuo3rJdC',
          userName: 'ps',
          profileName: 'pele santos',
          points: 0,
          winnings: 0,
        },
        {
          address: '0x7e0b49362897706290b7312d0b0902a1629397d8',
          prediction: [1, 1],
          wunderId: 'm-loechner',
          userName: 'm-loechner',
          profileName: 'Moritz Löchner',
          points: 0,
          winnings: 0,
        },
        {
          address: '0xb46b2a2d49ee2b051daa77bd28eb0af685cfbff8',
          prediction: [2, 1],
          wunderId: 'a-fricke',
          userName: 'a-fricke',
          profileName: 'A F',
          points: 2,
          winnings: 100,
        },
        {
          address: '0xc5e63465528f193fba1849e8d31222deeecd99f5',
          prediction: [0, 1],
          wunderId: 'f-eucalipto',
          userName: 'f-eucalipto',
          profileName: null,
          points: 0,
          winnings: 0,
        },
        {
          address: '0xeb724b0a006389ccc4a6e86d92ddb8b68eeb79c5',
          prediction: [1, 3],
          wunderId: 'WUNDER_OPhA8gpYOysiw',
          userName: 'da-bitschnau',
          profileName: 'Danilo Bitschnau',
          points: 0,
          winnings: 0,
        },
      ],
    },
    {
      name: 'FIFA World Cup - QF - Netherlands vs. Argentina',
      stake: 10,
      results: [
        {
          address: '0x03a2a3dfa9d2c1b3ec7990fff95d1fb94f85a143',
          prediction: [1, 2],
          wunderId: 'WUNDER_OfkhzVSuvR5z9',
          userName: 'ma-bennewitz',
          profileName: 'Manja Bennewitz',
          points: 0,
          winnings: 0,
        },
        {
          address: '0x097bf9d9a2c838e12fe153e4d7f83b48adb572c6',
          prediction: [2, 1],
          wunderId: 's-tschurilin',
          userName: 's-tschurilin',
          profileName: 'Slava Tschurilin',
          points: 0,
          winnings: 0,
        },
        {
          address: '0x0a94e06f980103c6e17473dbc41750af78e2f617',
          prediction: [1, 2],
          wunderId: 'e-eickhoff',
          userName: 'e-eickhoff',
          profileName: null,
          points: 0,
          winnings: 0,
        },
        {
          address: '0x1a8459f9ddecabe92281ebdfa62874010a53fdc6',
          prediction: [0, 0],
          wunderId: 'g-fricke',
          userName: 'encierro',
          profileName: 'Ger Win ',
          points: 2,
          winnings: 22.5,
        },
        {
          address: '0x3c782466d0560b05928515cf31def4ff308b947a',
          prediction: [2, 0],
          wunderId: 't-bäckendß2',
          userName: 'mstahl',
          profileName: 'Max Stahl',
          points: 0,
          winnings: 0,
        },
        {
          address: '0x7e0b49362897706290b7312d0b0902a1629397d8',
          prediction: [0, 1],
          wunderId: 'm-loechner',
          userName: 'm-loechner',
          profileName: 'Moritz Löchner',
          points: 0,
          winnings: 0,
        },
        {
          address: '0xac4c7c8c3a2cfffd889c1fb78b7468e281032284',
          prediction: [1, 1],
          wunderId: 't-bitschnau',
          userName: 'despot',
          profileName: 'Despot Bitschnau',
          points: 2,
          winnings: 22.5,
        },
        {
          address: '0xb46b2a2d49ee2b051daa77bd28eb0af685cfbff8',
          prediction: [1, 1],
          wunderId: 'a-fricke',
          userName: 'a-fricke',
          profileName: 'A F',
          points: 2,
          winnings: 22.5,
        },
        {
          address: '0xe732f335f354b3918e8e38c957471a4b991abdc1',
          prediction: [0, 0],
          wunderId: 'WUNDER_BEXdoQtpgBSdE',
          userName: 'holy-jesus',
          profileName: 'Jesus Christus',
          points: 2,
          winnings: 22.5,
        },
      ],
    },
    {
      name: 'FIFA World Cup - QF - Netherlands vs. Argentina',
      stake: 5,
      results: [
        {
          address: '0x034aa038118f45fbfc2c074c4cd8e8f012b31e82',
          prediction: [1, 0],
          wunderId: 'j-conde',
          userName: 'j-conde',
          profileName: null,
          points: 0,
          winnings: 0,
        },
        {
          address: '0x03a2a3dfa9d2c1b3ec7990fff95d1fb94f85a143',
          prediction: [1, 1],
          wunderId: 'WUNDER_OfkhzVSuvR5z9',
          userName: 'ma-bennewitz',
          profileName: 'Manja Bennewitz',
          points: 2,
          winnings: 0,
        },
        {
          address: '0x097bf9d9a2c838e12fe153e4d7f83b48adb572c6',
          prediction: [1, 2],
          wunderId: 's-tschurilin',
          userName: 's-tschurilin',
          profileName: 'Slava Tschurilin',
          points: 0,
          winnings: 0,
        },
        {
          address: '0x0a94e06f980103c6e17473dbc41750af78e2f617',
          prediction: [2, 1],
          wunderId: 'e-eickhoff',
          userName: 'e-eickhoff',
          profileName: null,
          points: 0,
          winnings: 0,
        },
        {
          address: '0x1a8459f9ddecabe92281ebdfa62874010a53fdc6',
          prediction: [2, 3],
          wunderId: 'g-fricke',
          userName: 'encierro',
          profileName: 'Ger Win ',
          points: 0,
          winnings: 0,
        },
        {
          address: '0x1b50d655d0b6da350cc16c1746d0582da3682eda',
          prediction: [2, 2],
          wunderId: 't-murtaza',
          userName: 't-murtaza',
          profileName: null,
          points: 3,
          winnings: 105,
        },
        {
          address: '0x264f7e9024aa559b56aba2a3aedd43adba49abff',
          prediction: [0, 2],
          wunderId: 'a-sors',
          userName: 'a-sors',
          profileName: 'Amélie Sors',
          points: 0,
          winnings: 0,
        },
        {
          address: '0x3c782466d0560b05928515cf31def4ff308b947a',
          prediction: [2, 0],
          wunderId: 't-bäckendß2',
          userName: 'mstahl',
          profileName: 'Max Stahl',
          points: 0,
          winnings: 0,
        },
        {
          address: '0x3fe487e1b64d71de79820bb32c73ad312a246fe5',
          prediction: [1, 2],
          wunderId: 'WUNDER_G16ieg9vJFQrX',
          userName: 'a-sp',
          profileName: 'Alexander Sp',
          points: 0,
          winnings: 0,
        },
        {
          address: '0x48dee6415987d51cdf6c9c7b53185afad0e4502c',
          prediction: [3, 1],
          wunderId: 't-romulo',
          userName: 't-romulo',
          profileName: null,
          points: 0,
          winnings: 0,
        },
        {
          address: '0x4f95b351b9aea43bcbc743d6a2cf8cec218ac746',
          prediction: [1, 1],
          wunderId: 'WUNDER_pzwxRLqgV5SbJ',
          userName: 'j-stahl',
          profileName: 'Jasmin Stahl',
          points: 2,
          winnings: 0,
        },
        {
          address: '0x6926dbc198a99a47375d085dbc980c4312214374',
          prediction: [1, 2],
          wunderId: 'WUNDER_fZkOPbYHsidcR',
          userName: 'alebanzas',
          profileName: 'Ale Banzas',
          points: 0,
          winnings: 0,
        },
        {
          address: '0x7e0b49362897706290b7312d0b0902a1629397d8',
          prediction: [0, 2],
          wunderId: 'm-loechner',
          userName: 'm-loechner',
          profileName: 'Moritz Löchner',
          points: 0,
          winnings: 0,
        },
        {
          address: '0x7f997782a4342ecdc5e566b30d30b98fe3b57a90',
          prediction: [0, 1],
          wunderId: 'j-mueller',
          userName: 'j-mueller',
          profileName: 'Jens Mueller',
          points: 0,
          winnings: 0,
        },
        {
          address: '0xa00571cff19956e1d89d56e30028d036904ea085',
          prediction: [0, 2],
          wunderId: 'n-hintzen',
          userName: 'n-hintzen',
          profileName: 'Nina Hintzen',
          points: 0,
          winnings: 0,
        },
        {
          address: '0xac4c7c8c3a2cfffd889c1fb78b7468e281032284',
          prediction: [101, 102],
          wunderId: 't-bitschnau',
          userName: 'despot',
          profileName: 'Despot Bitschnau',
          points: 0,
          winnings: 0,
        },
        {
          address: '0xb46b2a2d49ee2b051daa77bd28eb0af685cfbff8',
          prediction: [0, 1],
          wunderId: 'a-fricke',
          userName: 'a-fricke',
          profileName: 'A F',
          points: 0,
          winnings: 0,
        },
        {
          address: '0xb7fae9727e2459999e58dc064c5f65825d8d13ea',
          prediction: [1, 2],
          wunderId: 'WUNDER_WT4EEZscGhgON',
          userName: 'ch-sors',
          profileName: 'Chloé Sors',
          points: 0,
          winnings: 0,
        },
        {
          address: '0xc5e63465528f193fba1849e8d31222deeecd99f5',
          prediction: [1, 3],
          wunderId: 'f-eucalipto',
          userName: 'f-eucalipto',
          profileName: null,
          points: 0,
          winnings: 0,
        },
        {
          address: '0xc62b451cc584780b6d91f0bde2902c0af0f9e685',
          prediction: [1, 0],
          wunderId: 'WUNDER_oC7AXudPwD9kH',
          userName: 'rob-boer',
          profileName: 'Robert Boer',
          points: 0,
          winnings: 0,
        },
        {
          address: '0xe01f74c4e40eaabfcfec0ec5d1d5e320b9025a6c',
          prediction: [2, 0],
          wunderId: 'g-roeder',
          userName: 'g-roeder',
          profileName: null,
          points: 0,
          winnings: 0,
        },
      ],
    },
    {
      name: 'FIFA World Cup - QF - Netherlands vs. Argentina',
      stake: 50,
      results: [
        {
          address: '0x097bf9d9a2c838e12fe153e4d7f83b48adb572c6',
          prediction: [1, 1],
          wunderId: 's-tschurilin',
          userName: 's-tschurilin',
          profileName: 'Slava Tschurilin',
          points: 2,
          winnings: 200,
        },
        {
          address: '0x0a94e06f980103c6e17473dbc41750af78e2f617',
          prediction: [0, 1],
          wunderId: 'e-eickhoff',
          userName: 'e-eickhoff',
          profileName: null,
          points: 0,
          winnings: 0,
        },
        {
          address: '0x51b33d9e2a34990c9c2e9a0dc29e70b73baed035',
          prediction: [2, 1],
          wunderId: 'WUNDER_YAHIltc7ZPdAB',
          userName: 'ma-lennon',
          profileName: 'Mariandy Lennon',
          points: 0,
          winnings: 0,
        },
        {
          address: '0xac4c7c8c3a2cfffd889c1fb78b7468e281032284',
          prediction: [2, 3],
          wunderId: 't-bitschnau',
          userName: 'despot',
          profileName: 'Despot Bitschnau',
          points: 0,
          winnings: 0,
        },
      ],
    },
    {
      name: 'FIFA World Cup - QF - Croatia vs. Brazil',
      stake: 10,
      results: [
        {
          address: '0x097bf9d9a2c838e12fe153e4d7f83b48adb572c6',
          prediction: [0, 2],
          wunderId: 's-tschurilin',
          userName: 's-tschurilin',
          profileName: 'Slava Tschurilin',
          points: 0,
          winnings: 0,
        },
        {
          address: '0x0a94e06f980103c6e17473dbc41750af78e2f617',
          prediction: [1, 2],
          wunderId: 'e-eickhoff',
          userName: 'e-eickhoff',
          profileName: null,
          points: 0,
          winnings: 0,
        },
        {
          address: '0x3c782466d0560b05928515cf31def4ff308b947a',
          prediction: [0, 1],
          wunderId: 't-bäckendß2',
          userName: 'mstahl',
          profileName: 'Max Stahl',
          points: 0,
          winnings: 0,
        },
        {
          address: '0x7e0b49362897706290b7312d0b0902a1629397d8',
          prediction: [1, 4],
          wunderId: 'm-loechner',
          userName: 'm-loechner',
          profileName: 'Moritz Löchner',
          points: 0,
          winnings: 0,
        },
        {
          address: '0x93653b1bffcfb20eaf5e55bd3182e3b86df499ad',
          prediction: [3, 2],
          wunderId: 'WUNDER_NzozM1ilX28bx',
          userName: 'j-rupitz',
          profileName: 'Justin Rupitz',
          points: 0,
          winnings: 0,
        },
        {
          address: '0xac4c7c8c3a2cfffd889c1fb78b7468e281032284',
          prediction: [2, 1],
          wunderId: 't-bitschnau',
          userName: 'despot',
          profileName: 'Despot Bitschnau',
          points: 0,
          winnings: 0,
        },
        {
          address: '0xb46b2a2d49ee2b051daa77bd28eb0af685cfbff8',
          prediction: [1, 1],
          wunderId: 'a-fricke',
          userName: 'a-fricke',
          profileName: 'A F',
          points: 2,
          winnings: 40,
        },
        {
          address: '0xe01f74c4e40eaabfcfec0ec5d1d5e320b9025a6c',
          prediction: [2, 2],
          wunderId: 'g-roeder',
          userName: 'g-roeder',
          profileName: null,
          points: 2,
          winnings: 40,
        },
      ],
    },
    {
      name: 'FIFA World Cup - QF - Croatia vs. Brazil',
      stake: 5,
      results: [
        {
          address: '0x034aa038118f45fbfc2c074c4cd8e8f012b31e82',
          prediction: [0, 2],
          wunderId: 'j-conde',
          userName: 'j-conde',
          profileName: null,
          points: 0,
          winnings: 0,
        },
        {
          address: '0x03a2a3dfa9d2c1b3ec7990fff95d1fb94f85a143',
          prediction: [0, 4],
          wunderId: 'WUNDER_OfkhzVSuvR5z9',
          userName: 'ma-bennewitz',
          profileName: 'Manja Bennewitz',
          points: 0,
          winnings: 0,
        },
        {
          address: '0x097bf9d9a2c838e12fe153e4d7f83b48adb572c6',
          prediction: [1, 1],
          wunderId: 's-tschurilin',
          userName: 's-tschurilin',
          profileName: 'Slava Tschurilin',
          points: 2,
          winnings: 0,
        },
        {
          address: '0x0a94e06f980103c6e17473dbc41750af78e2f617',
          prediction: [1, 2],
          wunderId: 'e-eickhoff',
          userName: 'e-eickhoff',
          profileName: null,
          points: 0,
          winnings: 0,
        },
        {
          address: '0x0d113d629db84c26c56cd225b878bbe3af6c2cf6',
          prediction: [1, 5],
          wunderId: 'r-trombone',
          userName: 'r-trombone',
          profileName: 'Rusty Trombone',
          points: 0,
          winnings: 0,
        },
        {
          address: '0x1a8459f9ddecabe92281ebdfa62874010a53fdc6',
          prediction: [0, 4],
          wunderId: 'g-fricke',
          userName: 'encierro',
          profileName: 'Ger Win ',
          points: 0,
          winnings: 0,
        },
        {
          address: '0x1b50d655d0b6da350cc16c1746d0582da3682eda',
          prediction: [1, 2],
          wunderId: 't-murtaza',
          userName: 't-murtaza',
          profileName: null,
          points: 0,
          winnings: 0,
        },
        {
          address: '0x264f7e9024aa559b56aba2a3aedd43adba49abff',
          prediction: [1, 3],
          wunderId: 'a-sors',
          userName: 'a-sors',
          profileName: 'Amélie Sors',
          points: 0,
          winnings: 0,
        },
        {
          address: '0x3c782466d0560b05928515cf31def4ff308b947a',
          prediction: [2, 0],
          wunderId: 't-bäckendß2',
          userName: 'mstahl',
          profileName: 'Max Stahl',
          points: 0,
          winnings: 0,
        },
        {
          address: '0x48dee6415987d51cdf6c9c7b53185afad0e4502c',
          prediction: [1, 1],
          wunderId: 't-romulo',
          userName: 't-romulo',
          profileName: null,
          points: 2,
          winnings: 0,
        },
        {
          address: '0x4f95b351b9aea43bcbc743d6a2cf8cec218ac746',
          prediction: [2, 1],
          wunderId: 'WUNDER_pzwxRLqgV5SbJ',
          userName: 'j-stahl',
          profileName: 'Jasmin Stahl',
          points: 0,
          winnings: 0,
        },
        {
          address: '0x6c87ca930f7dba3953516953b2dc566988047c4e',
          prediction: [0, 4],
          wunderId: 'c-burston',
          userName: 'c-burston',
          profileName: null,
          points: 0,
          winnings: 0,
        },
        {
          address: '0x781dc9cc4f85f7170bef489da0a54db72e6e56e1',
          prediction: [0, 2],
          wunderId: 'r-fuhrmann',
          userName: 'r-fuhrmann',
          profileName: null,
          points: 0,
          winnings: 0,
        },
        {
          address: '0x7e0b49362897706290b7312d0b0902a1629397d8',
          prediction: [0, 0],
          wunderId: 'm-loechner',
          userName: 'm-loechner',
          profileName: 'Moritz Löchner',
          points: 3,
          winnings: 110,
        },
        {
          address: '0x7f997782a4342ecdc5e566b30d30b98fe3b57a90',
          prediction: [0, 4],
          wunderId: 'j-mueller',
          userName: 'j-mueller',
          profileName: 'Jens Mueller',
          points: 0,
          winnings: 0,
        },
        {
          address: '0xa00571cff19956e1d89d56e30028d036904ea085',
          prediction: [0, 3],
          wunderId: 'n-hintzen',
          userName: 'n-hintzen',
          profileName: 'Nina Hintzen',
          points: 0,
          winnings: 0,
        },
        {
          address: '0xac4c7c8c3a2cfffd889c1fb78b7468e281032284',
          prediction: [1, 3],
          wunderId: 't-bitschnau',
          userName: 'despot',
          profileName: 'Despot Bitschnau',
          points: 0,
          winnings: 0,
        },
        {
          address: '0xb280c720a53df8f6c13bd45e751e90dae18158c4',
          prediction: [3, 2],
          wunderId: 'm-trustwallet',
          userName: 'm-trustwallet',
          profileName: 'Moritz TrustWallet',
          points: 0,
          winnings: 0,
        },
        {
          address: '0xb46b2a2d49ee2b051daa77bd28eb0af685cfbff8',
          prediction: [1, 2],
          wunderId: 'a-fricke',
          userName: 'a-fricke',
          profileName: 'A F',
          points: 0,
          winnings: 0,
        },
        {
          address: '0xb7fae9727e2459999e58dc064c5f65825d8d13ea',
          prediction: [1, 3],
          wunderId: 'WUNDER_WT4EEZscGhgON',
          userName: 'ch-sors',
          profileName: 'Chloé Sors',
          points: 0,
          winnings: 0,
        },
        {
          address: '0xc5e63465528f193fba1849e8d31222deeecd99f5',
          prediction: [0, 1],
          wunderId: 'f-eucalipto',
          userName: 'f-eucalipto',
          profileName: null,
          points: 0,
          winnings: 0,
        },
        {
          address: '0xe01f74c4e40eaabfcfec0ec5d1d5e320b9025a6c',
          prediction: [2, 4],
          wunderId: 'g-roeder',
          userName: 'g-roeder',
          profileName: null,
          points: 0,
          winnings: 0,
        },
      ],
    },
  ];

  const admins = [
    '0x7e0b49362897706290b7312d0b0902a1629397d8', // Moritz
    '0xac4c7c8c3a2cfffd889c1fb78b7468e281032284', // Despot
    '0x1a8459f9ddecabe92281ebdfa62874010a53fdc6', // Gerwin
    '0x097bf9d9a2c838e12fe153e4d7f83b48adb572c6', // Slava
    '0x466274eefdd3265e3d8085933e69890f33023048', // Max
    '0x3c782466d0560b05928515cf31def4ff308b947a', // Max2
  ];

  const userPoints = [
    ...new Set(
      results.map((res) => res.results.map(({ address }) => address)).flat()
    ),
  ]
    .filter((addr) => !admins.includes(addr))
    .map((addr) => ({
      addr,
      wunderId: results
        .map(
          (res) =>
            res.results.find(({ address }) => compAddr(address, addr))?.wunderId
        )
        .filter((w) => w)[0],
      userName: results
        .map(
          (res) =>
            res.results.find(({ address }) => compAddr(address, addr))?.userName
        )
        .filter((w) => w)[0],
      points: results
        .map(
          (r) =>
            r.results.find(({ address }) => compAddr(address, addr))?.points ||
            0
        )
        .reduce((a, b) => a + b, 0),
    }))
    .sort((a, b) => b.points - a.points);
  let rank = 0;
  let lastPoints = 0;
  return (
    <Container maxWidth="xl">
      <div className="flex flex-col gap-3 mt-5">
        <h1 className="text-xl font-semibold text-center relative">Races</h1>
      </div>
      {userPoints.map(({ addr, wunderId, userName, points }) => {
        rank = lastPoints == points ? rank : rank + 1;
        lastPoints = points;
        return (
          <div className="container-white-p-0 p-2 flex flex-row items-center justify-between gap-2 my-2 w-full">
            <p>#{rank}</p>
            <div>
              <Avatar wunderId={wunderId} text={userName ? userName : '0X'} />
            </div>
            <div className="flex items-center justify-start truncate flex-grow">
              <div className="truncate">{userName || addr}</div>
            </div>
            <p>{points} Points</p>
          </div>
        );
      })}
    </Container>
  );
}
