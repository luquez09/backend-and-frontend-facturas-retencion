import pandas as pd


class CSVValidatorRules:
    print("Inicializando reglas de validación para CSVValidatorRules.")

    print("Iniciando calculo de IVA")
    def CalCulateIva(self, df_factura: pd.DataFrame) -> pd.DataFrame:
        df_factura['ivaEsperado'] = df_factura['base_gravable'] * 0.19
        return df_factura

    print("Iniciando validación de total de factura.")
    def ValidateTotalFactura(self, df_factura: pd.DataFrame) -> pd.DataFrame:
        df_factura['totalEsperado'] = df_factura['base_gravable'] + df_factura['ivaEsperado'] - df_factura['tarifa_retencion']
        return df_factura

    print("Iniciando validación de factura duplicada.")
    def ValidateFacturaDuplicada(self, df_factura: pd.DataFrame) -> pd.DataFrame:
        df_duplicada = df_factura.duplicated(subset=['id_factura', 'fecha_factura'], keep=False)
        df_factura['facturaDuplicada'] = df_duplicada
        return df_factura

    print("Iniciando validación de factura sin registro contable.")
    def FacturaSinRegistroContable(self, df_factura: pd.DataFrame, df_contabilidad: pd.DataFrame) -> pd.DataFrame:
        df_factura['RegistroContable'] = df_factura['id_factura'].isin(df_contabilidad['id_factura'])
        return df_factura

    
    def FacturaCorrecta(self, df_factura: pd.DataFrame) -> pd.DataFrame:
        df_factura = df_factura.copy()
        df_factura["FacturaCorrecta"] = False
        df_factura["FacturaError"] = ""

        for index, fila in df_factura.iterrows():

            total_correcto = fila["total_factura"] == fila["totalEsperado"]
            iva_correcto = fila["valor_iva"] == fila["ivaEsperado"]
            no_duplicada = fila["facturaDuplicada"] == False
            registro_correcto = fila["RegistroContable"] == True

            if (
                total_correcto
                and iva_correcto
                and no_duplicada
                and registro_correcto
            ):
                df_factura.at[index, "FacturaCorrecta"] = True
            else:
                df_factura.at[index, "FacturaCorrecta"] = False
                df_factura.at[index, "FacturaError"] = (
                      ("Total incorrecto. " if not total_correcto else "")
                    + ("IVA incorrecto. " if not iva_correcto else "")
                    + ("Factura duplicada. " if not no_duplicada else "")
                    + ("Sin registro contable. " if not registro_correcto else "")
                )

        return df_factura


    