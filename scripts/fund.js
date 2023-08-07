const { getNamedAccounts, ethers } = require("hardhat");

async function main() {
  const { deployer } = await getNamedAccounts();
  const fundMe = await ethers.getContract("FundMe", deployer);
  console.log("funding contracts....");
  const transactionResponse = await fundMe.fund({
    value: ethers.parseEther("1.0"),
  });

  await transactionResponse.wait(1);
  console.log("funded");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
