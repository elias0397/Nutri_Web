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
 * Helper para formatear números con separador de miles '.' y decimal ','
 * Ejemplo: 1234.56 -> "1.234,56"
 * @param {number} value - El valor a formatear.
 * @param {number} decimals - Cantidad de decimales (default 2).
 * @returns {string} El valor formateado.
 */
const formatNumber = (value, decimals = 2) => {
  if (value === undefined || value === null || isNaN(value)) return '-';
  // Asegurar que es número
  const num = parseFloat(value);
  // Formatear: toFixed para decimales, replace punto por coma, regex para miles
  return num.toFixed(decimals).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, ".");
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
    document.getElementById('pesoIdealManual').value = formatNumber(pesoIdeal, 1);
  }

  // B) Uso del Peso Ideal Manual si fue ingresado (sobrescribe el calculado)
  if (!isNaN(datos.pesoIdealManual) && datos.pesoIdealManual > 0) {
    pesoIdeal = datos.pesoIdealManual;
    document.getElementById('pesoIdealManual').value = formatNumber(pesoIdeal, 1);
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

  // 2. Cálculo de Contextura (Talla / Muñeca)
  let contextura = '';
  let contexturaClass = 'normal';
  let rValue = 0;

  if (datos.talla > 0 && datos.muneca > 0) {
    rValue = datos.talla / datos.muneca;

    // Interpretación según género
    if (datos.sexo === 'masculino') { // Changed 'hombre' to 'masculino' to match existing 'datos.sexo' values
      if (rValue > 10.4) { contextura = 'Pequeña'; contexturaClass = 'bajo'; }
      else if (rValue >= 9.6) { contextura = 'Mediana'; contexturaClass = 'normal'; }
      else { contextura = 'Grande'; contexturaClass = 'alto'; }
    } else { // femenino
      if (rValue > 11.0) { contextura = 'Pequeña'; contexturaClass = 'bajo'; }
      else if (rValue >= 10.1) { contextura = 'Mediana'; contexturaClass = 'normal'; }
      else { contextura = 'Grande'; contexturaClass = 'alto'; }
    }
  }

  document.getElementById('ctxValor').textContent = rValue > 0 ? rValue.toFixed(2).replace('.', ',') : '-'; // Updated ID to ctxValor
  const contexturaChip = document.getElementById('ctxTipo'); // Updated ID to ctxTipo
  contexturaChip.textContent = contextura;
  contexturaChip.className = `chip ${contexturaClass}`;
  // contexturaChip.style.display = contextura ? 'inline-block' : 'none'; // This line is not needed as ctxTipo is already handled in results section

  // 3. Peso Ideal (Hamwi) - This comment seems to be a leftover from the provided snippet, not a new calculation.
  // Hombres: 48kg por los primeros 152.4cm + 2.7kg por cada 2.54cm adicionales
  // Mujeres: 45.5kg por los primeros 152.4cm + 2.27kg por cada 2.54cm adicionales

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

  // Mostrar resultados
  document.getElementById('pesoBaseUsado').textContent = pesoBaseTexto; // Muestra si se usó PA o P
  document.getElementById('pesoAjustadoRes').textContent = formatNumber(pesoUtilizar, 1);
  document.getElementById('formulaPracticaRes').textContent = formatNumber(formulaPractica, 0);
  document.getElementById('harrisBenedictRes').textContent = formatNumber(tmb, 0);
  document.getElementById('vctRes').textContent = formatNumber(vct, 0);

  // Mostrar IMC
  document.getElementById('imcAutoRes').textContent = formatNumber(imc, 1);
  const imcChip = document.getElementById('imcAutoChip');
  imcChip.className = imcClass;
  imcChip.textContent = imcCat;

  // Resultados Contextura/Peso Ideal
  document.getElementById('ctxValor').textContent = formatNumber(valorCtx, 2);
  document.getElementById('ctxTipo').textContent = tipoCtx;
  // Mostrar resultados de Peso Ideal y PPI
  document.getElementById('pesoIdealRes').textContent = formatNumber(pesoIdeal, 1);
  document.getElementById('ppiRes').textContent = formatNumber(ppi, 1) + '%';

  // Resultados PPI
  const ppiChip = document.getElementById('ppiChip');
  ppiChip.className = ppiClass;
  ppiChip.textContent = interpretacion;

  // Resultados Cintura/Talla
  document.getElementById('cinturaTalla').textContent = formatNumber(cinturaTallaRatio, 2);

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
  document.getElementById('distHcKcal').textContent = formatNumber(kcalHc, 0);
  document.getElementById('distHcGramos').textContent = formatNumber(grHc, 0);

  document.getElementById('distPrKcal').textContent = formatNumber(kcalPr, 0);
  document.getElementById('distPrGramos').textContent = formatNumber(grPr, 0);

  document.getElementById('distGrKcal').textContent = formatNumber(kcalGr, 0);
  document.getElementById('distGrGramos').textContent = formatNumber(grGr, 0);

  // 4. Cálculos Adicionales de Proteína
  // 70% PAVB (Proteína de Alto Valor Biológico)
  // 70% PAVB (Proteína de Alto Valor Biológico)
  // Fórmula: (Total de proteinas * 70) / 100
  const pavb = (grPr * 70) / 100;
  document.getElementById('distPavb').textContent = formatNumber(pavb, 1);

  // Recuperar pesos guardados
  const distDiv = document.getElementById('distribucionMacros');
  const pesoActual = parseFloat(distDiv.dataset.pesoActual);
  const pesoAjustado = parseFloat(distDiv.dataset.pesoAjustado);

  // Gr Prot / Kg Peso (Actual)
  if (pesoActual > 0) {
    const protKg = grPr / pesoActual;
    document.getElementById('distProtKg').textContent = formatNumber(protKg, 1);
  } else {
    document.getElementById('distProtKg').textContent = '-';
  }

  // Gr Prot / P. Ajustado
  if (!isNaN(pesoAjustado) && pesoAjustado > 0) {
    const protAjustado = grPr / pesoAjustado;
    document.getElementById('distProtAjustado').textContent = formatNumber(protAjustado, 1);
  } else {
    // Si no hay peso ajustado (paciente normal), se puede mostrar guion o el mismo valor
    // Según la imagen, parece ser un campo específico. Lo dejaremos vacío si no aplica.
    document.getElementById('distProtAjustado').textContent = '-';
  }

  // Actualizar también la Fórmula Desarrollada si está visible
  actualizarDatosFormulaDesarrollada();

  // Mostrar botones de exportación
  document.getElementById('exportSection').style.display = 'block';
}

// ... (Existing code for Developed Formula) ...

// ==========================================================================
// CÁLCULO EN TIEMPO REAL DE CONTEXTURA
// ==========================================================================
const inputTalla = document.getElementById('talla');
const inputMuneca = document.getElementById('muneca');
const inputSexo = document.getElementById('sexo');

if (inputTalla && inputMuneca && inputSexo) {
  const inputsContextura = [inputTalla, inputMuneca, inputSexo];
  inputsContextura.forEach(input => {
    input.addEventListener('input', calcularContexturaIndependiente);
    input.addEventListener('change', calcularContexturaIndependiente);
  });
}

function calcularContexturaIndependiente() {
  const talla = parseFloat(document.getElementById('talla').value.replace(',', '.')) || 0;
  const muneca = parseFloat(document.getElementById('muneca').value.replace(',', '.')) || 0;
  const sexo = document.getElementById('sexo').value;

  let contextura = '';
  let contexturaClass = 'normal';
  let rValue = 0;

  if (talla > 0 && muneca > 0 && sexo) {
    rValue = talla / muneca;

    if (sexo === 'masculino') {
      if (rValue > 10.4) { contextura = 'Pequeña'; contexturaClass = 'bajo'; }
      else if (rValue >= 9.6) { contextura = 'Mediana'; contexturaClass = 'normal'; }
      else { contextura = 'Grande'; contexturaClass = 'alto'; }
    } else { // femenino
      if (rValue > 11.0) { contextura = 'Pequeña'; contexturaClass = 'bajo'; }
      else if (rValue >= 10.1) { contextura = 'Mediana'; contexturaClass = 'normal'; }
      else { contextura = 'Grande'; contexturaClass = 'alto'; }
    }
  }

  const elValor = document.getElementById('ctxValor');
  const elTipo = document.getElementById('ctxTipo');

  // Update main results if they exist
  if (elValor) elValor.textContent = rValue > 0 ? formatNumber(rValue, 2) : '-';
  if (elTipo) {
    elTipo.textContent = contextura;
    elTipo.className = `chip ${contexturaClass}`;
    // Ensure the result card is visible if it was hidden (though usually results are hidden until calc)
    // If we want to show JUST this result, we might need to handle the display of the parent container.
    // However, usually the results container is hidden. 
    // Let's assume the user wants to see it even before full calc? 
    // Or maybe just update it if the results are already visible.
    // Given the request "Mostrar contextura despues de ingresar...", implies immediate feedback.
    // But if the parent #resultados is hidden, this won't be seen.
    // We should probably NOT force show #resultados as it has many empty fields.
  }

  // Update input-adjacent results
  const elInputResult = document.getElementById('ctxInputResult');

  if (elInputResult) {
    if (contextura) {
      // Format: "Mediana (10,00)"
      elInputResult.value = `${contextura} (${formatNumber(rValue, 2)})`;
    } else {
      elInputResult.value = '';
    }
  }
}

// ==========================================================================
// LÓGICA DE EXPORTACIÓN (EXCEL / PDF)
// ==========================================================================

document.getElementById('btnExportExcel').addEventListener('click', exportarExcel);
document.getElementById('btnExportPDF').addEventListener('click', exportarPDF);

function exportarExcel() {
  const nombrePaciente = document.getElementById('nombre').value || 'Paciente';
  const filename = `NutriWeb_Reporte_${nombrePaciente.replace(/\s+/g, '_')}.xlsx`;

  // 1. Recopilar Datos Generales
  const datosGenerales = [
    ['DATOS DEL PACIENTE'],
    ['Nombre', document.getElementById('nombre').value],
    ['Fecha', document.getElementById('fecha').value],
    ['Edad', document.getElementById('edad').value],
    ['Peso', document.getElementById('peso').value],
    ['Talla', document.getElementById('talla').value],
    ['Sexo', document.getElementById('sexo').value],
    ['Cintura', document.getElementById('cintura').value],
    ['Muñeca', document.getElementById('muneca').value],
    [''],
    ['RESULTADOS PRINCIPALES'],
    ['IMC', document.getElementById('imcAutoRes').textContent, document.getElementById('imcAutoChip').textContent],
    ['Peso Ideal', document.getElementById('pesoIdealRes').textContent],
    ['PPI', document.getElementById('ppiRes').textContent, document.getElementById('ppiChip').textContent],
    ['TMB (Harris Benedict)', document.getElementById('harrisBenedictRes').textContent],
    ['VCT', document.getElementById('vctRes').textContent],
    [''],
    ['DIAGNÓSTICOS'],
    ['Dx Médico', document.getElementById('dxMedico').value],
    ['Dx Nutricional', document.getElementById('dxNutricional').value]
  ];

  // 2. Recopilar Datos de Distribución
  const distData = [
    ['DISTRIBUCIÓN DE MACRONUTRIENTES'],
    ['Paciente', nombrePaciente],
    ['VCT Utilizado', document.getElementById('distVct').value],
    [''],
    ['Macronutriente', 'KCAL', '%', 'GRAMOS', 'Notas'],
    ['HC', document.getElementById('distHcKcal').textContent, document.getElementById('distHcPorc').value, document.getElementById('distHcGramos').textContent],
    ['PR', document.getElementById('distPrKcal').textContent, document.getElementById('distPrPorc').value, document.getElementById('distPrGramos').textContent, '70% PAVB: ' + document.getElementById('distPavb').textContent],
    ['GR', document.getElementById('distGrKcal').textContent, document.getElementById('distGrPorc').value, document.getElementById('distGrGramos').textContent],
    ['TOTAL', '', document.getElementById('distSumaPorc').textContent, '']
  ];

  // 3. Recopilar Datos de Fórmula Desarrollada
  const fdRows = [['FÓRMULA DESARROLLADA']];
  fdRows.push(['Paciente', nombrePaciente]);
  fdRows.push(['']);

  // Headers
  const headers = [
    'Alimento', 'Medida Casera', 'Cantidad', 'HC', 'Prot', 'Grasa', 'PAVB',
    'Na', 'K', 'P', 'Ca', 'Col', 'Pur', 'Agua', 'GS', 'CHS', 'Fibra'
  ];
  fdRows.push(headers);

  // Data Rows
  const tableRows = document.querySelectorAll('#fdTableBody tr');
  tableRows.forEach(row => {
    const inputs = row.querySelectorAll('input');
    const rowData = [];
    inputs.forEach(input => rowData.push(input.value));
    fdRows.push(rowData);
  });

  // Totals Row
  const totals = ['TOTALES', '', '',
    document.getElementById('sumHc').textContent,
    document.getElementById('sumProt').textContent,
    document.getElementById('sumGrasa').textContent,
    document.getElementById('sumPavb').textContent,
    document.getElementById('sumNa').textContent,
    document.getElementById('sumK').textContent,
    document.getElementById('sumP').textContent,
    document.getElementById('sumCa').textContent,
    document.getElementById('sumCol').textContent,
    document.getElementById('sumPur').textContent,
    document.getElementById('sumAgua').textContent,
    document.getElementById('sumGs').textContent,
    document.getElementById('sumChs').textContent,
    document.getElementById('sumFibra').textContent
  ];
  fdRows.push(totals);

  // Add Summary Section (Aporte real de la dieta)
  fdRows.push(['']); // Empty row
  fdRows.push(['APORTE REAL DE LA DIETA']);
  fdRows.push(['VCT Real (Kcal)', document.getElementById('fdVctReal').textContent]);
  fdRows.push(['PAVB %', document.getElementById('fdPavbPorc').textContent]);
  fdRows.push(['GRASA SATURADAS %', document.getElementById('fdGsPorc').textContent]);
  fdRows.push(['CHS %', document.getElementById('fdChsPorc').textContent]);

  // Crear Workbook y Sheets
  const wb = XLSX.utils.book_new();

  const ws1 = XLSX.utils.aoa_to_sheet(datosGenerales);
  XLSX.utils.book_append_sheet(wb, ws1, "Datos Generales");

  const ws2 = XLSX.utils.aoa_to_sheet(distData);
  XLSX.utils.book_append_sheet(wb, ws2, "Distribución");

  const ws3 = XLSX.utils.aoa_to_sheet(fdRows);
  XLSX.utils.book_append_sheet(wb, ws3, "Fórmula Desarrollada");

  // Descargar
  XLSX.writeFile(wb, filename);
}

function exportarPDF() {
  const nombrePaciente = document.getElementById('nombre').value || 'Paciente';
  const filename = `NutriWeb_Reporte_${nombrePaciente.replace(/\s+/g, '_')}.pdf`;

  // Generar el contenido HTML específico para el reporte
  const reportContent = generarContenidoReporte();

  // Crear un contenedor temporal para el PDF
  const tempContainer = document.createElement('div');
  tempContainer.innerHTML = reportContent;
  document.body.appendChild(tempContainer);

  const opt = {
    margin: [0.3, 0.3],
    filename: filename,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true, logging: false, scrollY: 0 },
    jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' },
    pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
  };

  // Usar el contenedor temporal como fuente
  html2pdf().set(opt).from(tempContainer).save().then(() => {
    // Limpiar el DOM
    document.body.removeChild(tempContainer);
  }).catch(err => {
    console.error("PDF Generation Error:", err);
    if (document.body.contains(tempContainer)) {
      document.body.removeChild(tempContainer);
    }
  });
}

function generarContenidoReporte() {
  const nombre = document.getElementById('nombre').value;
  const fecha = document.getElementById('fecha').value;
  const edad = document.getElementById('edad').value;
  const peso = document.getElementById('peso').value;
  const talla = document.getElementById('talla').value;
  const imc = document.getElementById('imcAutoRes').textContent;
  const vct = document.getElementById('vctRes').textContent;

  // Construir filas de la fórmula desarrollada
  let fdRowsHTML = '';
  const fdRows = document.querySelectorAll('#fdTableBody tr');
  fdRows.forEach(row => {
    const inputs = row.querySelectorAll('input');
    // Solo agregar filas que tengan algún dato (ej. alimento o cantidad)
    if (inputs[0].value || inputs[2].value) {
      fdRowsHTML += '<tr>';
      // Alimento (0), Medida (1), Cantidad (2)
      fdRowsHTML += `<td style="text-align: left;">${inputs[0].value}</td>`;
      fdRowsHTML += `<td>${inputs[1].value}</td>`;
      fdRowsHTML += `<td>${inputs[2].value}</td>`;
      // Nutrientes (3-16)
      for (let i = 3; i <= 16; i++) {
        fdRowsHTML += `<td>${inputs[i].value}</td>`;
      }
      fdRowsHTML += '</tr>';
    }
  });

  // Totales
  const totalsHTML = `
    <tr style="background-color: #f0f0f0; font-weight: bold;">
      <td colspan="3" style="text-align: right;">TOTALES</td>
      <td>${document.getElementById('sumHc').textContent}</td>
      <td>${document.getElementById('sumProt').textContent}</td>
      <td>${document.getElementById('sumGrasa').textContent}</td>
      <td>${document.getElementById('sumPavb').textContent}</td>
      <td>${document.getElementById('sumNa').textContent}</td>
      <td>${document.getElementById('sumK').textContent}</td>
      <td>${document.getElementById('sumP').textContent}</td>
      <td>${document.getElementById('sumCa').textContent}</td>
      <td>${document.getElementById('sumCol').textContent}</td>
      <td>${document.getElementById('sumPur').textContent}</td>
      <td>${document.getElementById('sumAgua').textContent}</td>
      <td>${document.getElementById('sumGs').textContent}</td>
      <td>${document.getElementById('sumChs').textContent}</td>
      <td>${document.getElementById('sumFibra').textContent}</td>
    </tr>
  `;

  return `
    <div class="pdf-report-container">
      <div class="pdf-header">
        <h1>Reporte Nutricional</h1>
        <p>${fecha} - ${nombre}</p>
      </div>

      <div class="pdf-section">
        <h3>Datos del Paciente</h3>
        <div class="pdf-grid">
          <div class="pdf-row"><span class="pdf-label">Nombre:</span> <span>${nombre}</span></div>
          <div class="pdf-row"><span class="pdf-label">Edad:</span> <span>${edad} años</span></div>
          <div class="pdf-row"><span class="pdf-label">Peso:</span> <span>${peso} kg</span></div>
          <div class="pdf-row"><span class="pdf-label">Talla:</span> <span>${talla} cm</span></div>
          <div class="pdf-row"><span class="pdf-label">IMC:</span> <span>${imc}</span></div>
          <div class="pdf-row"><span class="pdf-label">VCT Calculado:</span> <span>${vct} Kcal</span></div>
        </div>
      </div>

      <div class="pdf-section">
        <h3>Distribución de Macronutrientes</h3>
        <table class="pdf-table">
          <thead>
            <tr>
              <th>Macro</th>
              <th>%</th>
              <th>Kcal</th>
              <th>Gramos</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Carbohidratos</td>
              <td>${document.getElementById('distHcPorc').value}%</td>
              <td>${document.getElementById('distHcKcal').textContent}</td>
              <td>${document.getElementById('distHcGramos').textContent}</td>
            </tr>
            <tr>
              <td>Proteínas</td>
              <td>${document.getElementById('distPrPorc').value}%</td>
              <td>${document.getElementById('distPrKcal').textContent}</td>
              <td>${document.getElementById('distPrGramos').textContent}</td>
            </tr>
            <tr>
              <td>Grasas</td>
              <td>${document.getElementById('distGrPorc').value}%</td>
              <td>${document.getElementById('distGrKcal').textContent}</td>
              <td>${document.getElementById('distGrGramos').textContent}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="pdf-section">
        <h3>Fórmula Desarrollada</h3>
        <div style="overflow-x: visible;">
          <table class="pdf-table" style="font-size: 10px;">
            <thead>
              <tr style="background-color: #e0e0e0;">
                <th colspan="3" style="text-align: right;">METAS:</th>
                <th>${document.getElementById('targetHc').textContent}</th>
                <th>${document.getElementById('targetProt').textContent}</th>
                <th>${document.getElementById('targetGrasa').textContent}</th>
                <th colspan="8"></th>
                <th>${document.getElementById('targetGs').textContent}</th>
                <th>${document.getElementById('targetChs').textContent}</th>
                <th></th>
              </tr>
              <tr>
                <th>Alimento</th>
                <th>Medida</th>
                <th>Cant</th>
                <th>HC</th>
                <th>Prot</th>
                <th>Gr</th>
                <th>PAVB</th>
                <th>Na</th>
                <th>K</th>
                <th>P</th>
                <th>Ca</th>
                <th>Col</th>
                <th>Pur</th>
                <th>Agua</th>
                <th>GS</th>
                <th>CHS</th>
                <th>Fib</th>
              </tr>
            </thead>
            <tbody>
              ${fdRowsHTML}
              ${totalsHTML}
            </tbody>
          </table>
        </div>
      </div>

      <div class="pdf-section pdf-summary">
        <h3>Aporte Real de la Dieta</h3>
        <div class="pdf-grid">
          <div class="pdf-row"><span class="pdf-label">VCT Real:</span> <span>${document.getElementById('fdVctReal').textContent} Kcal</span></div>
          <div class="pdf-row"><span class="pdf-label">PAVB:</span> <span>${document.getElementById('fdPavbPorc').textContent} %</span></div>
          <div class="pdf-row"><span class="pdf-label">Grasas Saturadas:</span> <span>${document.getElementById('fdGsPorc').textContent} %</span></div>
          <div class="pdf-row"><span class="pdf-label">Carbohidratos Simples:</span> <span>${document.getElementById('fdChsPorc').textContent} %</span></div>
        </div>
      </div>
    </div>
  `;
}

// ==========================================================================
// LÓGICA PARA FÓRMULA DESARROLLADA
// ==========================================================================

// Inicialización de listeners para la tabla de fórmula desarrollada
document.addEventListener('DOMContentLoaded', () => {
  // Agregar listeners a todos los inputs numéricos de la tabla
  const inputs = document.querySelectorAll('.fd-input-num');
  inputs.forEach(input => {
    input.addEventListener('input', calcularFormulaDesarrollada);
  });
});

function actualizarDatosFormulaDesarrollada() {
  const nombre = document.getElementById('nombre').value;
  // Usar el VCT del input manual de la distribución
  const vctTarget = document.getElementById('distVct').value;
  const pavbRef = document.getElementById('distPavb').textContent;

  document.getElementById('fdNombre').textContent = nombre;
  document.getElementById('fdVctTarget').textContent = vctTarget;
  document.getElementById('fdPavbRef').textContent = pavbRef;

  // 2. Calcular Metas (Targets)
  // HC, Prot, Grasa vienen de la distribución (en gramos)
  document.getElementById('targetHc').textContent = document.getElementById('distHcGramos').textContent;
  document.getElementById('targetProt').textContent = document.getElementById('distPrGramos').textContent;
  document.getElementById('targetGrasa').textContent = document.getElementById('distGrGramos').textContent;

  // PAVB Target (Reference)
  document.getElementById('targetPavb').textContent = document.getElementById('distPavb').textContent;

  // GS (Grasa Saturada): < 7% del VCT / 9 kcal/g
  // CHS (Carbohidratos Simples): < 10% del VCT (o 20% según criterio) / 4 kcal/g
  // El usuario pidió: GS (7% VCT) y CHS (20% VCT)
  const vct = parseFloat(vctTarget) || 0;

  const targetGs = (vct * 0.07) / 9;
  document.getElementById('targetGs').textContent = formatNumber(targetGs, 1);

  const targetChs = (vct * 0.20) / 4;
  document.getElementById('targetChs').textContent = formatNumber(targetChs, 1);

  // Mostrar la sección
  document.getElementById('formulaDesarrollada').style.display = 'block';

  // Recalcular por si hubo cambios en referencias
  calcularFormulaDesarrollada();
}

// Listener para el botón de agregar fila
document.getElementById('btnAddRow').addEventListener('click', agregarFilaFormula);

function agregarFilaFormula() {
  const tbody = document.getElementById('fdTableBody');
  const newRow = document.createElement('tr');

  // Estructura de la fila (17 columnas)
  // 2 inputs de texto, 15 inputs numéricos
  let html = '';

  // Col 1: Alimento (Texto)
  html += '<td><input type="text" class="fd-input-text" /></td>';
  // Col 2: Medida Casera (Texto)
  html += '<td><input type="text" class="fd-input-text" /></td>';
  // Col 3: Cantidad (Num)
  html += '<td><input type="number" class="fd-input-num" /></td>';

  // Cols 4-17: Nutrientes (Num) - Asignar clases específicas si es necesario para selectores CSS,
  // pero la lógica de cálculo usa índices, así que las clases son opcionales salvo .fd-input-num
  const clases = [
    'fd-hc', 'fd-prot', 'fd-grasa', 'fd-pavb', 'fd-na', 'fd-k', 'fd-p',
    'fd-ca', 'fd-col', 'fd-pur', 'fd-agua', 'fd-gs', 'fd-chs', 'fd-fibra'
  ];

  clases.forEach(cls => {
    html += `<td><input type="number" class="fd-input-num ${cls}" /></td>`;
  });

  newRow.innerHTML = html;
  tbody.appendChild(newRow);

  // Agregar listeners a los nuevos inputs
  const newInputs = newRow.querySelectorAll('.fd-input-num');
  newInputs.forEach(input => {
    input.addEventListener('input', calcularFormulaDesarrollada);
  });
}

function calcularFormulaDesarrollada() {
  // Column indices (0-based) in the inputs array of a row
  // Row structure: Text, Text, Num, HC, Prot, PAVB, Grasa, Na, K, P, Ca, Col, Pur, Agua, GS, CHS, Fibra
  // Indices of inputs: 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16

  const rows = document.querySelectorAll('#fdTableBody tr');
  const sums = {
    hc: 0, prot: 0, grasa: 0, pavb: 0, na: 0, k: 0, p: 0, ca: 0, col: 0, pur: 0, agua: 0, gs: 0, chs: 0, fibra: 0
  };

  rows.forEach(row => {
    const inputs = row.querySelectorAll('input');
    if (inputs.length < 17) return; // Safety check

    // Helper to get value (handling comma as decimal separator)
    const val = (idx) => {
      const v = inputs[idx].value.replace(',', '.');
      return parseFloat(v) || 0;
    };

    sums.hc += val(3);
    sums.prot += val(4);
    sums.pavb += val(5); // Moved PAVB here
    sums.grasa += val(6); // Moved Grasa here
    sums.na += val(7);
    sums.k += val(8);
    sums.p += val(9);
    sums.ca += val(10);
    sums.col += val(11);
    sums.pur += val(12);
    sums.agua += val(13);
    sums.gs += val(14);
    sums.chs += val(15);
    sums.fibra += val(16);
  });

  // Update Totals Row
  document.getElementById('sumHc').textContent = formatNumber(sums.hc, 1);
  document.getElementById('sumProt').textContent = formatNumber(sums.prot, 1);
  document.getElementById('sumGrasa').textContent = formatNumber(sums.grasa, 1);
  document.getElementById('sumPavb').textContent = formatNumber(sums.pavb, 1);
  document.getElementById('sumNa').textContent = formatNumber(sums.na, 1);
  document.getElementById('sumK').textContent = formatNumber(sums.k, 1);
  document.getElementById('sumP').textContent = formatNumber(sums.p, 1);
  document.getElementById('sumCa').textContent = formatNumber(sums.ca, 1);
  document.getElementById('sumCol').textContent = formatNumber(sums.col, 1);
  document.getElementById('sumPur').textContent = formatNumber(sums.pur, 1);
  document.getElementById('sumAgua').textContent = formatNumber(sums.agua, 1);
  document.getElementById('sumGs').textContent = formatNumber(sums.gs, 1);
  document.getElementById('sumChs').textContent = formatNumber(sums.chs, 1);
  document.getElementById('sumFibra').textContent = formatNumber(sums.fibra, 1);

  // Calculate KCAL Row
  const kcalHc = sums.hc * 4;
  const kcalProt = sums.prot * 4;
  const kcalGrasa = sums.grasa * 9;
  const kcalGs = sums.gs * 9;
  const kcalChs = sums.chs * 4;

  document.getElementById('kcalHc').textContent = formatNumber(kcalHc, 1);
  document.getElementById('kcalProt').textContent = formatNumber(kcalProt, 1);
  document.getElementById('kcalGrasa').textContent = formatNumber(kcalGrasa, 1);
  document.getElementById('kcalGs').textContent = formatNumber(kcalGs, 1);
  document.getElementById('kcalChs').textContent = formatNumber(kcalChs, 1);

  // 4. Actualizar Resumen (Aporte real de la dieta)
  const vctReal = kcalHc + kcalProt + kcalGrasa;
  document.getElementById('fdVctReal').textContent = formatNumber(vctReal, 2);

  // PAVB %: (100 * PAVB Real) / Total Proteínas
  // El usuario pidió: "(100*PAVB real)/tptal de proteinas"
  let pavbPorc = 0;
  if (sums.prot > 0) {
    pavbPorc = (100 * sums.pavb) / sums.prot;
  }
  document.getElementById('fdPavbPorc').textContent = formatNumber(pavbPorc, 2);

  // Grasa Saturadas % (GS Kcal / VCT Real * 100)
  // GS Kcal = GS Grams * 9
  let gsPorc = 0;
  if (vctReal > 0) {
    gsPorc = ((sums.gs * 9) / vctReal) * 100;
    document.getElementById('fdGsPorc').textContent = formatNumber(gsPorc, 2);
  } else {
    document.getElementById('fdGsPorc').textContent = '0,00';
  }

  // CHS % (CHS Kcal / VCT Real * 100)
  // CHS Kcal = CHS Grams * 4
  let chsPorc = 0;
  if (vctReal > 0) {
    chsPorc = ((sums.chs * 4) / vctReal) * 100;
    document.getElementById('fdChsPorc').textContent = formatNumber(chsPorc, 2);
  } else {
    document.getElementById('fdChsPorc').textContent = '0,00';
  }
}