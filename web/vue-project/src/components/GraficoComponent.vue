<template>
    <div>
      <canvas id="myChart" width="800" height="400"></canvas> <!-- Ajustar el tamaño aquí -->
    </div>
</template>

<script>
import { Chart, registerables } from 'chart.js';

export default {
  props: {
    estadisticas: {
      type: Array,
      required: true
    }
  },
  mounted() {
    Chart.register(...registerables); // Registra todos los elementos de Chart.js
    this.crearGrafico();
  },
  methods: {
    crearGrafico() {
      const ctx = document.getElementById('myChart').getContext('2d');
      const ids = this.estadisticas.map(stat => stat.id);
      const respuestasCorrectas = this.estadisticas.map(stat => stat.respuestas_correctas);

      // Convertir tiempo de formato "Xm Ys" a segundos
      const tiempos = this.estadisticas.map(stat => {
        const tiempo = stat.tiempo_terminado; // "2m 30s"
        const partes = tiempo.split(' '); // ["2m", "30s"]
        let totalSegundos = 0;

        partes.forEach(p => {
          const valor = parseInt(p); // Obtener el número
          if (p.includes('m')) {
            totalSegundos += valor * 60; // Convertir minutos a segundos
          } else if (p.includes('s')) {
            totalSegundos += valor; // Sumar segundos
          }
        });

        return totalSegundos; // Retornar el tiempo en segundos
      });

      new Chart(ctx, {
        type: 'bar',
        data: {
          labels: ids,
          datasets: [
            {
              label: 'Respuestas Correctas',
              data: respuestasCorrectas,
              backgroundColor: 'rgba(75, 192, 192, 0.2)',
              borderColor: 'rgba(75, 192, 192, 1)',
              borderWidth: 1,
              yAxisID: 'y1' // Asignar a un eje Y
            },
            {
              label: 'Tiempo (segundos)', // Nuevo conjunto de datos
              data: tiempos,
              backgroundColor: 'rgba(153, 102, 255, 0.2)',
              borderColor: 'rgba(153, 102, 255, 1)',
              borderWidth: 1,
              yAxisID: 'y2' // Asignar a otro eje Y
            }
          ]
        },
        options: {
          scales: {
            y1: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Respuestas Correctas'
              }
            },
            y2: {
              beginAtZero: true,
              position: 'right', // Eje Y en la derecha
              title: {
                display: true,
                text: 'Tiempo (segundos)'
              }
            }
          },
          plugins: {
            legend: {
              labels: {
                color: 'black' // Asegúrate de que las etiquetas sean visibles
              }
            }
          }
        }
      });
    }
  }
};
</script>

<style scoped>
canvas {
  max-width: 800px; /* Aumentar el tamaño máximo */
  margin: auto;
  background-color: white; /* Fondo blanco para el canvas */
}
</style>
