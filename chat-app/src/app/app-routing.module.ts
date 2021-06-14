import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
    {
        path: '',
        loadChildren: './layout/layout.module#LayoutModule'
    },
    {
        path: 'createwallet',
        loadChildren: './createwallet/createwallet.module#CreateWalletModule'
    },
    {
        path: 'setpassword',
        loadChildren: './setpassword/setpassword.module#SetPasswordModule'
    },
    {
        path: '**',
        loadChildren: './notfound/notfound.module#NotFoundModule'
    }
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule { }
