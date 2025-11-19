// Worker que sirve el HTML de la calculadora de dieta
export default {
  async fetch(request, env, ctx) {
    const html = `<!DOCTYPE html>
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>NutriWeb - Sistema de Gestión Nutricional</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      padding: 20px;
    }

    .container {
      background: white;
      border-radius: 20px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      padding: 40px;
      max-width: 1000px;
      margin: 0 auto;
      animation: fadeIn 0.5s ease-in;
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(-20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    h1 {
      color: #333;
      margin-bottom: 30px;
      font-size: 2em;
      text-align: center;
    }

    .section-header {
      background: #6c757d;
      color: white;
      padding: 12px 20px;
      margin: 30px 0 20px 0;
      border-radius: 8px;
      font-weight: 600;
      font-size: 1.1em;
    }

    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-bottom: 20px;
    }

    .input-group {
      margin-bottom: 20px;
    }

    .input-group.full-width {
      grid-column: 1 / -1;
    }

    label {
      display: block;
      font-weight: 600;
      margin-bottom: 8px;
      color: #444;
      font-size: 0.95em;
    }

    input, select, textarea {
      width: 100%;
      padding: 12px 15px;
      border-radius: 10px;
      border: 2px solid #e0e0e0;
      font-size: 16px;
      transition: all 0.3s ease;
      background: #fffef0;
      font-family: inherit;
    }

    input:focus, select:focus, textarea:focus {
      outline: none;
      border-color: #667eea;
      background: white;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }

    textarea {
      resize: vertical;
      min-height: 100px;
    }

    .unit {
      color: #666;
      font-size: 0.9em;
      margin-left: 5px;
    }

    .note {
      font-size: 0.85em;
      color: #d9534f;
      margin-top: 5px;
      font-style: italic;
    }

    .note.info {
      color: #5bc0de;
    }

    button {
      width: 100%;
      padding: 15px;
      margin-top: 20px;
      border: none;
      border-radius: 10px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      font-size: 18px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
    }

    button:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
    }

    button:active {
      transform: translateY(0);
    }

    @media (max-width: 768px) {
      .form-grid {
        grid-template-columns: 1fr;
      }

      .container {
        padding: 25px;
      }

      h1 {
        font-size: 1.5em;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>🍎 NutriWeb - Sistema de Gestión Nutricional</h1>

    <form id="formPaciente" onsubmit="guardarDatos(event)">
      <div class="section-header">Datos personales del paciente:</div>
      
      <div class="form-grid">
        <div class="input-group full-width">
          <label for="nombre">Nombre y Apellido:</label>
          <input type="text" id="nombre" required />
        </div>

        <div class="input-group">
          <label for="fecha">Fecha:</label>
          <input type="date" id="fecha" required />
        </div>

        <div class="input-group">
          <label for="edad">Edad: <span class="unit">AÑOS</span></label>
          <input type="number" id="edad" min="1" max="120" required />
        </div>

        <div class="input-group">
          <label for="peso">Peso actual: <span class="unit">KG</span></label>
          <input type="number" id="peso" step="0.1" min="1" max="500" required />
        </div>

        <div class="input-group">
          <label for="talla">Talla: <span class="unit">CM</span></label>
          <input type="number" id="talla" step="0.1" min="50" max="300" required />
        </div>

        <div class="input-group">
          <label for="sexo">Sexo:</label>
          <select id="sexo" required>
            <option value="">Selecciona...</option>
            <option value="masculino">Masculino</option>
            <option value="femenino">Femenino</option>
          </select>
        </div>

        <div class="input-group">
          <label for="cintura">CIA DE CINTURA: <span class="unit">CM</span></label>
          <input type="number" id="cintura" step="0.1" min="1" max="200" required />
          <div class="note">> 100 CM indica riesgo cardiovascular.</div>
        </div>

        <div class="input-group">
          <label for="muneca">CIA de Muñeca: <span class="unit">CM</span></label>
          <input type="number" id="muneca" step="0.1" min="1" max="50" required />
        </div>
      </div>

      <div class="section-header">Dx. Médico:</div>
      <div class="input-group">
        <label for="dxMedico">Diagnóstico Médico:</label>
        <textarea id="dxMedico" placeholder="Ingrese el diagnóstico médico del paciente..."></textarea>
      </div>

      <div class="section-header">Dx. Nutricional:</div>
      <div class="input-group">
        <label for="dxNutricional">Diagnóstico Nutricional:</label>
        <textarea id="dxNutricional" placeholder="Siempre el peor rango..."></textarea>
        <div class="note info">Siempre el peor rango.</div>
      </div>

      <button type="submit">Guardar Datos del Paciente</button>
    </form>
  </div>

  <script>
    function guardarDatos(e) {
      e.preventDefault();

      const datos = {
        nombre: document.getElementById('nombre').value,
        fecha: document.getElementById('fecha').value,
        edad: parseInt(document.getElementById('edad').value),
        peso: parseFloat(document.getElementById('peso').value),
        talla: parseFloat(document.getElementById('talla').value),
        sexo: document.getElementById('sexo').value,
        cintura: parseFloat(document.getElementById('cintura').value),
        muneca: parseFloat(document.getElementById('muneca').value),
        dxMedico: document.getElementById('dxMedico').value,
        dxNutricional: document.getElementById('dxNutricional').value
      };

      // Validar riesgo cardiovascular
      if (datos.cintura > 100) {
        alert('⚠️ ADVERTENCIA: La circunferencia de cintura es mayor a 100 CM. Indica riesgo cardiovascular.');
      }

      console.log('Datos del paciente:', datos);
      
      // Aquí puedes agregar la lógica para guardar los datos
      // Por ejemplo: enviar a un servidor, guardar en localStorage, etc.
      
      alert('✅ Datos del paciente guardados correctamente');
    }

    // Establecer fecha actual por defecto
    document.getElementById('fecha').valueAsDate = new Date();
  </script>
</body>
</html>`;

    return new Response(html, {
      headers: {
        'Content-Type': 'text/html; charset=UTF-8',
      },
    });
  },
};

