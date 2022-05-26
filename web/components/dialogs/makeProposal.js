import {
    Button,
    Collapse,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Divider,
    LinearProgress,
    Stack,
    Typography,
    Switch,
} from '@mui/material';
import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { createPool } from '/services/contract/pools';
import CurrencyInput from 'react-currency-input-field';
import { waitForTransaction } from '../../services/contract/provider';


export default function makeProposal(props) {
    const { setOpen, wunderPool, handleSuccess, handleError } = props;
    const [tokenAddress, setTokenAddress] = useState('');
    const [tokenImage, setTokenImage] = useState(null);
    const [tokenPrice, setTokenPrice] = useState(false);
    const [waitingForPrice, setWaitingForPrice] = useState(false);
    const [poolName, setPoolName] = useState('');
    const [poolDescription, setPoolDescription] = useState('');
    const [image, setImage] = useState(null);
    const [createObjectURL, setCreateObjectURL] = useState(null);
    const [poolNameTouched, setPoolNameTouched] = useState(false);
    const [tokenName, setTokenName] = useState('');
    const [tokenNameTouched, setTokenNameTouched] = useState(false);
    const [tokenSymbol, setTokenSymbol] = useState('');
    const [tokenSymbolTouched, setTokenSymbolTouched] = useState(false);
    const [entryBarrier, setEntryBarrier] = useState('');
    const [value, setValue] = useState('');
    const [valueTouched, setValueTouched] = useState(false);
    const [waitingForPool, setWaitingForPool] = useState(false);
    const [showMoreOptions, setShowMoreOptions] = useState(false);
    const [loading, setLoading] = useState(false);
    const [hasEnoughBalance, setHasEnoughBalance] = useState(false);
    const [step, setStep] = useState(1);
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

    const uploadToClient = (event) => {
        if (event.target.files && event.target.files[0]) {
            const i = event.target.files[0];

            setImage(i);
            setCreateObjectURL(URL.createObjectURL(i));
        }
    };

    const uploadToServer = async (event) => {
        const body = new FormData();
        body.append('file', image);
        const response = await fetch('/api/upload', {
            method: 'POST',
            body,
        });
    };

    const handleClose = () => {

    };

    const convertToRawValue = (value) => {
        return value.replace(/[^0-9.]/g, '');
    };

    const handleValueChange = (e) => {
        setHasEnoughBalance(
            user.usdBalance >= Number(convertToRawValue(e.target.value))
        );
        setValue(convertToRawValue(e.target.value));
        setValueTouched(true);
    };

    const handleNameChange = (e) => {
        let name = e.target.value;
        setPoolName(name);
        setPoolNameTouched(true);
        if (!tokenNameTouched)
            setTokenName(
                `${name.trim()}${name.match(' ') ? ' ' : name.match('-') ? '-' : ''
                }Token`
            );
        if (!tokenSymbolTouched)
            setTokenSymbol(name.slice(0, 3).toUpperCase() || 'PGT');
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
                                value={poolName}
                                className="textfield py-4 px-3 mt-2 "
                                id="poolName"
                                type="text"
                                placeholder="Name of the Pool"
                            />

                            {poolNameTouched && poolName.length < 3 && (
                                <div className="text-red-600" style={{ marginTop: 0 }}>
                                    must be 3 letters or more
                                </div>
                            )}
                        </div>

                        <div className="pt-4">
                            <label className="label pb-2" for="poolDescription">
                                Buy Token
                            </label>
                            <input
                                value={poolDescription}
                                className="textfield py-4 pb-9 mt-2"
                                id="poolDescription"
                                type="text"
                                placeholder="Description of the Pool"
                            />
                        </div>

                        <div className="pt-4">
                            <label className="label pb-2" for="value">
                                Amount
                            </label>
                            <div>
                                <CurrencyInput
                                    intlConfig={{ locale: 'en-US', currency: 'USD' }}
                                    value={value}
                                    className="textfield py-4 mt-2"
                                    prefix={'$'}
                                    type="text"
                                    placeholder="min - $3,00"
                                    decimalsLimit={2}
                                    onChange={handleValueChange}
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
                {waitingForPool ? (
                    <Stack spacing={2} sx={{ textAlign: 'center' }}>
                        <Typography variant="subtitle1">Creating your Pool...</Typography>
                    </Stack>
                ) : (
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
                                disabled={poolName.length < 3}
                            >
                                Continue
                            </button>
                        </div>
                    </DialogActions>
                )}
            </>
        </Dialog>
    );
}
