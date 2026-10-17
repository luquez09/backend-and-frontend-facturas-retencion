# Auditoría de facturas y retenciones

Aplicación local para revisar archivos CSV de facturas y de registros contables. El backend valida la estructura de los archivos y calcula inconsistencias; el frontend permite cargar ambos archivos y consultar los resultados.

## Estructura del proyecto

- `Backend-facturas-retencion/`: API REST con FastAPI y procesamiento de CSV con pandas.
- `Frontend-facturas-retencion/facturas-contabilidad/`: interfaz web desarrollada con Angular 17.

## Requisitos previos

- Python 3 instalado.
- Node.js y npm instalados (Angular CLI 17 requiere Node.js 18.13+ en la rama 18, o 20.9+ en la rama 20).
- PowerShell, Terminal de Windows o una terminal equivalente.

Verifica que los comandos estén disponibles:

```powershell
python --version
node --version
npm --version
```

## Ejecutar la aplicación

Inicia el backend y el frontend en terminales separadas. Mantén ambas terminales abiertas mientras usas la aplicación.

### 1. Backend

En una terminal de PowerShell, desde la carpeta raíz del repositorio:

```powershell
cd Backend-facturas-retencion
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requeriments.txt
python -m uvicorn main:app --reload
```

La API quedará disponible en <http://127.0.0.1:8000>. Puedes verificarla en <http://127.0.0.1:8000/> y consultar los endpoints en <http://127.0.0.1:8000/docs>.

Si PowerShell no permite activar el ambiente virtual, puedes ejecutar el comando de activación de CMD desde una terminal de ese tipo:

```bat
.venv\Scripts\activate.bat
```

### 2. Frontend

Abre otra terminal, también desde la carpeta raíz del repositorio:

```powershell
cd Frontend-facturas-retencion\facturas-contabilidad
npm ci
npm start
```

Angular estará disponible en <http://localhost:4200>. La pantalla de auditoría se puede abrir en <http://localhost:4200/> o <http://localhost:4200/invoice-audit-dashboard>.

## Uso

1. Abre el frontend y selecciona un archivo de facturas y uno contable.
2. El archivo de facturas debe comenzar con `facturas` y el contable con `contabilidad`; ambos deben tener extensión `.csv` y pesar como máximo 1 MB al cargarlos desde la interfaz.
3. Pulsa **Ejecutar Procesamiento**. La interfaz envía ambos archivos al endpoint `POST /csv/upload`.
4. Revisa el estado de las facturas, las inconsistencias y los registros contables en la tabla y el resumen.

La carga requiere que el backend esté activo. Para el formato exacto de los archivos y las reglas de validación, consulta [la guía del frontend](./Frontend-facturas-retencion/facturas-contabilidad/README.md) y [la guía del backend](./Backend-facturas-retencion/README.md).

## Detener los servicios

- En cada terminal, presiona `Ctrl+C`.
- Para salir del ambiente virtual del backend, ejecuta `deactivate`.

## Compilar el frontend

Desde `Frontend-facturas-retencion/facturas-contabilidad`:

```powershell
npm run build
```

Los archivos generados quedan en `dist/facturas-contabilidad/`.
