import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { InvoiceService } from '../../../../core/services/invoice.service';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-file-upload',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './file-upload.component.html',
})
export class FileUploadComponent {
  private invoiceService = inject(InvoiceService);

  archivoFacturas = signal<File | null>(null);
  archivoContable = signal<File | null>(null);

  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);
  isLoading = signal(false);

  private validarArchivo(
    file: File | null,
    prefijo: 'facturas' | 'contabilidad',
  ): string | null {
    if (!file) {
      return 'Debes seleccionar el archivo.';
    }

    const nombre = file.name.toLowerCase();

    if (!nombre.startsWith(prefijo)) {
      return `El archivo debe comenzar con "${prefijo}".`;
    }

    if (!nombre.endsWith('.csv')) {
      return 'Solo se permiten archivos con extensión .csv.';
    }

    if (file.size === 0) {
      return 'El archivo está vacío.';
    }

    return null;
  }

  onFacturasSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;

    this.errorMessage.set(null);
    this.successMessage.set(null);

    const error = this.validarArchivo(file, 'facturas');

    if (error) {
      this.archivoFacturas.set(null);
      input.value = '';
      this.errorMessage.set(`Archivo de facturas: ${error}`);
      return;
    }

    this.archivoFacturas.set(file);
  }

  onContableSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;

    this.errorMessage.set(null);
    this.successMessage.set(null);

    const error = this.validarArchivo(file, 'contabilidad');

    if (error) {
      this.archivoContable.set(null);
      input.value = '';
      this.errorMessage.set(`Archivo contable: ${error}`);
      return;
    }

    this.archivoContable.set(file);
  }

  executeProcess(): void {
    const facturas = this.archivoFacturas();
    const contabilidad = this.archivoContable();

    const errorFacturas = this.validarArchivo(facturas, 'facturas');
    const errorContabilidad = this.validarArchivo(contabilidad, 'contabilidad');

    if (errorFacturas || errorContabilidad) {
      this.errorMessage.set(
        errorFacturas
          ? `Archivo de facturas: ${errorFacturas}`
          : `Archivo contable: ${errorContabilidad}`,
      );
      return;
    }

    if (!facturas || !contabilidad) return;

    this.errorMessage.set(null);
    this.successMessage.set(null);
    this.isLoading.set(true);

    this.invoiceService
      .uploadAndProcess(facturas, contabilidad)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (response) => {
          if (response.status === 'success') {
            this.successMessage.set(
              response.message || 'Archivos procesados correctamente.',
            );
          } else {
            this.errorMessage.set(
              response.message || 'No fue posible procesar los archivos.',
            );
          }
        },
        error: (error: Error) => {
          this.errorMessage.set(
            error.message || 'Error al enviar los archivos.',
          );
        },
      });
  }
}
