import { NgModule } from '@angular/core';
import { NotFoundRoutingModule } from './notfound-routing.module';
import { NotFoundComponent } from './notfound.component';
import { SharedModule } from '../shared.module';

@NgModule({
    imports: [
        NotFoundRoutingModule,
        SharedModule
    ],
    declarations: [
        NotFoundComponent
    ]
})
export class NotFoundModule { }
