import { Component, OnInit } from '@angular/core';
import { DEX_MainContract_Address } from '../../../../addresses.const';
import { DEX_MainContract_ABI } from '../../../../ABI.const';

declare var window: any;
var web3 = window.web3;
declare let CanvasJS, $: any;

@Component({
    selector: 'app-offerbook',
    templateUrl: './offerbook.component.html',
    styleUrls: ['./offerbook.component.scss']
})
export class OfferbookComponent implements OnInit {
    web3: any;
    contract: any;
    coinbase: string;
    contractAddress = DEX_MainContract_Address;
    contractAbi = DEX_MainContract_ABI;
    completedOffersDetails = new Array();
    currencies = ['All'];
    selectedCurrency: string = 'All';
    ngOnInit() {
        if (web3 == undefined) {
            return;
        }
        this.web3 = web3;
        this.coinbase = this.web3.eth.accounts[0];
        this.contract = (this.web3.eth.contract(this.contractAbi)).at(this.contractAddress);
        this.filteroutHistory();
    }

    chartInit(data) {
        var chart = new CanvasJS.Chart("chartContainer",
            {
                animationEnabled: true,
                axisX: {
                    valueFormatString: "MMM",
                    labelFontColor: "#45589e",
                    lineThickness: 0
                },
                axisY: {
                    labelFontColor: "#45589e",
                    includeZero: false,
                    lineThickness: 0,
                    gridColor: "#1d2647",
                },
                backgroundColor: "transparent",
                data: [{
                    yValueFormatString: "$#,###",
                    xValueFormatString: "MMMM",
                    type: "spline",
                    dataPoints: data
                }]
            });
        chart.render();
    }

    filteroutHistory() {
        web3.eth.getBlockNumber((error, result) => {
            this.transactionWatcherForCompletedOffers(result - (365 * 24 * 60 * 60 / 15));
        });
    }

    transactionWatcherForCompletedOffers(blockNumberFromWhereToStartSearch: number) {
        const filter = web3.eth.filter({
            fromBlock: blockNumberFromWhereToStartSearch,
            toBlock: 'latest',
            address: this.contractAddress,
            topics: [web3.sha3("CompleteOffer(bytes32,address,address,address,string,string,uint256,uint256,uint256)")]
        });
        filter.watch((error, result) => {
            if (!error)
                this.AddHistoryDataToList(result);
        });
    }

    AddHistoryDataToList(historyOffer: any) {
        web3.eth.getBlock(historyOffer.blockNumber, (error, block) => {
            let dateTime = new Date(block.timestamp * 1000);
            let encodedData = this.ReformHexStringToArray(historyOffer.data);
            let modelToAdd = {
                ethQuantity: parseInt(encodedData[3], 16),//convert to number
                fiatQuantity: parseInt(encodedData[4], 16),//convert to number
                fiatCurrency: this.DecodeHexToString(encodedData[7]),//convert to string
                dateTime: dateTime,
                price: "Not Calculated"
            };
            modelToAdd.price = (modelToAdd.fiatQuantity / web3.fromWei(modelToAdd.ethQuantity, 'ether')).toFixed(0);

            if ((this.currencies.findIndex(x => x == modelToAdd.fiatCurrency)) < 0) {
                this.currencies.push(modelToAdd.fiatCurrency);
            }
            if (this.selectedCurrency == modelToAdd.fiatCurrency || this.selectedCurrency == 'All') {
                this.completedOffersDetails.push({
                    x: new Date(modelToAdd.dateTime.getFullYear(), modelToAdd.dateTime.getMonth()),
                    y: parseInt(modelToAdd.price)
                });
            }
            this.chartInit(this.completedOffersDetails);
        });
    }

    changeCurrency() {
        this.currencies = ['All'];
        this.completedOffersDetails = new Array();
        this.filteroutHistory();
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
}
