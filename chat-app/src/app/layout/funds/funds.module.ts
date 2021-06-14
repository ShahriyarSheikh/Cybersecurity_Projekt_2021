import { SharedModule } from '../../shared.module';
import { NgModule } from '@angular/core';
import { FundsRoutingModule } from './funds-routing.module';
import { FundsComponent } from './funds.component';
import { ReceiveFundsComponent } from './components/receivefunds/receivefunds.component';
import { SendFundsComponent } from './components/sendfunds/sendfunds.component';
import { ReservedFundsComponent } from './components/reservedfunds/reservedfunds.component';
import { LockedFundsComponent } from './components/lockedfunds/lockedfunds.component';
import { TransactionsComponent } from './components/transactions/transactions.component';

@NgModule({
    imports: [
        FundsRoutingModule,
        SharedModule
    ],
    declarations: [
        FundsComponent,
        ReceiveFundsComponent,
        SendFundsComponent,
        ReservedFundsComponent,
        LockedFundsComponent,
        TransactionsComponent
    ]
})
export class FundsModule { }
