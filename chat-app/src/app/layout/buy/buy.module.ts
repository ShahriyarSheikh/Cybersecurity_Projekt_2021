import { SharedModule } from '../../shared.module';
import { NgModule } from '@angular/core';
import { BuyRoutingModule } from './buy-routing.module';
import { BuyComponent } from './buy.component';
import { BuyOfferComponent } from './components/buyoffer/buyoffer.component';
import { BuyOrdersComponent } from './components/buyorders/buyorders.component';
import { BuyTakeOfferComponent } from './components/buytakeoffer/buytakeoffer.component';

@NgModule({
    imports: [
        BuyRoutingModule,
        SharedModule
    ],
    declarations: [
        BuyComponent,
        BuyOfferComponent,
        BuyOrdersComponent,
        BuyTakeOfferComponent,
    ]
})
export class BuyModule { }
