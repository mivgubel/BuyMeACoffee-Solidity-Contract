//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

// Example Contract Address on Goerli: 0x352Cbad003089F2E43a7e074DD4Bd63620Bf0B3c
//SOLO FALTA ENCHULAR LA UI, LOS 2 RETOS PROPUESTOS YA QUEDARON SOLUCIONADOS.

contract BuyMeACoffee {
    // Event to emit when a Memo is created.
    event newMemo(
        address indexed from,
        uint256 timestamp,
        string name,
        string message
    );

    // Memo struct
    struct Memo {
        address from;
        uint256 timestamp;
        string name;
        string message;
    }

    // Address of contract deployer. Marked payable so that
    // we can withdraw to this address later.
    address payable owner;

    // List of all memos received from coffee purchases.
    Memo[] memos;

    constructor() {
        // Store the address of the deployer as a payable address.
        // When we withdraw funds, we'll withdraw here.
        owner = payable(msg.sender);
    }

    /**
     * @dev fetches all stored memos
     */
    function getMemos() public view returns (Memo[] memory) {
        return memos;
    }

    /**
     * @dev buy a coffee for owner (sends an ETH tip and leaves a memo)
     * @param _name name of the coffee purchaser
     * @param _message a nice message from the purchaser
     */
    function buyCoffee(string memory _name, string memory _message)
        public
        payable
    {
        // Must accept more than 0 ETH for a coffee.
        require(msg.value > 0, "Can't Buy a Coffe for Free!");
        // Add the memo to storage!
        memos.push(Memo(msg.sender, block.timestamp, _name, _message));
        // Emit a NewMemo event with details about the memo.
        emit newMemo(msg.sender, block.timestamp, _name, _message);
    }

    /**
     * @dev send the entire balance stored in this contract to the owner
     */
    function withdrawTips() public {
        require(owner.send(address(this).balance));
    }

    // Modifier
    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner can call this function");
        _;
    }

    // Allow the owner to update the withdraw address.
    function updateAddress(address _newAddress) public onlyOwner {
        owner = payable(_newAddress);
    }
}
