const { assert } = require("chai");
const Token = artifacts.require("Token");
const EthSwap = artifacts.require("EthSwap");

require("chai")
  .use(require("chai-as-promised"))
  .should();

function tokens(n) {
  return web3.utils.toWei(n, "ether");
}

contract("EthSwap", ([deployer, investor]) => {
  let token, ethSwap;

  before(async () => {
    token = await Token.new();
    ethSwap = await EthSwap.new(token.address);
    await token.transfer(ethSwap.address, tokens("1000000"));
  });

  describe("Token deployment", async () => {
    it("contract has a name", async () => {
      const name = await token.name();
      assert.equal(name, "DApp Token");
    });
  });

  describe("EthSwap deployment", async () => {
    //   Testing creation of chain
    it("contract has a name", async () => {
      const name = await ethSwap.name();
      assert.equal(name, "EthSwap Instant Exchange");
    });
    // Testing transfer to initial account
    it("contract has tokens", async () => {
      let balance = await token.balanceOf(ethSwap.address);
      assert.equal(balance.toString(), tokens("1000000"));
    });
  });

  describe("buy tokens()", async () => {
    let result;

    before(async () => {
      // Send tokens to investor for the price of 1 ether
      result = await ethSwap.buyTokens({
        from: investor,
        value: web3.utils.toWei("1", "ether"),
      });
    });

    it("Check if the investor recieved the tokens exchanged", async () => {
      let investorBalance = await token.balanceOf(investor);
      assert.equal(investorBalance.toString(), tokens("100"));
      // Check if the dapp coin was sent

      let ethSwapBalance;
      ethSwapBalance = await token.balanceOf(ethSwap.address);
      assert.equal(ethSwapBalance.toString(), tokens("999900"));
      // Check if the ether was recieved

      ethSwapBalance = await web3.eth.getBalance(ethSwap.address);
      assert.equal(ethSwapBalance.toString(), tokens("1"));

      //Check event is working
      const event = result.logs[0].args;
      assert.equal(event.account, investor);
      assert.equal(event.token, token.address);
      assert.equal(event.amount.toString(), tokens("100").toString());
      assert.equal(event.rate.toString(), "100");
    });
  });

  describe("sell tokens()", async () => {
    let result;

    before(async () => {
      // Investor must approve the tokens
      await token.approve(ethSwap.address, tokens("100"), { from: investor });
      //   Investor sells tokens
      result = await ethSwap.sellTokens(tokens("100"), { from: investor });
    });

    it("Allow user to sell tokens to ethswap for a fixed price", async () => {
      // Check if investor send the tokens
      let investorBalance = await token.balanceOf(investor);
      assert.equal(investorBalance.toString(), tokens("0"));

      //   Check ethSwap recieved the tokens and sent ether
      let ethSwapBalance;
      ethSwapBalance = await token.balanceOf(ethSwap.address);
      assert.equal(ethSwapBalance.toString(), tokens("1000000"));

      // Check if the tokens were recieved
      ethSwapBalance = await web3.eth.getBalance(ethSwap.address);
      assert.equal(ethSwapBalance.toString(), tokens("0"));

      //Check event is working
      const event = result.logs[0].args;
      assert.equal(event.account, investor);
      assert.equal(event.token, token.address);
      assert.equal(event.amount.toString(), tokens("100").toString());
      assert.equal(event.rate.toString(), "100");

      //   FAILURE: investor cant sell more tokens than they have
      await ethSwap.sellTokens(tokens("500"), { from: investor }).should.be
        .rejected;
    });
  });
});
