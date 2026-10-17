import io
from pickle import loads
import traceback
import pandas as pd
from fastapi import UploadFile
from src.Services.Utils.CSVValidator import CSVValidator
from src.Services.Utils.CSVValidatorRules import CSVValidatorRules

validator = CSVValidator()
validator_rules = CSVValidatorRules()

class CSVServices:
    @staticmethod
    async def upload_documents(fileContabilidad: UploadFile, fileFactura: UploadFile):
        try:
            if not fileContabilidad or not fileContabilidad.filename or not fileContabilidad.filename.endswith('.csv'):
                return {"error": "El archivo de contabilidad es obligatorio y debe ser .csv"}
            
            if not fileFactura or not fileFactura.filename or not fileFactura.filename.endswith('.csv'):
                return {"error": "El archivo de factura es obligatorio y debe ser .csv"}

            content_contabilidad = await fileContabilidad.read()
            content_factura = await fileFactura.read()

            try:
                df_contabilidad = pd.read_csv(io.BytesIO(content_contabilidad))
                df_factura = pd.read_csv(io.BytesIO(content_factura))
            except Exception as read_err:
                return {"error": f"El formato interno del CSV no es válido: {str(read_err)}"}

            errors_contabilidad = validator.ValidatorFiles(df_contabilidad, "fileContabilidad")
            errors_factura = validator.ValidatorFiles(df_factura, "fileFactura")

            all_errors = errors_contabilidad + errors_factura
            if all_errors:
                return {
                    "status": "validation_failed",
                    "errorsContabilidad": errors_contabilidad,
                    "errorsFactura": errors_factura,
                    "message" : all_errors
                }

            df_factura = validator_rules.CalCulateIva(df_factura)
            df_factura = validator_rules.ValidateTotalFactura(df_factura)
            df_factura = validator_rules.ValidateFacturaDuplicada(df_factura)
            df_factura = validator_rules.FacturaSinRegistroContable(df_factura, df_contabilidad)
            df_factura = validator_rules.FacturaCorrecta(df_factura)

            print(df_factura.to_dict(orient="records"))

            return {
                "status": "success",
                "message": "Los documentos se procesaron y validaron exitosamente.",
                "dataFactura": df_factura.to_dict(orient="records")
            }

        except Exception as e:
            traceback.print_exc()
            return {"error": f"Error interno en el servidor: {str(e)}"}