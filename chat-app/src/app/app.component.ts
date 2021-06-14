import { Component, OnDestroy, OnInit } from '@angular/core';
import { Loading } from './shared/services/emitter.service';
import { ExchangeModel } from './shared/models/exchangeData.model'

declare var require: any;
var ipfsAPI = require('ipfs-api')
var ipfs = ipfsAPI('localhost', '5001', { protocol: 'http' })
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {

  loading: boolean = false;
  isSubscribeAlive: boolean = true;
  lockedAmount: number;

  constructor() {

  }

  ngOnInit(): void {
    Loading.takeWhile(() => this.isSubscribeAlive).subscribe((res: boolean) => this.loading = res);
    if (localStorage.length == 0) {
      ipfs.cat(localStorage.getItem("_ipfshash"), (err, result) => {
        localStorage.setItem("_ipfsdata", JSON.parse(result.toString('utf8')))
      });
    }

    if (JSON.parse(localStorage.getItem("amountLockedInBuyOffers")) != null) {
      ExchangeModel.amountLockedInBuyOffers = Number(JSON.parse(localStorage.getItem("amountLockedInBuyOffers")));
    }
    if (JSON.parse(localStorage.getItem("amountLockedInSellOffers")) != null) {
      ExchangeModel.amountLockedInSellOffers = Number(JSON.parse(localStorage.getItem("amountLockedInSellOffers")));
    }
  }

  ngOnDestroy(): void {
    this.isSubscribeAlive = false;
  }

}
