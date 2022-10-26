const { getNamedAccounts, ethers, network } = require("hardhat")
const { developmentChain } = require("../../helper-hardhat-config")
const { assert } = require("chai")


developmentChain.includes(network.name)
    ? describe.skip
    : describe("FundMe", async function () {

        let fundMe
        let deployer
        const sendValue = ethers.utils.parseEther("1") // = 1 ether

        beforeEach(async function () {
            deployer = (await getNamedAccounts()).deployer
            fundMe = await ethers.getContract("FundMe", deployer)
        })

        it("Allows people to run and withdraw", async function () {
            await fundMe.fund({value: sendValue})
            await fundMe.withdraw()
            const endingBalance = await fundMe.provider.getBalance(fundMe.address)
            assert.equal(endingBalance.toString(), "0")
        })
    })