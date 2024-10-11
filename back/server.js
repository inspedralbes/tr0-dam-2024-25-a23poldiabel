const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const { spawn } = require('child_process');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());
app.use("/img", express.static(path.join(__dirname, 'public'))); 
// Ruta para cargar las preguntas
app.get('/api/preguntes', (req, res) => {
  fs.readFile(path.join(__dirname, 'Projecte0.json'), 'utf8', (err, data) => {
    if (err) {
      return res.status(500).json({ message: 'Error al cargar las preguntas' });
    }
    const preguntes = JSON.parse(data).preguntes;
    res.json(preguntes);
  });
});

// Ruta para agregar una pregunta
app.post('/api/agregar-pregunta', (req, res) => {
  const nuevaPregunta = req.body;
  console.log('Recibido nueva pregunta:', nuevaPregunta);

  // Validación básica
  if (!nuevaPregunta.pregunta || !nuevaPregunta.respostes || nuevaPregunta.respostes.length === 0) {
    return res.status(400).json({ message: 'Formato de pregunta inválido' });
  }

  fs.readFile(path.join(__dirname, 'Projecte0.json'), 'utf8', (err, data) => {
    if (err) {
      console.error('Error al leer el archivo JSON:', err);
      return res.status(500).json({ message: 'Error al leer el archivo de preguntas' });
    }

    const json = JSON.parse(data);
    nuevaPregunta.id = json.preguntes.length > 0 ? json.preguntes[json.preguntes.length - 1].id + 1 : 1;
    json.preguntes.push(nuevaPregunta);

    fs.writeFile(path.join(__dirname, 'Projecte0.json'), JSON.stringify(json, null, 2), (err) => {
      if (err) {
        console.error('Error al escribir en el archivo JSON:', err);
        return res.status(500).json({ message: 'Error al guardar la nueva pregunta' });
      }

      console.log('Pregunta añadida correctamente:', nuevaPregunta);
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
    json.preguntes = json.preguntes.filter(pregunta => pregunta.id !== parseInt(id));

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

    // Actualizar la pregunta
    preguntaActualizada.id = parseInt(id);
    json.preguntes[index] = preguntaActualizada;

    fs.writeFile(path.join(__dirname, 'Projecte0.json'), JSON.stringify(json, null, 2), (err) => {
      if (err) {
        return res.status(500).json({ message: 'Error al guardar la pregunta actualizada' });
      }
      res.json({ message: 'Pregunta actualizada correctamente' });
    });
  });
});

// Ruta para generar estadísticas
app.get('/api/estadisticas/generar', (req, res) => {
  const pythonPath = path.join(__dirname, 'Practica.py');
  const pythonProcess = spawn('python', [pythonPath, 'Estadisticas.JSON']); 

  let hasResponded = false;

  pythonProcess.stdout.on('data', (data) => {
    if (hasResponded) return;

    console.log(`stdout: ${data}`);
    try {
      const resultados = JSON.parse(data);
      res.json(resultados);
      hasResponded = true;
    } catch (error) {
      console.error("Error al parsear la salida de Python:", error);
      if (!hasResponded) {
        res.status(500).json({ message: 'Error al procesar los resultados' });
        hasResponded = true;
      }
    }
  });

  pythonProcess.stderr.on('data', (data) => {
    console.error(`stderr: ${data}`);
    if (!hasResponded) {
      res.status(500).json({ message: 'Error al generar estadísticas' });
      hasResponded = true;
    }
  });

  pythonProcess.on('exit', (code) => {
    console.log(`child process exited with code ${code}`);
    if (!hasResponded && code !== 0) {
      res.status(500).json({ message: 'Error: El proceso de Python falló' });
      hasResponded = true;
    }
  });
});

app.get('/api/estadisticas', (req, res) => {
  fs.readFile(path.join(__dirname, 'Estadisticas.JSON'), 'utf8', (err, data) => {
    if (err) {
      return res.status(500).json({ message: 'Error al cargar las estadísticas' });
    }
    const estadisticas = JSON.parse(data).estadisticas;
    res.json(estadisticas);
  });
});


app.post('/api/agregar-estadistica', (req, res) => {
  const nuevaEstadistica = req.body;
  console.log('Recibida nueva estadística:', nuevaEstadistica);

  if (typeof nuevaEstadistica.respuestas_correctas !== 'number' || !nuevaEstadistica.tiempo_terminado) {
    return res.status(400).json({ message: 'Formato de estadística inválido' });
  }
  let tiempoFormateado;
  if (nuevaEstadistica.tiempo_terminado >= 60) {
    const minutos = Math.floor(nuevaEstadistica.tiempo_terminado / 60);
    const segundos = nuevaEstadistica.tiempo_terminado % 60;
    tiempoFormateado = minutos > 0 ? `${minutos}m` : `${segundos}s`;
  } else {
    tiempoFormateado = `${nuevaEstadistica.tiempo_terminado}s`;
  }

  nuevaEstadistica.tiempo_terminado = tiempoFormateado;

  fs.readFile(path.join(__dirname, 'Estadisticas.JSON'), 'utf8', (err, data) => {
    if (err) {
      console.error('Error al leer el archivo JSON:', err);
      return res.status(500).json({ message: 'Error al leer el archivo de estadísticas' });
    }

    let json;
    try {
      json = JSON.parse(data);
    } catch (parseError) {
      console.error('Error al parsear el JSON:', parseError);
      return res.status(500).json({ message: 'Error al procesar las estadísticas' });
    }

    nuevaEstadistica.id = json.estadisticas.length > 0 ? json.estadisticas[json.estadisticas.length - 1].id + 1 : 1; // Asignar un ID nuevo
    json.estadisticas.push(nuevaEstadistica);

    fs.writeFile(path.join(__dirname, 'Estadisticas.JSON'), JSON.stringify(json, null, 2), (err) => {
      if (err) {
        console.error('Error al escribir en el archivo JSON:', err);
        return res.status(500).json({ message: 'Error al guardar la nueva estadística' });
      }

      console.log('Estadística añadida correctamente:', nuevaEstadistica);
      res.status(201).json({ message: 'Estadística añadida correctamente', estadistica: nuevaEstadistica });
    });
  });
});





// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor escuchando en http://192.168.0.157:${port}`);
});
