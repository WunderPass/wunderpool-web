import {
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Stack,
    Typography,
    Collapse,
    FormControl,
    InputLabel,
    OutlinedInput,
    InputAdornment,

} from '@mui/material';
import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import CurrencyInput from 'react-currency-input-field';
import TokenInput from '../tokens/input';
import { currency, round } from '/services/formatter';




export default function makeProposal(props) {
    const { setOpen, wunderPool, handleSuccess, handleError } = props;
    const [tokenAddress, setTokenAddress] = useState('');
    const [tokenImage, setTokenImage] = useState(null);
    const [tokenPrice, setTokenPrice] = useState(false);
    const [waitingForPrice, setWaitingForPrice] = useState(false);
    const [tokenName, setTokenName] = useState('');
    const [tokenNameTouched, setTokenNameTouched] = useState(false);
    const [tokenSymbol, setTokenSymbol] = useState('');
    const [tokenSymbolTouched, setTokenSymbolTouched] = useState(false);
    const [value, setValue] = useState('');
    const [valueTouched, setValueTouched] = useState(false);
    const [loading, setLoading] = useState(false);
    const [hasEnoughBalance, setHasEnoughBalance] = useState(false);
    const [votingsOn, setVotingsOn] = useState(true);
    const end = useRef(null);

    const receivedTokens = value / tokenPrice;

    const handleApe = (e) => {
        e.preventDefault();
        setLoading(true);
        wunderPool
            .apeSuggestion(
                tokenAddress,
                `Let's Ape into ${tokenName} (${tokenSymbol})`,
                `We will ape ${value} USD into ${tokenName}`,
                value
            )
            .then((res) => {
                console.log(res);
                handleSuccess(`Created Proposal to Ape into ${tokenSymbol}`);
                wunderPool.determineProposals();
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
        if (tokenAddress && tokenAddress.length == 42) {
            setWaitingForPrice(true);
            axios({
                url: `/api/tokens/price`,
                params: { address: tokenAddress },
            }).then((res) => {
                setTokenPrice(res.data?.dollar_price);
                setWaitingForPrice(false);
            });
        }
    }, [tokenAddress]);

    const handleValueInput = (e) => {
        setValue(e.target.value);
    };

    const onToggle = () => {
        setVotingsOn(!votingsOn);
    };

    const stepBack = () => {
        setStep(step - 1);
    };

    const stepContinue = () => {
        setStep(step + 1);
        console.log(step.toString());
    };

    const openAdvanced = () => {
        setShowMoreOptions(true);
        setTimeout(() => {
            end.current.scrollIntoView({ behavior: 'smooth' });
        }, 250);
    };
    const handleClose = () => {
        setTokenAddress('');
        setTokenName(null);
        setTokenSymbol(null);
        setTokenImage(null);
        setValue(0);
        setLoading(false);
        setOpen(false);
    };

    const handleValueChange = (e) => {
        setHasEnoughBalance(
            user.usdBalance >= Number(convertToRawValue(e.target.value))
        );
        setValue(convertToRawValue(e.target.value));
        setValueTouched(true);
    };



    return (
        <Dialog
            className="rounded-2xl"
            open={open}
            onClose={handleClose}
            PaperProps={{
                style: { borderRadius: 12 },
            }}
        >

            <>
                <DialogTitle className="font-bold font-graphik tracking-tight w-screen">
                    Make a Proposal
                </DialogTitle>
                <DialogContent style={{ scrollbarwidth: 'none' }}>
                    <Stack spacing={1}>

                        <div className="mt-2">
                            <label className="label " for="poolName">
                                Name of the Proposal
                            </label>
                            <input
                                className="textfield py-4 px-3 mt-2 "
                                id="poolName"
                                type="text"
                                placeholder="Name of the Proposal"
                            />


                        </div>

                        <div className="pt-4">
                            <label className="label pb-2" for="poolDescription">
                                Buy Token
                            </label>

                            <div className="mt-2">
                                <TokenInput
                                    className="textfield py-4 pb-9 mt-2"
                                    setTokenAddress={setTokenAddress}
                                    setTokenName={setTokenName}
                                    setTokenSymbol={setTokenSymbol}
                                    setTokenImage={setTokenImage}
                                />
                            </div>
                        </div>
                        <Collapse in={tokenName && tokenSymbol ? true : false}>
                            <Stack spacing={3}>
                                <Stack
                                    spacing={2}
                                    alignItems="center"
                                    direction="row"
                                    sx={{ height: '50px' }}
                                >
                                    <img width="50px" src={tokenImage || '/favicon.ico'} />
                                    <Typography variant="h4" flexGrow={1}>
                                        {tokenName}
                                    </Typography>
                                    <Typography variant="h4" color="GrayText">
                                        {!waitingForPrice && currency(tokenPrice, {})}
                                    </Typography>
                                </Stack>
                                <FormControl fullWidth variant="outlined">
                                    <InputLabel>Ape Amount</InputLabel>
                                    <OutlinedInput
                                        type="number"
                                        value={value}
                                        onChange={handleValueInput}
                                        label="Ape Amount"
                                        placeholder="1"
                                        endAdornment={
                                            <InputAdornment position="end">USD</InputAdornment>
                                        }
                                    />
                                    <Typography variant="subtitle1" textAlign="right">
                                        {round(receivedTokens, receivedTokens > 1 ? 2 : 5)}{' '}
                                        {tokenSymbol}
                                    </Typography>
                                </FormControl>
                            </Stack>
                        </Collapse>

                        <div className="pt-4">
                            <label className="label pb-2" for="value">
                                Amount
                            </label>
                            <div>
                                <CurrencyInput
                                    intlConfig={{ locale: 'en-US', currency: 'USD' }}
                                    className="textfield py-4 mt-2"
                                    prefix={'$'}
                                    placeholder="$1,00"
                                    decimalsLimit={2}
                                    type="text"
                                    value={value}
                                    onChange={handleValueInput}
                                    label="amount"
                                />
                                {valueTouched && !hasEnoughBalance && (
                                    <div className="text-red-600" style={{ marginTop: 0 }}>
                                        The pool doesn't have that much USD in its Treasury!
                                    </div>
                                )}
                            </div>
                        </div>



                    </Stack>
                </DialogContent>

                <DialogActions className="flex items-center justify-center mx-4">
                    <div className="flex flex-col items-center justify-center w-full">
                        <button
                            className="btn-neutral w-full py-3"
                            onClick={handleClose}
                        >
                            Cancel
                        </button>
                        <button
                            className="btn-kaico w-full py-3 mt-2"
                            onClick={stepContinue}
                        >
                            Continue
                        </button>
                    </div>
                </DialogActions>
            </>
        </Dialog>
    );
}
