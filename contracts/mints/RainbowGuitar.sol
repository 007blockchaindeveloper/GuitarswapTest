
pragma solidity 0.6.12;
import "../nft-farm/ERC721.sol";

contract RainbowGuitar is ERC721Enumerable, Ownable {
    using Counters for Counters.Counter;
    using Strings for uint256;

    address payable private _PaymentAddress = payable(0x44B638F9457a572DF9d48228bcC4749b4F6144F7);

    uint256 public GUITAR_MAX = 25;
    uint256 public PUBLIC_PRICE = 0.5 ether;
    uint256 public PURCHASE_LIMIT = 5;
    uint256 public PUBLIC_MINT_LIMIT = GUITAR_MAX;

    mapping(address => uint256) private _mappingPublicMintCount;

    uint256 public _activeDateTime = 1642766400; //(GMT): Friday, January 21, 2022 12:00:00 PM
    
    string private _tokenBaseURI = "";
    
    Counters.Counter private _publicGUITAR;

    constructor() ERC721("Rainbow Guitar", "RAINBOWGUT") {}

    function setPaymentAddress(address paymentAddress) external onlyOwner {
        _PaymentAddress = payable(paymentAddress);
    }

    function setActiveDateTime(uint256 activeDateTime) external onlyOwner {
        _activeDateTime = activeDateTime;
    }

    function setMintPrice(uint256 publicMintPrice) external onlyOwner {
        PUBLIC_PRICE = publicMintPrice;
    }

    function setMaxLimit(uint256 maxLimit) external onlyOwner {
        GUITAR_MAX = maxLimit;
    }

    function setPurchaseLimit(uint256 purchaseLimit, uint256 publicMintLimit) external onlyOwner {
        PURCHASE_LIMIT = purchaseLimit;
        PUBLIC_MINT_LIMIT = publicMintLimit;
    }

    function PRICE() public view returns (uint256) {
        return PUBLIC_PRICE;
    }

    function setBaseURI(string memory baseURI) external onlyOwner {
        _tokenBaseURI = baseURI;
    }

    function airdrop(address[] memory airdropAddress, uint256 numberOfTokens) external onlyOwner {
        for (uint256 k = 0; k < airdropAddress.length; k++) {
            for (uint256 i = 0; i < numberOfTokens; i++) {
                uint256 tokenId = _publicGUITAR.current();

                if (_publicGUITAR.current() < GUITAR_MAX) {
                    _publicGUITAR.increment();
                    if (!_exists(tokenId)) _safeMint(airdropAddress[k], tokenId);
                }
            }
        }
    }

    function airdropSpecial(address to, uint256 tokenId) external onlyOwner {
        require(!_exists(tokenId), "Token already exist");
        if (!_exists(tokenId)) _safeMint(to, tokenId);
    }

    function purchase(uint256 numberOfTokens) external payable {
        require(_publicGUITAR.current() < GUITAR_MAX,"Purchase would exceed GUITAR_MAX");

        if (msg.sender != owner()) {
            require(numberOfTokens <= PURCHASE_LIMIT,"Can only mint up to purchase limit");
            require(PRICE() * numberOfTokens <= msg.value,"ETH amount is not sufficient");
            require(block.timestamp > _activeDateTime , "Mint is not activated");
            _mappingPublicMintCount[msg.sender] = _mappingPublicMintCount[msg.sender] + numberOfTokens;
            require(_mappingPublicMintCount[msg.sender] <= PUBLIC_MINT_LIMIT,"Overflow for PUBLIC_MINT_LIMIT");

            _PaymentAddress.transfer(msg.value);
        }

        for (uint256 i = 0; i < numberOfTokens; i++) {
            uint256 tokenId = _publicGUITAR.current();

            if (_publicGUITAR.current() < GUITAR_MAX) {
                _publicGUITAR.increment();
                if (!_exists(tokenId)) _safeMint(msg.sender, tokenId);
            }
        }
    }

    function tokenURI(uint256 tokenId) public view override(ERC721) returns (string memory)
    {
        require(_exists(tokenId), "Token does not exist");
        return _tokenBaseURI;
    }

    function withdraw() external onlyOwner {
        uint256 balance = address(this).balance;

        payable(msg.sender).transfer(balance);
    }
}
