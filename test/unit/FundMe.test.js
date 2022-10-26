const { deployments, ethers, getNamedAccounts } = require("hardhat")
const { assert, expect } = require("chai")
const { developmentChain } = require("../../helper-hardhat-config")

!developmentChain.includes(network.name)
    ? describe.skip
    : describe("FundMe", function () {

        let fundMe
        let deployer
        let mockV3Aggregator
        const sendValue = ethers.utils.parseEther("1") // = 1 ether
        beforeEach(async function () {
            // deploy fundMe contract using hardhat deploy
            // const accounts = await ethers.getSigners()
            // const accountZero = accounts[0]
            deployer = (await getNamedAccounts()).deployer
            await deployments.fixture(["all"])              // fixture is like tag but deploying all the files in deploy folder
            fundMe = await ethers.getContract("FundMe", deployer)
            mockV3Aggregator = await ethers.getContract("MockV3Aggregator", deployer)
        })

        describe("constructor", function () {
            it("Sets the aggregator addresses correctly", async function () {
                const response = await fundMe.getPriceFeed()
                assert.equal(response, mockV3Aggregator.address)
            })
        })


        describe("Fund", async function () {
            it("Fails if you don't send enough ETH", async function () {
                await expect(fundMe.fund()).to.be.reverted
            })

            it("Updates the amount funded data structure", async function () {
                await fundMe.fund({value: sendValue})
                const response = await fundMe.getAddressToAmountFunded(deployer)
                assert.equal(response.toString(), sendValue.toString())
            })

            it("Add funder to array of funders", async function () {
                await fundMe.fund({value: sendValue})
                const funder = await fundMe.getFunder(0)
                assert.equal(funder, deployer)
            })
        })

        describe("Withdraw", async function () {
            beforeEach(async function () {
                await fundMe.fund({value: sendValue})
            })

            it("Can withdraw ETh from single founder", async function () {
                
                // arrange
                const startingFundMeBalance = await fundMe.provider.getBalance(fundMe.address)
                const startingDeployerBalance = await fundMe.provider.getBalance(deployer)

                // act
                const transactionResponse = await fundMe.withdraw()
                const transactionReceipt = await transactionResponse.wait(1)

                const endingFundMeBalance = await fundMe.provider.getBalance(fundMe.address)
                const endingDeployerBalance = await fundMe.provider.getBalance(deployer)

                // gasCost
                const { gasUsed, effectiveGasPrice } = transactionReceipt
                const gasCost = gasUsed.mul(effectiveGasPrice)

                // assert
                assert.equal(endingFundMeBalance, 0)
                assert.equal(startingFundMeBalance.add(startingDeployerBalance).toString(),
                    endingDeployerBalance.add(gasCost).toString()
                )
            })

            it("Allow us to withdraw with multiple funders", async function () {
                
                // arrange
                const accounts = await ethers.getSigners()
                for (let i=1; i<6; i++) {
                    const fundMeConnectedContract = await fundMe.connect(accounts[i])
                    await fundMeConnectedContract.fund({value: sendValue})
                }

                const startingFundMeBalance = await fundMe.provider.getBalance(fundMe.address)
                const startingDeployerBalance = await fundMe.provider.getBalance(deployer)

                // Act
                const transactionResponse = await fundMe.withdraw()
                const transactionReceipt = await transactionResponse.wait(1)

                const endingFundMeBalance = await fundMe.provider.getBalance(fundMe.address)
                const endingDeployerBalance = await fundMe.provider.getBalance(deployer)

                // gasCost
                const { gasUsed, effectiveGasPrice } = transactionReceipt
                const withdrawGasCost = gasUsed.mul(effectiveGasPrice)

                // assert
                assert.equal(endingFundMeBalance, 0)

                assert.equal(startingFundMeBalance.add(startingDeployerBalance).toString(),
                    endingDeployerBalance.add(withdrawGasCost).toString()
                )

                // Make sure the funders are reset properly
                await expect(fundMe.getFunder(0)).to.be.reverted

                for (i=1; i<6; i++) {
                    assert.equal(await fundMe.getAddressToAmountFunded(accounts[i].address), 0)
                }
            })

            it("Only allows the owner to withdraw", async function () {
                const accounts = await ethers.getSigners()
                const attacker = accounts[1]

                const attackerConnectedContract = await fundMe.connect(attacker)

                await expect(attackerConnectedContract.withdraw()).to.be.reverted
            })

            it("Can CheaperWithdraw ETh from single founder", async function () {
                
                // arrange
                const startingFundMeBalance = await fundMe.provider.getBalance(fundMe.address)
                const startingDeployerBalance = await fundMe.provider.getBalance(deployer)

                // act
                const transactionResponse = await fundMe.cheaperWithdraw()
                const transactionReceipt = await transactionResponse.wait(1)

                const endingFundMeBalance = await fundMe.provider.getBalance(fundMe.address)
                const endingDeployerBalance = await fundMe.provider.getBalance(deployer)

                // gasCost
                const { gasUsed, effectiveGasPrice } = transactionReceipt
                const gasCost = gasUsed.mul(effectiveGasPrice)

                // assert
                assert.equal(endingFundMeBalance, 0)
                assert.equal(startingFundMeBalance.add(startingDeployerBalance).toString(),
                    endingDeployerBalance.add(gasCost).toString()
                )
            })

            it("Allow us to cheaperWithdraw with multiple funders", async function () {
                
                // arrange
                const accounts = await ethers.getSigners()
                for (let i=1; i<6; i++) {
                    const fundMeConnectedContract = await fundMe.connect(accounts[i])
                    await fundMeConnectedContract.fund({value: sendValue})
                }

                const startingFundMeBalance = await fundMe.provider.getBalance(fundMe.address)
                const startingDeployerBalance = await fundMe.provider.getBalance(deployer)

                // Act
                const transactionResponse = await fundMe.cheaperWithdraw()
                const transactionReceipt = await transactionResponse.wait(1)

                const endingFundMeBalance = await fundMe.provider.getBalance(fundMe.address)
                const endingDeployerBalance = await fundMe.provider.getBalance(deployer)

                // gasCost
                const { gasUsed, effectiveGasPrice } = transactionReceipt
                const withdrawGasCost = gasUsed.mul(effectiveGasPrice)

                // assert
                assert.equal(endingFundMeBalance, 0)

                assert.equal(startingFundMeBalance.add(startingDeployerBalance).toString(),
                    endingDeployerBalance.add(withdrawGasCost).toString()
                )

                // Make sure the funders are reset properly
                await expect(fundMe.getFunder(0)).to.be.reverted

                for (i=1; i<6; i++) {
                    assert.equal(await fundMe.getAddressToAmountFunded(accounts[i].address), 0)
                }
            })

            it("Only allows the owner to CheaperWithdraw", async function () {
                const accounts = await ethers.getSigners()
                const attacker = accounts[1]

                const attackerConnectedContract = await fundMe.connect(attacker)

                await expect(attackerConnectedContract.cheaperWithdraw()).to.be.reverted
            })
        })
    })