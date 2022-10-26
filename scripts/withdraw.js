const { getNamedAccounts } = require("hardhat")

const main = async () => {
    const deployer = (await getNamedAccounts()).deployer
    const fundMe = await ethers.getContract("FundMe", deployer)

    console.log("Withdrawing from contract ...")

    const transactionResponse = await fundMe.withdraw()
    await transactionResponse.wait(1)

    console.log("Withdrawing finished !!!")
}

main() 
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })