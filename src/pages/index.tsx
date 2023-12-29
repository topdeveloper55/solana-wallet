'use client';
import { FormControlLabel, Switch, Table, TableBody, TableCell, TableHead, TableRow, Tooltip } from '@mui/material';
import type { NextPage } from 'next';
import dynamic from 'next/dynamic';
import React from 'react';

import { useAutoConnect } from '../components/AutoConnectProvider';

const MaterialUIWalletMultiButtonDynamic = dynamic(
    async () => (await import('@solana/wallet-adapter-material-ui')).WalletMultiButton,
    { ssr: false }
);
const SignTransactionDynamic = dynamic(async () => (await import('../components/SignTransaction')).SignTransaction, {
    ssr: false,
});

const Index: NextPage = () => {
    return (
        <>
            <div className="absolute flex w-full h-full items-center justify-center">
                <div className="flex w-[400px] h-[200px] bg-stone-800/75 rounded-md items-center justify-center">
                    <MaterialUIWalletMultiButtonDynamic className='mr-[20px]' />
                    <SignTransactionDynamic />
                </div>
            </div>
        </>
    );
};

export default Index;
