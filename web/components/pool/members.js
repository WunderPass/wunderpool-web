import { Collapse, Paper, Skeleton, Stack, Typography } from '@mui/material';

import { useState, useEffect } from 'react';
import React from 'react';
import { AiOutlinePlus } from 'react-icons/ai';
import JoinPoolDialog from '/components/dialogs/joinPool';

function members(props) {
    const { address, loading, wunderPool, loginCallback } = props;

    const [ape, setApe] = useState(false);
    const [customProposal, setCustomProposal] = useState(false);
    const [withdrawDialog, setWithdrawDialog] = useState(false);
    const [joinPool, setJoinPool] = useState(false);

    return (
        <div className="md:ml-4 mt-6">
            {wunderPool.isMember ? (
                <>


                </>
            ) : wunderPool.isMember === false ? ( //POOL BEFORE YOU ARE A MEMBER
                <div className="flex container-white justify-start sm:justify-center mb-4 ">
                    <div className="flex flex-col items-center justify-center ">
                        <Typography className="text-xl w-full">Members</Typography>
                        <div className="flex flex-col ">
                            <div className="flex flex-row w-full mt-2">
                                <div className="flex border-solid text-black rounded-full bg-green-400 w-10 h-10 items-center justify-center border-2 border-white">
                                    <Typography>AR</Typography>
                                </div>
                                <div className="flex border-solid text-black rounded-full bg-red-400 w-10 h-10 items-center justify-center -ml-3 border-2 border-white">
                                    <Typography>JF </Typography>
                                </div>
                                <div className="flex border-solid text-black rounded-full bg-blue-300 w-10 h-10 items-center justify-center -ml-3 border-2 border-white">
                                    <Typography>DP</Typography>
                                </div>
                            </div>
                            <Typography className="my-2 sm:mt-4 " variant="h7">
                                6 Wunderpass friends and 10 other members are in the pool.
                            </Typography>
                        </div>
                        <button
                            className="btn-kaico items-center w-full my-5 py-3 px-3 text-md "
                            onClick={() => setJoinPool(true)}
                        >
                            <div className="flex flex-row items-center justify-center">
                                <AiOutlinePlus className=" text-xl" />
                                <Typography className="ml-2">Join</Typography>
                            </div>
                        </button>
                    </div>
                </div>
            ) : (
                //DEFAULT
                <Skeleton width="100%" height={100} />
            )}

        </div>
    );
}

export default members;
