import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
  name: "filter"
})
export class FilterPipe implements PipeTransform {
  transform(value: any[], args: number): any {
    return value.filter(element => element.toxic[0] <= args);
  }
}
