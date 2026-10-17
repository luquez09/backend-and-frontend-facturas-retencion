import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { finalize } from 'rxjs/operators';

import { InvoiceService } from '../../../../core/services/invoice.service';

@Component({
  selector: 'app-file-upload',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './file-upload.component.html',
})
export class FileUploadComponent {
  private readonly invoiceService = inject(InvoiceService);

  readonly archivoFacturas = signal<File | null>(null);
  readonly archivoContable = signal<File | null>(null);

  readonly errorMessage = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);
  readonly isLoading = signal(false);

  private readonly MAX_FILE_SIZE = 1024 * 1024; // 1 MB

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

    if (file.size > this.MAX_FILE_SIZE) {
      return 'El archivo supera el tamaño máximo permitido de 1 MB.';
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
    if (this.isLoading()) {
      return;
    }

    const facturas = this.archivoFacturas();
    const contabilidad = this.archivoContable();

    const errorFacturas = this.validarArchivo(facturas, 'facturas');
    const errorContabilidad = this.validarArchivo(
      contabilidad,
      'contabilidad',
    );

    if (errorFacturas || errorContabilidad) {
      this.errorMessage.set(
        errorFacturas
          ? `Archivo de facturas: ${errorFacturas}`
          : `Archivo contable: ${errorContabilidad}`,
      );
      this.successMessage.set(null);
      return;
    }

    if (!facturas || !contabilidad) {
      return;
    }

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
        error: (error: unknown) => {
          const mensaje =
            error instanceof Error
              ? error.message
              : 'Error al enviar los archivos. Verifica la conexión con el servidor.';

          this.errorMessage.set(mensaje);
          this.successMessage.set(null);
        },
      });
  }
}