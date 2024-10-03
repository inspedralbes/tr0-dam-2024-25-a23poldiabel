const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(express.json()); // Para parsear el cuerpo de las peticiones JSON

// Ruta para cargar las preguntas
app.get('/api/preguntes', (req, res) => {
  fs.readFile(path.join(__dirname, 'Projecte0.json'), 'utf8', (err, data) => {
    if (err) {
      return res.status(500).json({ message: 'Error al cargar las preguntas' });
    }
    const preguntes = JSON.parse(data).preguntes;
    res.json(preguntes); // Enviar las preguntas al frontend
  });
});

// Ruta para agregar una pregunta
app.post('/api/agregar-pregunta', (req, res) => {
  const nuevaPregunta = req.body;

  fs.readFile(path.join(__dirname, 'Projecte0.json'), 'utf8', (err, data) => {
    if (err) {
      return res.status(500).json({ message: 'Error al leer el archivo de preguntas' });
    }

    const json = JSON.parse(data);
    nuevaPregunta.id = json.preguntes.length + 1; // Asignar un ID nuevo
    json.preguntes.push(nuevaPregunta); // Añadir la nueva pregunta

    fs.writeFile(path.join(__dirname, 'Projecte0.json'), JSON.stringify(json, null, 2), (err) => {
      if (err) {
        return res.status(500).json({ message: 'Error al guardar la nueva pregunta' });
      }
      res.status(201).json({ message: 'Pregunta añadida correctamente' });
    });
  });
});

// Ruta para eliminar una pregunta
app.delete('/api/eliminar-pregunta/:id', (req, res) => {
  const { id } = req.params;

  fs.readFile(path.join(__dirname, 'Projecte0.json'), 'utf8', (err, data) => {
    if (err) {
      return res.status(500).json({ message: 'Error al leer el archivo de preguntas' });
    }

    const json = JSON.parse(data);
    json.preguntes = json.preguntes.filter(pregunta => pregunta.id !== parseInt(id)); // Filtrar la pregunta a eliminar

    fs.writeFile(path.join(__dirname, 'Projecte0.json'), JSON.stringify(json, null, 2), (err) => {
      if (err) {
        return res.status(500).json({ message: 'Error al guardar la lista de preguntas' });
      }
      res.json({ message: 'Pregunta eliminada correctamente' });
    });
  });
});

// Ruta para editar una pregunta
app.put('/api/editar-pregunta/:id', (req, res) => {
  const { id } = req.params;
  const preguntaActualizada = req.body;

  fs.readFile(path.join(__dirname, 'Projecte0.json'), 'utf8', (err, data) => {
    if (err) {
      return res.status(500).json({ message: 'Error al leer el archivo de preguntas' });
    }

    const json = JSON.parse(data);
    const index = json.preguntes.findIndex(pregunta => pregunta.id === parseInt(id));

    if (index === -1) {
      return res.status(404).json({ message: 'Pregunta no encontrada' });
    }

    json.preguntes[index] = preguntaActualizada; // Actualizar la pregunta

    fs.writeFile(path.join(__dirname, 'Projecte0.json'), JSON.stringify(json, null, 2), (err) => {
      if (err) {
        return res.status(500).json({ message: 'Error al guardar la pregunta actualizada' });
      }
      res.json({ message: 'Pregunta actualizada correctamente' });
    });
  });
});

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});
