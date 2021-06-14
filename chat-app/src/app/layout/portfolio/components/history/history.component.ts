import { Component, OnInit } from '@angular/core';
import { DEX_MainContract_Address } from '../../../../addresses.const';
import { DEX_MainContract_ABI } from '../../../../ABI.const';

declare var window: any;
var web3 = window.web3;

@Component({
    selector: 'app-history',
    templateUrl: './history.component.html',
    styleUrls: ['./history.component.scss']
})
export class HistoryComponent {
    web3: any;
    contract: any;
    coinbase: string;
    contractAddress = DEX_MainContract_Address;
    contractAbi = DEX_MainContract_ABI;
    offerDetails = new Array();

    ngOnInit() {
        if (web3 == undefined) {
            return;
        }
        this.web3 = web3;
        this.coinbase = this.web3.eth.accounts[0];
        this.contract = (this.web3.eth.contract(this.contractAbi)).at(this.contractAddress);
        this.transactionWatcherForSellOffers();
        this.transactionWatcherForBuyOffers();
    }

    transactionWatcherForSellOffers() {
        const filter = web3.eth.filter({
            fromBlock: '0',
            toBlock: 'latest',
            address: this.contractAddress,
            topics: [web3.sha3("CompleteOffer(bytes32,address,address,address,string,string,uint256,uint256,uint256)"), null, this.ConvertAddressToBase64(this.coinbase), null]
        });
        filter.watch((error, result) => {
            if (!error)
                this.AddHistoryDataToList(result, "Sold");
        });
    }

    transactionWatcherForBuyOffers() {
        const filter = web3.eth.filter({
            fromBlock: '0',
            toBlock: 'latest',
            address: this.contractAddress,
            topics: [web3.sha3("CompleteOffer(bytes32,address,address,address,string,string,uint256,uint256,uint256)"), null, null, this.ConvertAddressToBase64(this.coinbase)]
        });
        filter.watch((error, result) => {
            if (!error)
                this.AddHistoryDataToList(result, "Bought");
        });
    }

    AddHistoryDataToList(historyOffer: any, offerType: string) {
        let dateTime = new Date(0);
        web3.eth.getBlock(historyOffer.blockNumber, (error, block) => {
            dateTime = new Date(block.timestamp * 1000);
            let encodedData = this.ReformHexStringToArray(historyOffer.data);
            let modelToAdd = {
                tradeHash: "0x" + (((historyOffer.topics[1]).split("x"))[1]).replace(/^0+/, ''),//removed extra zeros after 0x
                sellerAddress: "0x" + (((historyOffer.topics[2]).split("x"))[1]).replace(/^0+/, ''),//removed extra zeros after 0x
                buyerAddress: "0x" + (((historyOffer.topics[3]).split("x"))[1]).replace(/^0+/, ''),//removed extra zeros after 0x
                arbitratorAddress: "0x" + (encodedData[0]).replace(/^0+/, ''),//removed extra zeros and added 0x
                ethQuantity: parseInt(encodedData[3], 16),//convert to number
                fiatQuantity: parseInt(encodedData[4], 16),//convert to number
                arbitratorFee: parseInt(encodedData[5], 16),//convert to number
                fiatCurrency: this.DecodeHexToString(encodedData[7]),//convert to string
                paymentMethod: this.DecodeHexToString(encodedData[9]),//convert to string
                offerType: offerType,
                dateTime: dateTime,
                price: "Not Calculated",
                status: "Completed"
            };
            modelToAdd.price = (modelToAdd.fiatQuantity / web3.fromWei(modelToAdd.ethQuantity, 'ether')).toFixed(0);
            this.offerDetails.push(modelToAdd);
        });
    }

    private ReformHexStringToArray(hexString: string) {
        if (hexString == undefined || hexString == null)
            return hexString;

        var result = [];
        let i = 2;
        while (i < hexString.length) {
            result.push(hexString.substr(i, 64));
            i = i + 64;
        }
        return result;
    }

    private DecodeHexToString(hexString: string) {
        if (hexString == undefined || hexString == null) { return hexString; }
        let str = '';
        for (let n = 0; n < hexString.length; n += 2) {
            str += String.fromCharCode(parseInt(hexString.substr(n, 2), 16));
        }
        let str2 = new String(str);
        return str2.replace(/[^A-Z a-z0-9]+/g, '');
    }

    private ConvertAddressToBase64(address: string) {
        if (address == undefined || address == null)
            return address;
        var splittedAddress = address.split("x");
        address = "0x000000000000000000000000" + splittedAddress[1];
        return address;
    }
}
