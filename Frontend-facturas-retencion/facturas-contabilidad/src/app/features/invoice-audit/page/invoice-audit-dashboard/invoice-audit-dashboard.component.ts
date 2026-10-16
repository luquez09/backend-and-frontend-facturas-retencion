import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BehaviorSubject } from 'rxjs';
import { FileUploadComponent } from '../../component/file-upload/file-upload.component';
import { SummaryCardsComponent } from '../../component/summary-cards/summary-cards.component';
import { InvoiceTableComponent } from '../../component/invoice-table/invoice-table.component';
import { InvoiceDetailModalComponent } from '../../component/invoice-detail-modal/invoice-detail-modal.component';
import { Factura } from '../../../../core/models/invoice.model';

@Component({
  selector: 'app-invoice-audit-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FileUploadComponent,
    SummaryCardsComponent,
    InvoiceTableComponent,
    InvoiceDetailModalComponent,
  ],
  templateUrl: './invoice-audit-dashboard.component.html',
})
export class InvoiceAuditDashboardComponent {
  private selectedFacturaSubject = new BehaviorSubject<Factura | null>(null);
  selectedFactura$ = this.selectedFacturaSubject.asObservable();

  openDetail(factura: Factura) {
    this.selectedFacturaSubject.next(factura);
  }

  closeDetail() {
    this.selectedFacturaSubject.next(null);
  }
}
