import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { BuyComponent } from './buy.component';
import { BuyTakeOfferComponent } from './components/buytakeoffer/buytakeoffer.component';

const routes: Routes = [
    { path: '', component: BuyComponent },
    { path: 'takeoffer/:id', component: BuyTakeOfferComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BuyRoutingModule { }
