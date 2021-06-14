import { Component, OnInit } from '@angular/core';
import { DEX_MainContract_ABI } from '../../ABI.const';
import { DEX_MainContract_Address } from '../../addresses.const';
import { promisify } from '../../shared/wrappers/wrapper';
import { Loading } from '../../shared/services/emitter.service';

declare var window: any;
var web3 = window.web3;

@Component({
  selector: 'app-marketplacedemo',
  templateUrl: './marketplacedemo.component.html',
  styleUrls: ['./marketplacedemo.component.scss']
})
export class MarketplacedemoComponent implements OnInit {

  contractAbi = DEX_MainContract_ABI;
  contractAddress = DEX_MainContract_Address;
  web3: any;
  contract: any;
  coinbase: string;
  arbitratorList: any;
  currentArbitratorCount: any;

  category: string;
  title: string;
  description: string;
  location: string;
  ethQuantity: number;
  expiry: any;
  arbitratorAddress: string;


  constructor() { }
  ngOnInit() {
    if (web3 == undefined) {
      return;
    }
    this.web3 = web3;
    this.coinbase = this.web3.eth.accounts[0];
    this.LoadContract();
  }

  async LoadContract() {
    this.contract = (this.web3.eth.contract(this.contractAbi)).at(this.contractAddress);
    this.web3.eth.defaultAccount = this.coinbase;
    this.currentArbitratorCount = await promisify(cb => this.contract.getArbitratorsCount(cb));
    this.currentArbitratorCount = JSON.parse(this.currentArbitratorCount);
    this.loadAllArbitrators(this.currentArbitratorCount);
  }
  async loadAllArbitrators(currentNumberOfArbitrators: number) {
    this.arbitratorList = [];
    for (let i = 0; i < currentNumberOfArbitrators; i++) {
      let arbitrators = await promisify(cb => this.contract.arbitrators(i, cb));
      this.arbitratorList.push(arbitrators);
    }
  }

  async placeProductOfferInContract() {
    Loading.emit(true);
    if (this.contract != undefined) {
      console.log("_fiatCurrency => ", this.category);
      console.log("_paymentMethod => ", JSON.stringify({title: this.title, description: this.description, location: this.location}));
      console.log("_offeredEthQuantity => ", this.web3.toWei(this.ethQuantity));
      console.log("_fiatQuantity => ", this.expiry);
      console.log("_arbitratorAddress => ", this.arbitratorAddress);
      console.log("_arbitratorFees => ", this.web3.toWei(0));
      // await promisify(cb => this.contract.placeSellOffer(
      //   this.category,
      //   JSON.stringify({title: this.title, description: this.description, location: this.location}),
      //   this.web3.toWei(this.ethQuantity),
      //   this.expiry,//convert this to a UNIX time stamp
      //   this.arbitratorAddress,
      //   this.web3.toWei(0), cb)).catch(error => Loading.emit(false));
      this.watchNewBuyOrderPlaced();
    }
  }

  watchNewBuyOrderPlaced() {
    const filter = web3.eth.filter({
      fromBlock: 'pending',
      toBlock: 'latest',
      address: this.contractAddress,
      topics: [web3.sha3("SellOfferPlaced(address,bytes32)"), this.ConvertAddressToBase64(this.coinbase)]
    })
    filter.watch((error, result) => {
      Loading.emit(false);
    });
  }
  private ConvertAddressToBase64(address: string) {
    if (address == undefined || address == null)
      return address;
    var splittedAddress = address.split("x");
    address = "0x000000000000000000000000" + splittedAddress[1];
    return address;
  }

}
