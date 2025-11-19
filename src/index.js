// Worker que sirve el HTML de la calculadora de dieta
export default {
  async fetch(request, env, ctx) {
    const html = `<!DOCTYPE html>
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>NutriWeb - Sistema de Cálculo Nutricional</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }

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
      from { opacity: 0; transform: translateY(-20px); }
      to { opacity: 1; transform: translateY(0); }
    }

    h1 { color: #333; margin-bottom: 30px; font-size: 2em; text-align: center; }

    .section-header {
      background: #6c757d;
      color: white;
      padding: 12px 20px;
      margin: 30px 0 20px 0;
      border-radius: 8px;
      font-weight: 600;
      font-size: 1.1em;
    }

    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
    .input-group { margin-bottom: 20px; }
    .input-group.full-width { grid-column: 1 / -1; }

    label { display: block; font-weight: 600; margin-bottom: 8px; color: #444; font-size: 0.95em; }

    input, select, textarea {
      width: 100%; padding: 12px 15px; border-radius: 10px; border: 2px solid #e0e0e0;
      font-size: 16px; transition: all 0.3s ease; background: #fffef0; font-family: inherit;
    }

    input:focus, select:focus, textarea:focus {
      outline: none; border-color: #667eea; background: white;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }

    textarea { resize: vertical; min-height: 100px; }

    .unit { color: #666; font-size: 0.9em; margin-left: 5px; }
    .note { font-size: 0.85em; color: #d9534f; margin-top: 5px; font-style: italic; }
    .note.info { color: #5bc0de; }

    button {
      width: 100%; padding: 15px; margin-top: 20px; border: none; border-radius: 10px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; font-size: 18px;
      font-weight: 600; cursor: pointer; transition: all 0.3s ease; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
    }

    button:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6); }
    button:active { transform: translateY(0); }

    /* colores para interpretaciones */
    .chip { display:inline-block; padding:6px 10px; border-radius:999px; font-weight:700; color:#fff; margin-left:8px; font-size:0.95em; }
    .chip.normal { background: #2e7d32; }        /* verde */
    .chip.sobrepeso { background: #ff9800; }     /* naranja */
    .chip.obesidad { background: #d32f2f; }      /* rojo */
    .chip.desnutricion { background: #6a1b9a; }  /* morado */

    .result-card { margin-top: 40px; padding: 20px; background: #f8f9fa; border-radius: 15px; border: 2px solid #e0e0e0; }
    .result-row { display: flex; justify-content: space-between; gap: 12px; align-items: center; margin: 8px 0; }
    .result-label { color: #333; font-weight: 600; }
    .result-value { color: #111; font-weight: 700; }
    .small-note { font-size: 0.9em; color: #666; margin-top: 6px; }

    @media (max-width: 768px) {
      .form-grid { grid-template-columns: 1fr; }
      .container { padding: 25px; }
      h1 { font-size: 1.5em; }
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>🍎 NutriWeb - Sistema de Cálculo Nutricional</h1>

    <form id="formCalculos" onsubmit="realizarCalculos(event)">
      <div class="section-header">Datos del paciente para cálculos:</div>

      <div class="form-grid">
        <div class="input-group full-width">
          <label for="nombre">Nombre y Apellido:</label>
          <input type="text" id="nombre" />
        </div>

        <div class="input-group">
          <label for="fecha">Fecha:</label>
          <input type="date" id="fecha" />
        </div>

        <div class="input-group">
          <label for="edad">Edad: <span class="unit">AÑOS</span></label>
          <input type="number" id="edad" min="1" max="120" />
        </div>

        <div class="input-group">
          <label for="peso">Peso actual: <span class="unit">KG</span></label>
          <input type="text" id="peso" placeholder="Ej: 71,2" />
        </div>

        <div class="input-group">
          <label for="talla">Talla: <span class="unit">CM</span></label>
          <input type="text" id="talla" placeholder="Ej: 179,0" />
        </div>

        <div class="input-group">
          <label for="sexo">Sexo:</label>
          <select id="sexo">
            <option value="">Selecciona...</option>
            <option value="masculino">Masculino</option>
            <option value="femenino">Femenino</option>
          </select>
        </div>

        <div class="input-group">
          <label for="cintura">CIA DE CINTURA: <span class="unit">CM</span></label>
          <input type="text" id="cintura" placeholder="Ej: 100,0" />
          <div class="note">> 100 CM indica riesgo cardiovascular.</div>
        </div>

        <div class="input-group">
          <label for="muneca">CIA de Muñeca: <span class="unit">CM</span></label>
          <input type="text" id="muneca" placeholder="Ej: 25,0" />
        </div>
      </div>

      <!-- Peso ideal -->
      <div class="section-header">Peso Ideal (según tabla)</div>
      <div class="form-grid">
        <div class="input-group">
          <label for="dato1">Dato 1:</label>
          <input type="text" id="dato1" placeholder="Ej: 71,2" />
        </div>

        <div class="input-group">
          <label for="dato2">Dato 2:</label>
          <input type="text" id="dato2" placeholder="Ej: 80" />
        </div>

        <div class="input-group">
          <label for="divisor">Divisor:</label>
          <input type="text" id="divisor" placeholder="Ej: 2" />
        </div>

        <div class="input-group full-width">
          <label for="formulaTabla">Fórmula de tabla (opcional):</label>
          <input type="text" id="formulaTabla" placeholder="Ej: (71,2 + 80) / 2" />
          <div class="small-note">Si completas la fórmula se usará ella; si no, se usará (Dato 1 + Dato 2) / Divisor. Usa coma para decimales.</div>
        </div>
      </div>

      <div class="section-header">Dx. Médico:</div>
      <div class="input-group">
        <label for="dxMedico">Diagnóstico Médico:</label>
        <textarea id="dxMedico" placeholder="Ingrese diagnóstico médico..."></textarea>
      </div>

      <div class="section-header">Dx. Nutricional:</div>
      <div class="input-group">
        <label for="dxNutricional">Diagnóstico Nutricional:</label>
        <textarea id="dxNutricional" placeholder="Siempre el peor rango..."></textarea>
        <div class="note info">Siempre el peor rango.</div>
      </div>

      <button type="submit">Realizar cálculos</button>
    </form>

    <!-- Resultados -->
    <div id="resultados" class="result-card" style="display:none;">
      <h2 style="text-align:center; margin-bottom:20px; color:#333;">📊 Resultados del Análisis</h2>

      <div class="result-row"><div class="result-label">Contextura corporal (talla/muneca):</div><div class="result-value"><span id="ctxValor"></span></div></div>
      <div class="result-row"><div class="result-label">Tipo de contextura:</div><div class="result-value"><span id="ctxTipo"></span></div></div>
      <div class="result-row"><div class="result-label">Peso ideal (kg):</div><div class="result-value"><span id="pesoIdeal"></span></div></div>
      <div class="result-row"><div class="result-label">% Peso Ideal (PPI):</div><div class="result-value"><span id="ppi"></span> <span id="ppiChip" class=""></span></div></div>
      <div class="result-row"><div class="result-label">Interpretación PPI:</div><div class="result-value"><span id="ppiCat"></span></div></div>
      <div class="result-row"><div class="result-label">IMC:</div><div class="result-value"><span id="imc"></span></div></div>
      <div class="result-row"><div class="result-label">Categoría IMC:</div><div class="result-value"><span id="imcCat"></span></div></div>
      <div class="result-row"><div class="result-label">Cintura / Talla:</div><div class="result-value"><span id="ct"></span></div></div>

      <div id="riesgoCintura" class="small-note" style="display:none; color:#c62828; font-weight:700; margin-top:12px;">
        Riesgo cardiovascular por relación cintura/talla elevada (&gt; 0.5)
      </div>
    </div>
  </div>

  <script>
    // convierte coma -> punto y parsea a float (soporta separar miles sin problemas)
    function parseNumero(v) {
      if (v === undefined || v === null) return NaN;
      const s = String(v).trim();
      if (s === '') return NaN;
      // quitar espacios, reemplazar separador miles (.) y usar , como decimal -> transforma 1.234,56 -> 1234.56
      const normalized = s.replace(/\s+/g, '').replace(/\./g, '').replace(/,/g, '.');
      const n = parseFloat(normalized);
      return isNaN(n) ? NaN : n;
    }

    // PARSER MATEMÁTICO SEGURO (shunting-yard -> RPN -> evaluar)
    // acepta: números (con decimales), operadores + - * / y paréntesis
    function evaluarExpresionAritmetica(expr) {
      if (!expr || String(expr).trim() === '') return NaN;
      // normalizar coma -> punto y quitar espacios
      let s = String(expr).trim().replace(/\s+/g, '').replace(/\./g, '').replace(/,/g, '.');

      // validación básica: solo caracteres permitidos 0-9 . + - * / ( )
      if (!/^[0-9+\-*/().]+$/.test(s)) return NaN;

      // tokenizar: números y operadores/paréntesis
      const tokens = [];
      let i = 0;
      while (i < s.length) {
        const ch = s[i];
        if (/[0-9.]/.test(ch)) {
          // leer número completo
          let j = i+1;
          while (j < s.length && /[0-9.]/.test(s[j])) j++;
          tokens.push(s.slice(i, j));
          i = j;
        } else {
          tokens.push(ch);
          i++;
        }
      }

      // shunting-yard: operadores y precedencia
      const outQueue = [];
      const opStack = [];
      const prec = { '+':1, '-':1, '*':2, '/':2 };
      const isOp = t => ['+','-','*','/'].includes(t);

      for (let t of tokens) {
        if (/^[0-9.]+$/.test(t)) {
          outQueue.push(t);
        } else if (isOp(t)) {
          while (opStack.length) {
            const top = opStack[opStack.length-1];
            if (isOp(top) && ((prec[top] > prec[t]) || (prec[top] === prec[t]))) {
              outQueue.push(opStack.pop());
            } else break;
          }
          opStack.push(t);
        } else if (t === '(') {
          opStack.push(t);
        } else if (t === ')') {
          let found = false;
          while (opStack.length) {
            const top = opStack.pop();
            if (top === '(') { found = true; break; }
            outQueue.push(top);
          }
          if (!found) return NaN; // paréntesis desbalanceados
        } else {
          return NaN; // token inválido
        }
      }

      while (opStack.length) {
        const top = opStack.pop();
        if (top === '(' || top === ')') return NaN; // paréntesis desbalanceados
        outQueue.push(top);
      }

      // evaluar RPN
      const stack = [];
      for (let t of outQueue) {
        if (/^[0-9.]+$/.test(t)) {
          stack.push(parseFloat(t));
        } else if (isOp(t)) {
          if (stack.length < 2) return NaN;
          const b = stack.pop();
          const a = stack.pop();
          let res = NaN;
          if (t === '+') res = a + b;
          else if (t === '-') res = a - b;
          else if (t === '*') res = a * b;
          else if (t === '/') {
            if (b === 0) return NaN;
            res = a / b;
          }
          stack.push(res);
        } else {
          return NaN;
        }
      }
      if (stack.length !== 1) return NaN;
      const final = stack[0];
      return typeof final === 'number' && isFinite(final) ? final : NaN;
    }

    function realizarCalculos(e) {
      e.preventDefault();

      // obtener elementos
      const elPeso = document.getElementById('peso');
      const elTalla = document.getElementById('talla');
      const elCintura = document.getElementById('cintura');
      const elMuneca = document.getElementById('muneca');
      const elDato1 = document.getElementById('dato1');
      const elDato2 = document.getElementById('dato2');
      const elDivisor = document.getElementById('divisor');
      const elFormula = document.getElementById('formulaTabla');
      const elSexo = document.getElementById('sexo');

      // parsear con soporte de coma
      const peso = parseNumero(elPeso.value);
      const talla = parseNumero(elTalla.value);
      const cinturaVal = parseNumero(elCintura.value);
      const munecaVal = parseNumero(elMuneca.value);

      if (isNaN(peso) || isNaN(talla) || isNaN(cinturaVal) || isNaN(munecaVal) || talla <= 0 || munecaVal <= 0) {
        alert('Por favor completa peso, talla, cintura y muñeca con valores numéricos válidos (usa coma como decimal).');
        return;
      }

      // calcular peso ideal
      let pesoIdealCalc = NaN;
      const formulaText = String(elFormula.value || '').trim();
      if (formulaText !== '') {
        // usar parser seguro (sin eval)
        pesoIdealCalc = evaluarExpresionAritmetica(formulaText);
      } else {
        const x = parseNumero(elDato1.value);
        const y = parseNumero(elDato2.value);
        const z = parseNumero(elDivisor.value);
        if (!isNaN(x) && !isNaN(y) && !isNaN(z) && z !== 0) {
          pesoIdealCalc = (x + y) / z;
        }
      }

      if (isNaN(pesoIdealCalc) || pesoIdealCalc <= 0) {
        alert('No se pudo calcular el Peso Ideal. Completa Fórmula o Dato1/Dato2/Divisor correctamente (Divisor ≠ 0).');
        return;
      }

      // contextura corporal
      const valorCtx = talla / munecaVal;
      let tipoCtx = '';
      const sexo = String(elSexo.value || '').toLowerCase();
      if (sexo === 'masculino') {
        if (valorCtx > 10.4) tipoCtx = 'Pequeña';
        else if (valorCtx >= 9.6 && valorCtx <= 10.4) tipoCtx = 'Mediana';
        else tipoCtx = 'Grande';
      } else if (sexo === 'femenino') {
        if (valorCtx > 11) tipoCtx = 'Pequeña';
        else if (valorCtx >= 10.1 && valorCtx <= 11) tipoCtx = 'Mediana';
        else tipoCtx = 'Grande';
      } else {
        tipoCtx = 'No definido (sexo no seleccionado)';
      }

      // PPI
      const ppi = (peso / pesoIdealCalc) * 100;
      let ppiCat = '';
      let ppiChipClass = '';
      if (ppi > 180) { ppiCat = 'Obesidad mórbida'; ppiChipClass = 'chip obesidad'; }
      else if (ppi >= 140) { ppiCat = 'Obesidad II'; ppiChipClass = 'chip obesidad'; }
      else if (ppi >= 120) { ppiCat = 'Obesidad I'; ppiChipClass = 'chip sobrepeso'; }
      else if (ppi >= 110) { ppiCat = 'Sobrepeso'; ppiChipClass = 'chip sobrepeso'; }
      else if (ppi >= 90) { ppiCat = 'Normal o Estándar'; ppiChipClass = 'chip normal'; }
      else if (ppi >= 85) { ppiCat = 'Desnutrición leve'; ppiChipClass = 'chip desnutricion'; }
      else if (ppi >= 75) { ppiCat = 'Desnutrición moderada'; ppiChipClass = 'chip desnutricion'; }
      else { ppiCat = 'Desnutrición severa'; ppiChipClass = 'chip desnutricion'; }

      // IMC
      const talla_m = talla / 100;
      const imc = peso / (talla_m * talla_m);
      let imcCat = '';
      if (imc < 18.5) imcCat = 'Bajo peso';
      else if (imc < 25) imcCat = 'Normal';
      else if (imc < 30) imcCat = 'Sobrepeso';
      else imcCat = 'Obesidad';

      // cintura/talla
      const ctRatio = cinturaVal / talla;
      const riesgoCintura = ctRatio > 0.5;

      // funciones de formateo (coma decimal)
      function f1(n) { return (Math.round(n * 10) / 10).toFixed(1).replace('.', ','); }
      function f2(n) { return (Math.round(n * 100) / 100).toFixed(2).replace('.', ','); }

      document.getElementById('ctxValor').textContent = f2(valorCtx);
      document.getElementById('ctxTipo').textContent = tipoCtx;
      document.getElementById('pesoIdeal').textContent = f2(pesoIdealCalc);
      document.getElementById('ppi').textContent = f1(ppi);

      const chip = document.getElementById('ppiChip');
      chip.className = ppiChipClass;
      chip.textContent = ppiCat;

      document.getElementById('ppiCat').textContent = ppiCat;
      document.getElementById('imc').textContent = f1(imc);
      document.getElementById('imcCat').textContent = imcCat;
      document.getElementById('ct').textContent = f2(ctRatio);

      document.getElementById('riesgoCintura').style.display = riesgoCintura ? 'block' : 'none';
      document.getElementById('resultados').style.display = 'block';
    }

    // fecha actual
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

