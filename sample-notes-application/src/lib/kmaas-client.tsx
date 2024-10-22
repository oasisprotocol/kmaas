"use server"

import { ethers } from "ethers";
import {createHash} from "crypto";
import {runQuery, fetchQuery} from "/src/lib/db-client";
import {LOGGING_ABI, KMAAS_SYMKEY_ABI, VALIDATOR_SIWE_ABI, ACCOUNT_FACTORY_ABI, NOTES_ABI} from "/src/lib/AbiDefinitions";
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
    const queryResults = await fetchQuery("SELECT kmaas FROM users WHERE username=?", [username]);
    const kmaas = queryResults[0].kmaas;
    const kmaasContract = new ethers.Contract(kmaas, KMAAS_SYMKEY_ABI, account);
    const validatorContract = new ethers.Contract(process.env.VALIDATOR_ADDRESS, VALIDATOR_SIWE_ABI, account);
    return [kmaasContract, validatorContract];
}

export async function logNoteChange(method: string, note: any) {
    const hash = ethers.id(`${note.id}:${note.title}:${note.content}`);
    const serverSession = await getServerSession(options);
    const username = serverSession.user.username;
    const bearerToken = serverSession.user.bearerToken;

    const queryResults = await fetchQuery("SELECT public_key FROM users WHERE username=?", [username]);
    const publicKey = queryResults[0].public_key;

    const loggingAddr = process.env.LOGGING_ADDRESS;
    const provider = ethers.getDefaultProvider("http://localhost:8545/");
    const account = new ethers.Wallet(process.env.PRIVATE_KEY).connect(provider);
    const nonce = await provider.getTransactionCount(publicKey)

    // Prepare transaction to sign
    const loggingContract = new ethers.Contract(loggingAddr, LOGGING_ABI, account);
    // The proxy function in the notes application decodes the data it's passed into address and bytes function data
    // The notes application operates as a trusted forwarder for the meta-transaction as per ERC 2771 such that the
    // end user does not have to pay gas. Otherwise, it would be necessary to fund the public key associated
    // with the KMaaS account for the KMaaS account to submit logging transactions
    const loggingFunctionData = ethers.AbiCoder.defaultAbiCoder().encode(["address", "bytes"], [
        process.env.LOGGING_ADDRESS,
        loggingContract.interface.encodeFunctionData(method, [hash])
    ]);

    // Get the notes contract
    const notesContract = new ethers.Contract(process.env.NOTES_ADDRESS, NOTES_ABI, account);
    const proxyFunctionData = notesContract.interface.encodeFunctionData("proxy", [loggingFunctionData]);

    var loggingTx = {
        'nonce': nonce,
        'gasPrice': 100000000000,
        'gasLimit': 250000,
        'to': process.env.NOTES_ADDRESS,
        'value': 0,
        'data': proxyFunctionData,
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
    var results = await fetchQuery("SELECT seq + 1 AS next_id FROM sqlite_sequence WHERE name = ?", ['notes']);
    var noteId = results[0].next_id;
    var note = {
        id: noteId,
        title: title,
        content: ""
    };
    var encryptedData = await encryptNote(note);
    var query = "INSERT INTO notes(id, encrypted_bytes) VALUES (?, ?)";
    await runQuery(query, [noteId, encryptedData]);
    return note;
}

export async function saveNote(note: any) {
    var encryptedData = await encryptNote(note);
    var query = "UPDATE notes SET encrypted_bytes=? WHERE id = ?";
    await runQuery(query, [encryptedData, note.id]);
}

export async function retrieveNotes(): any[] {
    var query = "SELECT encrypted_bytes FROM notes";
    var result = await fetchQuery(query, []);
    var notes = await Promise.all(result.map(async (row) => {
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
    const notesContract = new ethers.Contract(process.env.NOTES_ADDRESS, NOTES_ABI, account);
    var cred = {
        'credType': 2,
        'credData': ethers.encodeBytes32String(password)
    }
    const tx = await notesContract.createUser(process.env.VALIDATOR_ADDRESS, cred);
    const receipt = await tx.wait();
    const contractAddr = receipt.logs[0].args[0];
    const publicKey = receipt.logs[0].args[1];
    // Here get the event that's emitted and grab the public key and address of KMaaS
    await runQuery("INSERT INTO users(username, kmaas, public_key) VALUES (?, ?, ?)", [username, contractAddr, publicKey]);
}

