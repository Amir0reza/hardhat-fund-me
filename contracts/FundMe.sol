// SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "./PriceConverter.sol";

error FundMe__NotOwner();
error FundMe__NotEnoughETH(uint256 sent, uint256 minRequired);
error FundMe__CallFailed();


/** @title A contract for crowd funding
 *  @author Patrick Collins
 *  @notice This contract is demo a sample funding contract
 *  @dev This implements price feed as our library
 */
contract FundMe {


    using PriceConverter for uint256;
    mapping(address => uint256) private s_addressToAmountFunded;
    address[] private s_funders;
    address private immutable i_owner;
    uint256 public constant MINIMUM_USD = 50 * 10 ** 18;
    AggregatorV3Interface private s_priceFeed;
    

    modifier onlyOwner {
        if (msg.sender != i_owner) revert FundMe__NotOwner();
        _;
    }
    

    constructor(address priceFeedAddress) {
        i_owner = msg.sender;
        s_priceFeed = AggregatorV3Interface(priceFeedAddress);
    }


    receive() external payable {
        fund();
    }


    fallback() external payable {
        fund();
    }


    /*  @notice This function funds this contract
     *  @dev This implements price feed as our library
     *  @param 
     *  @returns
    */
    function fund() public payable {
        uint256 sentInUSD = msg.value.getConversionRate(s_priceFeed);
        if ( sentInUSD < MINIMUM_USD) {
            revert FundMe__NotEnoughETH({
                sent: sentInUSD,
                minRequired: MINIMUM_USD
                });
        }
        s_addressToAmountFunded[msg.sender] += msg.value;
        s_funders.push(msg.sender);
    }


    function withdraw() public onlyOwner {
        for (uint256 funderIndex=0; funderIndex < s_funders.length; funderIndex++){
            address funder = s_funders[funderIndex];
            s_addressToAmountFunded[funder] = 0;
        }
        s_funders = new address[](0);
        (bool callSuccess, ) = payable(msg.sender).call{value: address(this).balance}("");
        if (!callSuccess) revert FundMe__CallFailed();
    }


    function cheaperWithdraw() public onlyOwner {
        address[] memory funders = s_funders;
        for (uint256 funderIndex=0; funderIndex < funders.length; funderIndex++){
            address funder = funders[funderIndex];
            s_addressToAmountFunded[funder] = 0;
        }
        s_funders = new address[](0);
        (bool callSuccess, ) = payable(msg.sender).call{value: address(this).balance}("");
        if (!callSuccess) revert FundMe__CallFailed();
    }


    function getVersion() public view returns (uint256) {
        return s_priceFeed.version();
    }


    function getOwner() public view returns (address) {
        return i_owner;
    }


    function getFunder(uint256 index) public view returns (address) {
        return s_funders[index];
    }


    function getAddressToAmountFunded(address funder) public view returns (uint256) {
        return s_addressToAmountFunded[funder];
    }


    function getPriceFeed() public view returns (AggregatorV3Interface) {
        return s_priceFeed;
    }

}