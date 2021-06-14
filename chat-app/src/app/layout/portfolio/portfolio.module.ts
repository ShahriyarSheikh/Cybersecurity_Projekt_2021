import { SharedModule } from '../../shared.module';
import { NgModule } from '@angular/core';
import { PortfolioRoutingModule } from './portfolio-routing.module';
import { PortfolioComponent } from './portfolio.component';
import { HistoryComponent } from './components/history/history.component';
import { OpenOffersComponent } from './components/openoffers/openoffers.component';
import { OpenTradesComponent } from './components/opentrades/opentrades.component';

@NgModule({
    imports: [
        PortfolioRoutingModule,
        SharedModule
    ],
    declarations: [
        PortfolioComponent,
        HistoryComponent,
        OpenOffersComponent,
        OpenTradesComponent
    ]
})
export class PortfolioModule { }
