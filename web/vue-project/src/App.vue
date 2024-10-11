<template>
  <div class="container">
    <h1>Añadir nueva pregunta</h1>

    <!-- Formulario para añadir o editar preguntas -->
    <input v-model="nuevaPregunta.pregunta" placeholder="Escribe la pregunta" />
    <input v-model="nuevaPregunta.imatge" placeholder="URL de la imagen" />
    <textarea v-model="nuevaPregunta.respostes" placeholder="Respuestas (separadas por /#)"></textarea>
    <input v-model.number="nuevaPregunta.resposta_correcta" placeholder="Índice de respuesta correcta (0-3)" />

    <!-- Mostrar botón de agregar solo si no se está editando -->
    <button v-if="!isEditing" @click="agregarPregunta">Agregar Pregunta</button>

    <!-- Mostrar botón de actualizar solo si se está editando -->
    <button v-if="isEditing" @click="actualizarPregunta">Actualizar Pregunta</button>

    <h1>Eliminar o Editar Pregunta</h1>

    <div v-if="error">{{ error }}</div>
    <div v-if="preguntas.length === 0 && !error">Cargando preguntas...</div>
    <div v-else>
      <div v-for="pregunta in preguntas" :key="pregunta.id" class="pregunta">
        <p><strong>{{ pregunta.pregunta }}</strong></p>
        <img v-if="pregunta.imatge" :src="pregunta.imatge" alt="Imagen de la pregunta" style="max-width: 100%; height: auto; margin-bottom: 10px;" />
        <ul>
          <li v-for="(respuesta, index) in pregunta.respostes" :key="index">{{ index }}: {{ respuesta }}</li>
        </ul>
        <button @click="eliminarPregunta(pregunta.id)">Eliminar</button>
        <button @click="editarPregunta(pregunta)">Editar</button>
      </div>
    </div>

    <h1>Estadísticas</h1>
    <button @click="mostrarEstadisticas">Mostrar Estadísticas</button>
    <div v-if="estadisticas.length > 0">
      <h2>Estadísticas de los usuarios:</h2>
      <table class="estadisticas-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Respuestas Correctas</th>
            <th>Tiempo</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="estadistica in estadisticas" :key="estadistica.id">
            <td>{{ estadistica.id }}</td>
            <td>{{ estadistica.respuestas_correctas }}/10</td>
            <td>{{ estadistica.tiempo_terminado }}</td>
          </tr>
        </tbody>
      </table>
      <GraficoComponent :estadisticas="estadisticas" />
    </div>
  </div>
</template>

<script>
import GraficoComponent from './components/GraficoComponent.vue';

export default {
  components: {
    GraficoComponent
  },
  data() {
    return {
      preguntas: [], // Lista de preguntas
      nuevaPregunta: {
        pregunta: '',
        imatge: '',
        respostes: '',
        resposta_correcta: null,
        id: null // Campo para el ID
      },
      isEditing: false, // Controlar si estamos editando
      error: null, // Para manejar los errores en la carga
      estadisticas: [] // Para almacenar las estadísticas
    };
  },
  mounted() {
    this.cargarPreguntas(); // Cargar preguntas al iniciar
  },
  methods: {
    async cargarPreguntas() {
      try {
        const response = await fetch('http://a23poldiabel.dam.inspedralbes.cat:25867/api/preguntes');
        if (!response.ok) {
          throw new Error('Error al cargar preguntas');
        }
        const data = await response.json();
        this.preguntas = data; // Asignar datos recibidos a la lista de preguntas
      } catch (error) {
        console.error('Error al cargar preguntas:', error);
        this.error = 'Error al cargar preguntas: ' + error.message;
      }
    },

    async mostrarEstadisticas() {
      try {
        const response = await fetch('http://a23poldiabel.dam.inspedralbes.cat:25867/api/estadisticas/generar');
        if (!response.ok) {
          throw new Error('Error al cargar estadísticas');
        }
        const data = await response.json();
        this.estadisticas = data.estadisticas;
        console.log('Estadísticas cargadas:', this.estadisticas);
      } catch (error) {
        console.error('Error al cargar estadísticas:', error);
        this.error = 'Error al cargar estadísticas: ' + error.message;
      }
    },
    
    async agregarPregunta() {
      console.log('Botón Agregar Pregunta clicado');
  
      if (
        this.nuevaPregunta.pregunta.trim() === '' ||
        this.nuevaPregunta.imatge.trim() === '' ||
        this.nuevaPregunta.respostes.trim() === '' ||
        this.nuevaPregunta.resposta_correcta === null
      ) {
        alert('Por favor, completa todos los campos.');
        return;
      }

      const nuevaPregunta = {
          pregunta: this.nuevaPregunta.pregunta,
          imatge: this.nuevaPregunta.imatge,
          respostes: this.nuevaPregunta.respostes.split('/#').map((res) => res.trim()),
          resposta_correcta: this.nuevaPregunta.resposta_correcta
      };


      try {
        const response = await fetch('http://a23poldiabel.dam.inspedralbes.cat:25867/api/agregar-pregunta', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(nuevaPregunta)
        });

        if (!response.ok) {
          const errorResponse = await response.json();
          throw new Error(errorResponse.message || 'Error al añadir la pregunta');
        }

        alert('Pregunta añadida correctamente');
        this.resetForm();
        this.cargarPreguntas();
      } catch (error) {
        console.error('Error al agregar la pregunta:', error);
        alert('Ocurrió un error al enviar la pregunta: ' + error.message);
      }
    },

    async eliminarPregunta(id) {
      try {
        const response = await fetch(`http://a23poldiabel.dam.inspedralbes.cat:25867/api/eliminar-pregunta/${id}`, {
          method: 'DELETE'
        });

        if (!response.ok) {
          throw new Error('Error al eliminar la pregunta');
        }

        this.cargarPreguntas();
      } catch (error) {
        console.error('Error al eliminar la pregunta:', error);
      }
    },

    editarPregunta(pregunta) {
      this.nuevaPregunta = { ...pregunta, respostes: pregunta.respostes.join('/#') };
      this.isEditing = true;
    },

    async actualizarPregunta() {
      if (!this.nuevaPregunta.id) {
        alert('No se puede actualizar, ID no encontrado.');
        return;
      }
      
      try {
        const response = await fetch(`http://a23poldiabel.dam.inspedralbes.cat:25867/api/editar-pregunta/${this.nuevaPregunta.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            ...this.nuevaPregunta,
            respostes: this.nuevaPregunta.respostes.split('/#')
          })
        });

        if (!response.ok) {
          throw new Error('Error al actualizar la pregunta');
        }

        this.cargarPreguntas();
        this.resetForm();
        this.isEditing = false;
      } catch (error) {
        console.error('Error al actualizar la pregunta:', error);
      }
    },

    resetForm() {
      this.nuevaPregunta = { pregunta: '', imatge: '', respostes: '', resposta_correcta: null };
      this.isEditing = false;
    }
  }
};
</script>



<style scoped>
body {
  font-family: Arial, sans-serif;
  background-color: #f4f4f4;
  margin: 0;
  padding: 20px;
  color: black;
}
.container {
  max-width: 800px;
  margin: 0 auto;
  background-color: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  color: black;
}

h1 {
  font-size: 24px;
  color: #333;
  margin-bottom: 20px;
}
input,
textarea {
  width: 100%;
  padding: 10px;
  margin-bottom: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
}
button {
  background-color: #28a745;
  color: black;
  padding: 10px 15px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
button:hover {
  background-color: #218838;
}
.pregunta {
  border-bottom: 1px solid #ccc;
  padding: 10px 0;
}

.imagen-pregunta {
  max-width: 100%;
  height: auto;
  margin-bottom: 10px;
}

.btn {
  padding: 8px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-right: 10px;
}
.btn-primary {
  background-color: #007bff;
  color: white;
}
.btn-danger {
  background-color: #dc3545;
  color: white;
}
.btn-success {
  background-color: #28a745;
  color: white;
}

.btn:hover {
  opacity: 0.9;
}

/* Tabla de estadísticas */
.estadisticas-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
  background-color: #f9f9f9;
}
.estadisticas-table th, 
.estadisticas-table td {
  padding: 10px;
  border: 1px solid #ddd;
  text-align: center;
}
.estadisticas-table th {
  background-color: #f2f2f2;
  font-weight: bold;
}

</style>
