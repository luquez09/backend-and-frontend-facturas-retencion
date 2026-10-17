import { Component, inject, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { map } from 'rxjs/operators';

import { InvoiceService } from '../../../../core/services/invoice.service';
import { Factura, StatusFilter } from '../../../../core/models/invoice.model';

@Component({
  selector: 'app-invoice-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './invoice-table.component.html'
})
export class InvoiceTableComponent {
  readonly invoiceService = inject(InvoiceService);

  readonly onSelectFactura = output<Factura>();

  readonly filteredFacturas$ = this.invoiceService.filteredFacturas$;
  readonly isLoading$ = this.invoiceService.isLoading$;
  readonly errorMessage$ = this.invoiceService.errorMessage$;
  readonly currentFilter$ = this.invoiceService.filterStatus$;

  readonly counts$ = this.invoiceService.facturas$.pipe(
    map(facturas => ({
      total: facturas.length,
      correctas: facturas.filter(f => f.FacturaCorrecta).length,
      inconsistentes: facturas.filter(f => !f.FacturaCorrecta).length,
      sinRegistro: facturas.filter(f => !f.RegistroContable).length,
      duplicadas: facturas.filter(f => f.facturaDuplicada).length
    }))
  );

  selectFilter(filter: StatusFilter): void {
    this.invoiceService.setFilter(filter);
  }

  onSearchChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.invoiceService.setSearch(input.value);
  }

  selectFactura(factura: Factura): void {
    this.onSelectFactura.emit(factura);
  }
}