// Logic for handling blockchain-related requests
import { loadPeerNodes, savePeerNodes } from '../utils/fileUtils.js';
import { verifySignature, verifyNonce, addToMempool, loadBlockchainState, isMempoolFull, mineBlock, clearMempool, getBalanceByAddress } from '../utils/cryptoUtils.js';
import { pingNode } from './nodeController.js';
import { broadcastTransaction, broadcastBlock, syncPeerDataWithOtherNodes } from '../utils/networkUtils.js';
import { validateNewNode, verifyNodeSignature } from '../middlewares/nodeAuth.js';
/*
    {
        "port",
        "public_key"
        "sign"
    }

    node message verification through assymetric cryptography. middleware
*/

// Function to handle new node registration
export const registerNode = async (req, res) => {

    const { provided_port, public_key, sign } = req.body;
    const ip = req.ip;
    // verify sign
    const isValidSignature = verifyNodeSignature({ ip, provided_port }, sign, public_key);
    if (!isValidSignature) {
        return res.status(403).json({ message: 'Invalid signature' });
    }

    // Ping the new node to verify that it’s live (? how it will work)
    const isNodeActive = await pingNode(ip, provided_port);

    if (!isNodeActive) {
        return res.status(400).json({ message: 'Node verification failed' });
    }

    // Load peer nodes using utils
    const peerNodes = loadPeerNodes();

    // Check if the node already exists
    const nodeExists = peerNodes.some(node => node.public_key === public_key || (node => node.ip === ip && node.port === provided_port)); // [check]
    if (nodeExists) {
        return res.status(400).json({ message: 'Node already exists' });
    }

    const newNode = { ip, provided_port, public_key };

    // Add the new node to peer nodes
    peerNodes.push(newNode);
    savePeerNodes(peerNodes);

    // Broadcast peer data to other nodes
    syncPeerDataWithOtherNodes(peerNodes);

    return res.status(200).json({ message: 'Node registered successfully' });
};

// Submit a transaction
export const submitTxn = async (req, res) => {
    const { sender, recipient, amt, nonce, sign } = req.body;

    if (!sender || !recipient || !amt || !nonce || !sign) {
        return res.status(400).json({ error: 'All fields (sender, recipient, amt, nonce, sign) are required' });
    }

    // 1. Verify the signature
    const isSignatureValid = verifySignature(sender, recipient, amt, nonce, sign);
    if (!isSignatureValid) {
        return res.status(400).json({ error: 'Invalid signature' });
    }

    // 2. Verify the nonce (to prevent replay attacks) 
    const isNonceValid = verifyNonce(sender, nonce);
    if (!isNonceValid) {
        return res.status(400).json({ error: 'Invalid nonce' });
    }

    // 3. Broadcast the transaction to peers
    const transaction = { sender, recipient, amt, nonce, sign };
    broadcastTransaction(transaction);

    // 4. Add transaction to the mempool, mine if full
    const addedToMempool = addToMempool(transaction);
    if (!addedToMempool) {
        return res.status(500).json({ error: 'Failed to add transaction to mempool' });
    }

    if (isMempoolFull()) {
        // execute mempool
        executeMempool();

        // mine
        const minedBlock = mineBlock();

        // add to local blockchain
        addBlockToChain();

        // broadcast block
        broadcastBlock(minedBlock);

        // clear mempool
        clearMempool();
    }

    res.status(200).json({
        message: 'Transaction submitted successfully',
        transaction
    });
};

// Controller to check balance by address
export const checkBalanceByAdd = (req, res) => {
    const { address } = req.params;

    // Load the blockchain state
    const state = loadBlockchainState();

    // Check if the address exists in the state
    const account = state[address];
    if (!account) {
        return res.status(404).json({ error: 'Address not found in blockchain state' });
    }

    // Return the balance of the address
    res.status(200).json({
        address,
        balance: getBalanceByAddress(address)
    });
};

// Controller to get the entire blockchain state
export const getState = (req, res) => {
    // Load the entire blockchain state
    const state = loadBlockchainState();

    // Return the state
    res.status(200).json({
        state
    });
};