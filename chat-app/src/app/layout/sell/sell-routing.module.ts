import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SellComponent } from './sell.component';
import { SellTakeOfferComponent } from './components/selltakeoffer/selltakeoffer.component';

const routes: Routes = [
    { path: '', component: SellComponent },
    { path: 'takeoffer/:id', component: SellTakeOfferComponent } 
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SellRoutingModule { }
