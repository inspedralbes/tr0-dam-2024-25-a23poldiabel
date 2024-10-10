const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const { spawn } = require('child_process'); // Importar el módulo para ejecutar scripts de Python

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

app.post('/api/agregar-pregunta', (req, res) => {
  const nuevaPregunta = req.body;
  console.log('Recibido nueva pregunta:', nuevaPregunta); // Log para depurar

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
    nuevaPregunta.id = json.preguntes.length + 1; // Asignar un ID nuevo
    json.preguntes.push(nuevaPregunta); // Añadir la nueva pregunta

    fs.writeFile(path.join(__dirname, 'Projecte0.json'), JSON.stringify(json, null, 2), (err) => {
      if (err) {
        console.error('Error al escribir en el archivo JSON:', err);
        return res.status(500).json({ message: 'Error al guardar la nueva pregunta' });
      }

      console.log('Pregunta añadida correctamente:', nuevaPregunta); // Log para depurar
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

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname))); // Servir archivos estáticos

function generar_graficas(filename) {
    // Lógica para generar estadísticas
    try {
        // Simula la generación de estadísticas
        const estadisticas = [
            { id: 1, respuestas_correctas: 7, tiempo_terminado: "2m 30s" },
            { id: 2, respuestas_correctas: 5, tiempo_terminado: "1m 45s" }
        ];

        // Guardar el JSON en un archivo, si es necesario
        fs.writeFileSync(filename, JSON.stringify({ estadisticas }, null, 2));

        return { estadisticas }; // Retornar las estadísticas generadas
    } catch (error) {
        console.error("Error generando estadísticas:", error);
        return null; // En caso de error
    }
}
// Ruta para generar estadísticas
app.get('/api/estadisticas/generar', (req, res) => {
    // Asegúrate de que esta ruta es correcta y apunta al archivo Practica.py
    const pythonPath = path.join(__dirname, 'Practica.py'); // Asegúrate de que esta ruta sea correcta
    const pythonProcess = spawn('python', [pythonPath, 'Estadisticas.JSON']); 

    pythonProcess.stdout.on('data', (data) => {
        console.log(`stdout: ${data}`);
        try {
            const resultados = JSON.parse(data); // Intentar parsear los datos como JSON
            res.json(resultados); // Devolver los resultados al cliente
        } catch (error) {
            console.error("Error al parsear la salida de Python:", error);
            res.status(500).json({ message: 'Error al procesar los resultados' });
        }
    });

    pythonProcess.stderr.on('data', (data) => {
        console.error(`stderr: ${data}`);
        res.status(500).json({ message: 'Error al generar estadísticas' });
    });

    pythonProcess.on('exit', (code) => {
        console.log(`child process exited with code ${code}`);
    });
});
 

app.get('/api/estadisticas', (req, res) => {
  fs.readFile(path.join(__dirname, 'Estadisticas.JSON'), 'utf8', (err, data) => {
    if (err) {
      return res.status(500).json({ message: 'Error al cargar las estadísticas' });
    }
    const estadisticas = JSON.parse(data).estadisticas;
    res.json(estadisticas); // Enviar las estadísticas al frontend
  });
});

app.post('/api/agregar-estadistica', (req, res) => {
  const nuevaEstadistica = req.body;
  console.log('Recibida nueva estadística:', nuevaEstadistica); // Log para depurar

  // Validación básica
  if (!nuevaEstadistica.respuestas_correctas || !nuevaEstadistica.tiempo_terminado) {
    return res.status(400).json({ message: 'Formato de estadística inválido' });
  }

  fs.readFile(path.join(__dirname, 'Estadisticas.JSON'), 'utf8', (err, data) => {
    if (err) {
      console.error('Error al leer el archivo JSON:', err);
      return res.status(500).json({ message: 'Error al leer el archivo de estadísticas' });
    }

    const json = JSON.parse(data);
    nuevaEstadistica.id = json.estadisticas.length + 1; // Asignar un ID nuevo
    json.estadisticas.push(nuevaEstadistica); // Añadir la nueva estadística

    fs.writeFile(path.join(__dirname, 'Estadisticas.JSON'), JSON.stringify(json, null, 2), (err) => {
      if (err) {
        console.error('Error al escribir en el archivo JSON:', err);
        return res.status(500).json({ message: 'Error al guardar la nueva estadística' });
      }

      console.log('Estadística añadida correctamente:', nuevaEstadistica); // Log para depurar
      res.status(201).json({ message: 'Estadística añadida correctamente' });
    });
  });
});













  

// Iniciar el servidor
app.listen(port, () => {
    console.log(`Servidor escuchando en http://192.168.1.173:${port}`);
});
