import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InvoiceService } from '../../../../core/services/invoice.service';
import { Observable, map, of, startWith, catchError } from 'rxjs';

interface InvoiceMetrics {
  total: number;
  correct: number;
  inconsistent: number;
  noAccounting: number;
  ivaDiff: number;
}

@Component({
  selector: 'app-summary-cards',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './summary-cards.component.html'
})
export class SummaryCardsComponent {
  private readonly invoiceService = inject(InvoiceService);

  readonly metrics$: Observable<InvoiceMetrics> =
    this.invoiceService.metrics$.pipe(
      map((metrics: any) => ({
        total: Number(metrics?.total ?? 0),
        correct: Number(metrics?.correctas ?? 0),
        inconsistent: Number(metrics?.inconsistentes ?? 0),
        noAccounting: Number(metrics?.sinRegistroContable ?? 0),
        ivaDiff: Number(metrics?.desviacionIvaTotal ?? 0)
      })),
      startWith({
        total: 0,
        correct: 0,
        inconsistent: 0,
        noAccounting: 0,
        ivaDiff: 0
      }),
      catchError(error => {
        console.error('Error cargando métricas de facturas:', error);

        return of({
          total: 0,
          correct: 0,
          inconsistent: 0,
          noAccounting: 0,
          ivaDiff: 0
        });
      })
    );

    percentage(value: number, total: number): number {
    return total > 0 ? (value / total) * 100 : 0;
  }
}
