import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { SharedPipesModule } from './shared';
import { CommonModule } from '@angular/common';
import { LoadingComponent } from './shared/components/loading/loading.component';
import { SocketService } from './shared/services/socket.service';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        SharedPipesModule,
        HttpClientModule
    ],
    declarations: [
        LoadingComponent
    ],
    exports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        HttpClientModule,
        SharedPipesModule,
        LoadingComponent
    ],
    providers:[SocketService]
})
export class SharedModule {
    static forRoot(): ModuleWithProviders {
        return {
            ngModule: SharedModule
        }
    }
}
