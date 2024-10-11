import pandas as pd
import matplotlib.pyplot as plt
import json
import sys
import os

def generar_graficas(archivo_estadisticas):
    try:
        estadisticas = pd.read_json(archivo_estadisticas)
    except ValueError as e:
        print(json.dumps({"error": str(e)}))
        return None

    try:
        estadisticas = estadisticas['estadisticas'].apply(pd.Series)
    except KeyError as e:
        print(json.dumps({"error": str(e)}))
        return None

    promedio_correctas = estadisticas['respuestas_correctas'].mean()

    plt.figure(figsize=(10, 5))
    plt.bar(estadisticas['id'], estadisticas['respuestas_correctas'], color='skyblue')
    plt.xlabel('ID de Usuario')
    plt.ylabel('Respuestas Correctas')
    plt.title('Respuestas Correctas por Usuario')
    plt.xticks(estadisticas['id'])
    plt.grid(axis='y')

    directorio_actual = os.path.dirname(os.path.abspath(__file__))
    ruta_guardado = os.path.join(directorio_actual, 'public', 'respuestas_correctas.png') 
    plt.savefig(ruta_guardado)
    plt.close()

    resultados = {
        "promedio_correctas": promedio_correctas,
        "estadisticas": estadisticas.to_dict(orient='records')
    }
    
    return resultados

if __name__ == "__main__":
    archivo_estadisticas = sys.argv[1]
    resultados = generar_graficas(archivo_estadisticas)
    if resultados:
        print(json.dumps(resultados))
