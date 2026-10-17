import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError, combineLatest } from 'rxjs';
import { tap, finalize, map, catchError, startWith } from 'rxjs/operators';
import { ApiResponseFacturas, Factura, StatusFilter } from '../models/invoice.model';

@Injectable({
  providedIn: 'root'
})
export class InvoiceService {
  private http = inject(HttpClient);
  private apiUrl = 'http://127.0.0.1:8000/csv/upload';

  private facturasSubject = new BehaviorSubject<Factura[]>([]);
  private isLoadingSubject = new BehaviorSubject<boolean>(false);
  private errorMessageSubject = new BehaviorSubject<string | null>(null);
  private filterStatusSubject = new BehaviorSubject<StatusFilter>('ALL');
  private searchTermSubject = new BehaviorSubject<string>('');

  facturas$ = this.facturasSubject.asObservable();
  isLoading$ = this.isLoadingSubject.asObservable();
  errorMessage$ = this.errorMessageSubject.asObservable();
  filterStatus$ = this.filterStatusSubject.asObservable();
  searchTerm$ = this.searchTermSubject.asObservable();
  
  metrics$ = this.facturas$.pipe(
    map(list => ({
      total: list.length,
      correctas: list.filter(f => f.FacturaCorrecta).length,
      inconsistentes: list.filter(f => !f.FacturaCorrecta).length,
      sinRegistroContable: list.filter(f => !f.RegistroContable).length,
      desviacionIvaTotal: list.reduce((acc, f) => acc + Math.abs(f.ivaEsperado - f.valor_iva), 0)
    }))
  );

  filteredFacturas$: Observable<Factura[]>;

  constructor() {
    this.filteredFacturas$ = combineLatest({
      facturas: this.facturas$,
      filter: this.filterStatus$,
      search: this.searchTerm$
    }).pipe(
      map(({ facturas, filter, search }) => {
        let result = [...facturas];
        const searchTerm = search.toLowerCase().trim();

        switch (filter) {
        case 'CORRECT':
          result = result.filter(f => f.FacturaCorrecta);
          break;

        case 'ERROR':
          result = result.filter(f => !f.FacturaCorrecta);
          break;

        case 'NO_RECORD':
          result = result.filter(f => !f.RegistroContable);
          break;

        case 'DUPLICATED':
          result = result.filter(f => f.facturaDuplicada);
          break;
      }

        if (searchTerm) {
          result = result.filter(f =>
            f.id_factura.toLowerCase().includes(searchTerm) ||
            f.nit_proveedor.toString().includes(searchTerm) ||
            f.concepto.toLowerCase().includes(searchTerm)
          );
        }
        return result;
      })
    );
  }

  uploadAndProcess(fileFactura: File, contableFile: File): Observable<ApiResponseFacturas> {
    this.isLoadingSubject.next(true);
    this.errorMessageSubject.next(null);

    const formData = new FormData();
    formData.append('fileFactura', fileFactura);
    formData.append('fileContabilidad', contableFile);

    return this.http.post<ApiResponseFacturas>(`${this.apiUrl}`, formData)
    .pipe(
      tap((response) => {
        console.log('Respuesta de la API:', response);
        if (response.status === 'success') {
          this.facturasSubject.next(response.dataFactura);
        } else {
          this.errorMessageSubject.next(response.message || 'Error en la respuesta de la API');
        }
      }),
      catchError((error) => {
        const msg = error.error?.message || 'Error al conectar con el servidor.';
        this.errorMessageSubject.next(msg);
        return throwError(() => new Error(msg));
      }),
      finalize(() => this.isLoadingSubject.next(false))
    );
  }

  setFilter(status: StatusFilter) {
    this.filterStatusSubject.next(status);
  }

  setSearch(term: string) {
    this.searchTermSubject.next(term);
  }
}