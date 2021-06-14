import { NgModule } from '@angular/core';
import { CreateWalletRoutingModule } from './createwallet-routing.module';
import { CreateWalletComponent } from './createwallet.component';
import { SharedModule } from '../shared.module';

@NgModule({
    imports: [
        CreateWalletRoutingModule,
        SharedModule
    ],
    declarations: [
        CreateWalletComponent
    ]
})
export class CreateWalletModule { }
