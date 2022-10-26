// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

library PriceConverter {
    function getPrice(AggregatorV3Interface _s_priceFeed) internal view returns (uint256) {
        (, int256 answer, , , ) = _s_priceFeed.latestRoundData();
        // ETH/USD rate in 18 digit
        return uint256(answer * 10000000000);
    }

    function getConversionRate(uint256 ethAmount, AggregatorV3Interface _s_priceFeed)
        internal
        view
        returns (uint256)
    {
        uint256 ethPrice = getPrice(_s_priceFeed);
        uint256 ethAmountInUsd = (ethPrice * ethAmount) / 1000000000000000000;
        return ethAmountInUsd;
    }
}