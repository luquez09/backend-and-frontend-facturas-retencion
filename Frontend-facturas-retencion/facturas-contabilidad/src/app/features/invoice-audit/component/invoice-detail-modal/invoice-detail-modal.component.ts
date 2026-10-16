import { Component, Input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Factura } from '../../../../core/models/invoice.model';

@Component({
  selector: 'app-invoice-detail-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './invoice-detail-modal.component.html',
  styleUrl: './invoice-detail-modal.component.css'
})
export class InvoiceDetailModalComponent {
  @Input({ required: true }) factura!: Factura;
    onClose = output<void>();

    closeModal() {
      this.onClose.emit();
    }
}
