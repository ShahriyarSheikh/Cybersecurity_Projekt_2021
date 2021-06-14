import { SharedModule } from '../../shared.module';
import { NgModule } from '@angular/core';
import { HomeRoutingModule } from './home-routing.module';
import { HomeComponent } from './home.component';
import { OfferbookComponent } from './components/offerbook/offerbook.component';
import { TradesComponent } from './components/trades/trades.component';
import { SpreadComponent } from './components/spread/spread.component';
import { OffersToBuyComponent } from './components/offerbook/components/offersToBuy/offersToBuy.component';
import { OffersToSellComponent } from './components/offerbook/components/offersToSell/offersToSell.component';

@NgModule({
    imports: [
        HomeRoutingModule,
        SharedModule
    ],
    declarations: [
        HomeComponent,
        TradesComponent,
        OfferbookComponent,
        OffersToSellComponent,
        OffersToBuyComponent,
        SpreadComponent
    ]
})
export class HomeModule { }
