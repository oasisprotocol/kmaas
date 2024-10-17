// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/metatx/ERC2771Context.sol";

/// @notice For use in the sample notes application. This contract logs changes in the notes on behalf of the user
/// It functions as a recipient contract in the ERC-2771 model that is able to decode the original message sender if a transaction
/// comes from a trusted forwarder
contract Logging is ERC2771Context {
    /// @param trustedForwarder Address to trust when decoding the original message sender
    constructor(address trustedForwarder) ERC2771Context(trustedForwarder) {}

    event NoteCreated(address owner, bytes32 hash);
    event NoteUpdated(address owner, bytes32 hash);

    /// The following functions log changes in notes but uses _msgSender() instead of msg.sender to get the address
    /// of the transaction signer instead of the caller of this function
    function logNoteCreated(bytes32 hash) public {
        emit NoteCreated(_msgSender(), hash);
    }

    function logNoteUpdated(bytes32 hash) public {
        emit NoteUpdated(_msgSender(), hash);
    }
}