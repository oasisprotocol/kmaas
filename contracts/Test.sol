// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

contract Test {
    uint256 public counter;

    constructor() {
        counter = 0;
    }

    function incrementCounter() public {
        counter++;
    }
}