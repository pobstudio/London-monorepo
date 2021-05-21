pragma solidity ^0.7.0;

import "./MixinOwnable.sol";
import "../library/LibString.sol";
import "../MetadataRegistry.sol";

contract MixinMetadataRegistryTokenURI is Ownable {
    using LibString for string;

    MetadataRegistry public metadataRegistry;
    
    string public metadataKey = "uri";
    string public baseMetadataURI = "";


    // constructor(
    //     address _metadataRegistry
    // ) {
    //     metadataRegistry = MetadataRegistry(_metadataRegistry);
    // }

    function setBaseMetadataURI(string memory newBaseMetadataURI) public onlyOwner() {
        baseMetadataURI = newBaseMetadataURI;
    }

    function setMetadataKey(string memory newMetadataKey) public onlyOwner() {
        metadataKey = newMetadataKey;
    }

    function setMetadataRegistry(address newMetadataRegistry) public onlyOwner() {
        metadataRegistry = MetadataRegistry(newMetadataRegistry);
    }

    function uri(uint256 _id) public view returns (string memory) {
        (, string memory text ,) = metadataRegistry.tokenIdToDocumentMap(_id, metadataKey);
        return LibString.strConcat(
        baseMetadataURI,
        text
        );
    }
}