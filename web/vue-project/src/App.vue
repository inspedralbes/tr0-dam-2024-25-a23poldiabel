<template>
  <div class="container">
    <h1>Añadir nueva pregunta</h1>

    <!-- Formulario para añadir o editar preguntas -->
    <input v-model="nuevaPregunta.pregunta" placeholder="Escribe la pregunta" />
    <input v-model="nuevaPregunta.imatge" placeholder="URL de la imagen" />
    <textarea v-model="nuevaPregunta.respostes" placeholder="Respuestas (separadas por /#)"></textarea>
    <input v-model.number="nuevaPregunta.resposta_correcta" placeholder="Índice de respuesta correcta (0-3)" />

    <button @click="isEditing ? actualizarPregunta() : agregarPregunta">{{ isEditing ? 'Actualizar Pregunta' : 'Agregar Pregunta' }}</button>

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
  </div>
</template>

<script>
export default {
  data() {
    return {
      preguntas: [], // Lista de preguntas
      nuevaPregunta: {
        pregunta: '',
        imatge: '',
        respostes: '',
        resposta_correcta: null,
        id: null // Agregar un campo para el ID
      },
      isEditing: false, // Controlar si estamos editando
      error: null // Para manejar los errores en la carga
    };
  },
  mounted() {
    this.cargarPreguntas(); // Cargar preguntas al iniciar
  },
  methods: {
    async cargarPreguntas() {
      try {
        const response = await fetch('http://localhost:3000/api/preguntes');
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

    async agregarPregunta() {
      // Validar que los campos no estén vacíos
      if (
        this.nuevaPregunta.pregunta.trim() === '' ||
        this.nuevaPregunta.imatge.trim() === '' ||
        this.nuevaPregunta.respostes.trim() === '' ||
        this.nuevaPregunta.resposta_correcta === null
      ) {
        alert('Por favor, completa todos los campos.');
        return; // Salir del método si hay campos vacíos
      }

      const nuevaPregunta = {
        pregunta: this.nuevaPregunta.pregunta,
        imatge: this.nuevaPregunta.imatge,
        respostes: this.nuevaPregunta.respostes.split('/#').map((res) => res.trim()),
        resposta_correcta: this.nuevaPregunta.resposta_correcta
      };

      try {
        const response = await fetch('http://localhost:3000/api/agregar-pregunta', {
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
        this.cargarPreguntas(); // Recargar preguntas después de añadir
      } catch (error) {
        console.error('Error al agregar la pregunta:', error);
        alert('Ocurrió un error al enviar la pregunta: ' + error.message);
      }
    },

    async eliminarPregunta(id) {
      if (confirm('¿Estás seguro de que deseas eliminar esta pregunta?')) {
        try {
          const response = await fetch(`http://localhost:3000/api/eliminar-pregunta/${id}`, {
            method: 'DELETE'
          });
          if (!response.ok) {
            throw new Error('Error al eliminar la pregunta');
          }
          alert('Pregunta eliminada correctamente');
          this.cargarPreguntas(); // Recargar preguntas después de eliminar
        } catch (error) {
          console.error('Error al eliminar la pregunta:', error);
          alert('Ocurrió un error al eliminar la pregunta: ' + error.message);
        }
      }
    },

    editarPregunta(pregunta) {
      this.nuevaPregunta = {
        id: pregunta.id,
        pregunta: pregunta.pregunta,
        imatge: pregunta.imatge,
        respostes: pregunta.respostes.join('/#'), // Convertir las respuestas a la forma de entrada
        resposta_correcta: pregunta.resposta_correcta
      };
      this.isEditing = true; // Activar el modo de edición
    },

    async actualizarPregunta() {
      if (
        this.nuevaPregunta.pregunta.trim() === '' ||
        this.nuevaPregunta.imatge.trim() === '' ||
        this.nuevaPregunta.respostes.trim() === '' ||
        this.nuevaPregunta.resposta_correcta === null
      ) {
        alert('Por favor, completa todos los campos.');
        return; // Salir del método si hay campos vacíos
      }

      const preguntaActualizada = {
        ...this.nuevaPregunta,
        respostes: this.nuevaPregunta.respostes.split('/#').map((res) => res.trim())
      };

      try {
        const response = await fetch(`http://localhost:3000/api/editar-pregunta/${preguntaActualizada.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(preguntaActualizada)
        });
        if (!response.ok) {
          const errorResponse = await response.json();
          throw new Error(errorResponse.message || 'Error al actualizar la pregunta');
        }
        alert('Pregunta actualizada correctamente');
        this.resetForm();
        this.cargarPreguntas(); // Recargar preguntas después de editar
      } catch (error) {
        console.error('Error al actualizar la pregunta:', error);
        alert('Ocurrió un error al actualizar la pregunta: ' + error.message);
      }
    },

    resetForm() {
      this.nuevaPregunta = {
        pregunta: '',
        imatge: '',
        respostes: '',
        resposta_correcta: null,
        id: null // Reiniciar el ID
      };
      this.isEditing = false; // Desactivar el modo de edición
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
  max-width: 600px;
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
</style>
