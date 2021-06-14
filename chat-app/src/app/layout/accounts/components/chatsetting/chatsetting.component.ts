import { Component, OnInit } from '@angular/core';
import { LocalStorageService } from '../../../../shared/services/localstorage.service';
import { ExchangeModel } from '../../../../shared/models/exchangeData.model';
import { DEX_MainContract_ABI } from '../../../../ABI.const';
import { promisify } from '../../../../shared/wrappers/wrapper';
import { DEX_MainContract_Address } from '../../../../addresses.const';

declare var window: any;
var web3 = window.web3;

@Component({
    selector: 'app-chatsetting',
    templateUrl: './chatsetting.component.html',
    styleUrls: ['./chatsetting.component.scss']
})
export class ChatSettingComponent implements OnInit {

    web3: any;
    contract: any;
    coinbase: string;


    nickname: string;
    profilepic: string;
    matchingFees: number;
    alreadyDepositedAmount;

    ngOnInit(): void {
        this.nickname = LocalStorageService.nickName;
        this.web3 = web3;
        this.coinbase = this.web3.eth.accounts[0];
        this.LoadContract();
    }

    async LoadContract() {
        this.contract = (this.web3.eth.contract(DEX_MainContract_ABI)).at(DEX_MainContract_Address);
        this.web3.eth.defaultAccount = this.coinbase;
        this.alreadyDepositedAmount = await promisify(cb => this.contract.getLockedMatchingFeeTokens(this.coinbase, cb));
    }

    saveNickName() {
        LocalStorageService.nickName = this.nickname;
        ExchangeModel.userName = LocalStorageService.nickName
    }

    async depositMatchingFees() {
        await promisify(cb => this.contract.lockMatchingFeeTokens(this.web3.toWei(this.matchingFees, 'ether'), cb)).catch(error => { });
    }

}
