import { Component } from '@angular/core';
import { DEX_MainContract_Address } from '../../../../addresses.const';
import { DEX_MainContract_ABI } from '../../../../ABI.const';
import { promisify } from '../../../../shared/wrappers/wrapper';

declare var window: any;
declare let CanvasJS, $: any;
var web3 = window.web3;
const blockswrtTime = {
    'tenMinBlocks': 10 * 60 / 15,
    'oneHourBlocks': 60 * 60 / 15,
    'oneDayBlocks': 24 * 60 * 60 / 15,
    'oneWeekBlocks': 7 * 24 * 60 * 60 / 15,
    'oneMonthBlocks': 30 * 24 * 60 * 60 / 15,
    'oneYearBlocks': 365 * 24 * 60 * 60 / 15
}

@Component({
    selector: 'app-trades',
    templateUrl: './trades.component.html',
    styleUrls: ['./trades.component.scss']
})
export class TradesComponent {
    web3: any;
    contract: any;
    coinbase: string;
    contractAddress = DEX_MainContract_Address;
    contractAbi = DEX_MainContract_ABI;
    completedOffersDetails = new Array();
    candleBarChartData = new Array();
    volumeBarChartData = new Array();
    currencies = ['All'];
    selectedCurrency: string = 'All';
    blockTimePeriod: string = 'oneYearBlocks';

    async ngOnInit() {
        if (web3 == undefined) {
            return;
        }
        this.web3 = web3;
        this.coinbase = this.web3.eth.accounts[0];
        this.contract = (this.web3.eth.contract(this.contractAbi)).at(this.contractAddress);

        this.filteroutHistory(this.blockTimePeriod);
    }

    volumeBarGraphInit(data) {
        var chartbar = new CanvasJS.Chart("chartContainerbar",
            {
                backgroundColor: "transparent",
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
                data: [
                    {
                        type: "column",
                        color: "#376691",        // change color here
                        dataPoints: data/*[
                            { x: new Date(2017, 0), y: 26060 },
                            { x: new Date(2017, 0), y: 26560 },
                            { x: new Date(2017, 0), y: 27060 },
                            { x: new Date(2017, 1), y: 27980 }
                        ]*/
                    }
                ]
            });
        chartbar.render();
    }

    candleGraphInit(dataPoints) {
        var chartbtc = new CanvasJS.Chart("chartContainerbtc", {
            animationEnabled: true,
            theme: "dark1", // "light1", "light2", "dark1", "dark2"
            //exportEnabled: true,

            axisX: {
                interval: 1,
                valueFormatString: "MMM",
                labelFontColor: "#45589e",
                lineThickness: 0
            },
            axisY: {
                includeZero: false,
                labelFontColor: "#45589e",
                lineThickness: 0,
                gridColor: "#1d2647",
            },
            toolTip: {
                content: "Date: {x}<br /><strong>Price:</strong><br />Open: {y[0]}, Close: {y[3]}<br />High: {y[1]}, Low: {y[2]}"
            },
            backgroundColor: "transparent",
            data: [{

                risingColor: "#00ce7d",
                fallingColor: "#e55541",
                type: "candlestick",
                yValueFormatString: "##0.00",
                dataPoints: dataPoints
            }]
        });
        chartbtc.render();
    }

    filteroutHistory(condition: string) {//condition could be 'all', 'tenMinBlocks', 'oneHourBlocks', 'oneDayBlocks', 'oneWeekBlocks', 'oneMonthBlock', 'oneYearBlocks'
        if (condition == "all") {
            this.transactionWatcherForCompletedOffers(0);
        }
        else {
            web3.eth.getBlockNumber((error, result) => {
                this.transactionWatcherForCompletedOffers(result - blockswrtTime[condition]);
            });
        }
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
                this.AddHistoryDataToList(result, "Sold");
        });
    }

    AddHistoryDataToList(historyOffer: any, offerType: string) {
        web3.eth.getBlock(historyOffer.blockNumber, (error, block) => {
            let dateTime = new Date(block.timestamp * 1000);
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
            if ((this.currencies.findIndex(x => x == modelToAdd.fiatCurrency)) < 0) {
                this.currencies.push(modelToAdd.fiatCurrency);
            }
            if (this.selectedCurrency == modelToAdd.fiatCurrency || this.selectedCurrency == 'All') {
                let _date = new Date(modelToAdd.dateTime.getFullYear(), modelToAdd.dateTime.getMonth(), modelToAdd.dateTime.getDate());
                let _index = this.candleBarChartData.findIndex(s => s.date == _date.toString());
                let _price = parseFloat(modelToAdd.price);
                if (_index >= 0) {

                    if (modelToAdd.dateTime.getTime() < this.candleBarChartData[_index].opentime) {
                        this.candleBarChartData[_index].y[0] = _price;
                        this.candleBarChartData[_index].opentime = modelToAdd.dateTime.getTime();
                    }
                    else if (modelToAdd.dateTime.getTime() > this.candleBarChartData[_index].closetime) {
                        this.candleBarChartData[_index].y[3] = _price;
                        this.candleBarChartData[_index].closetime = modelToAdd.dateTime.getTime();
                    }

                    if (_price > this.candleBarChartData[_index].y[1])
                        this.candleBarChartData[_index].y[1] = _price;
                    else if (_price < this.candleBarChartData[_index].y[2])
                        this.candleBarChartData[_index].y[2] = _price;
                } else {
                    this.candleBarChartData.push({
                        date: _date.toString(),
                        opentime: modelToAdd.dateTime.getTime(),
                        closetime: modelToAdd.dateTime.getTime(),
                        x: _date,
                        y: [_price, _price, _price, _price]
                    });
                }
                this.candleGraphInit(this.candleBarChartData);

                this.completedOffersDetails.push(modelToAdd);

                let _yearMonth = new Date(modelToAdd.dateTime.getFullYear(), modelToAdd.dateTime.getMonth());
                let _volumeBarIndex = this.volumeBarChartData.findIndex(x => x.date == _yearMonth.toString());
                let _ethQty = parseFloat(web3.fromWei(modelToAdd.ethQuantity, 'ether'));
                if (_volumeBarIndex >= 0){
                    this.volumeBarChartData[_volumeBarIndex].y = (this.volumeBarChartData[_volumeBarIndex].y + _ethQty)
                }else{
                    this.volumeBarChartData.push(
                        {
                            date: _yearMonth.toString(),
                            x: _yearMonth,
                            y: _ethQty
                        }
                    );
                }
                this.volumeBarGraphInit(this.volumeBarChartData);
            }
        });
    }

    changeCurrencyOrTimePeriod() {
        this.candleGraphInit([]);
        this.currencies = ['All'];
        this.candleBarChartData = new Array();
        this.completedOffersDetails = new Array();
        this.volumeBarChartData = new Array();
        this.filteroutHistory(this.blockTimePeriod);
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
