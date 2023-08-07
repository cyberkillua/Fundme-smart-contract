const { assert, expect } = require("chai");
const { deployments, ethers, getNamedAccounts, network } = require("hardhat");

const {developmentChains} = require("../../helper-hardhat.config");

!developmentChains.includes(network.name)
  ? describe.skip
  : describe("FundMe", async function () {
      let fundMe;
      let deployer;
      let mockV3Aggregator;
      const sendValue = ethers.parseEther("1.0"); // 1ETH

      beforeEach(async function () {
        deployer = (await getNamedAccounts()).deployer;
        await deployments.fixture(["all"]);
        fundMe = await ethers.getContract("FundMe", deployer);
        mockV3Aggregator = await ethers.getContract(
          "MockV3Aggregator",
          deployer
        );
      });

      describe("constructor", async function () {
        it("sets the aggregator addresses correctly", async function () {
          const response = await fundMe.getPrice();
          assert.equal(response, mockV3Aggregator.target);
        });
      });

      describe("fundMe", async function () {
        it("Fails if you don't send enough ETH", async function () {
          await expect(fundMe.fund()).to.be.revertedWith(
            "You need to spend more ETH!"
          );
        });
        it("updates the amount funded data structure", async function () {
          await fundMe.fund({ value: sendValue });
          const response = await fundMe.getAddressToAmountFunded(deployer);
          assert.equal(response.toString(), sendValue.toString());
        });
        it("adds funder to funers array", async function () {
          await fundMe.fund({ value: sendValue });
          const funder = await fundMe.getFunder(0);
          assert.equal(funder, deployer);
        });
      });

      describe("withdraw", async function () {
        beforeEach(async function () {
          await fundMe.fund({ value: sendValue });
        });

        it("withdrawal can only by single founder", async function () {
          const startingFundMeBalance = await ethers.provider.getBalance(
            fundMe.target
          );

          const startingDeployerBalance = await ethers.provider.getBalance(
            deployer
          );

          const transactionResponse = await fundMe.withdraw();
          const transactionReceipt = await transactionResponse.wait();

          const { gasUsed, gasPrice } = transactionReceipt;

          const gasCost = gasPrice * gasUsed;

          const endingFundMeBalance = await ethers.provider.getBalance(
            fundMe.target
          );

          const endingDeployerBalance = await ethers.provider.getBalance(
            deployer
          );

          assert.equal(endingFundMeBalance, 0);
          assert.equal(
            startingFundMeBalance + startingDeployerBalance,
            endingDeployerBalance + gasCost
          );
        });
        it("allows us to withdraw with mulitple founders", async function () {
          const accounts = await ethers.getSigners();
          for (let i = 1; i < 6; i++) {
            const fundMeConnectedContract = await fundMe.connect(accounts[i]);
            await fundMeConnectedContract.fund({ value: sendValue });
          }

          const startingFundMeBalance = await ethers.provider.getBalance(
            fundMe.target
          );

          const startingDeployerBalance = await ethers.provider.getBalance(
            deployer
          );

          const transactionResponse = await fundMe.withdraw();
          const transactionReceipt = await transactionResponse.wait();

          const { gasUsed, gasPrice } = transactionReceipt;

          const gasCost = gasPrice * gasUsed;

          const endingFundMeBalance = await ethers.provider.getBalance(
            fundMe.target
          );

          const endingDeployerBalance = await ethers.provider.getBalance(
            deployer
          );

          assert.equal(endingFundMeBalance, 0);
          assert.equal(
            startingFundMeBalance + startingDeployerBalance,
            endingDeployerBalance + gasCost
          );

          await expect(fundMe.getFunder(0)).to.be.reverted;
          for (let i = 1; i < 6; i++) {
            assert.equal(
              await fundMe.getAddressToAmountFunded(accounts[i].address),
              0
            );
          }
        });
        it("allows only the owner to withdraw", async function () {
          const accounts = await ethers.getSigners();
          const fundMeConnectedContract = await fundMe.connect(accounts[1]);
          await expect(
            fundMeConnectedContract.withdraw()
          ).to.be.revertedWithCustomError(
            fundMeConnectedContract,
            "FundMe__NotOwner"
          );
        });
      });
    });
