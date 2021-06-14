import { NgModule } from '@angular/core';
import { SetPasswordRoutingModule } from './setpassword-routing.module';
import { SetPasswordComponent } from './setpassword.component';
import { SharedModule } from '../shared.module';

@NgModule({
    imports: [
        SetPasswordRoutingModule,
        SharedModule
    ],
    declarations: [
        SetPasswordComponent
    ]
})
export class SetPasswordModule { }
