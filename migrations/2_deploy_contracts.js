const Token = artifacts.require("Token");
const EthSwap = artifacts.require("EthSwap");

module.exports = async function(deployer) {
  // Deploy token
  await deployer.deploy(Token);
  const token = await Token.deployed();

  //   deploy EthSwapp
  await deployer.deploy(EthSwap);
  const ethSwap = await EthSwap.deployed();

  //   transfer all tokens to Ethswap
  await token.transfer(ethSwap.address, "1000000000000000000000000");
};
