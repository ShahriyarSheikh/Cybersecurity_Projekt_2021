import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { DEX_MainContract_ABI } from '../../../../ABI.const';
import { DEX_MainContract_Address } from '../../../../addresses.const';
import { promisify } from '../../../../shared/wrappers/wrapper';
import { Router } from '@angular/router';

declare var window: any;
var web3 = window.web3;

@Component({
    selector: 'app-sellorders',
    templateUrl: './sellorders.component.html',
    styleUrls: ['./sellorders.component.scss']
})
export class SellOrdersComponent implements OnInit {
    @Output() activateCreateOfferTab: EventEmitter<boolean> = new EventEmitter();
    contractAbi = DEX_MainContract_ABI;
    contractAddress = DEX_MainContract_Address;
    web3: any;
    contract: any;
    coinbase: string;
    currentBuyOffersCount: any;
    currentBuyOffersTradeHashes: string[] = Array();
    buyOfferDetails = new Array();
    watcherBuyOfferDetails = new Array();


    constructor(private router: Router) { }

    ngOnInit() {
        if (web3 == undefined) {
            return;
        }
        this.web3 = web3;

        this.coinbase = this.web3.eth.accounts[0];
        this.LoadContract();
        this.watchNewBuyOrderPlaced();
        this.watchNewOrderAndUpdate();
    }

    watchNewBuyOrderPlaced() {
        const filter = web3.eth.filter({
            fromBlock: 'pending',
            toBlock: 'latest',
            address: this.contractAddress,
            topics: [web3.sha3("BuyOfferPlaced(address,bytes32)")]
        })
        filter.watch((error, result) => {
            this.LoadTradeDetailsFromTradeHash(result.topics[2]);
        });
    }

    async LoadContract() {
        this.buyOfferDetails = new Array();
        this.watcherBuyOfferDetails = new Array();
        this.contract = (this.web3.eth.contract(this.contractAbi)).at(this.contractAddress);
        this.web3.eth.defaultAccount = this.coinbase;
        this.currentBuyOffersCount = await promisify(cb => this.contract.getCurrentBuyOffersCount(cb));
        this.currentBuyOffersCount = JSON.parse(this.currentBuyOffersCount);
        this.LoadAllBuyTradeHashes((this.currentBuyOffersCount));
    }

    async LoadAllBuyTradeHashes(currentNumberOfTrades: number) {
        this.currentBuyOffersTradeHashes = [];
        for (let i = 0; i < currentNumberOfTrades; i++) {
            let tradeHash = await promisify(cb => this.contract.currentBuyOffersTradeHash(i, cb));
            this.currentBuyOffersTradeHashes.push(tradeHash.toString());
            this.LoadTradeDetailsFromTradeHash(tradeHash.toString());
        }
    }

    async LoadTradeDetailsFromTradeHash(hash) {
        let offerDetails = await promisify(cb => this.contract.getBuyOfferFromTradeHash(hash, cb));
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
        if (offer.sellerAddress == '0x0000000000000000000000000000000000000000') {
            this.buyOfferDetails.push(offer);
            this.watcherBuyOfferDetails.push(offer);
        }
    }

    async takeBuyOffer(offer) {
        this.router.navigateByUrl(`/sell/takeoffer/${offer.tradeHash}`);
    }

    watchNewOrderAndUpdate() {
        setInterval(() => {
            if (this.watcherBuyOfferDetails.length != this.buyOfferDetails.length) {
                this.buyOfferDetails = this.watcherBuyOfferDetails;
            }
        }, 1000);
    }

}

