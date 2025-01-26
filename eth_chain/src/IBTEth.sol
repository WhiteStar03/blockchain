// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract IBTEth {
    string public name = "IBT";
    string public symbol = "IBT";
    uint8 public decimals = 18;
    uint256 public totalSupply;
    address public owner;

    mapping(address => uint256) public balanceOf;

    event Transfer(address indexed from, address indexed to, uint256 value);
    event BridgeBurn(address indexed from, uint256 amount, string destinationChain);

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Not the owner");
        _;
    }

    function mint(address to, uint256 amount) external onlyOwner {
        balanceOf[to] += amount;
        totalSupply += amount;
        emit Transfer(address(0), to, amount);
    }

    function burn(uint256 amount, string calldata destinationChain) external {
        require(balanceOf[msg.sender] >= amount, "Insufficient balance");
        balanceOf[msg.sender] -= amount;
        totalSupply -= amount;
        emit BridgeBurn(msg.sender, amount, destinationChain);
        emit Transfer(msg.sender, address(0), amount);
    }
    function burnFrom(address from, uint256 amount, string calldata destinationChain) external {
        require(balanceOf[from] >= amount, "Insufficient balance");
        require(msg.sender == owner || msg.sender == from, "Not authorized to burn"); // Ensure either the `owner` or `from` address initiates the burn
        balanceOf[from] -= amount;
        totalSupply -= amount;
        emit BridgeBurn(from, amount, destinationChain);
        emit Transfer(from, address(0), amount);
    }
    function transfer(address to, uint256 amount) external returns (bool) {
        require(balanceOf[msg.sender] >= amount, "Insufficient balance");
        balanceOf[msg.sender] -= amount;
        balanceOf[to] += amount;
        emit Transfer(msg.sender, to, amount);
        return true;
    }
}
