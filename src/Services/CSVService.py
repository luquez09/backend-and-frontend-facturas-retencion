import io
import traceback
import pandas as pd
from fastapi import UploadFile, HTTPException
from src.Services.Utils.CSVValidator import CSVValidator

# Instanciar el validador
validator = CSVValidator()

class CSVServices:
    @staticmethod
    async def upload_documents(fileContabilidad: UploadFile, fileFactura: UploadFile):
        try:
            # 1. Depuración de nombres y archivos recibidos
            print("--- INICIANDO PROCESAMIENTO DE DOCUMENTOS ---")
            print(f"Archivo Contabilidad recibido: {fileContabilidad.filename if fileContabilidad else 'NULO'}")
            print(f"Archivo Factura recibido: {fileFactura.filename if fileFactura else 'NULO'}")

            # Validar existencia y extensión
            if not fileContabilidad or not fileContabilidad.filename or not fileContabilidad.filename.endswith('.csv'):
                print("DEBUG -> Error: El archivo de contabilidad no es válido o no existe.")
                return {"error": "El archivo de contabilidad es obligatorio y debe ser .csv"}
            
            if not fileFactura or not fileFactura.filename or not fileFactura.filename.endswith('.csv'):
                print("DEBUG -> Error: El archivo de factura no es válido o no existe.")
                return {"error": "El archivo de factura es obligatorio y debe ser .csv"}

            # 2. Leer contenido binario
            content_contabilidad = await fileContabilidad.read()
            content_factura = await fileFactura.read()

            print("DEBUG -> Archivos leídos en memoria binaria correctamente.")

            # 3. Convertir a DataFrames de Pandas
            try:
                df_contabilidad = pd.read_csv(io.BytesIO(content_contabilidad))
                df_factura = pd.read_csv(io.BytesIO(content_factura))
                print(f"DEBUG -> CSV Contabilidad cargado. Columnas: {list(df_contabilidad.columns)}")
                print(f"DEBUG -> CSV Factura cargado. Columnas: {list(df_factura.columns)}")
            except Exception as read_err:
                # Esto captura si el archivo CSV está corrupto o mal formado
                print(f"ERROR DE PANDAS AL LEER CSV: {str(read_err)}")
                return {"error": f"El formato interno del CSV no es válido: {str(read_err)}"}

            # 4. Ejecutar validación de estructuras usando el validador
            print("----------------- Validando archivo de contabilidad--------------------------")
            errors_contabilidad = validator.ValidatorFiles(df_contabilidad, "fileContabilidad")
            print("----------------- Validando archivo de factura--------------------------")
            errors_factura = validator.ValidatorFiles(df_factura, "fileFactura")

            print(f"DEBUG -> Errores Contabilidad: {errors_contabilidad}")
            print(f"DEBUG -> Errores Factura: {errors_factura}")

            # Consolidar errores si existen
            all_errors = errors_contabilidad + errors_factura
            if all_errors:
                return {
                    "status": "validation_failed",
                    "errorsContabilidad": errors_contabilidad,
                    "errorsFactura": errors_factura
                }

            return {
                "status": "success",
                "message": "Los documentos se procesaron y validaron exitosamente."
            }

        except Exception as e:
            # Captura cualquier error no controlado imprimiendo la traza completa en tu terminal
            print("--- ERROR CRITICO NO CONTROLADO ---")
            traceback.print_exc()
            return {"error": f"Error interno en el servidor: {str(e)}"}