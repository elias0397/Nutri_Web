// app.js
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('formCalculos');
  const resultadosDiv = document.getElementById('resultados');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    calcularNutricion();
  });
});

/**
 * Función que convierte el valor de un input de texto a número,
 * manejando automáticamente la coma como separador decimal.
 */
function parseInput(id) {
  const val = document.getElementById(id).value;
  // Reemplaza coma por punto para cálculos y convierte a número
  const num = parseFloat(val.replace(',', '.'));
  return isNaN(num) ? 0 : num;
}

function calcularNutricion() {
  // 1. Obtener valores
  const peso = parseInput('peso');
  const tallaCm = parseInput('talla');
  const tallaM = tallaCm / 100;
  const muneca = parseInput('muneca');
  const cintura = parseInput('cintura');
  const sexo = document.getElementById('sexo').value;

  // Valores para peso ideal tabla (X, Y, Z)
  const xVal = parseInput('x_val');
  const yVal = parseInput('y_val');
  const zVal = parseInput('z_val');
  let pesoIdealManual = parseInput('pesoIdealManual');

  if (!peso || !tallaCm || !sexo) {
    alert("Por favor ingresa Peso, Talla y Sexo para continuar.");
    return;
  }

  // --- CÁLCULOS ---

  // A. Peso Ideal (Lógica mixta: Manual > Calculado > Fallback)
  let pesoIdeal = 0;
  if (pesoIdealManual > 0) {
    pesoIdeal = pesoIdealManual;
  } else if (zVal > 0) {
    pesoIdeal = (xVal + yVal) / zVal;
    // Rellenamos el input
    document.getElementById('pesoIdealManual').value = pesoIdeal.toFixed(1).replace('.', ',');
  } else {
    // Si no hay datos, se usa una fórmula simple como Hamwi (22 * Talla^2)
    pesoIdeal = 22 * (tallaM * tallaM); 
  }

  // B. Contextura (Talla cm / Muñeca cm)
  let contexturaVal = 0;
  let contexturaTipo = "No calculado";
  if (muneca > 0) {
    contexturaVal = tallaCm / muneca;
    // Clasificación de contextura (ej. según Frisancho)
    if (sexo === 'masculino') {
      if (contexturaVal > 10.4) contexturaTipo = "Pequeña";
      else if (contexturaVal >= 9.6) contexturaTipo = "Mediana";
      else contexturaTipo = "Grande";
    } else { // Femenino
      if (contexturaVal > 11) contexturaTipo = "Pequeña";
      else if (contexturaVal >= 10.1) contexturaTipo = "Mediana";
      else contexturaTipo = "Grande";
    }
  }

  // C. IMC
  const imc = peso / (tallaM * tallaM);
  let imcCat = "";
  if (imc < 18.5) imcCat = "Bajo peso";
  else if (imc < 24.9) imcCat = "Normopeso";
  else if (imc < 29.9) imcCat = "Sobrepeso";
  else if (imc < 34.9) imcCat = "Obesidad I";
  else if (imc < 39.9) imcCat = "Obesidad II";
  else imcCat = "Obesidad III";

  // D. PPI (% Peso Ideal) = (Peso Actual / Peso Ideal) * 100
  let ppi = 0;
  let ppiInterp = "";
  if (pesoIdeal > 0) {
    ppi = (peso / pesoIdeal) * 100;
    
    // Clasificación de PPI
    if (ppi < 90) ppiInterp = "Déficit";
    else if (ppi <= 110) ppiInterp = "Normal";
    else if (ppi <= 120) ppiInterp = "Sobrepeso";
    else ppiInterp = "Obesidad";
  }

  // E. Relación Cintura/Talla (ICT)
  let ict = 0;
  if (cintura > 0 && tallaCm > 0) {
    ict = cintura / tallaCm;
  }

  // --- MOSTRAR RESULTADOS ---
  document.getElementById('resultados').style.display = 'block';
  
  // Contextura
  document.getElementById('ctxValor').textContent = contexturaVal > 0 ? contexturaVal.toFixed(2).replace('.', ',') : "-";
  document.getElementById('ctxTipo').textContent = contexturaTipo;

  // Peso Ideal
  document.getElementById('pesoIdealRes').textContent = pesoIdeal.toFixed(1).replace('.', ',');

  // PPI
  document.getElementById('ppiRes').textContent = ppi.toFixed(1).replace('.', ',') + "%";
  document.getElementById('interpretacionRes').textContent = ppiInterp;

  // IMC
  document.getElementById('imcRes').textContent = imc.toFixed(1).replace('.', ',');
  document.getElementById('imcCat').textContent = imcCat;

  // Cintura/Talla
  document.getElementById('cinturaTalla').textContent = ict.toFixed(2).replace('.', ',');
  
  // Alerta de riesgo (ICT > 0.5 es riesgo elevado)
  const alerta = document.getElementById('riesgoCintura');
  if (ict > 0.5) {
    alerta.textContent = "¡RIESGO ELEVADO! Riesgo cardiovascular por relación cintura/talla elevada (> 0.5)";
    alerta.style.display = 'block';
  } else {
    alerta.style.display = 'none';
  }

  // Scroll suave hacia resultados (útil en móviles)
  document.getElementById('resultados').scrollIntoView({ behavior: 'smooth' });
}