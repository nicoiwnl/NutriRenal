import pandas as pd
import json

def extraer_establecimientos(file_path):
    # Cargar la hoja de establecimientos
    df = pd.read_excel(file_path, sheet_name='BASE_ESTABLECIMIENTO_2024-12-')
    
    # Renombrar las columnas correctamente
    df.columns = [
        "Nombre Oficial", "Nombre Región", "Nombre Comuna", "Dirección", 
        "Teléfono", "Tiene Servicio de Urgencia", "Latitud", "Longitud"
    ]
    
    # Eliminar la primera fila si contiene nombres repetidos
    df = df.iloc[1:].reset_index(drop=True)
    
    # Convertir los datos en una lista de diccionarios (JSON estructurado)
    establecimientos_json = df.to_dict(orient="records")
    
    # Guardar el JSON en un archivo
    with open("establecimientos.json", "w", encoding="utf-8") as f:
        json.dump(establecimientos_json, f, ensure_ascii=False, indent=4)
    
    return "Archivo establecimientos.json generado con éxito"

# Ejecutar la función con la ruta del archivo
txt = extraer_establecimientos("Establecimientos DEIS MINSAL 31-12-2024.xlsx")
print(txt)
