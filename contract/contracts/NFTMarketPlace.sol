// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract NFTMarketPlace is ERC721URIStorage, Ownable {

    constructor() ERC721("Art Galery", "AGNFT") Ownable(msg.sender) {

    }

}

