import pandas as pd
import matplotlib.pyplot as plt
import json
import sys

def generar_graficas(archivo_estadisticas):
    # Leer el archivo y convertirlo en un DataFrame
    try:
        estadisticas = pd.read_json(archivo_estadisticas)
    except ValueError as e:
        print(json.dumps({"error": str(e)}))  # Imprimir el error como JSON
        return None

    # Aplanar el DataFrame
    try:
        estadisticas = estadisticas['estadisticas'].apply(pd.Series)
    except KeyError as e:
        print(json.dumps({"error": str(e)}))
        return None

    # Calcular el promedio de respuestas correctas
    promedio_correctas = estadisticas['respuestas_correctas'].mean()

    # Generar la gráfica de respuestas correctas
    plt.figure(figsize=(10, 5))
    plt.bar(estadisticas['id'], estadisticas['respuestas_correctas'], color='skyblue')
    plt.xlabel('ID de Usuario')
    plt.ylabel('Respuestas Correctas')
    plt.title('Respuestas Correctas por Usuario')
    plt.xticks(estadisticas['id'])
    plt.grid(axis='y')
    plt.savefig('respuestas_correctas.png')  # Guardar la gráfica
    plt.close()

    # Devolver los resultados como JSON
    resultados = {
        "promedio_correctas": promedio_correctas,
        "estadisticas": estadisticas.to_dict(orient='records')
    }
    
    return resultados

if __name__ == "__main__":
    # Esperar la entrada desde el script de Node.js
    archivo_estadisticas = sys.argv[1]
    resultados = generar_graficas(archivo_estadisticas)
    if resultados:
        print(json.dumps(resultados))  # Imprimir los resultados como JSON
