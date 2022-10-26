// import

// main function

// call main function


// export default function deployFunc (hre) {
//     console.log("Deploy successfully ...!!!")
// }

//module.exports.default = deployFunc   ===>   for javascript

const { networkConfig } = require("../helper-hardhat-config")
const { network } = require("hardhat")
const {verify} = require("../utils/verify")
const { developmentChain } = require("../helper-hardhat-config")

module.exports = async ({getNamedAccounts, deployments}) => {
    // const {getNamedAccounts, deployments} = hre

    const {deploy, log} = deployments
    const {deployer} = await getNamedAccounts()
    console.log(`The deployer address is: ${deployer}`)
    const chainId = network.config.chainId

    
    // when using localhost or hardhar we want to use th mock of the price feed

    let ethUsdPriceFeedAddress
    if (developmentChain.includes(network.name)) {
        const ethUsdAggregator = await deployments.get("MockV3Aggregator")
        ethUsdPriceFeedAddress = ethUsdAggregator.address
    } else {
        ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"]
    }


    // parameterize the pricefeed address

    const args = [ethUsdPriceFeedAddress]
    const fundMe = await deploy("FundMe", {
        from: deployer,
        args: args,
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,  
    })
    
    log("__________________________________________________")


    if (!developmentChain.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        // verify the code
        await verify(fundMe.address, args)
    }
}

module.exports.tags = ["all", "fundme"]