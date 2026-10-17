import pandas as pd
import json
from pathlib import Path
from typing import List

class CSVValidator:
    def __init__(self):
        current_dir = Path(__file__).resolve().parent
        json_path = current_dir.parent.parent / "Rules" / "DocumentRules.json"

        print(f"Buscando JSON en: {json_path}")
        try:
            with open(json_path, "r") as file:
                self.rules = json.load(file)
        except FileNotFoundError:
            print(f"Archivo JSON no encontrado en: {json_path}")
            self.rules = {}

    def ValidatorFiles(self, df: pd.DataFrame, file_key: str):
        errors = []
        
        structure_errors = self.ValidateStructureFile(df, file_key)
        errors.extend(structure_errors)

        if errors:
            return errors

        type_errors = self.ValidateTypeDataFile(df, file_key)
        errors.extend(type_errors)

        return errors

    def ValidateStructureFile(self, df: pd.DataFrame, file_key: str) -> list:

        
        errors = []

        print(f"Validando estructura de {file_key}...")

        file_config = self.rules.get(file_key, {})
        required_columns = file_config.get("columnas_requeridas", [])

        # Validar que el archivo tenga estructura
        if df.empty and len(df.columns) == 0:
            errors.append(f"El archivo {file_key} no contiene columnas.")
            return errors

        current_columns = list(df.columns)

        missing_cols = [
            col for col in required_columns
            if col not in current_columns
        ]

        if missing_cols:
            errors.append(
                f"Faltan columnas requeridas en {file_key}: {missing_cols}"
            )
            return errors

        for col in required_columns:
            missing_mask = (
                df[col].isna()
                | df[col].astype("string").str.strip().eq("").fillna(False)
            )

            missing_rows = df.index[missing_mask]

            for idx in missing_rows:
                excel_row = idx + 2 if isinstance(idx, int) else idx

                errors.append(
                    f"Registro faltante en {file_key}: "
                    f"fila {excel_row}, columna '{col}'."
                )


        if current_columns != required_columns:
            errors.append(
                f"Las columnas de {file_key} no tienen el orden correcto. "
                f"Orden esperado: {required_columns}. "
                f"Orden actual: {current_columns}."
            )

        required_data = df[required_columns]

        missing_values = (
            required_data.isna() | required_data.astype("string").apply(
                lambda col: col.str.strip().eq("")
            )
        )
        
        rows, cols = missing_values.to_numpy().nonzero()

        for row, col in zip(rows, cols):
            column_name = required_columns[col]
            errors.append(
                f"Fila {df.index[row]}: la columna '{column_name}' "
                f"no tiene un valor válido."
            )

        return errors


    def ValidateTypeDataFile(self, df: pd.DataFrame, file_key: str) -> List[str]:
        errors = []

        file_config = self.rules.get(file_key, {})
        column_types = file_config.get("tipos_dato_requeridos", {})

        if not isinstance(column_types, dict):
            print("Advertencia: 'tipos_dato_requeridos' debe ser un diccionario en el JSON.")
            return errors

        print(f"Validando tipos de dato de {file_key}. Tipos esperados: {column_types}")
        
        
        for column_name, expected_type in column_types.items():
            if column_name not in df.columns:
                continue

            expected = expected_type.strip().lower()
            actual_type = str(df[column_name].dtype)

            series = df[column_name]

            if expected in ("float64", "float", "int64", "int", "numeric", "number"):
                is_match = pd.api.types.is_numeric_dtype(series)

            elif expected in ("str", "string", "object"):
                is_match = (
                    pd.api.types.is_string_dtype(series)
                    or pd.api.types.is_object_dtype(series)
                )

            elif expected in ("date", "datetime", "datetime64"):
                parsed_dates = pd.to_datetime(series, errors="coerce")
                
                non_empty = series.notna() & series.astype(str).str.strip().ne("")

                invalid_dates = non_empty & parsed_dates.isna()
                is_match = not invalid_dates.any()

                if not is_match:
                    rows = (df.index[invalid_dates] + 2).tolist()
                    errors.append(
                        f"Columna '{column_name}' en {file_key} contiene "
                        f"fechas inválidas en las filas: {rows}."
                    )
                    continue

            else:
                is_match = actual_type == expected_type

            if not is_match:
                errors.append(
                    f"Columna '{column_name}' en {file_key} tiene tipo "
                    f"de dato incorrecto. Se esperaba '{expected_type}', "
                    f"pero se encontró '{actual_type}'."
                )


        return errors