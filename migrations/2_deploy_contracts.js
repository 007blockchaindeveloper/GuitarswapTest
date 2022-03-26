// var GuitarLottery = artifacts.require("GuitarSwapLottery");
// var RandomNumberGenerator = artifacts.require("RandomNumberGenerator");

var GuitarToken = artifacts.require("GuitarToken");
var BetaGuitar = artifacts.require("BetaGuitar");
var GuitarNftFarm = artifacts.require("GuitarNftFarm");
var GuitarNftStaking = artifacts.require("GuitarNftStaking");
module.exports = async function(deployer, network, accounts) {

		
		await deployer.deploy(GuitarToken);
		let guitarToken = await GuitarToken.deployed();
		console.log("guitarToken ", guitarToken.address);
		


		await deployer.deploy(BetaGuitar);
		let betaGuitar = await BetaGuitar.deployed();

		console.log("BetaGuitar ", betaGuitar.address);
		
		
// 	const LINK_Token_Address = '0x84b9B910527Ad5C03A9Ca831909E21e236EA7b06';
	// 	const VRF_Coordinator_Address = '0xa555fC018435bef5A13C6c6870a9d4C11DEC329C';
	
		
	// 	await deployer.deploy(RandomNumberGenerator, VRF_Coordinator_Address, LINK_Token_Address);
	// 	let randomGenerator = await RandomNumberGenerator.deployed();
	// 	console.log("randomGenerator: " , randomGenerator.address);	
		

	// 	await deployer.deploy(GuitarLottery, guitarToken.address, randomGenerator.address);
    // let lottery = await GuitarLottery.deployed();
	// 	console.log("GuitarLottery: " , lottery.address);	
		
	// 	await randomGenerator.setFee(web3.utils.toWei('0.1'));
	// 	await randomGenerator.setKeyHash('0xcaf3c3727e033261d383b315559476f48034c13b18f8cafed4d871abe5049186');
	// 	await randomGenerator.setLotteryAddress(lottery.address);
		
};

