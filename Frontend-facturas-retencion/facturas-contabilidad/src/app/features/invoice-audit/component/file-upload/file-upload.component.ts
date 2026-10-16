import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InvoiceService } from '../../../../core/services/invoice.service';

@Component({
  selector: 'app-file-upload',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './file-upload.component.html',
  styleUrl: './file-upload.component.css'
})

export class FileUploadComponent {
  invoiceService = inject(InvoiceService);
  selectedFile = signal<File | null>(null);

  isLoading$ = this.invoiceService.isLoading$;

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile.set(input.files[0]);
    }
  }

  executeProcess() {
    const file = this.selectedFile();
    if (!file) return;

    this.invoiceService.uploadAndProcess(file).subscribe({
      next: () => console.log('Procesado con éxito'),
      error: (err) => console.error('Error al procesar:', err)
    });
  }
}
