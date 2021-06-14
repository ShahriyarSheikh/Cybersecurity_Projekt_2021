import { Component, Injectable } from '@angular/core';
import { LocalStorageService } from '../../../../shared/services/localstorage.service';
import { FormGroup } from '@angular/forms';
import { AltCoinAccounts } from '../../../../shared/models/altCoinAccounts.model'
import { ToastyService } from 'ng2-toasty';
@Component({
    selector: 'app-altcoinaccount',
    templateUrl: './altcoinaccount.component.html',
    styleUrls: ['./altcoinaccount.component.scss'],
    providers: [AltCoinAccounts]
})
export class AltcoinAccountComponent {
    isCreateAccountForm: boolean = false;
    addAltCoin: string = null;
    customAccountName: boolean = false;
    altCoinForm: FormGroup;
    userSavedAltcoinAccounts: Array<any> = new Array();

    constructor(private altCoinAccountsFormGroup: AltCoinAccounts, private toastyService: ToastyService) { }

    ngOnInit() {
        this.altCoinForm = this.altCoinAccountsFormGroup.altCoinAccount;
        this.loadAllAltcoinAccountsSaved();
    }

    public saveAltCoinAccount() {
        if (!this.isAddressValid()) {
            this.toastyService.error("invalid address");
        }
        else {
            LocalStorageService.appendUserAltCoinAccounts(this.altCoinForm.value);
            this.isCreateAccountForm = false;
            this.addAltCoin = null;
            this.userSavedAltcoinAccounts.push(this.altCoinForm.value);
            this.altCoinForm.reset();
        }
    }

    loadAllAltcoinAccountsSaved() {
        let altCoins = LocalStorageService.userAltCoinAccounts;
        if (altCoins != null)
            this.userSavedAltcoinAccounts = altCoins;
    }

    changePaymentMethod() {
        this.altCoinForm.get('accountName').setValue(`${this.altCoinForm.get('paymentMethod').value} Account`);
    }

    exportAllAccounts() {
        let altCoins = LocalStorageService.userAltCoinAccounts;
        if (altCoins != null) {
            var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(altCoins));
            var downloadAnchorNode = document.createElement('a');
            downloadAnchorNode.setAttribute("href", dataStr);
            downloadAnchorNode.setAttribute("download", "SavedAltcoinAccounts" + ".json");
            document.body.appendChild(downloadAnchorNode);// required for firefox
            downloadAnchorNode.click();
            downloadAnchorNode.remove();
        }
    }

    importAccount(event) {
        var reader = new FileReader();
        reader.onload = () => {
            let accounts = JSON.parse(atob(reader.result.split(',')[1]));
            accounts.forEach(element => {
                LocalStorageService.appendUserAltCoinAccounts(element);
                this.userSavedAltcoinAccounts.push(element);
            });
        };
        reader.readAsDataURL(event.target.files[0]);
    }

    isAddressValid() {
        if (this.altCoinForm.get('paymentMethod').value == 'Bitcoin') {
            return new RegExp('[13][a-km-zA-HJ-NP-Z0-9]{26,33}').test(this.altCoinForm.get('altCoinAddress').value);
        }
        if (this.altCoinForm.get('paymentMethod').value == 'Tron') {
            return new RegExp('0x[a-fA-F0-9]{40}').test(this.altCoinForm.get('altCoinAddress').value);
        }
        if (this.altCoinForm.get('paymentMethod').value == 'Ripple') {
            return new RegExp('r[rpshnaf39wBUDNEGHJKLM4PQRST7VWXYZ2bcdeCg65jkm8oFqi1tuvAxyz]{27,35}').test(this.altCoinForm.get('altCoinAddress').value);
        }
    }
}
