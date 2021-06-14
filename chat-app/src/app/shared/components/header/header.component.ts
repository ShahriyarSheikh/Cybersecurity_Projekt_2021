import { Component, OnInit } from '@angular/core';
import { ExchangeModel } from '../../models/exchangeData.model';
import { DEX_Token } from '../../../ABI.const';
import { DEX_Token_Address } from '../../../addresses.const';
import { promisify } from '../../../shared/wrappers/wrapper';
declare var window: any;
var web3 = window.web3;
@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
    web3: any;
    coinbase: string;
    accountBalance: string;
    dexTokens;
    userName: string;
    contractAbi = DEX_Token;
    contractAddress = DEX_Token_Address;
    DexTokenContract: any;
    //lockedInTrades:number = 0;
    exchangeData = ExchangeModel
    ngOnInit() {
        if (web3 != undefined) {
            this.web3 = web3;
        }
        else {
            //this.web3 = new Web3(new Web3.providers.HttpProvider("http://192.168.100.20:8545"));
        }
        this.coinbase = this.web3.eth.accounts[0];

        this.exchangeData.userName = localStorage.getItem("_nickName");
        this.getBalance();
        this.LoadContract();

        //     setInterval(() => {
        //     this.lockedInTrades = this.exchangeData.amountLockedInTrade;
        // }, 1000);

    }

    LoadContract() {
        this.DexTokenContract = (this.web3.eth.contract(this.contractAbi)).at(this.contractAddress);
        this.getTokenBalance();
    }

    async getTokenBalance() {
       this.dexTokens = await promisify(cb => this.DexTokenContract.balanceOf(this.coinbase, cb));
    }

    public getBalance() {
        setInterval(() => {
            this.web3.eth.getBalance(this.coinbase, (err, balance) => {
                this.accountBalance = this.web3.fromWei(balance, "ether") + " ETH"
            });
        }, 1000);

    }
}