import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MarketplacedemoComponent } from './marketplacedemo.component';
const routes: Routes = [
    { path: '', component: MarketplacedemoComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MarketplacedemoRoutingModule { }
