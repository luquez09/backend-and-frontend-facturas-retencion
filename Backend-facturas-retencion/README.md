# backend-facturas-retencion

La Gerencia de Evolución Contable y Tributaria recibe mensualmente un archivo con facturas de proveedores y otro con los registros contabilizados. Actualmente, un analista cruza ambos archivos de forma manual para identificar diferencias en valores, impuestos, retenciones y estados de contabilización.

## Ejecución local

### Requisitos

- Python 3 instalado y disponible desde la terminal.

### 1. Crear el ambiente virtual

Desde la carpeta raíz del proyecto, crea un ambiente virtual llamado `.venv`:

```powershell
python -m venv .venv
```

### 2. Activar el ambiente virtual

En PowerShell:

```powershell
.\.venv\Scripts\Activate.ps1
```

En el símbolo del sistema de Windows (CMD):

```bat
.venv\Scripts\activate.bat
```

Al activarlo, el nombre del ambiente (`.venv`) aparecerá al inicio de la línea de comandos.

### 3. Instalar dependencias

Con el ambiente virtual activo, instala las dependencias del proyecto:

```powershell
python -m pip install -r requeriments.txt
```

> El archivo de dependencias del proyecto se llama `requeriments.txt`.

### 4. Iniciar la API

Desde la raíz del proyecto y con el ambiente virtual activo, ejecuta:

```powershell
python -m uvicorn main:app --reload
```

La API quedará disponible en <http://127.0.0.1:8000>. La documentación interactiva de los endpoints está en <http://127.0.0.1:8000/docs>.

## Consumir la API desde Postman

Con la API en ejecución, configura una solicitud con estos datos:

1. Selecciona el método `POST` y usa la URL `http://127.0.0.1:8000/csv/upload`.
2. Abre la pestaña **Body** y selecciona **form-data**.
3. Agrega los siguientes campos. Para ambos, cambia el tipo de `Text` a `File` y selecciona el archivo correspondiente:

   | Key                | Type   | Valor                   |
   | ------------------ | ------ | ----------------------- |
   | `fileContabilidad` | `File` | Archivo de contabilidad |
   | `fileFactura`      | `File` | Archivo de facturas     |

   Los nombres de las keys deben escribirse exactamente como se muestran. No los envíes como `Text`: el endpoint los recibe como archivos (`UploadFile`) mediante un formulario `multipart/form-data`.

4. Presiona **Send** para enviar la solicitud.

Postman configura automáticamente el encabezado `Content-Type` adecuado al seleccionar **form-data**. No lo agregues manualmente, ya que debe incluir el separador (`boundary`) del formulario.

Para detener el servidor, presiona `Ctrl+C`. Para salir del ambiente virtual, ejecuta:

```powershell
deactivate
```
