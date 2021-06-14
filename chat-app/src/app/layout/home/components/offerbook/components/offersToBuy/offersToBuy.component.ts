import { Component, OnInit } from '@angular/core';
import { DEX_MainContract_Address } from '../../../../../../addresses.const';
import { promisify } from '../../../../../../shared/wrappers/wrapper';
import { DEX_MainContract_ABI } from '../../../../../../ABI.const';

declare var window: any;
var web3 = window.web3;

@Component({
    selector: 'app-offersToBuy',
    templateUrl: './offersToBuy.component.html',
    styleUrls: ['./offersToBuy.component.scss']
})
export class OffersToBuyComponent implements OnInit {
    web3: any;
    coinbase: string;
    contractAddress = DEX_MainContract_Address;
    contractAbi = DEX_MainContract_ABI;
    contract: any;
    sellOfferDetails = new Array();
    watcherSellOfferDetails = new Array();

    ngOnInit() {
        if (web3 == undefined) {
            return;
        }
        this.web3 = web3;
        this.coinbase = this.web3.eth.accounts[0];
        this.loadContract();
        this.watchNewOrderAndUpdate();
    }

    async loadContract() {
        this.contract = (this.web3.eth.contract(this.contractAbi)).at(this.contractAddress);
        this.web3.eth.defaultAccount = this.coinbase;
        let currentSellOffersCount = await promisify(cb => this.contract.getCurrentSellOffersCount(cb));
        this.LoadAllSellTradeHashes(Number(currentSellOffersCount));
    }

    async LoadAllSellTradeHashes(currentNumberOfTrades: number) {
        for (let i = 0; i < currentNumberOfTrades; i++) {
            let tradeHash = await promisify(cb => this.contract.currentSellOffersTradeHash(i, cb));
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

    watchNewOrderAndUpdate() {
        setInterval(() => {
            if (this.watcherSellOfferDetails.length != this.sellOfferDetails.length) {
                this.sellOfferDetails = this.watcherSellOfferDetails;
            }
        }, 1000);
    }
}
