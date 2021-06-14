import { SharedModule } from '../../shared.module';
import { NgModule } from '@angular/core';
import { SettingsRoutingModule } from './settings-routing.module';
import { SettingsComponent } from './settings.component';
import { NetworkinfoComponent } from './components/networkinfo/networkinfo.component';
import { PreferencesComponent } from './components/preferences/preferences.component';
import { AboutComponent } from './components/about/about.component';

@NgModule({
    imports: [
        SettingsRoutingModule,
        SharedModule
    ],
    declarations: [
        SettingsComponent,
        NetworkinfoComponent,
        PreferencesComponent,
        AboutComponent
    ]
})
export class SettingsModule { }
