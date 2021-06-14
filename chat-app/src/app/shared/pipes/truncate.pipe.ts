import { Pipe, PipeTransform } from "@angular/core";

@Pipe({ name: 'truncate' })
export class TruncatePipe implements PipeTransform {
    transform(value: string, max: number): string {
        if (value == null)
            return;
        let _truncate = value.substring(0, max);
        if (value.length > max) {
            _truncate = _truncate + "...";
        }
        return _truncate;
    }
}