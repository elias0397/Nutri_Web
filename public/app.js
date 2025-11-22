/**
 * @file app.js
 * @description Lógica principal para la aplicación Nutri Web.
 * Maneja la obtención de datos del formulario, validaciones, cálculos nutricionales
 * (Peso Ideal, PPI, IMC, TMB, VCT) y la visualización de resultados.
 * @version 1.0.0
 */

// Ejecutar al cargar el DOM
document.addEventListener('DOMContentLoaded', () => {
  // Inicializar la fecha actual en el input de fecha
  document.getElementById('fecha').valueAsDate = new Date();

  // Asignar el listener al formulario (llama a realizarCalculos al hacer submit)
  const form = document.getElementById('formCalculos');
  form.addEventListener('submit', realizarCalculos);
});

/**
 * Helper para obtener valores numéricos de inputs, permitiendo ',' o '.' como separador decimal.
 * @param {string} id - El ID del elemento HTML input.
 * @returns {number} El valor numérico parseado o NaN si no es válido.
 */
const getData = (id) => {
  const value = document.getElementById(id).value;
  // Reemplaza la coma por punto para que parseFloat funcione correctamente.
  const cleanValue = value.replace(',', '.');
  return value === '' || isNaN(parseFloat(cleanValue)) ? NaN : parseFloat(cleanValue);
};

/**
 * Función principal: toma todos los valores, valida, calcula y muestra resultados.
 * @param {Event} e - El evento de submit del formulario.
 */
function realizarCalculos(e) {
  e.preventDefault(); // Prevenir el envío real del formulario

  // ==========================================================================
  // 1) OBTENCIÓN DE DATOS
  // Recopila los valores de los inputs del formulario.
  // ==========================================================================
  const datos = {
    nombre: document.getElementById('nombre').value.trim(),
    fecha: document.getElementById('fecha').value,
    edad: parseInt(document.getElementById('edad').value, 10),
    peso: getData('peso'),
    talla: getData('talla'), // Talla en Centímetros (CM)
    sexo: document.getElementById('sexo').value,
    cintura: getData('cintura'),
    muneca: getData('muneca'),
    // Valores para cálculo de estructura ósea (si aplica)
    x_val: getData('x_val'),
    y_val: getData('y_val'),
    z_val: getData('z_val'),
    pesoIdealManual: getData('pesoIdealManual'),
    factorActividad: getData('factorActividad'),
    factorInjuria: getData('factorInjuria')
  };

  // ==========================================================================
  // 2) VALIDACIONES BÁSICAS
  // Verifica que los campos numéricos requeridos tengan valores válidos.
  // ==========================================================================
  const numerosRequeridos = ['peso', 'talla', 'cintura', 'muneca', 'factorActividad', 'factorInjuria'];
  for (const key of numerosRequeridos) {
    if (isNaN(datos[key]) || datos[key] <= 0) {
      alert(`Por favor ingresa un valor numérico válido para ${key}.`);
      return;
    }
  }
  if (datos.sexo === '') {
    alert('Por favor selecciona el sexo del paciente.');
    return;
  }
  if (isNaN(datos.edad) || datos.edad <= 0) {
    alert('Por favor ingresa una edad válida.');
    return;
  }

  // ==========================================================================
  // 3) CÁLCULO DE PESO IDEAL Y PPI (Porcentaje de Peso Ideal)
  // ==========================================================================
  let pesoIdeal = NaN;

  // A) Cálculo automático del Peso Ideal basado en medidas óseas (X, Y, Z)
  // Fórmula específica del proyecto para estimación de estructura.
  if (!isNaN(datos.x_val) && !isNaN(datos.y_val) && !isNaN(datos.z_val) && datos.z_val !== 0) {
    pesoIdeal = (datos.x_val + datos.y_val) / datos.z_val;
    document.getElementById('pesoIdealManual').value = pesoIdeal.toFixed(1).replace('.', ',');
  }

  // B) Uso del Peso Ideal Manual si fue ingresado (sobrescribe el calculado)
  if (!isNaN(datos.pesoIdealManual) && datos.pesoIdealManual > 0) {
    pesoIdeal = datos.pesoIdealManual;
    document.getElementById('pesoIdealManual').value = pesoIdeal.toFixed(1).replace('.', ',');
  }

  if (isNaN(pesoIdeal) || pesoIdeal <= 0) {
    alert('No se pudo calcular el Peso Ideal. Completa X, Y, Z o ingresa manualmente.');
    return;
  }

  // PPI = (Peso Actual / Peso Ideal) * 100
  const ppi = (datos.peso / pesoIdeal) * 100;

  // Clasificación según el PPI
  let interpretacion = '';
  let ppiClass = '';
  if (ppi > 180) { interpretacion = 'Obesidad mórbida'; ppiClass = 'chip obesidad'; }
  else if (ppi >= 140) { interpretacion = 'Obesidad II'; ppiClass = 'chip obesidad'; }
  else if (ppi >= 120) { interpretacion = 'Obesidad I'; ppiClass = 'chip sobrepeso'; }
  else if (ppi >= 110) { interpretacion = 'Sobrepeso'; ppiClass = 'chip sobrepeso'; }
  else if (ppi >= 90) { interpretacion = 'Normal o Estándar'; ppiClass = 'chip normal'; }
  else if (ppi >= 85) { interpretacion = 'Desnutrición leve'; ppiClass = 'chip desnutricion'; }
  else if (ppi >= 75) { interpretacion = 'Desnutrición moderada'; ppiClass = 'chip desnutricion'; }
  else { interpretacion = 'Desnutrición severa'; ppiClass = 'chip desnutricion'; }

  // ==========================================================================
  // 4) CÁLCULO DE IMC (Índice de Masa Corporal)
  // IMC = Peso (kg) / Talla (m)²
  // ==========================================================================
  const talla_metros = datos.talla / 100; // Convertir CM a Metros
  const imc = datos.peso / (talla_metros * talla_metros);

  let imcCat = '';
  let imcClass = '';

  // Clasificación de la OMS para IMC
  if (imc < 18.5) { imcCat = 'Delgadez o Bajo peso'; imcClass = 'chip desnutricion'; }
  else if (imc < 25) { imcCat = 'Peso normal, Sano o Saludable'; imcClass = 'chip normal'; }
  else if (imc < 30) { imcCat = 'Sobrepeso'; imcClass = 'chip sobrepeso'; }
  else if (imc < 35) { imcCat = 'Obesidad Grado I'; imcClass = 'chip obesidad'; }
  else if (imc < 40) { imcCat = 'Obesidad Grado II'; imcClass = 'chip obesidad'; }
  else { imcCat = 'Obesidad Grado III o Mórbida'; imcClass = 'chip obesidad'; }

  // ==========================================================================
  // 5) CÁLCULOS DE ENERGÍA Y REQUERIMIENTOS
  // ==========================================================================

  let pesoUtilizar;
  let pesoBaseTexto; // Texto para indicar qué peso se usó en los cálculos

  // Determinar Peso a utilizar (Peso Actual o Peso Ajustado - PA)
  // CRITERIO: Si el paciente tiene sobrepeso o es obeso (IMC >= 25 O PPI >= 110%), se usa Peso Ajustado.
  if (imc >= 25 || ppi >= 110) {
    // Se cumple la condición de sobrepeso/obesidad
    // FÓRMULA PESO AJUSTADO (Wilkens): (Peso actual - peso ideal) * 0.25 + Peso ideal
    const PA = (datos.peso - pesoIdeal) * 0.25 + pesoIdeal;
    pesoUtilizar = PA;
    pesoBaseTexto = 'Peso Ajustado (PA)';
  } else {
    // NO se cumple la condición (Peso Normal o Desnutrición) -> Usar Peso Actual
    pesoUtilizar = datos.peso;
    pesoBaseTexto = 'Peso Actual';
  }

  // 5.1) Cálculo de Fórmula Práctica (Kcal/kg)
  // Estima requerimientos basándose en el estado nutricional (PPI)
  let factorKcal;
  let pesoParaPractica;

  if (ppi >= 110) {
    // Sobrepeso/Obesidad (PPI >= 110%) -> Usar Peso Ajustado x 25 kcal (Restricción calórica moderada)
    pesoParaPractica = pesoUtilizar; // pesoUtilizar ya es PA aquí
    factorKcal = 25;
  } else if (ppi >= 90) {
    // Normal (90% <= PPI < 110%) -> Peso Actual x 30 kcal (Mantenimiento)
    pesoParaPractica = datos.peso;
    factorKcal = 30;
  } else if (ppi >= 85) {
    // Desnutrición Leve (85% <= PPI < 90%) -> Peso Actual x 30 kcal
    pesoParaPractica = datos.peso;
    factorKcal = 30;
  } else if (ppi >= 75) {
    // Desnutrición Moderada (75% <= PPI < 85%) -> Peso Actual x 40 kcal (Hipercalórica)
    pesoParaPractica = datos.peso;
    factorKcal = 40;
  } else { // ppi < 75
    // Desnutrición Severa (PPI < 75%) -> Peso Actual x 45 kcal (Hipercalórica agresiva)
    pesoParaPractica = datos.peso;
    factorKcal = 45;
  }

  const formulaPractica = pesoParaPractica * factorKcal;


  // 5.2) Ecuación de Harris-Benedict Original (TMB/GMR)
  // Calcula la Tasa Metabólica Basal.
  // Nota: Se utiliza 'pesoUtilizar' que puede ser el Peso Actual o Ajustado según criterio anterior.
  let tmb;
  if (datos.sexo === 'masculino') {
    // Hombres: 66.47 + (13.75 x Peso) + (5 x Talla) - (6.75 x Edad)
    tmb = 66.47 + (13.75 * pesoUtilizar) + (5 * datos.talla) - (6.75 * datos.edad);
  } else {
    // Mujeres: 655.1 + (9.56 x Peso) + (1.85 x Talla) - (4.68 x Edad)
    tmb = 655.1 + (9.56 * pesoUtilizar) + (1.85 * datos.talla) - (4.68 * datos.edad);
  }

  // 5.3) Valor Calórico Total (VCT)
  // VCT = TMB x Factor Actividad x Factor Injuria
  const vct = tmb * datos.factorActividad * datos.factorInjuria;


  // ==========================================================================
  // 6) OTROS CÁLCULOS ANTROPOMÉTRICOS
  // ==========================================================================

  // Contextura corporal (Complexión)
  // R = Talla (cm) / Circunferencia Muñeca (cm)
  const valorCtx = datos.talla / datos.muneca;
  let tipoCtx = '';

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

  // Relación Cintura / Talla (ICT)
  // Un valor > 0.5 indica mayor riesgo cardiovascular.
  const cinturaTallaRatio = datos.cintura / datos.talla;
  const riesgoCintura = cinturaTallaRatio > 0.5;


  // ==========================================================================
  // 7) VISUALIZACIÓN DE RESULTADOS
  // Actualiza el DOM con los valores calculados.
  // ==========================================================================

  // Resultados Energía
  document.getElementById('pesoBaseUsado').textContent = pesoBaseTexto; // Muestra si se usó PA o P
  document.getElementById('pesoAjustadoRes').textContent = pesoUtilizar.toFixed(1).replace('.', ',');
  document.getElementById('formulaPracticaRes').textContent = formulaPractica.toFixed(1).replace('.', ',');
  document.getElementById('harrisBenedictRes').textContent = tmb.toFixed(1).replace('.', ',');
  document.getElementById('vctRes').textContent = vct.toFixed(1).replace('.', ',');

  // Resultados IMC
  document.getElementById('imcAutoRes').textContent = imc.toFixed(2).replace('.', ',');
  const imcChip = document.getElementById('imcAutoChip');
  imcChip.className = imcClass;
  imcChip.textContent = imcCat;

  // Resultados Contextura/Peso Ideal
  document.getElementById('ctxValor').textContent = valorCtx.toFixed(2).replace('.', ',');
  document.getElementById('ctxTipo').textContent = tipoCtx;
  document.getElementById('pesoIdealRes').textContent = pesoIdeal.toFixed(1).replace('.', ',');
  document.getElementById('ppiRes').textContent = ppi.toFixed(1).replace('.', ',') + '%';

  // Resultados PPI
  const ppiChip = document.getElementById('ppiChip');
  ppiChip.className = ppiClass;
  ppiChip.textContent = interpretacion;

  // Resultados Cintura/Talla
  document.getElementById('cinturaTalla').textContent = cinturaTallaRatio.toFixed(2).replace('.', ',');

  const aviso = document.getElementById('riesgoCintura');
  if (riesgoCintura) {
    aviso.style.display = 'block';
  } else {
    aviso.style.display = 'none';
  }

  // Mostrar la tarjeta de resultados y asegurar el scroll
  const resultadosDiv = document.getElementById('resultados');
  resultadosDiv.style.display = 'block';

  // ==========================================================================
  // 8) INICIALIZAR TABLA DE DISTRIBUCIÓN DE MACROS
  // ==========================================================================
  const distDiv = document.getElementById('distribucionMacros');
  distDiv.style.display = 'block';

  // Pre-llenar VCT con el valor calculado
  const inputVct = document.getElementById('distVct');
  inputVct.value = Math.round(vct);

  // Pre-llenar porcentajes por defecto (ej: 50, 20, 30) si están vacíos
  const inputHc = document.getElementById('distHcPorc');
  const inputPr = document.getElementById('distPrPorc');
  const inputGr = document.getElementById('distGrPorc');

  if (!inputHc.value) inputHc.value = 50;
  if (!inputPr.value) inputPr.value = 20;
  if (!inputGr.value) inputGr.value = 30;

  // Guardar datos globales necesarios para la distribución
  // Se usan atributos data- en el contenedor para persistir valores entre eventos
  distDiv.dataset.pesoActual = datos.peso;
  distDiv.dataset.pesoAjustado = (imc >= 25 || ppi >= 110) ? pesoUtilizar : ''; // Si se usó PA, guardarlo.

  // Calcular distribución inicial
  calcularDistribucion();

  // Usar requestAnimationFrame para asegurar que el scroll funcione correctamente en móviles
  window.requestAnimationFrame(() => {
    resultadosDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
}

// ==========================================================================
// LÓGICA PARA DISTRIBUCIÓN DE MACRONUTRIENTES
// ==========================================================================

// Listeners para recálculo automático al cambiar inputs
['distVct', 'distHcPorc', 'distPrPorc', 'distGrPorc'].forEach(id => {
  document.getElementById(id).addEventListener('input', calcularDistribucion);
});

function calcularDistribucion() {
  const vct = parseFloat(document.getElementById('distVct').value) || 0;
  const porcHc = parseFloat(document.getElementById('distHcPorc').value) || 0;
  const porcPr = parseFloat(document.getElementById('distPrPorc').value) || 0;
  const porcGr = parseFloat(document.getElementById('distGrPorc').value) || 0;

  // 1. Calcular Suma de Porcentajes
  const sumaPorc = porcHc + porcPr + porcGr;
  const spanSuma = document.getElementById('distSumaPorc');
  spanSuma.textContent = sumaPorc + '%';

  // Validar si suma 100% (visual feedback)
  if (Math.abs(sumaPorc - 100) < 0.1) {
    spanSuma.style.color = 'green';
  } else {
    spanSuma.style.color = 'red';
  }

  // 2. Calcular Kcal y Gramos
  // HC: 4 kcal/g
  const kcalHc = vct * (porcHc / 100);
  const grHc = kcalHc / 4;

  // PR: 4 kcal/g
  const kcalPr = vct * (porcPr / 100);
  const grPr = kcalPr / 4;

  // GR: 9 kcal/g
  const kcalGr = vct * (porcGr / 100);
  const grGr = kcalGr / 9;

  // 3. Actualizar DOM (Kcal y Gramos)
  document.getElementById('distHcKcal').textContent = Math.round(kcalHc);
  document.getElementById('distHcGramos').textContent = Math.round(grHc);

  document.getElementById('distPrKcal').textContent = Math.round(kcalPr);
  document.getElementById('distPrGramos').textContent = Math.round(grPr);

  document.getElementById('distGrKcal').textContent = Math.round(kcalGr);
  document.getElementById('distGrGramos').textContent = Math.round(grGr);

  // 4. Cálculos Adicionales de Proteína
  // 70% PAVB (Proteína de Alto Valor Biológico)
  const pavb = grPr * 0.70;
  document.getElementById('distPavb').textContent = pavb.toFixed(1);

  // Recuperar pesos guardados
  const distDiv = document.getElementById('distribucionMacros');
  const pesoActual = parseFloat(distDiv.dataset.pesoActual);
  const pesoAjustado = parseFloat(distDiv.dataset.pesoAjustado);

  // Gr Prot / Kg Peso (Actual)
  if (pesoActual > 0) {
    const protKg = grPr / pesoActual;
    document.getElementById('distProtKg').textContent = protKg.toFixed(1);
  } else {
    document.getElementById('distProtKg').textContent = '-';
  }

  // Gr Prot / P. Ajustado
  if (!isNaN(pesoAjustado) && pesoAjustado > 0) {
    const protAjustado = grPr / pesoAjustado;
    document.getElementById('distProtAjustado').textContent = protAjustado.toFixed(1);
  } else {
    // Si no hay peso ajustado (paciente normal), se puede mostrar guion o el mismo valor
    // Según la imagen, parece ser un campo específico. Lo dejaremos vacío si no aplica.
    document.getElementById('distProtAjustado').textContent = '-';
  }
}