// app.js (Funcionalidad y lógica de cálculo)

// Ejecutar al cargar el DOM
document.addEventListener('DOMContentLoaded', () => {
  // Inicializar la fecha actual
  document.getElementById('fecha').valueAsDate = new Date();
  
  // Asignar el listener al formulario (llama a realizarCalculos al hacer submit)
  const form = document.getElementById('formCalculos');
  form.addEventListener('submit', realizarCalculos);
});

/**
 * Helper para obtener valores numéricos, permitiendo ',' o '.' como separador decimal.
 * Devuelve NaN si no es un número válido.
 */
const getData = (id) => {
  const value = document.getElementById(id).value;
  // Reemplaza la coma por punto para que parseFloat funcione correctamente.
  const cleanValue = value.replace(',', '.'); 
  return value === '' || isNaN(parseFloat(cleanValue)) ? NaN : parseFloat(cleanValue);
};

/**
 * Función principal: toma todos los valores, valida, calcula y muestra resultados.
 */
function realizarCalculos(e) {
  e.preventDefault();

  // =====================================================
  // 1) Obtener datos
  // =====================================================
  const datos = {
    nombre: document.getElementById('nombre').value.trim(),
    fecha: document.getElementById('fecha').value,
    edad: parseInt(document.getElementById('edad').value, 10),
    peso: getData('peso'),
    talla: getData('talla'),
    sexo: document.getElementById('sexo').value,
    cintura: getData('cintura'),
    muneca: getData('muneca'),
    x_val: getData('x_val'),
    y_val: getData('y_val'),
    z_val: getData('z_val'),
    pesoIdealManual: getData('pesoIdealManual'),
    dxMedico: document.getElementById('dxMedico').value.trim(),
    dxNutricional: document.getElementById('dxNutricional').value.trim()
  };

  // =====================================================
  // 2) Validaciones básicas
  // =====================================================
  const numerosRequeridos = ['peso','talla','cintura','muneca'];
  for (const key of numerosRequeridos) {
    if (isNaN(datos[key]) || datos[key] <= 0) {
      alert('Por favor ingresa valores numéricos válidos para peso, talla, cintura y muñeca.');
      return;
    }
  }
  if (datos.sexo === '') {
    alert('Por favor selecciona el sexo del paciente.');
    return;
  }

  // =====================================================
  // 3) Calcular Peso Ideal
  // =====================================================
  let pesoIdeal = NaN;
  if (!isNaN(datos.x_val) && !isNaN(datos.y_val) && !isNaN(datos.z_val) && datos.z_val !== 0) {
    pesoIdeal = (datos.x_val + datos.y_val) / datos.z_val;
    // Rellenamos el campo con el cálculo para que el usuario lo vea (formato coma)
    document.getElementById('pesoIdealManual').value = pesoIdeal.toFixed(1).replace('.', ','); 
  }

  // El valor manual sobrescribe cualquier cálculo
  if (!isNaN(datos.pesoIdealManual) && datos.pesoIdealManual > 0) {
    pesoIdeal = datos.pesoIdealManual;
    // Aseguramos que el valor ingresado esté en el campo (formato coma)
    document.getElementById('pesoIdealManual').value = pesoIdeal.toFixed(1).replace('.', ',');
  }

  if (isNaN(pesoIdeal) || pesoIdeal <= 0) {
    alert('No se pudo calcular el Peso Ideal. Completa X, Y, Z correctamente o ingresa manualmente el Peso Ideal.');
    return;
  }

  // =====================================================
  // 4) Contextura corporal (talla / muñeca)
  // =====================================================
  const valorCtx = datos.talla / datos.muneca;
  let tipoCtx = '';
  // Clasificación de contextura (ej. según Frisancho)
  if (datos.sexo === 'masculino') {
    if (valorCtx > 10.4) tipoCtx = 'Pequeña';
    else if (valorCtx >= 9.6 && valorCtx <= 10.4) tipoCtx = 'Mediana';
    else tipoCtx = 'Grande';
  } else if (datos.sexo === 'femenino') {
    if (valorCtx > 11) tipoCtx = 'Pequeña';
    else if (valorCtx >= 10.1 && valorCtx <= 11) tipoCtx = 'Mediana';
    else tipoCtx = 'Grande';
  } else {
    tipoCtx = 'No definido';
  }

  // =====================================================
  // 5) % Peso Ideal (PPI) y su interpretación
  // =====================================================
  const ppi = (datos.peso / pesoIdeal) * 100;
  let interpretacion = '';
  let ppiClass = '';

  if (ppi > 180)      { interpretacion = 'Obesidad mórbida'; ppiClass = 'chip obesidad'; }
  else if (ppi >= 140){ interpretacion = 'Obesidad II'; ppiClass = 'chip obesidad'; }
  else if (ppi >= 120){ interpretacion = 'Obesidad I'; ppiClass = 'chip sobrepeso'; }
  else if (ppi >= 110){ interpretacion = 'Sobrepeso'; ppiClass = 'chip sobrepeso'; }
  else if (ppi >= 90) { interpretacion = 'Normal o Estándar'; ppiClass = 'chip normal'; }
  else if (ppi >= 85) { interpretacion = 'Desnutrición leve'; ppiClass = 'chip desnutricion'; }
  else if (ppi >= 75) { interpretacion = 'Desnutrición moderada'; ppiClass = 'chip desnutricion'; }
  else                { interpretacion = 'Desnutrición severa'; ppiClass = 'chip desnutricion'; }

  // =====================================================
  // 6) IMC (Índice de Masa Corporal)
  // =====================================================
  const talla_m = datos.talla / 100;
  const imc = datos.peso / (talla_m * talla_m);
  let imcCategoria = '';
  if (imc < 18.5) imcCategoria = 'Bajo peso';
  else if (imc < 25) imcCategoria = 'Normal';
  else if (imc < 30) imcCategoria = 'Sobrepeso';
  else imcCategoria = 'Obesidad';

  // =====================================================
  // 7) Relación cintura / talla
  // =====================================================
  const cinturaTallaRatio = datos.cintura / datos.talla;
  const riesgoCintura = cinturaTallaRatio > 0.5;

  // =====================================================
  // 8) Mostrar todos los resultados y manejar el scroll
  // =====================================================
  
  // Asignar valores (convirtiendo punto a coma para la visualización en español)
  document.getElementById('ctxValor').textContent = valorCtx.toFixed(2).replace('.', ',');
  document.getElementById('ctxTipo').textContent = tipoCtx;
  document.getElementById('pesoIdealRes').textContent = pesoIdeal.toFixed(1).replace('.', ',');
  // Solo el valor numérico va aquí
  document.getElementById('ppiRes').textContent = ppi.toFixed(1).replace('.', ',') + '%';
  
  // **Alineación corregida:** El chip se alinea a la derecha para la Interpretación PPI.
  const chip = document.getElementById('ppiChip');
  chip.className = ppiClass;
  chip.textContent = interpretacion; 

  document.getElementById('imcRes').textContent = imc.toFixed(1).replace('.', ',');
  document.getElementById('imcCat').textContent = imcCategoria;
  document.getElementById('cinturaTalla').textContent = cinturaTallaRatio.toFixed(2).replace('.', ',');

  const aviso = document.getElementById('riesgoCintura');
  if (riesgoCintura) {
    aviso.style.display = 'block';
  } else {
    aviso.style.display = 'none';
  }

  // Mostrar la tarjeta de resultados y hacer scroll suave
  setTimeout(() => {
    document.getElementById('resultados').style.display = 'block';
    document.getElementById('resultados').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 50);
}