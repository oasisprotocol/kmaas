// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

contract Sender {
    event CheckSender(address sender);

    function emitSender() public returns (address){
        emit CheckSender(msg.sender);
        return msg.sender;
    }

}