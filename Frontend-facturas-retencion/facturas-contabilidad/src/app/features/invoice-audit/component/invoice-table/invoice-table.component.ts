import { Component, inject, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InvoiceService } from '../../../../core/services/invoice.service';
import { Factura, StatusFilter } from '../../../../core/models/invoice.model';

@Component({
  selector: 'app-invoice-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './invoice-table.component.html'
})
export class InvoiceTableComponent {
  invoiceService = inject(InvoiceService);
  onSelectFactura = output<Factura>();

  filteredFacturas$ = this.invoiceService.filteredFacturas$;
  isLoading$ = this.invoiceService.isLoading$;
  errorMessage$ = this.invoiceService.errorMessage$;
  currentFilter$ = this.invoiceService.filterStatus$;

  selectFilter(filter: StatusFilter) {
    this.invoiceService.setFilter(filter);
  }

  onSearchChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.invoiceService.setSearch(input.value);
  }
}