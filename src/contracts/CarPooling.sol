// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IERC20{
    event Transfer(address indexed from, address indexed to, uint256 amount);
    event Approval(address indexed owner, address indexed spender, uint256 amount);

    function name() external view returns(string memory);
    function symbol() external view returns(string memory);
    function decimals() external view returns(uint8);
    function totalSupply() external view returns(uint256);
    function balanceOf(address account) external view returns(uint256);
    function allowance(address owner, address spender) external view returns(uint256);

    function transfer(address to, uint256 amount) external returns(bool);
    function approve(address spender, uint256 amount) external returns(bool);
    function transferFrom(address from, address to, uint256 amount) external returns(bool);
}

contract Carpooling {
    struct Order {
        uint256 orderId;
        address consumer;
        string startPoint;
        string endPoint;
        uint256 amount;
        bool accepted;
    }

    struct Consumer {
        string fullName;
        string phoneNumber;
        uint256 balance;
    }

    struct Driver {
        string fullName;
        string documentNumber;
    }

    mapping(address => bool) public isDriver;
    mapping(address => bool) public isConsumer;
    mapping(address => Consumer) public consumers;
    mapping(address => Driver) public drivers;
    mapping(uint256 => Order) public orders;
    uint256 public orderCount = 0;

    IERC20 public mantToken;

    event OrderCreated(uint256 orderId, address indexed consumer, string startPoint, string endPoint, uint256 amount);
    event OrderUpdated(uint256 orderId, bool accepted);
    event Withdrawal(address indexed consumer, uint256 amount);
    event DriverRegistered(address indexed driverAddress, string fullName, string documentNumber);
    event ConsumerRegistered(address indexed consumerAddress, string fullName, string phoneNumber, uint256 initialBalance);
    event ConsumerRechargedBalance(address indexed consumerAddress, uint256 initialBalance);

    modifier onlyConsumer(){
        require(isConsumer[msg.sender], "Only consumer function");
        _;
    }
    modifier onlyDriver(){
        require(isDriver[msg.sender], "Only driver function");
        _;
    }

    modifier notRegistered() {
        require(!isDriver[msg.sender] && !isConsumer[msg.sender], "User is already registered");
        _;
    }

    constructor(address _mantTokenAddress) {
        mantToken = IERC20(_mantTokenAddress);
    }

    function registerDriver(string memory _fullName, string memory _documentNumber) external notRegistered {
        isDriver[msg.sender] = true;
        drivers[msg.sender] = Driver(_fullName, _documentNumber);
        emit DriverRegistered(msg.sender, _fullName, _documentNumber);
    }

    function registerConsumer(string memory _fullName, string memory _phoneNumber, uint256 _initialBalance) external notRegistered{
        isConsumer[msg.sender] = true;
        mantToken.transferFrom(msg.sender, address(this), _initialBalance);
        consumers[msg.sender] = Consumer(_fullName, _phoneNumber, _initialBalance);
        emit ConsumerRegistered(msg.sender, _fullName, _phoneNumber, _initialBalance);
    }

    function createOrder(string memory startPoint, string memory endPoint, uint256 amount) external onlyConsumer{
        require(consumers[msg.sender].balance >= amount, "Insufficient funds");

        orderCount++;
        orders[orderCount] = Order({
            orderId: orderCount,
            consumer: msg.sender,
            startPoint: startPoint,
            endPoint: endPoint,
            amount: amount,
            accepted: false
        });

        consumers[msg.sender].balance -= amount;
        emit OrderCreated(orderCount, msg.sender, startPoint, endPoint, amount);
    }

    function getOrders() external view onlyDriver returns (Order[] memory) {

        Order[] memory availableOrders = new Order[](orderCount);
        uint256 availableOrderCount = 0;

        for (uint256 i = 1; i <= orderCount; i++) {
            if (!orders[i].accepted) {
                availableOrders[availableOrderCount] = orders[i];
                availableOrderCount++;
            }
        }

        return availableOrders;
    }

    function acceptOrder(uint256 orderId) external onlyDriver{
        require(!orders[orderId].accepted, "Order already accepted");

        orders[orderId].accepted = true;
        mantToken.transfer(msg.sender, orders[orderId].amount);

        emit OrderUpdated(orderId, true);
    }

    function rejectOrder(uint256 orderId) external onlyDriver{
        require(!orders[orderId].accepted, "Order already accepted");

        consumers[orders[orderId].consumer].balance += orders[orderId].amount;
        delete orders[orderId];

        emit OrderUpdated(orderId, false);
    }

    
    function withdraw() external onlyConsumer {
        uint256 balance = consumers[msg.sender].balance;
        require(balance > 0, "No balance to withdraw");

        mantToken.transfer(msg.sender, balance);
        consumers[msg.sender].balance = 0;

        emit Withdrawal(msg.sender, balance);
    }
    
    function rechargeBalance(uint256 _initialBalance) external onlyConsumer{
        mantToken.transferFrom(msg.sender, address(this), _initialBalance);
        consumers[msg.sender].balance = _initialBalance;
        emit ConsumerRechargedBalance(msg.sender, _initialBalance);
    }
}
