"use server"

import { ethers } from "ethers";
import {createHash} from "crypto";
import {runQuery} from "/src/lib/pg-client";
import {LOGGING_ABI, KMAAS_SYMKEY_ABI, VALIDATOR_SIWE_ABI, ACCOUNT_FACTORY_ABI} from "/src/lib/AbiDefinitions";
import {getServerSession} from "next-auth/next";
import {options} from "/src/app/api/auth/[...nextauth]/options.ts";
import {crypto} from "crypto";

async function retrieveKmaasAndValidator(username: string = "") {
    const provider = ethers.getDefaultProvider("http://localhost:8545/");
    const account = new ethers.Wallet(process.env.PRIVATE_KEY).connect(provider);
    if (!username) {
        const serverSession = await getServerSession(options);
        username = serverSession.user.username;
    }
    const queryResults = await runQuery("SELECT kmaas FROM users WHERE username=$1", [username]);
    const kmaas = queryResults.rows[0].kmaas;
    const kmaasContract = new ethers.Contract(kmaas, KMAAS_SYMKEY_ABI, account);
    const validatorContract = new ethers.Contract(process.env.VALIDATOR_ADDRESS, VALIDATOR_SIWE_ABI, account);
    return [kmaasContract, validatorContract];
}

export async function logNoteChange(method: string, note: any) {
    const hash = ethers.id(`${note.id}:${note.title}:${note.content}`);
    const serverSession = await getServerSession(options);
    const username = serverSession.user.username;
    const bearerToken = serverSession.user.bearerToken;

    const queryResults = await runQuery("SELECT public_key FROM users WHERE username=$1", [username]);
    const publicKey = queryResults.rows[0].public_key;

    const loggingAddr = process.env.LOGGING_ADDRESS;
    const provider = ethers.getDefaultProvider("http://localhost:8545/");
    const account = new ethers.Wallet(process.env.PRIVATE_KEY).connect(provider);
    const nonce = await provider.getTransactionCount(publicKey)

    // Prepare transaction to sign
    const loggingContract = new ethers.Contract(loggingAddr, LOGGING_ABI, account);
    const loggingFunctionData = loggingContract.interface.encodeFunctionData(method, [hash]);
    var loggingTx = {
        'nonce': nonce,
        'gasPrice': 100000000000,
        'gasLimit': 250000,
        'to': loggingAddr,
        'value': 0,
        'data': loggingFunctionData,
        'chainId': '0x5afd'
    }

    const [kmaasContract, validatorContract] = await retrieveKmaasAndValidator();
    const kmaasAddress = await kmaasContract.getAddress();
    var success, signedTxData;
    [success, signedTxData] = await validatorContract['callAccount(address,bytes,bool,bytes)'](kmaasAddress, bearerToken, true, loggingFunctionData);
    const signedTx = ethers.AbiCoder.defaultAbiCoder().decode(["bytes"], signedTxData)[0];
    if (!success) {
        throw new Error("Logging transaction failed");
    }

    const broadcastResponse = await account.provider.broadcastTransaction(signedTx);
    await broadcastResponse.wait();
}

export async function createNote(title: string) {
    var results = await runQuery("SELECT nextval($1)::integer", ['note_id']);
    var noteId = results.rows[0].nextval;
    var note = {
        id: noteId,
        title: title,
        content: ""
    };
    var encryptedData = await encryptNote(note);
    var query = "INSERT INTO notes(id, encrypted_bytes) VALUES ($1, $2)";
    await runQuery(query, [noteId, encryptedData]);
    return note;
}

export async function saveNote(note: any) {
    var encryptedData = await encryptNote(note);
    var query = "UPDATE notes SET encrypted_bytes=$1 WHERE id = $2";
    await runQuery(query, [encryptedData, note.id]);
}

export async function retrieveNotes(): any[] {
    var query = "SELECT encrypted_bytes FROM notes";
    var result = await runQuery(query, []);
    var notes = await Promise.all(result.rows.map(async (row) => {
        const note = await decryptNote(row.encrypted_bytes);
        return note;
    }));
    return notes;
}

export async function encryptNote(note: any): string {
    const noteJson = JSON.stringify(note);
    const [kmaasContract, validatorContract] = await retrieveKmaasAndValidator();
    const kmaasAddress = await kmaasContract.getAddress();
    const session = await getServerSession(options);
    const bearerToken = session.user.bearerToken;
    const kmaasFunctionData = kmaasContract.interface.encodeFunctionData("encryptSymKey", ["notes", ethers.toUtf8Bytes(noteJson)]);
    const [success, encryptedDataOutput] = await validatorContract['callAccount(address,bytes,bool,bytes)'](kmaasAddress, bearerToken, true, kmaasFunctionData);
    const encryptedData = ethers.AbiCoder.defaultAbiCoder().decode(["bytes"], encryptedDataOutput)[0];
    return encryptedData;
}

export async function decryptNote(encryptedData: string) {
    const [kmaasContract, validatorContract] = await retrieveKmaasAndValidator();
    const bearerToken = (await getServerSession(options)).user.bearerToken;
    const kmaasAddress = await kmaasContract.getAddress();
    const kmaasFunctionDataDecrypt = kmaasContract.interface.encodeFunctionData("decryptSymKey", ["notes", encryptedData]);
    var success, decryptedDataOutput;
    [success, decryptedDataOutput] = await validatorContract['callAccount(address,bytes,bool,bytes)'](kmaasAddress, bearerToken, true, kmaasFunctionDataDecrypt);
    var decryptedText = ethers.toUtf8String(ethers.AbiCoder.defaultAbiCoder().decode(["bytes"], decryptedDataOutput)[0]);
    return JSON.parse(decryptedText);
}

export async function handleLogin(username: string, siweMessage: string, password: string) {
    const [kmaasContract, validatorContract] = await retrieveKmaasAndValidator(username);
    const hash = ethers.hashMessage(siweMessage);
    const kmaasFunctionData = kmaasContract.interface.encodeFunctionData("sign", [hash]);
    const kmaasAddress = await kmaasContract.getAddress();

    const passwordBytes = ethers.encodeBytes32String(password);
    try {
        var success, validatorOutput;
        [success, validatorOutput] = await validatorContract['callAccount(address,bytes,bytes)'](kmaasAddress, passwordBytes, kmaasFunctionData);
        if (!success) {
            throw new Error("Unexpected error")
        }
        var decodedOutput = ethers.AbiCoder.defaultAbiCoder().decode(["bytes32", "bytes32", "uint256"], validatorOutput);
        var signature = ethers.Signature.from({
            "r": decodedOutput[0],
            "s": decodedOutput[1],
            "v": decodedOutput[2]
        });

        var bearerToken = await validatorContract.login(kmaasAddress, siweMessage, signature);
        return bearerToken;
    } catch (err) {
        console.log(err);
        throw new Error("Username or password is incorrect");
    }
}

export async function createUser(username: string, password: string) {
    const provider = ethers.getDefaultProvider("http://localhost:8545/");
    const account = new ethers.Wallet(process.env.PRIVATE_KEY).connect(provider);
    const validatorContract = new ethers.Contract(process.env.VALIDATOR_ADDRESS, VALIDATOR_SIWE_ABI, account);
    // Call clone() on KMaaS factory to deploy an instance of the factory
    const masterKmaasContractAddr = process.env.ACCOUNT_SYMKEY;
    const kmaasFactory = new ethers.Contract(process.env.ACCOUNT_FACTORY_ADDRESS, ACCOUNT_FACTORY_ABI, account);
    // Get the emitted event to get the address
    const kmaasFactoryTx = await kmaasFactory.clone(masterKmaasContractAddr);
    const kmaasFactoryReceipt = await kmaasFactoryTx.wait();
    const contractAddr = kmaasFactoryReceipt.logs[0].args[0];
    // Set the controller of KMaaS to the validator contract
    const kmaasContract = new ethers.Contract(contractAddr, KMAAS_SYMKEY_ABI, account);
    const kmaasInit = await kmaasContract.initialize(account.address);
    await kmaasInit.wait();
    // Generate the keys for signing tokens and encrypting notes
    const genKey1Tx = await kmaasContract.generateSymKey("notes", false);
    await genKey1Tx.wait();
    const genKey2Tx = await kmaasContract.generateSymKey("tokenSigner", false);
    await genKey2Tx.wait();
    // Change the controller
    const changeControllerTx = await kmaasContract.updateController(process.env.VALIDATOR_ADDRESS);
    await changeControllerTx.wait();
    // Add the account to validator
    const cred = {
        'credType': 2,
        'credData': ethers.encodeBytes32String(password)
    };
    const addAccountTx = await validatorContract.addAccount(contractAddr, cred);
    await addAccountTx.wait()
    const publicKey = await kmaasContract.publicKey();
    // Initially the publicKey address so that the user can make transactions
    const fundTx = await account.sendTransaction({to: publicKey, value: ethers.parseEther("0.5")})
    await fundTx.wait()
    // Add the user info to the backend store
    await runQuery("INSERT INTO users(username, kmaas, public_key) VALUES ($1, $2, $3)", [username, contractAddr, publicKey]);
}

