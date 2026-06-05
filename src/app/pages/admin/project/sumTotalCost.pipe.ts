import { Pipe, PipeTransform } from '@angular/core';
import { CropRowForm } from './project.component';

@Pipe({
  name: 'sumTotalCost',
  standalone: false,
  pure: false,
})
export class SumTotalCostPipe implements PipeTransform {
  transform(rows: CropRowForm[]): number {
    if (!rows || rows.length === 0) {
      return 0;
    }

    return rows.reduce((sum, r) => {
      const plantCount = Number(r.plantCount || 0);
      const costPerPlant = Number(r.costPerPlant || 0);

      return sum + plantCount * costPerPlant;
    }, 0);
  }
}
