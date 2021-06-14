import { SharedModule } from '../../shared.module';
import { NgModule } from '@angular/core';
import { MarketplacedemoRoutingModule } from './marketplacedemo-routing.module';
import { MarketplacedemoComponent } from './marketplacedemo.component';

@NgModule({
    imports: [

    MarketplacedemoRoutingModule,
        SharedModule
    ],
    declarations: [
        MarketplacedemoComponent
    ]
})
export class MarketplacedemoModule { }
