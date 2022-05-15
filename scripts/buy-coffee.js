// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");

// Returns the Ether balance of a given address.
async function getBalance(address) {
	const balanceBigInt = await hre.waffle.provider.getBalance(address);
	return hre.ethers.utils.formatEther(balanceBigInt);
}

// Logs the Ether balances for a list of addresses.
async function printBalances(addresses) {
	let idx = 0;
	for (const address of addresses) {
		console.log(`Address ${idx} balance: `, await getBalance(address));
		idx++;
	}
}

// Logs the memos stored on-chain from coffee purchases.
async function printMemos(memos) {
	for (const memo of memos) {
		const timestamp = memo.timestamp;
		const tipper = memo.name;
		const tipperAddress = memo.from;
		const message = memo.message;
		console.log(`At ${timestamp}, ${tipper} (${tipperAddress}) said: "${message}"`);
	}
}

async function main() {
	// Hardhat always runs the compile task when running scripts with its command
	// line interface.
	//
	// If this script is run directly using `node` you may want to call compile
	// manually to make sure everything is compiled
	// await hre.run('compile');

	// Get the example accounts we'll be working with.
	const [owner, tipper, tipper2, tipper3] = await hre.ethers.getSigners();

	// We get the contract to deploy.
	const BuyMeACoffee = await hre.ethers.getContractFactory("BuyMeACoffee");
	const buyMeACoffee = await BuyMeACoffee.deploy();

	// Deploy the contract.
	await buyMeACoffee.deployed();
	console.log("BuyMeACoffee deployed to:", buyMeACoffee.address);

	// Check balances before the coffee purchase.
	const addresses = [owner.address, tipper.address, buyMeACoffee.address];
	console.log("== start ==");
	await printBalances(addresses);

	// Buy the owner a few coffees.
	const tipSmall = { value: hre.ethers.utils.parseEther("0.001") };
	const tipMedium = { value: hre.ethers.utils.parseEther("0.002") };
	const tipLarge = { value: hre.ethers.utils.parseEther("0.003") };
	await buyMeACoffee.connect(tipper).buyCoffee("Carolina", "You're the best!", tipSmall);
	await buyMeACoffee.connect(tipper2).buyCoffee("Vitto", "Amazing teacher", tipMedium);
	await buyMeACoffee.connect(tipper3).buyCoffee("Kay", "I love my Proof of Knowledge", tipLarge);

	// Check balances after the coffee purchase.
	console.log("== bought coffee ==");
	await printBalances(addresses);

	// Withdraw.
	await buyMeACoffee.connect(owner).withdrawTips();

	// Check balances after withdrawal.
	console.log("== withdrawTips ==");
	await printBalances(addresses);

	// Check out the memos.
	console.log("== memos ==");
	const memos = await buyMeACoffee.getMemos();
	printMemos(memos);
	/*
	 await buyMeACoffee.updateAddress(tipper.address);
	console.log("New Owner: ", newOnwer);

	const newOwn = await buyMeACoffee.connect(tipper2).updateAddress(tipper3.address);
	console.log("new owner 2: ", newOwn);
	*/
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error(error);
		process.exit(1);
	});
