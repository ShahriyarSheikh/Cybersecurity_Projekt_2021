import { NgModule } from '@angular/core';
import { ObjectKeysPipe } from './objectKeys.pipe';
import { TruncatePipe } from './truncate.pipe';
import { SortDateTimePipe } from './sortDateTime.pipe';

@NgModule({
    declarations: [
        ObjectKeysPipe,
        TruncatePipe,
        SortDateTimePipe
    ],
    exports: [
        ObjectKeysPipe,
        TruncatePipe,
        SortDateTimePipe
    ]
})
export class SharedPipesModule { }
