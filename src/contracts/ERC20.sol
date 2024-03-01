//SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

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

contract ERC20MANT is IERC20{
    //Values of Token
    uint256 _totalSupply; //All tokens 
    string _name; //Name
    string _symbol; //Short name
    uint8 _decimals; //Decimals. Number of zeros of token. E.g: 1 ruble = 100 kopeika. It means 1 ruble has 2 decimals.
    address _owner; //Owner account

    mapping(address => uint256) balances;
    mapping(address => mapping(address => uint256)) allowed;
    //mapping(from => mapping(spender => amount))
    //from - address from where tokens are allowed to spend
    //spender - address is who is allowed to spend tokens from address 'from'
    //amount - is amount of tokens which are allowed to spend to address 'spender'

    constructor(){
        _name = "MANT";
        _symbol = "MT";
        _decimals = 18;
        _owner = msg.sender;
    }

    //View functions
    function name() public view returns(string memory){
        return _name;
    }
    function symbol() public view returns(string memory){
        return _symbol;
    }
    function decimals() public view returns(uint8){
        return _decimals;
    }
    function totalSupply() public view returns(uint256){
        return _totalSupply;
    }
    function balanceOf(address account) public view returns(uint256){
        return balances[account];
    }
    function allowance(address owner, address spender) public view returns(uint256){
        return allowed[owner][spender];
    }

    //Functions that interacts with tokens
    function transfer(address to, uint256 amount) public returns(bool){
        require(balances[msg.sender] >= amount, "ERC20: Not enough tokens");
        balances[msg.sender] -= amount;
        balances[to] += amount;
        emit Transfer(msg.sender, to, amount);
        return true;
    }

    function approve(address spender, uint256 amount) public returns(bool){
        allowed[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }

    function transferFrom(address from, address to, uint256 amount) public returns(bool){
        require(balances[from] >= amount, "ERC20: not enough tokens");
        require(allowed[from][msg.sender] >= amount, "ERC20: no permission to spend");
        balances[from] -= amount;
        balances[to] +=amount;
        allowed[from][msg.sender] -= amount;
        emit Transfer(from, to, amount);
        emit Approval(from, msg.sender, amount);
        return true;
    }

    function mint(address to, uint256 amount) public returns(bool){
        require(msg.sender == _owner, "ERC20: not owner call");
        balances[to] += amount;
        _totalSupply += amount;
        emit Transfer(address(0), to, amount);
        return true;
    }

    function burn(uint256 amount) public returns(bool){
        require(balances[msg.sender] >= amount, "ERC20: invalid amount");
        _totalSupply -= amount;
        balances[address(0)] += amount;
        balances[msg.sender] -= amount;
        emit Transfer(msg.sender, address(0), amount);
        return true;
    }

    function increaseAllowance(address spender, uint256 addValue) public returns(bool){
        allowed[msg.sender][spender] += addValue;
        emit Approval(msg.sender, spender, addValue);
        return true;
    }

    function decreaseAllowance(address spender, uint256 subValue) public returns(bool){
        allowed[msg.sender][spender] -= subValue;
        emit Approval(msg.sender, spender, subValue);
        return true;
    }
}