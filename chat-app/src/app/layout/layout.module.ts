import { SharedModule } from '../shared.module';
import { NgModule } from '@angular/core';
import { LayoutRoutingModule } from './layout-routing.module';
import { LayoutComponent } from './layout.component';
import { SidebarComponent, HeaderComponent, MessagesComponent } from '../shared/components';

@NgModule({
    imports: [
        LayoutRoutingModule,
        SharedModule
    ],
    declarations: [
        LayoutComponent,
        HeaderComponent,
        SidebarComponent,
        MessagesComponent,
    ]
})
export class LayoutModule { }
