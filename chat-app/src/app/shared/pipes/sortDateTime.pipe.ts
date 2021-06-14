import { PipeTransform, Pipe } from "@angular/core";

@Pipe({name: 'SortDateTime'})
export class SortDateTimePipe implements PipeTransform {
  transform(arr:Array<any>): any {
    return arr.sort((a, b) => {
        if (a.dateTime > b.dateTime) {
          return 1;
        }
        if (a.dateTime < b.dateTime) {
          return -1;
        }
        // a must be equal to b
        return 0;
      });
  }
}