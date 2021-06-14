import { Component } from '@angular/core';

declare var window: any;
var web3 = window.web3;

@Component({
    selector: 'app-layout',
    templateUrl: './layout.component.html',
    styleUrls: ['./layout.component.scss']
})
export class LayoutComponent {
    address = null;
    constructor() {
        if (web3 != undefined) {
            this.address = web3.eth.accounts[0];
            let changeAddressInterval = setInterval(() => {
                if (this.address != web3.eth.accounts[0]) {
                    clearInterval(changeAddressInterval);
                    window.location.reload();
                }
            }, 1000);
        }
    }
}
