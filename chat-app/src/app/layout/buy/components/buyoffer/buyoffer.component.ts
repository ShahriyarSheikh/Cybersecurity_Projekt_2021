import { Component, OnInit } from '@angular/core';
import { LocalStorageService } from '../../../../shared/services/localstorage.service';
import { DEX_MainContract_ABI } from '../../../../ABI.const';
import { DEX_MainContract_Address } from '../../../../addresses.const';
import { promisify } from '../../../../shared/wrappers/wrapper';
import { Router } from '@angular/router';
import { Loading } from '../../../../shared/services/emitter.service';
import { CreateNewOffer } from '../../../../shared/models/createnewoffer.model';
import { FormGroup } from '../../../../../../node_modules/@angular/forms';
import { SocketService } from '../../../../shared/services/socket.service';

declare var require: any;
declare var window: any;
var web3 = window.web3;
//var Web3 = require('web3');

@Component({
    selector: 'app-buyoffer',
    templateUrl: './buyoffer.component.html',
    styleUrls: ['./buyoffer.component.scss'],
    providers: [CreateNewOffer]
})
export class BuyOfferComponent implements OnInit {

    contractAbi = DEX_MainContract_ABI;
    contractAddress = DEX_MainContract_Address;
    web3: any;
    contract: any;
    coinbase: string;
    userSavedFiatAccounts: Array<any> = Array();
    selectedFiatAccountIndex: any;
    arbitratorList: any;
    currentArbitratorCount: any;
    isRequestMatch: boolean;
    isRegularOffer: boolean;
    form: FormGroup;
    formForRequestmatch: FormGroup;

    constructor(private router: Router, private createNewOfferForm: CreateNewOffer, private socketService: SocketService) { }

    ngOnInit() {
        this.loadAllFiatAccountsSaved();
        if (web3 == undefined) {
            return;
        }
        this.web3 = web3;
        this.form = this.createNewOfferForm.form;
        this.formForRequestmatch = this.createNewOfferForm.formForRequestMatch;
        this.coinbase = this.web3.eth.accounts[0];
        this.LoadContract();
        this.watchNewSellOrderPlaced();
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


    loadAllFiatAccountsSaved() {
        this.userSavedFiatAccounts = LocalStorageService.userFiatCurrencyAccounts;
        this.selectedFiatAccountIndex = 0;
    }

    clearForm() {
        this.selectedFiatAccountIndex = 0;
        this.form.get("fiatQuantity").setValue(undefined);
        this.form.get("ethQuantity").setValue(undefined);
    }
    clearFormForRequestmatch() {
        this.selectedFiatAccountIndex = 0;
        this.formForRequestmatch.get("fiatQuantity").setValue(undefined);
        this.formForRequestmatch.get("ethQuantity").setValue(undefined);
        this.formForRequestmatch.get("deviationAllowedForEthQuantityInPercentage").setValue(undefined);
        this.formForRequestmatch.get("deviationAllowedForFiatQuantityInPercentage").setValue(undefined);
    }

    async placeOfferInContract() {
        Loading.emit(true);
        if (this.selectedFiatAccountIndex != undefined && this.form.value.fiatQuantity != undefined && this.form.value.ethQuantity != undefined
            && this.selectedFiatAccountIndex >= 0 && this.selectedFiatAccountIndex < this.userSavedFiatAccounts.length && this.form.value.fiatQuantity > 0 && this.form.value.ethQuantity > 0) {
            if (this.contract != undefined) {
                await promisify(cb => this.contract.placeBuyOffer(
                    this.userSavedFiatAccounts[this.selectedFiatAccountIndex].currency,
                    this.userSavedFiatAccounts[this.selectedFiatAccountIndex].paymentMethod,
                    this.web3.toWei(this.form.value.ethQuantity),
                    this.form.value.fiatQuantity,
                    this.form.value.arbitratorAddress,
                    this.web3.toWei(0.1), cb)).catch(error => {
                        Loading.emit(false);
                    });
                this.clearForm();
            }
        }
    }
    async placeRequestMatchOffer() {
        if (this.selectedFiatAccountIndex != undefined && this.formForRequestmatch.value.fiatQuantity != undefined && this.formForRequestmatch.value.ethQuantity != undefined
            && this.selectedFiatAccountIndex >= 0 && this.selectedFiatAccountIndex < this.userSavedFiatAccounts.length && this.formForRequestmatch.value.fiatQuantity > 0 && this.formForRequestmatch.value.ethQuantity > 0) {
            this.socketService.SendOrderForMatch({
                address: this.coinbase,
                dateTime: new Date(),
                fiatCurrency: this.userSavedFiatAccounts[this.selectedFiatAccountIndex].currency,
                paymentMethod: this.userSavedFiatAccounts[this.selectedFiatAccountIndex].paymentMethod,
                ethQuantity: this.web3.toWei(this.formForRequestmatch.value.ethQuantity),
                fiatQuantity: this.formForRequestmatch.value.fiatQuantity,
                deviationAllowedForFiatQuantityInPercentage: this.formForRequestmatch.value.deviationAllowedForFiatQuantityInPercentage,
                deviationAllowedForEthQuantityInPercentage: this.formForRequestmatch.value.deviationAllowedForEthQuantityInPercentage,
                type: 'Buy'
            });
            // this.clearForm();
        }
    }

    watchNewSellOrderPlaced() {
        const filter = web3.eth.filter({
            fromBlock: 'pending',
            toBlock: 'latest',
            address: this.contractAddress,
            topics: [web3.sha3("BuyOfferPlaced(address,bytes32)"), this.ConvertAddressToBase64(this.coinbase)]
        })
        filter.watch((error, result) => {
            Loading.emit(false);
            this.router.navigateByUrl(`/portfolio`);
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
