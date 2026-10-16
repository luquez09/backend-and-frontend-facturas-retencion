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
            print(f"Errores de estructura encontrados en {file_key}: {structure_errors}")
            return errors

        type_errors = self.ValidateTypeDataFile(df, file_key)
        errors.extend(type_errors)

        return errors


    def ValidateStructureFile(self, df: pd.DataFrame, file_key: str) -> list:
        errors = []

        print(f"Validando estructura de {file_key}...")
        print(f"Columnas actuales: {list(df.columns)}")

        file_config = self.rules.get(file_key, {})
        required_columns = file_config.get("columnas_requeridas", [])
        
        # Obtener las columnas actuales del DataFrame como una lista ordenada
        current_columns = list(df.columns)
        
        print(f"Columnas actuales (ordenadas): {current_columns}")
        print(f"Columnas requeridas (ordenadas): {required_columns}")

        # 1. Validar si falta alguna columna en general
        missing_cols = [col for col in required_columns if col not in current_columns]
        if missing_cols:
            errors.append(f"Faltan columnas requeridas en {file_key}: {missing_cols}")
            
        # 2. (Opcional) Validar si el orden es estrictamente el mismo
        elif current_columns != required_columns:
            errors.append(
                f"Las columnas de {file_key} están completas, pero **no tienen el orden correcto**. "
                f"Orden esperado: {required_columns}"
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
            if column_name in df.columns:
                
                actual_type = str(df[column_name].dtype)
                print(f"DEBUG -> Columna '{column_name}' en {file_key}: tipo actual '{actual_type}', se esperaba '{expected_type}'")    
                is_match = False
                if "float" in expected_type.lower() or "int" in expected_type.lower():
                    is_match = pd.api.types.is_numeric_dtype(df[column_name])
                elif expected_type.lower() == "str":
                    is_match = actual_type in ["object", "string", "str"]
                elif expected_type.lower() == "date":
                    print(f"DEBUG -> Validando columna '{column_name}' en {file_key}: tipo actual '{actual_type}', se esperaba 'date'")
                    is_match = pd.to_datetime(df[column_name], errors='coerce').notna().all()
                    print(f"DEBUG -> Columna '{column_name}' en {file_key}: tipo actual '{actual_type}', se esperaba 'date', es fecha: {is_match}")
                else:
                    is_match = (actual_type == expected_type)

                if not is_match:
                    errors.append(
                        f"Columna '{column_name}' en {file_key} tiene tipo de dato incorrecto. "
                        f"Se esperaba '{expected_type}', pero se encontró '{actual_type}'."
                    )

        return errors