pragma solidity ^0.5.0;
import "./Token.sol";

contract EthSwap {
    string public name = "EthSwap Instant Exchange";
    Token public token;
    //Redemption rate = # tokens they received for 1 ether
    uint256 public rate = 100;

    event TokensPurchased(
        address account,
        address token,
        uint256 amount,
        uint256 rate
    );

    event TokensSold(
        address account,
        address token,
        uint256 amount,
        uint256 rate
    );

    constructor(Token _token) public {
        token = _token;
    }

    function buyTokens() public payable {
        uint256 tokenAmount = msg.value * rate;
        token.transfer(msg.sender, tokenAmount);

        // Check if ethSwap has enough tokens
        require(token.balanceOf(address(this)) >= tokenAmount);

        // Emit an event
        emit TokensPurchased(msg.sender, address(token), tokenAmount, rate);
    }

    function sellTokens(uint256 _amount) public {
        // Calculate amount of ether to redeem
        uint256 etherAmount = _amount / rate;

        // Check if ethSwap has enough ether to send
        require(address(this).balance >= etherAmount);
        require(token.balanceOf(msg.sender) >= _amount);

        // perform a sale
        token.transferFrom(msg.sender, address(this), _amount);
        msg.sender.transfer(etherAmount);

        // emit event tokensSold
        emit TokensSold(msg.sender, address(token), _amount, rate);
    }
}
