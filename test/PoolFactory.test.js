const { expectRevert, time } = require('@openzeppelin/test-helpers');
const { assert } = require('chai');
const CakeToken = artifacts.require('GuitarToken');
const SyrupBar = artifacts.require('GuitarSyrupBar');
const GuitarPoolFactory = artifacts.require('GuitarPoolFactory');
const GuitarPoolInitializable = artifacts.require('GuitarPoolInitializable');
const truffleAssert = require('truffle-assertions');
const tokenAmountToStake =  web3.utils.toWei('1000', 'ether');
const rewardPerBlock = web3.utils.toWei('0.0001', 'ether');



contract('GuitarPoolFactory', ([alice, bob, carol, dev, minter]) => {
    beforeEach(async () => { 
        this.cake = await CakeToken.new({ from: alice });
        this.syrup = await SyrupBar.new(this.cake.address, { from: alice });
    });
  
    it('mint', async () => {
        await this.cake.mint(tokenAmountToStake);
        await this.syrup.mint(alice, tokenAmountToStake);
    });
    
    it("initialize", async () => {   
       this.guitarPoolFactory =  await GuitarPoolFactory.new();
       
       
       let startBlock = await time.latestBlock() + 1;;
       let bonusEndBlock = startBlock + 100;
       let poolLimitPerUser = tokenAmountToStake;
       let depositFee = 1000;
       let feeAddress = alice;
       let admin = alice;
       tx = await this.guitarPoolFactory.deployPool(this.cake.address, this.syrup.address, rewardPerBlock, startBlock, bonusEndBlock, poolLimitPerUser, depositFee, feeAddress, admin);
       truffleAssert.eventEmitted(tx, 'NewGuitarPoolContract', (ev) => {
        console.log("NewGuitarPoolContract user :", ev.smartChef);
        return true;
        });
    });
    it("deposit", async () => {   
        this.guitarPool = await GuitarPoolInitializable.at(this.guitarPoolFactory.address);
        await this.cake.approve(this.guitarPool.address, 1000);
        tx =  await this.guitarPool.deposit(1000);
        truffleAssert.eventEmitted(tx, 'Deposit', (ev) => {
            console.log("Deposit user :", ev.user);
            console.log("Deposit amount :", ev.amount);
            return true;
        });
    });
});