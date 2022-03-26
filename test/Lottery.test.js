const { expectRevert, time } = require('@openzeppelin/test-helpers');
const { assert } = require('chai');
const CakeToken = artifacts.require('GuitarToken');
const GuitarLottery = artifacts.require('GuitarSwapLottery');
const RandomNumberGenerator = artifacts.require("RandomNumberGenerator");
const LinkTokenInterface = artifacts.require("LinkTokenInterface");
const truffleAssert = require('truffle-assertions');
const LINK_Token_Address = '0x84b9B910527Ad5C03A9Ca831909E21e236EA7b06';
contract('GuitarSwapLottery', ([alice, bob, carol, dev, minter]) => {
  beforeEach(async () => { 
    
  });

  it("initialize", async () => {   
    
    this.cake = await CakeToken.deployed();  
    this.link = await LinkTokenInterface.at(LINK_Token_Address);
    console.log("this.link: " , this.link.address );
    this.randomGenerator = await RandomNumberGenerator.deployed(); 
    await this.link.approve(this.randomGenerator.address, web3.utils.toWei('3'));
    await this.randomGenerator.getToken(alice, web3.utils.toWei('3'));
    console.log("randomGenerator: ", this.randomGenerator.address);
    
    //await this.randomGenerator.getRandomNumber(10);
    
    await this.cake.mintFor(alice, web3.utils.toWei('1000000'));
    this.lottery = await GuitarLottery.deployed();
    console.log("Lottery: ", this.lottery.address);     
    await this.lottery.setOperatorAndTreasuryAndInjectorAddresses(alice, alice, alice); 
  });

  it('startLottery', async () => {
    const tnow = await time.latest();
    const tend = tnow.add(time.duration.hours(3));
    // console.log("Times: ", tnow, tend);
    let tx = await this.lottery.startLottery(
      tend, 
      web3.utils.toWei('0.00005', 'ether'), 
      300, 
      [3000,2000,1000,1000,1000,2000], 
      3000
    );
    truffleAssert.eventEmitted(tx, 'LotteryOpen', (ev) => {
      console.log("ev :", ev);
      console.log("_lotteryId: ", ev.lotteryId);
      console.log("this.lotteryId: ",ev.startTime);
      console.log("currentTicketId: ", ev.firstTicketId);
      this.lotteryId = ev.firstTicketId;
      return true;

    });
    this.lotteryId = await this.lottery.viewCurrentLotteryId.call();
    assert(this.lotteryId > 0, "failed to start");
    console.log("Lottery ID: ", this.lotteryId.toString());
    
  });

  it('buyTickets', async () => {
    let ticketNum = 1000000;
    let ticketNumbers = [];
    for (var i=0; i<90000; i = i + 13459) {
      ticketNumbers.push(ticketNum+i);
    }
    console.log("ticketNumbers ", ticketNumbers.length );

    console.log('balance', (await this.cake.balanceOf(alice)).toString());
    let needAmount = await this.lottery.calculateTotalPriceForBulkTickets(300, web3.utils.toWei('0.00005', 'ether'), ticketNumbers.length);
    console.log('need amount', needAmount.toString());
    await this.cake.approve(this.lottery.address, needAmount);
    let tx = await this.lottery.buyTickets.call(this.lotteryId, ticketNumbers);
    // truffleAssert.eventEmitted(tx, 'TicketsPurchase', (ev) => {
    //   console.log("TicketsPurchase ev :", ev);
    //   return true;

    // });
    this.lotteryInfo = await this.lottery.viewLottery(this.lotteryId);
    console.log("Lottery Info: ", this.lotteryInfo);
    for (var i =0; i< ticketNumbers.length; i++){
      let numberTickets = await this.lottery.getNumberTicketsPerLotteryId(this.lotteryId,ticketNumbers[i]);
      console.log("numberTickets: ", numberTickets);
    }
      
  });

  it('closeLottery', async () => {
    console.log("RandomNumberGenerator Info: ", this.randomGenerator.address);
    let tx = await this.lottery.closeLottery(this.lotteryId);
    console.log("Lottery Closed: ", this.lotteryId);
    truffleAssert.eventEmitted(tx, 'LotteryClose', (ev) => {
      console.log("ev :", ev);
      console.log("_lotteryId: ", ev.lotteryId);
      console.log("this.lotteryId: ", this.lotteryId);
      console.log("currentTicketId: ", ev.firstTicketIdNextLottery);
      this.lotteryId = ev.lotteryId;
      return true;

    });

  });

  it('drawFinalNumberAndMakeLotteryClaimable', async () => {
    let LotteryId = await this.randomGenerator.viewLatestLotteryId();
    console.log("Lottery: ", LotteryId);
    await this.lottery.drawFinalNumberAndMakeLotteryClaimable(this.lotteryId, true);
  });

  // it('claimTickets', async () => {
  
  // });

  // it('injectFunds', async () => {
  
  // });

});
