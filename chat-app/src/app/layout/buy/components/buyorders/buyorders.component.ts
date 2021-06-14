import { Component, Output, EventEmitter, OnInit } from '@angular/core';
import { DEX_MainContract_ABI } from '../../../../ABI.const';
import { DEX_MainContract_Address } from '../../../../addresses.const';
import { promisify } from '../../../../shared/wrappers/wrapper';
import { Router } from '@angular/router';

declare var window: any;
var web3 = window.web3;

@Component({
    selector: 'app-buyorders',
    templateUrl: './buyorders.component.html',
    styleUrls: ['./buyorders.component.scss']
})
export class BuyOrdersComponent implements OnInit {
    @Output() activateCreateOfferTab: EventEmitter<boolean> = new EventEmitter();

    contractAbi = DEX_MainContract_ABI;
    contractAddress = DEX_MainContract_Address;
    web3: any;
    contract: any;
    coinbase: string;
    currentSellOffersCount: any;
    currentSellOffersTradeHashes: string[] = Array();
    sellOfferDetails = new Array();
    watcherSellOfferDetails = new Array();

    constructor(private router: Router) { }

    ngOnInit() {
        if (web3 == undefined) {
            return;
        }
        this.web3 = web3;
        this.coinbase = this.web3.eth.accounts[0];
        this.LoadContract();
        this.watchNewSellOrderPlaced();
        this.watchNewOrderAndUpdate();
    }

    watchNewSellOrderPlaced() {
        const filter = web3.eth.filter({
            fromBlock: 'pending',
            toBlock: 'latest',
            address: this.contractAddress,
            topics: [web3.sha3("SellOfferPlaced(address,bytes32)")]
        })
        filter.watch((error, result) => {
            this.LoadTradeDetailsFromTradeHash(result.topics[2]);
        });
    }

    async LoadContract() {
        this.sellOfferDetails = new Array();
        this.watcherSellOfferDetails = new Array();
        this.contract = (this.web3.eth.contract(this.contractAbi)).at(this.contractAddress);
        this.web3.eth.defaultAccount = this.coinbase;
        this.currentSellOffersCount = await promisify(cb => this.contract.getCurrentSellOffersCount(cb));
        this.currentSellOffersCount = JSON.parse(this.currentSellOffersCount);
        this.LoadAllSellTradeHashes(this.currentSellOffersCount);
    }

    async LoadAllSellTradeHashes(currentNumberOfTrades: number) {
        this.currentSellOffersTradeHashes = [];
        for (let i = 0; i < currentNumberOfTrades; i++) {
            let tradeHash = await promisify(cb => this.contract.currentSellOffersTradeHash(i, cb));
            this.currentSellOffersTradeHashes.push(tradeHash.toString());
            this.LoadTradeDetailsFromTradeHash(tradeHash.toString());
        }
    }

    async LoadTradeDetailsFromTradeHash(hash) {
        let offerDetails = await promisify(cb => this.contract.getSellOfferFromTradeHash(hash, cb));
        let offer = {
            tradeHash: hash,
            fiatCurrency: offerDetails[0],
            paymentMethod: offerDetails[1],
            ethQuantity: offerDetails[2],
            fiatQuantity: offerDetails[3],
            sellerAddress: offerDetails[4],
            buyerAddress: offerDetails[5],
            arbitratorAddress: offerDetails[6]
        }
        if (offer.buyerAddress == '0x0000000000000000000000000000000000000000') {
            this.sellOfferDetails.push(offer);
            this.watcherSellOfferDetails.push(offer);
        }
    }

    async takeSellOffer(offer) {
        this.router.navigateByUrl(`/buy/takeoffer/${offer.tradeHash}`);
    }

    watchNewOrderAndUpdate() {
        setInterval(() => {
            if (this.watcherSellOfferDetails.length != this.sellOfferDetails.length) {
                this.sellOfferDetails = this.watcherSellOfferDetails;
            }
        }, 1000);
    }

}