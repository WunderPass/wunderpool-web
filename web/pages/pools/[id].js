import {useRouter} from 'next/router';
import { Button, Collapse, Container, Grid, IconButton, Skeleton, Stack, Typography } from "@mui/material";
import { useState, useEffect } from "react";
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import DangerousIcon from '@mui/icons-material/Dangerous';
import { fetchPoolProposals } from '/services/contract/proposals';
import Link from 'next/link';
import AddMemberDialog from '/components/dialogs/addMember';
import DestroyPoolDialog from '/components/dialogs/destroyPool';
import RemoveMemberDialog from '/components/dialogs/removeMember';
import ProposalList from '/components/proposals/list';
import TokenList from '/components/tokens/list';
import { fetchPoolTokens } from '/services/contract/token';
import ApeForm from '/components/proposals/apeForm';
import { fetchPoolMembers } from "/services/contract/pools";
import FundPoolDialog from '/components/dialogs/fundPoolDialog';
import { fetchPoolBalance } from '/services/contract/pools';

export default function Pool(props) {
  const router = useRouter();
  const {id: address, name} = router.query;
  const [ape, setApe] = useState(false)
  const [customProposal, setCustomProposal] = useState(false)
  const [personDialog, setPersonDialog] = useState(false);
  const [personRemoveDialog, setPersonRemoveDialog] = useState(false);
  const [fundDialog, setFundDialog] = useState(false);
  const [withdrawDialog, setWithdrawDialog] = useState(false);
  const [destroyDialog, setDestroyDialog] = useState(false);
  const [proposals, setProposals] = useState([]);
  const [tokens, setTokens] = useState([]);
  const [members, setMembers] = useState([]);
  const [poolBalance, setPoolBalance] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchProposals = () => {
    setLoading(true);
    fetchPoolProposals(address).then(ps => {
      setProposals(ps);
      setLoading(false);
    })
  }

  const fetchTokens = () => {
    fetchPoolTokens(address).then(ts => {
      setTokens(ts);
    })
  }

  const fetchMembers = () => {
    fetchPoolMembers(address).then(res => {
      setMembers(res);
    })
  }

  const fetchBalance = () => {
    fetchPoolBalance(address).then(res => {
      setPoolBalance(res);
    })
  }

  useEffect(() => {
    if(address) {
      fetchProposals();
      fetchTokens();
      fetchMembers();
      fetchBalance();
    }
  }, [address])

  return (
    <Container maxWidth="md">
      <Stack spacing={3} alignItems="center" paddingTop={2} sx={{width: '100%'}}>
        <Grid container alignItems="center">
          <Grid item xs={12} sm={2}>
            <Link href={`/pools`} passHref>
              <Button startIcon={<ArrowBackIosIcon />}>All Pools</Button>
            </Link>
          </Grid>
          <Grid item xs={12} sm={8} textAlign="center">
            <Typography variant="h3">{name}</Typography>
          </Grid>
          <Grid item xs={12} sm={2}>
            <Stack direction="row" alignItems="center" justifyContent="right">
              <IconButton color="success" onClick={() => setPersonDialog(true)}><PersonAddAlt1Icon /></IconButton>
              <IconButton onClick={() => setPersonRemoveDialog(true)}><PersonRemoveIcon /></IconButton>
              <IconButton color="error" onClick={() => setDestroyDialog(true)}><DangerousIcon /></IconButton>
            </Stack>
          </Grid>
        </Grid>
        <Collapse in={!ape && !customProposal} sx={{width: '100%'}}>
          <Stack direction="row" spacing={3} sx={{width: '100%'}}>
            <Button onClick={() => {setApe(true)}} color="success" variant="contained" sx={{width: '100%', minHeight: 150, aspectRatio: '2/1'}}>So richtig Reinapen</Button>
            <Button onClick={() => {setCustomProposal(true)}} variant="contained" sx={{width: '100%', minHeight: 150, aspectRatio: '2/1'}}>Eigenes Proposal</Button>
          </Stack>
        </Collapse>
        <Collapse in={ape} sx={{width: "100%"}}>
          <ApeForm setApe={setApe} address={address} fetchProposals={fetchProposals}/>
        </Collapse>
        <Collapse in={customProposal} sx={{width: "100%"}}>
          
        </Collapse>
        {loading ? 
          <Skeleton variant="rectangular" width="100%" sx={{height: "100px", borderRadius: 3}} /> :
          <Collapse in={!customProposal && !ape} sx={{width: "100%"}}>
            <ProposalList proposals={proposals} members={members} poolAddress={address} setApe={setApe} fetchProposals={fetchProposals} {...props}/>
            <TokenList tokens={tokens} poolAddress={address} fetchProposals={fetchProposals} handleFund={() => setFundDialog(true)} handleWithdraw={() => setWithdrawDialog(true)} poolBalance={poolBalance}/>
          </Collapse>
        }
      </Stack>
      <AddMemberDialog open={personDialog} setOpen={setPersonDialog} poolAddress={address} {...props}/>
      <RemoveMemberDialog open={personRemoveDialog} members={members} setOpen={setPersonRemoveDialog} poolAddress={address} {...props}/>
      <FundPoolDialog open={fundDialog} setOpen={setFundDialog} address={address} {...props}/>
      <DestroyPoolDialog open={destroyDialog} setOpen={setDestroyDialog} address={address} name={name} {...props}/>
    </Container>
  )
}