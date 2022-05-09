import { useEffect, useState } from 'react';
import {
  Dialog,
  LinearProgress,
  Button,
  FormControl,
  IconButton,
  InputLabel,
  OutlinedInput,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import { TransactionForm } from '/components/proposals/transactionForm';
import { createCustomProposal } from '/services/contract/proposals';

export default function CustomForm(props) {
  const {
    customProposal,
    setCustomProposal,
    poolAddress,
    fetchProposals,
    handleSuccess,
    handleError,
  } = props;
  const [proposalTitle, setProposalTitle] = useState('');
  const [proposalDescription, setProposalDescription] = useState('');
  const [proposalTransactions, setProposalTransactions] = useState([]);
  const [proposalDeadline, setProposalDeadline] = useState('');
  const [loading, setLoading] = useState(false);
  const [signing, setSigning] = useState(true);

  const handleClose = () => {
    setProposalTitle('');
    setProposalDescription('');
    setProposalTransactions([]);
    setProposalDeadline('');
    setLoading(false);
    setCustomProposal(false);
  };

  const dialogClose = () => {
    setSigning(false);
  };

  const addTransaction = () => {
    setProposalTransactions([
      ...proposalTransactions,
      { address: '', action: '', params: [[], []], value: '' },
    ]);
  };

  const updateTransaction = (index, property, val) => {
    proposalTransactions[index][property] = val;
    setProposalTransactions([...proposalTransactions]);
  };

  const removeTransaction = (index) => {
    proposalTransactions.splice(index, 1);
    setProposalTransactions([...proposalTransactions]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setSigning(true);
    const proposalContracts = proposalTransactions.map((tr) => tr.address);
    const proposalActions = proposalTransactions.map((tr) => tr.action);
    const proposalParams = proposalTransactions.map((tr) => tr.params);
    const proposalValues = proposalTransactions.map((tr) => tr.value);
    createCustomProposal(
      poolAddress,
      proposalTitle,
      proposalDescription,
      proposalContracts,
      proposalActions,
      proposalParams,
      proposalValues,
      Math.round(new Date(proposalDeadline).getTime() / 1000)
    )
      .then((res) => {
        console.log(res);
        handleSuccess(`Created Custom Proposal`);
        fetchProposals();
        handleClose();
      })
      .catch((err) => {
        handleError(err);
      })
      .then(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    if (customProposal)
      setProposalDeadline(
        new Date(new Date().getTime() + 86400000).toISOString().slice(0, -5)
      );
  }, [customProposal]);

  return (
    <form>
      <Stack width="100%" spacing={3}>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
        >
          <Typography variant="h5">New Proposal</Typography>
          <IconButton onClick={handleClose}>
            <CloseIcon />
          </IconButton>
        </Stack>
        <TextField
          label="Title"
          required
          value={proposalTitle}
          onChange={(e) => setProposalTitle(e.target.value)}
          placeholder="Buy a WunderPass NFT"
        />
        <TextField
          label="Description"
          value={proposalDescription}
          onChange={(e) => setProposalDescription(e.target.value)}
          placeholder="We will buy a WunderPass NFT for 420 MATIC"
        />
        <FormControl>
          <InputLabel>Deadline</InputLabel>
          <OutlinedInput
            type="datetime-local"
            label="Deadline"
            value={proposalDeadline}
            onChange={(e) => setProposalDeadline(e.target.value)}
            inputProps={{ min: new Date().toISOString().slice(0, -5) }}
          />
        </FormControl>

        {proposalTransactions.map((transaction, i) => {
          return (
            <TransactionForm
              key={`transaction-${i}`}
              index={i}
              transaction={transaction}
              updateTransaction={(property, val) =>
                updateTransaction(i, property, val)
              }
              removeTransaction={removeTransaction}
              {...props}
            />
          );
        })}
        <button className="btn btn-default" onClick={addTransaction}>
          <AddIcon fontSize="small" />
          Add Transaction
        </button>
        {loading ? (
          <>
            <button className="btn btn-default" disabled variant="contained">
              Submitting Proposal...
            </button>
            {signing && (
              <Dialog open={open} onClose={dialogClose}>
                <iframe
                  className="w-auto"
                  id="fr"
                  name="transactionFrame"
                  height="600"
                ></iframe>
                <Stack spacing={2} sx={{ textAlign: 'center' }}>
                  <LinearProgress />
                </Stack>
              </Dialog>
            )}
          </>
        ) : (
          <>
            <button
              className="btn btn-success"
              type="submit"
              disabled={false}
              onClick={handleSubmit}
              variant="contained"
            >
              Submit Proposal
            </button>
          </>
        )}
      </Stack>
    </form>
  );
}
