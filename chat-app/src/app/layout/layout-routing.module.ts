import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LayoutComponent } from './layout.component';

const routes: Routes = [
    {
        path: '',
        pathMatch: 'full',
        component: LayoutComponent,
        loadChildren: './home/home.module#HomeModule'
    },
    {
        path: '',
        component: LayoutComponent,
        children: [
            { path: 'sell', loadChildren: './sell/sell.module#SellModule' },
            { path: 'buy', loadChildren: './buy/buy.module#BuyModule' },
            { path: 'funds', loadChildren: './funds/funds.module#FundsModule' },
            { path: 'accounts', loadChildren: './accounts/accounts.module#AccountsModule' },
            { path: 'portfolio', loadChildren: './portfolio/portfolio.module#PortfolioModule' },
            { path: 'settings', loadChildren: './settings/settings.module#SettingsModule' },
            { path: 'marketplacedemo', loadChildren: './marketplacedemo/marketplacedemo.module#MarketplacedemoModule' }
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class LayoutRoutingModule { }
