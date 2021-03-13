pragma solidity ^0.5.0;
import "./Token.sol";

contract EthSwap {
    string public name = "EthSwap Instant Exchange";
    Token public token;
    //Redemption rate = # tokens they received for 1 ether
    uint256 public rate = 100;

    event TokenPurchased(
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
        emit TokenPurchased(msg.sender, address(token), tokenAmount, rate);
    }
}
