import { Component, OnInit } from '@angular/core';
import { DEX_MainContract_Address } from '../../../../addresses.const';
import { promisify } from '../../../../shared/wrappers/wrapper';
import { DEX_MainContract_ABI } from '../../../../ABI.const';
import { LocalStorageService } from '../../../../shared/services/localstorage.service';

const EmptyAddress = '0x0000000000000000000000000000000000000000';
declare var window: any;
var web3 = window.web3;

@Component({
    selector: 'app-opentrades',
    templateUrl: './opentrades.component.html',
    styleUrls: ['./opentrades.component.scss']
})
export class OpenTradesComponent implements OnInit {
    web3: any;
    contract: any;
    coinbase: string;
    contractAddress = DEX_MainContract_Address;
    contractAbi = DEX_MainContract_ABI;
    matchedRequestsResults: any;
    offerDetails = new Array();
    
    ngOnInit() {
        if (web3 == undefined) {
            return;
        }
        this.web3 = web3;
        this.coinbase = this.web3.eth.accounts[0];
        // Start    
        this.contract = (this.web3.eth.contract(this.contractAbi)).at(this.contractAddress);
        // End
        this.transactionWatcherForSellOffers();
        this.transactionWatcherForBuyOffers();
        this.loadAllMatchedHistory();
    }

    loadAllMatchedHistory(){
        this.matchedRequestsResults = LocalStorageService.requestMatchNotifications;
    }

    transactionWatcherForSellOffers() {
        const filter = web3.eth.filter({
            fromBlock: '0',
            toBlock: 'latest',
            address: this.contractAddress,
            topics: [web3.sha3("SellOfferPlaced(address,bytes32)", this.ConvertAddressToBase64(this.coinbase))]
        });
        filter.watch((error, result) => {
            this.LoadSellTradeDetailsFromTradeHash(result.topics[2]);
        });
    }

    transactionWatcherForBuyOffers() {
        const filter = web3.eth.filter({
            fromBlock: '0',
            toBlock: 'latest',
            address: this.contractAddress,
            topics: [web3.sha3("BuyOfferPlaced(address,bytes32)", this.ConvertAddressToBase64(this.coinbase))]
        });
        filter.watch((error, result) => {
            this.LoadBuyTradeDetailsFromTradeHash(result.topics[2]);
        });
    }

    async LoadSellTradeDetailsFromTradeHash(hash) {
        let offerDetails = await promisify(cb => this.contract.getSellOfferFromTradeHash(hash, cb));

        if (offerDetails[4] == EmptyAddress || (offerDetails[4] == EmptyAddress && offerDetails[5] == EmptyAddress))
            return;

        if (offerDetails[4] == this.coinbase && offerDetails[5] != EmptyAddress)
            this.addOfferToList(offerDetails, hash, "Sell ETH");

        else if (offerDetails[5] == this.coinbase) {
            this.addOfferToList(offerDetails, hash, "Buy ETH");
        }
    }

    async LoadBuyTradeDetailsFromTradeHash(hash) {
        let offerDetails = await promisify(cb => this.contract.getBuyOfferFromTradeHash(hash, cb));

        if (offerDetails[5] == EmptyAddress || (offerDetails[4] == EmptyAddress && offerDetails[5] == EmptyAddress))
            return;

        if (offerDetails[5] == this.coinbase && offerDetails[4] != EmptyAddress)
            this.addOfferToList(offerDetails, hash, "Buy ETH");

        else if (offerDetails[4] == this.coinbase) {
            this.addOfferToList(offerDetails, hash, "Sell ETH");
        }
    }

    private addOfferToList(offerDetails, hash, offerType) {
        this.offerDetails.push({
            tradeHash: hash,
            fiatCurrency: offerDetails[0],
            paymentMethod: offerDetails[1],
            ethQuantity: offerDetails[2],
            fiatQuantity: offerDetails[3],
            sellerAddress: offerDetails[4],
            buyerAddress: offerDetails[5],
            arbitratorAddress: offerDetails[6],
            offerType: offerType
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
