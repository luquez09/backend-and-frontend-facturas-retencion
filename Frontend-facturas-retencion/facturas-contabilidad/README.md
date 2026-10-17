# Frontend de auditoría de facturas

Interfaz web desarrollada con Angular 17 para cargar archivos de facturas y contabilidad, mostrar un resumen de la auditoría, filtrar y buscar facturas, y consultar el detalle de cada registro. El frontend consume la API FastAPI en `http://127.0.0.1:8000`.

## Requisitos

- Node.js 18.13 o posterior dentro de la rama 18, o 20.9 o posterior dentro de la rama 20.
- npm.
- Backend ejecutándose en `http://127.0.0.1:8000` para procesar archivos.

## Instalar y ejecutar

Desde esta carpeta (`Frontend-facturas-retencion/facturas-contabilidad`):

```powershell
npm ci
npm start
```

Abre <http://localhost:4200/> o <http://localhost:4200/invoice-audit-dashboard>. El servidor de desarrollo recarga la aplicación al detectar cambios en el código.

Para levantar la aplicación completa, sigue también las instrucciones de [ejecución del backend](../../Backend-facturas-retencion/README.md).

## Archivos de entrada

En la pantalla selecciona los dos archivos CSV. La interfaz requiere que:

- El archivo de facturas comience con `facturas` (por ejemplo, `facturas_octubre.csv`).
- El archivo contable comience con `contabilidad` (por ejemplo, `contabilidad_octubre.csv`).
- Cada archivo tenga extensión `.csv`, no esté vacío y pese como máximo 1 MB.

Los encabezados deben coincidir exactamente con los nombres y el orden indicados:

**Facturas**

```text
id_factura,nit_proveedor,fecha_factura,concepto,base_gravable,tarifa_iva,valor_iva,tarifa_retencion,valor_retencion,total_factura
```

**Contabilidad**

```text
id_factura,fecha_contabilizacion,cuenta_contable,centro_costo,valor_debito,valor_credito,estado
```

Las columnas numéricas deben ser reconocidas como números en el CSV. Las fechas deben poder interpretarse como fechas. Ningún campo requerido puede estar vacío. El backend aplica estas validaciones de esquema, independiente de la validación de nombre y tamaño que realiza la interfaz.

## Reglas de auditoría aplicadas por el backend

- Calcula el IVA esperado como `base_gravable × 0.19`.
- Calcula el total esperado como `base_gravable + ivaEsperado − valor_retencion`.
- Marca como duplicadas las facturas que comparten `id_factura` y `fecha_factura`.
- Comprueba si el `id_factura` aparece en el archivo contable.
- Marca una factura como correcta si el IVA y el total coinciden con los valores esperados, no está duplicada y tiene registro contable.

## API utilizada

El frontend envía los dos archivos como `multipart/form-data` al endpoint:

```text
POST http://127.0.0.1:8000/csv/upload
```

Los campos del formulario se llaman `fileFactura` y `fileContabilidad`. La API permite solicitudes desde `http://localhost:4200` y `http://127.0.0.1:4200`.

## Comandos disponibles

```powershell
npm start       # Inicia el servidor de desarrollo
npm run build   # Compila la aplicación en dist/facturas-contabilidad/
npm test        # Ejecuta las pruebas unitarias con Karma
```

## Estructura principal

- `src/app/features/invoice-audit/page/`: pantalla de auditoría.
- `src/app/features/invoice-audit/component/`: carga de archivos, resumen, tabla y modal de detalle.
- `src/app/core/services/invoice.service.ts`: comunicación con la API y estado de facturas, filtros y métricas.
- `src/app/core/models/invoice.model.ts`: modelos de factura y respuesta de la API.
- `src/app/app.routes.ts`: rutas de la aplicación.
