import { SharedModule } from '../../shared.module';
import { NgModule } from '@angular/core';
import { SellRoutingModule } from './sell-routing.module';
import { SellComponent } from './sell.component';
import { SellOfferComponent } from './components/selloffer/selloffer.component';
import { SellOrdersComponent } from './components/sellorders/sellorders.component';
import { SellTakeOfferComponent } from './components/selltakeoffer/selltakeoffer.component';

@NgModule({
    imports: [
        SellRoutingModule,
        SharedModule
    ],
    declarations: [
        SellComponent,
        SellOfferComponent,
        SellOrdersComponent,
        SellTakeOfferComponent,
    ]
})
export class SellModule { }
