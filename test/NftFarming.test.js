const { expectRevert, time } = require('@openzeppelin/test-helpers');
const { assert } = require('chai');
const CakeToken = artifacts.require('GuitarToken');
const BetaGuitar = artifacts.require('BetaGuitar');
const GuitarNftFarm = artifacts.require('GuitarNftFarm');
const truffleAssert = require('truffle-assertions');

const nftTokenMax = 25;
const nftTokenPrice = web3.utils.toWei('0.00001', 'ether');
const nftTokenPurchaseLimit = 5;



contract('GuitarSwapLottery', ([alice, bob, carol, dev, minter]) => {
    beforeEach(async () => { 
        this.cake = await CakeToken.deployed();  
        this.nftToken = await BetaGuitar.deployed();  
    });
  
    it("initialize", async () => {   
        let tnow = await time.latest();
        tnow = tnow.add(time.duration.hours(2));
        let tend = tnow.add(time.duration.hours(30));
        let DEPOSIT_FEE = 1500;
        let LOCK_PERIOD = time.duration.hours(300);
        this.guitarNftFarm = await GuitarNftFarm.new( this.cake.address, this.nftToken.address, tnow, tend, nftTokenMax, nftTokenPrice, nftTokenPurchaseLimit, DEPOSIT_FEE, alice, LOCK_PERIOD, { from: alice, gas: 20000000 });	
		
        
		console.log("GuitarNftFarm ", this.guitarNftFarm.address);
    });
    it("stake", async () => {   
        let nftAmountToBuy = 2;
        let tokenAmountToStake = (nftAmountToBuy + 1 ) * nftTokenPrice;
        await this.nftToken.airdrop([this.guitarNftFarm.address], nftAmountToBuy + 5);
        await this.cake.mint(tokenAmountToStake);
        await this.cake.approve(this.guitarNftFarm.address, tokenAmountToStake);
        tx = await this.guitarNftFarm.stake(tokenAmountToStake, nftAmountToBuy);	
        truffleAssert.eventEmitted(tx, 'Staked', (ev) => {
            console.log("Staked user :", ev.user);
            console.log("Staked tokenAmount :", ev.tokenAmount);
            console.log("Staked nftToBuyAmount :", ev.nftToBuyAmount);
            return true;
        });
		console.log("GuitarNftFarm ", this.guitarNftFarm.address);
    });
    it("claim", async () => {   
        tx = await this.guitarNftFarm.claim();
        truffleAssert.eventEmitted(tx, 'Claimed', (ev) => {
            console.log("Claimed user :", ev.user);
            console.log("Claimed claimedTokenAmount :", ev.claimedTokenAmount);
            console.log("Claimed claimedNftAmount :", ev.claimedNftAmount);
            return true;
        });
    });
    it("withdrawRemainedNfts", async () => {   
        tx = await this.guitarNftFarm.withdrawRemainedNfts(1);
        truffleAssert.eventEmitted(tx, 'AdminNftWithdrawn', (ev) => {
            console.log("AdminNftWithdrawn amount :", ev.amount);
            return true;
        });
    });
   
});