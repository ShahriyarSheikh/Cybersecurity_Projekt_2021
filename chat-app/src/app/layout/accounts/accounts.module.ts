import { SharedModule } from '../../shared.module';
import { NgModule } from '@angular/core';
import { AccountsRoutingModule } from './accounts-routing.module';
import { AccountsComponent } from './accounts.component';
import { AltcoinAccountComponent } from './components/altcoinaccount/altcoinaccount.component';
import { ArbitratorSelectionComponent } from './components/arbitratorselection/arbitratorselection.component';
import { BackupComponent } from './components/backup/backup.component';
import { CurrencyAccountComponent } from './components/currencyaccount/currencyaccount.component';
import { WalletPasswordComponent } from './components/walletpassword/walletpassword.component';
import { WalletSeedComponent } from './components/walletseed/walletseed.component';
import { WalletmanagmentComponent } from './components/walletmanagment/walletmanagment.component';
import { ChatSettingComponent } from './components/chatsetting/chatsetting.component';
import { IpfsbackupComponent } from './components/ipfsbackup/ipfsbackup.component';

@NgModule({
    imports: [
        AccountsRoutingModule,
        SharedModule
    ],
    declarations: [
        AccountsComponent,
        AltcoinAccountComponent,
        ArbitratorSelectionComponent,
        BackupComponent,
        CurrencyAccountComponent,
        WalletPasswordComponent,
        WalletSeedComponent,
        WalletmanagmentComponent,
        ChatSettingComponent,
        IpfsbackupComponent
    ]
})
export class AccountsModule { }
