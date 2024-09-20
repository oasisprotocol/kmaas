// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

// For use in the sample notes application
contract Logging {
    event NoteCreated(address owner, bytes32 hash);
    event NoteUpdated(address owner, bytes32 hash);

    function logNoteCreated(bytes32 hash) public {
        emit NoteCreated(msg.sender, hash);
    }

    function logNoteUpdated(bytes32 hash) public {
        emit NoteUpdated(msg.sender, hash);
    }
}