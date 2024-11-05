// for cryptographic operations (signing, hashing) [NEEDS EXTENSIVE CHANGES]

import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

const STATE_FILE = path.join(__dirname, '../localdb/blockchainState.json');
const MEMPOOL_FILE = path.join(__dirname, '../localdb/mempool.json');

// Helper function to ensure file exists
function ensureFileExists(filePath, initialContent = '[]') {
    if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, initialContent);
    }
}

// Load the current blockchain state
export function loadBlockchainState() {
    ensureFileExists(STATE_FILE, '{}');
    try {
        return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
    } catch (error) {
        console.error('Error loading blockchain state:', error.message);
        return {};
    }
}

// Save the blockchain state
export function saveBlockchainState(state) {
    try {
        fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
    } catch (error) {
        console.error('Error saving blockchain state:', error.message);
    }
}

// Verify the signature of the transaction
export function verifySignature(sender, recipient, amt, nonce, sign) {
    // In a real blockchain, this would be public/private key cryptography verification
    // For this example, we'll assume a simple verification function for illustration purposes
    const data = `${sender}${recipient}${amt}${nonce}`;
    const hash = crypto.createHash('sha256').update(data).digest('hex');

    // Simulate signature verification (you would use a real key-pair in practice)
    return hash === sign; // Normally, you'd verify with the sender's public key
}

// Verify nonce (ensure the transaction is in correct order)
export function verifyNonce(sender, nonce) {
    const state = loadBlockchainState();
    const account = state[sender];

    if (!account) {
        return false; // Sender doesn't exist
    }

    // Nonce must be 1 greater than the current nonce in the state
    return nonce === account.nonce + 1;
}

// Add transaction to the mempool
export function addToMempool(transaction) {
    ensureFileExists(MEMPOOL_FILE);
    try {
        let mempool = JSON.parse(fs.readFileSync(MEMPOOL_FILE, 'utf8'));
        mempool.push(transaction);
        fs.writeFileSync(MEMPOOL_FILE, JSON.stringify(mempool, null, 2));
        return true;
    } catch (error) {
        console.error('Error adding transaction to mempool:', error.message);
        return false;
    }
}

export function isMempoolFull() {
    ensureFileExists(MEMPOOL_FILE);
    try {
        let mempool = JSON.parse(fs.readFileSync(MEMPOOL_FILE, 'utf8'));
        return mempool.length > 8
    }
    catch (error) {
        console.error('Error accessing mempool:', error.message);
        return false;
    }
}

export function clearMempool() {
    // make
}

export function executeMempool() {
    //for txn in txns  [or CPP function]
}

export function verifyBlock() {
    return // bool
}

export function executeBlock() {
    //for txn in txns  [or CPP function]
}

export const mineBlock = () => {

    //mine
    return newBlock;
}

export const addBlockToChain = () => {
    // open local blockchain
    // add block
}

export function getBalanceByAddress(address) {
    const balance = 0; // CPP function
    return balance;
}

export const addTwoNums = (num1, num2) => {
    num = addTwoNumsCpp(num1, num2);
    return num;
}


/**
 * blockchain ki length
 * block
 * 
 */