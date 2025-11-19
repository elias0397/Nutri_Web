// Worker que sirve el HTML de la calculadora de dieta
export default {
  async fetch(request, env, ctx) {
    const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Calculadora de Dieta - NutriWeb</title>
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
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .container {
      background: white;
      border-radius: 20px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      padding: 40px;
      max-width: 600px;
      width: 100%;
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
      margin-bottom: 10px;
      font-size: 2em;
      text-align: center;
    }

    .subtitle {
      text-align: center;
      color: #666;
      margin-bottom: 30px;
      font-size: 0.95em;
    }

    .input-group {
      margin-bottom: 20px;
    }

    label {
      display: block;
      font-weight: 600;
      margin-bottom: 8px;
      color: #444;
      font-size: 0.95em;
    }

    input, select {
      width: 100%;
      padding: 12px 15px;
      border-radius: 10px;
      border: 2px solid #e0e0e0;
      font-size: 16px;
      transition: all 0.3s ease;
      background: #f9f9f9;
    }

    input:focus, select:focus {
      outline: none;
      border-color: #667eea;
      background: white;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }

    button {
      width: 100%;
      padding: 15px;
      margin-top: 10px;
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

    .results {
      margin-top: 30px;
      padding: 25px;
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
      border-radius: 15px;
      display: none;
      animation: slideDown 0.5s ease-out;
    }

    @keyframes slideDown {
      from {
        opacity: 0;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .results.show {
      display: block;
    }

    .results h3 {
      color: #333;
      margin-bottom: 20px;
      font-size: 1.5em;
      text-align: center;
    }

    .result-item {
      background: white;
      padding: 15px;
      margin-bottom: 15px;
      border-radius: 10px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .result-label {
      font-weight: 600;
      color: #555;
    }

    .result-value {
      font-size: 1.3em;
      font-weight: 700;
      color: #667eea;
    }

    .macros {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 10px;
      margin-top: 20px;
    }

    .macro-item {
      background: white;
      padding: 15px;
      border-radius: 10px;
      text-align: center;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    }

    .macro-label {
      font-size: 0.85em;
      color: #666;
      margin-bottom: 5px;
    }

    .macro-value {
      font-size: 1.2em;
      font-weight: 700;
      color: #333;
    }

    .goals {
      margin-top: 20px;
      padding: 15px;
      background: white;
      border-radius: 10px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    }

    .goals h4 {
      color: #333;
      margin-bottom: 10px;
    }

    .goal-item {
      padding: 8px 0;
      border-bottom: 1px solid #eee;
      display: flex;
      justify-content: space-between;
    }

    .goal-item:last-child {
      border-bottom: none;
    }

    .goal-label {
      color: #666;
    }

    .goal-value {
      font-weight: 600;
      color: #333;
    }

    @media (max-width: 600px) {
      .container {
        padding: 25px;
      }

      h1 {
        font-size: 1.5em;
      }

      .macros {
        grid-template-columns: 1fr;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>🍎 Calculadora de Dieta</h1>
    <p class="subtitle">Calcula tu metabolismo basal y necesidades calóricas</p>

    <form id="formCalc" onsubmit="calculateResults(event)">
      <div class="input-group">
        <label for="peso">Peso (kg)</label>
        <input type="number" id="peso" step="0.1" min="1" max="500" required />
      </div>

      <div class="input-group">
        <label for="altura">Altura (cm)</label>
        <input type="number" id="altura" step="0.1" min="50" max="300" required />
      </div>

      <div class="input-group">
        <label for="edad">Edad</label>
        <input type="number" id="edad" min="1" max="120" required />
      </div>

      <div class="input-group">
        <label for="sexo">Sexo</label>
        <select id="sexo" required>
          <option value="">Selecciona...</option>
          <option value="h">Hombre</option>
          <option value="m">Mujer</option>
        </select>
      </div>

      <div class="input-group">
        <label for="actividad">Nivel de actividad</label>
        <select id="actividad" required>
          <option value="">Selecciona...</option>
          <option value="1.2">Sedentario (poco o nada de ejercicio)</option>
          <option value="1.375">Ligero (ejercicio 1-3 días/semana)</option>
          <option value="1.55">Moderado (ejercicio 3-5 días/semana)</option>
          <option value="1.725">Intenso (ejercicio 6-7 días/semana)</option>
          <option value="1.9">Muy intenso (ejercicio 2 veces/día)</option>
        </select>
      </div>

      <button type="submit">Calcular</button>
    </form>

    <div id="results" class="results">
      <h3>📊 Tus Resultados</h3>
      
      <div class="result-item">
        <span class="result-label">Tasa Metabólica Basal (TMB)</span>
        <span class="result-value" id="tmb">0</span>
      </div>

      <div class="result-item">
        <span class="result-label">Calorías de Mantenimiento</span>
        <span class="result-value" id="mantenimiento">0</span>
      </div>

      <div class="macros">
        <div class="macro-item">
          <div class="macro-label">Proteínas</div>
          <div class="macro-value" id="proteinas">0g</div>
        </div>
        <div class="macro-item">
          <div class="macro-label">Carbohidratos</div>
          <div class="macro-value" id="carbohidratos">0g</div>
        </div>
        <div class="macro-item">
          <div class="macro-label">Grasas</div>
          <div class="macro-value" id="grasas">0g</div>
        </div>
      </div>

      <div class="goals">
        <h4>🎯 Objetivos Calóricos</h4>
        <div class="goal-item">
          <span class="goal-label">Pérdida de peso (déficit 20%)</span>
          <span class="goal-value" id="perdida">0 kcal</span>
        </div>
        <div class="goal-item">
          <span class="goal-label">Mantenimiento</span>
          <span class="goal-value" id="mantenimiento-goal">0 kcal</span>
        </div>
        <div class="goal-item">
          <span class="goal-label">Aumento de peso (superávit 20%)</span>
          <span class="goal-value" id="aumento">0 kcal</span>
        </div>
      </div>
    </div>
  </div>

  <script>
    function calculateResults(e) {
      e.preventDefault();

      const peso = parseFloat(document.getElementById('peso').value);
      const altura = parseFloat(document.getElementById('altura').value);
      const edad = parseInt(document.getElementById('edad').value);
      const sexo = document.getElementById('sexo').value;
      const actividad = parseFloat(document.getElementById('actividad').value);

      // Calcular TMB (Fórmula de Mifflin-St Jeor)
      let tmb;
      if (sexo === 'h') {
        tmb = 10 * peso + 6.25 * altura - 5 * edad + 5;
      } else {
        tmb = 10 * peso + 6.25 * altura - 5 * edad - 161;
      }

      const mantenimiento = tmb * actividad;

      // Calcular macros (distribución estándar: 30% proteínas, 40% carbohidratos, 30% grasas)
      const proteinas = Math.round((mantenimiento * 0.30) / 4); // 4 kcal por gramo
      const carbohidratos = Math.round((mantenimiento * 0.40) / 4); // 4 kcal por gramo
      const grasas = Math.round((mantenimiento * 0.30) / 9); // 9 kcal por gramo

      // Calcular objetivos calóricos
      const perdida = Math.round(mantenimiento * 0.80);
      const aumento = Math.round(mantenimiento * 1.20);

      // Mostrar resultados
      document.getElementById('tmb').textContent = Math.round(tmb) + ' kcal';
      document.getElementById('mantenimiento').textContent = Math.round(mantenimiento) + ' kcal';
      document.getElementById('mantenimiento-goal').textContent = Math.round(mantenimiento) + ' kcal';
      document.getElementById('proteinas').textContent = proteinas + 'g';
      document.getElementById('carbohidratos').textContent = carbohidratos + 'g';
      document.getElementById('grasas').textContent = grasas + 'g';
      document.getElementById('perdida').textContent = perdida + ' kcal';
      document.getElementById('aumento').textContent = aumento + ' kcal';

      // Mostrar sección de resultados
      const resultsDiv = document.getElementById('results');
      resultsDiv.classList.add('show');
      resultsDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
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

