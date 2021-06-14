import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { FundsComponent } from './funds.component';

const routes: Routes = [
    { path: '', component: FundsComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FundsRoutingModule { }
