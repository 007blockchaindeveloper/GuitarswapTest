const { expectRevert, time } = require('@openzeppelin/test-helpers');
const { assert } = require('chai');
const CakeToken = artifacts.require('GuitarToken');
const BetaGuitar = artifacts.require('BetaGuitar');
const BikeGuitar = artifacts.require('BikeGuitar');
const EkectroGuitar = artifacts.require('EkectroGuitar');
const GuitarNftStaking = artifacts.require('GuitarNftStaking');
const truffleAssert = require('truffle-assertions');
const rewardPerBlock = web3.utils.toWei('0.0001', 'ether');
const tokenAmountToStake =  web3.utils.toWei('1000', 'ether');
contract('GuitarNftStaking', ([alice, bob, carol, dev, minter]) => {
    beforeEach(async () => { 
        this.cake = await CakeToken.deployed();  
        this.nftToken = await BetaGuitar.deployed();  
        this.nftToken1 = await BikeGuitar.deployed();  
        this.nftToken2 = await EkectroGuitar.deployed();  
    });
  
    it("initialize", async () => {   
        
        let tnow = await time.latestBlock() + 1;
        let tend = tnow + 100;

        this.guitarNftStaking = await GuitarNftStaking.new(  this.nftToken.address,this.cake.address, tnow, tend,rewardPerBlock, { from: alice, gas: 20000000 });	
		let nftAmount = 10;
        await this.nftToken.airdrop([ alice,this.guitarNftStaking.address], nftAmount);
        await this.cake.mint(tokenAmountToStake);
        await this.cake.approve(this.guitarNftStaking.address, tokenAmountToStake);
        await this.guitarNftStaking.updateMaxNftsPerUser(10);
        
        this.guitarNftStaking1 = await GuitarNftStaking.new(  this.nftToken1.address,this.cake.address, tnow, tend,rewardPerBlock, { from: alice, gas: 20000000 });	
		let nftAmount1 = 10;
        await this.nftToken.airdrop([ alice,this.guitarNftStaking1.address], nftAmount1);
        await this.cake.mint(tokenAmountToStake);
        await this.cake.approve(this.guitarNftStaking1.address, tokenAmountToStake);
        await this.guitarNftStaking1.updateMaxNftsPerUser(10);

		console.log("GuitarNftStaking ", this.guitarNftStaking.address);
    });
    it("stake", async () => {   
        let tokenIdList = [1,2,3];
        await this.nftToken.setApprovalForAll(this.guitarNftStaking.address, true);
        tx = await this.guitarNftStaking.stake(tokenIdList);
        truffleAssert.eventEmitted(tx, 'Staked', (ev) => {
            console.log("Staked account :", ev.account);
            console.log("Staked tokenId :", ev.tokenId);
            return true;
        });
         let treward = await time.latestBlock() + 10;
        await time.advanceBlockTo(treward);
    });
    it("pendingRewards", async () => {   
        let reward = await this.guitarNftStaking.pendingRewards(alice);
        console.log("Staked reward :", reward);
    });
    it("withdraw", async () => {   
        let tokenIdList = [1,2,3];
        let tx = await this.guitarNftStaking.withdraw(tokenIdList);
        truffleAssert.eventEmitted(tx, 'Withdrawn', (ev) => {
            console.log("Staked account :", ev.account);
            console.log("Staked tokenId :", ev.tokenId);
            return true;
        });
    });
   
});