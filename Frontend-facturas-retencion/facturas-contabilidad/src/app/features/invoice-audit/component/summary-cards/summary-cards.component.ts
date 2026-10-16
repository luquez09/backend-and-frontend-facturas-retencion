import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InvoiceService } from '../../../../core/services/invoice.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-summary-cards',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './summary-cards.component.html'
})
export class SummaryCardsComponent {
  invoiceService = inject(InvoiceService);
  metrics$ = this.invoiceService.metrics$;
}