import { Component } from '@angular/core';
import { FiatCurrencyAccounts } from '../../../../shared/models/fiatCurrencyAccounts.model';
import { FormGroup } from '@angular/forms';
import { LocalStorageService } from '../../../../shared/services/localstorage.service';
import { Regions } from '../../../../shared/const/Regions';
import { ArrayType } from '@angular/compiler/src/output/output_ast';
import { asTextData } from '../../../../../../node_modules/@angular/core/src/view';
import {CURRENCYNAMES} from '../currency.const'

declare var window: any;
declare var Gun: any;
const web3 = window.web3;

@Component({
    selector: 'app-currencyaccount',
    templateUrl: './currencyaccount.component.html',
    styleUrls: ['./currencyaccount.component.scss'],
    providers: [FiatCurrencyAccounts, LocalStorageService]
})
export class CurrencyAccountComponent {
    isCreateAccountForm: boolean = false;
    addFormName: string = 'alipay';
    coinbase: string = null;

    gun = Gun({ init: true });
    web3 = window.web3;

    alipayAccountForm: FormGroup;
    appCashAccountForm: FormGroup;
    cashDepositeAccountForm: FormGroup;
    perfectMoneyAccountForm: FormGroup;
    venmoAccountForm: FormGroup;
    westernUnionAccountForm: FormGroup;
    userSavedFiatAccounts: Array<any> = new Array();
    selectedFiatAccountIndex: number;
    regions = Object.keys(Regions);
    country = Regions[this.regions[0]];
    customAccountName: boolean = false;
    currencies = CURRENCYNAMES ;
    constructor(private fiatCurrencyAccountsFormGroup: FiatCurrencyAccounts) {

    }

    ngOnInit() {
        if (web3 !== undefined) {
            this.web3 = web3;
            this.coinbase = this.web3.eth.accounts[0];

        }
        // else {
        //     //this.web3 = new Web3(new Web3.providers.HttpProvider("http://192.168.100.20:8545"));
        // }
        this.loadAllFiatAccountsSaved();
        this.alipayAccountForm = this.fiatCurrencyAccountsFormGroup.aliPayAccount;
        this.appCashAccountForm = this.fiatCurrencyAccountsFormGroup.cashAppAccount;
        this.cashDepositeAccountForm = this.fiatCurrencyAccountsFormGroup.cashDepositeAccount;
        this.perfectMoneyAccountForm = this.fiatCurrencyAccountsFormGroup.perfectMoneyAccount;
        this.venmoAccountForm = this.fiatCurrencyAccountsFormGroup.venmoAccount;
        this.westernUnionAccountForm = this.fiatCurrencyAccountsFormGroup.westernUnionAccount;


        if (this.coinbase != null) {
            const user = this.gun.user();

            user.create(this.coinbase, 'password', function (ack) {
            });

            user.auth(this.coinbase, 'password', function (ack, err) {
                if (ack) {
                    console.log('Auth Successful');
                } else {
                    console.log('Auth Failed');
                }
            });
        }
    }

    changeRegion(region: string) {
        this.country = Regions[region];
    }

    accountGunSave(saveAccount) {
        const save = this.gun.get('accounts');
        save.set(saveAccount);
        LocalStorageService.appendUserFiatCurrencyAccounts(saveAccount);
    }

    aliPayAccountFormsubmission() {
        this.accountGunSave(this.alipayAccountForm.value);
        this.isCreateAccountForm = false;
        this.userSavedFiatAccounts.push(this.alipayAccountForm.value);
        this.alipayAccountForm.reset();
    }
    appCashAccountFormsubmission() {
        this.accountGunSave(this.appCashAccountForm.value);
        this.isCreateAccountForm = false;
        this.userSavedFiatAccounts.push(this.appCashAccountForm.value);
        this.appCashAccountForm.reset();
    }
    cashDepositeAccountFormsubmission() {
        this.accountGunSave(this.cashDepositeAccountForm.value);
        this.isCreateAccountForm = false;
        this.userSavedFiatAccounts.push(this.cashDepositeAccountForm.value);
        this.cashDepositeAccountForm.reset();
    }
    perfectMoneyAccountFormsubmission() {
        this.accountGunSave(this.perfectMoneyAccountForm.value);
        this.isCreateAccountForm = false;
        this.userSavedFiatAccounts.push(this.perfectMoneyAccountForm.value);
        this.perfectMoneyAccountForm.reset();
    }
    venmoAccountFormsubmission() {
        this.accountGunSave(this.venmoAccountForm.value);
        this.isCreateAccountForm = false;
        this.userSavedFiatAccounts.push(this.venmoAccountForm.value);
        this.venmoAccountForm.reset();
    }
    westernUnionAccountFormsubmission() {
        this.accountGunSave(this.westernUnionAccountForm.value);
        this.isCreateAccountForm = false;
        this.userSavedFiatAccounts.push(this.westernUnionAccountForm.value);
        this.westernUnionAccountForm.reset();
    }

    loadAllFiatAccountsSaved() {
        const fiatAccounts = LocalStorageService.userFiatCurrencyAccounts;
        if (fiatAccounts != null) {
            this.userSavedFiatAccounts = fiatAccounts;
            this.selectedFiatAccountIndex = 0;
        }
        // getting the values from GunDB
        // this.gun.get('accounts').map((accounts) => {
        //     this.userSavedFiatAccounts.push(accounts);
        // });
    }

    exportAllAccounts() {
        const fiatAccounts = LocalStorageService.userFiatCurrencyAccounts;
        if (fiatAccounts != null) {
            const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(fiatAccounts));
            const downloadAnchorNode = document.createElement('a');
            downloadAnchorNode.setAttribute('href', dataStr);
            downloadAnchorNode.setAttribute('download', 'SavedCurrencyAccounts' + '.json');
            document.body.appendChild(downloadAnchorNode); // required for firefox
            downloadAnchorNode.click();
            downloadAnchorNode.remove();
        }
    }

    importAccount(event) {
        const reader = new FileReader();
        reader.onload = () => {
            const accounts = JSON.parse(atob(reader.result.split(',')[1]));
            accounts.forEach(element => {
                LocalStorageService.appendUserFiatCurrencyAccounts(element);
                this.userSavedFiatAccounts.push(element);
            });
        };
        reader.readAsDataURL(event.target.files[0]);
    }
}
