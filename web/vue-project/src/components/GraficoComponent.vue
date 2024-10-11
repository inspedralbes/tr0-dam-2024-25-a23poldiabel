<template>
    <div>
      <canvas id="myChart" width="800" height="400"></canvas>
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
    Chart.register(...registerables);
    this.crearGrafico();
  },
  methods: {
    crearGrafico() {
      const ctx = document.getElementById('myChart').getContext('2d');
      const ids = this.estadisticas.map(stat => stat.id);
      const respuestasCorrectas = this.estadisticas.map(stat => stat.respuestas_correctas);


      const tiempos = this.estadisticas.map(stat => {
        const tiempo = stat.tiempo_terminado;
        const partes = tiempo.split(' ');
        let totalSegundos = 0;

        partes.forEach(p => {
          const valor = parseInt(p);
          if (p.includes('m')) {
            totalSegundos += valor * 60;
          } else if (p.includes('s')) {
            totalSegundos += valor;
          }
        });

        return totalSegundos;
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
              yAxisID: 'y1'
            },
            {
              label: 'Tiempo (segundos)',
              data: tiempos,
              backgroundColor: 'rgba(153, 102, 255, 0.2)',
              borderColor: 'rgba(153, 102, 255, 1)',
              borderWidth: 1,
              yAxisID: 'y2'
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
              position: 'right',
              title: {
                display: true,
                text: 'Tiempo (segundos)'
              }
            }
          },
          plugins: {
            legend: {
              labels: {
                color: 'black'
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
  max-width: 800px;
  margin: auto;
  background-color: white;
}
</style>
