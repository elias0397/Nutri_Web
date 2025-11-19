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
    talla: getData('talla'), // en CM
    sexo: document.getElementById('sexo').value,
    cintura: getData('cintura'),
    muneca: getData('muneca'),
    x_val: getData('x_val'),
    y_val: getData('y_val'),
    z_val: getData('z_val'),
    pesoIdealManual: getData('pesoIdealManual'),
    factorActividad: getData('factorActividad'),
    factorInjuria: getData('factorInjuria')
  };

  // =====================================================
  // 2) Validaciones básicas
  // =====================================================
  const numerosRequeridos = ['peso','talla','cintura','muneca', 'factorActividad', 'factorInjuria']; 
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

  // =====================================================
  // 3) Cálculo de Peso Ideal y PPI
  // =====================================================
  let pesoIdeal = NaN;
  // Cálculo automático del Peso Ideal
  if (!isNaN(datos.x_val) && !isNaN(datos.y_val) && !isNaN(datos.z_val) && datos.z_val !== 0) {
    pesoIdeal = (datos.x_val + datos.y_val) / datos.z_val;
    document.getElementById('pesoIdealManual').value = pesoIdeal.toFixed(1).replace('.', ','); 
  }
  // Uso del Peso Ideal Manual si está disponible
  if (!isNaN(datos.pesoIdealManual) && datos.pesoIdealManual > 0) {
    pesoIdeal = datos.pesoIdealManual;
    document.getElementById('pesoIdealManual').value = pesoIdeal.toFixed(1).replace('.', ',');
  }
  if (isNaN(pesoIdeal) || pesoIdeal <= 0) {
    alert('No se pudo calcular el Peso Ideal. Completa X, Y, Z o ingresa manualmente.');
    return;
  }
  const ppi = (datos.peso / pesoIdeal) * 100;

  // Clasificación PPI
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
  // 4) Cálculo de IMC
  // =====================================================
  // Calcular Talla en metros a partir de Talla en CM
  const talla_metros = datos.talla / 100; 
  const imc = datos.peso / (talla_metros * talla_metros);
  let imcCat = '';
  let imcClass = '';

  if (imc < 18.5)      { imcCat = 'Delgadez o Bajo peso'; imcClass = 'chip desnutricion'; }
  else if (imc < 25)   { imcCat = 'Peso normal, Sano o Saludable'; imcClass = 'chip normal'; }
  else if (imc < 30)   { imcCat = 'Sobrepeso'; imcClass = 'chip sobrepeso'; }
  else if (imc < 35)   { imcCat = 'Obesidad Grado I'; imcClass = 'chip obesidad'; }
  else if (imc < 40)   { imcCat = 'Obesidad Grado II'; imcClass = 'chip obesidad'; }
  else                 { imcCat = 'Obesidad Grado III o Mórbida'; imcClass = 'chip obesidad'; }

  // =====================================================
  // 5) Cálculos de Energía
  // =====================================================
  
  let pesoUtilizar;
  // Determinar Peso a utilizar (Peso Actual o Peso Ajustado - PA)
  // CONDICIÓN: Si el paciente tiene sobrepeso o es obeso (IMC >= 25 O PPI >= 110%), se usa Peso Ajustado.
  if (imc >= 25 || ppi >= 110) {
    // FÓRMULA PESO AJUSTADO: (Peso actual - peso ideal)x 0,25 + Peso ideal
    const PA = (datos.peso - pesoIdeal) * 0.25 + pesoIdeal;
    pesoUtilizar = PA;
  } else {
    // Si no cumple la condición, se usa el Peso Actual.
    pesoUtilizar = datos.peso;
  }
  
  // 5.1) Cálculo de Fórmula Práctica (Depende del PPI)
  let factorKcal;
  let pesoParaPractica;

  if (ppi >= 110) {
      // Sobrepeso/Obesidad (PPI >= 110%) -> Peso Ajustado x 25 kcal
      pesoParaPractica = pesoUtilizar; // pesoUtilizar es PA en este caso
      factorKcal = 25;
  } else if (ppi >= 90) {
      // Normal (90% <= PPI < 110%) -> Peso X 30 kcal (Mantenimiento)
      pesoParaPractica = datos.peso;
      factorKcal = 30;
  } else if (ppi >= 85) {
      // Desnutrición Leve (85% <= PPI < 90%) -> Peso X 30 kcal
      pesoParaPractica = datos.peso;
      factorKcal = 30;
  } else if (ppi >= 75) {
      // Desnutrición Moderada (75% <= PPI < 85%) -> Peso X 40 kcal
      pesoParaPractica = datos.peso;
      factorKcal = 40;
  } else { // ppi < 75
      // Desnutrición Severa (PPI < 75%) -> Peso X 45 kcal
      pesoParaPractica = datos.peso;
      factorKcal = 45;
  }

  const formulaPractica = pesoParaPractica * factorKcal;


  // 5.2) Harris-Benedict Original (TMB/GMR) - Usa Talla en CM y el Peso a Utilizar
  let tmb;
  if (datos.sexo === 'masculino') {
    // TMB Hombres: 66,47 + (13, 75 x P) + (5 x T) - (6,75 x E)
    tmb = 66.47 + (13.75 * pesoUtilizar) + (5 * datos.talla) - (6.75 * datos.edad);
  } else {
    // TMB Mujeres: 655, I + (9,56 x P) + (1,85 x T) - (4,68 x E)
    tmb = 655.1 + (9.56 * pesoUtilizar) + (1.85 * datos.talla) - (4.68 * datos.edad);
  }
  
  // 5.3) Valor Calórico Total (VCT)
  // VCT = TMB x Factor Actividad x Factor Injuria
  const vct = tmb * datos.factorActividad * datos.factorInjuria;


  // =====================================================
  // 6) Otros Cálculos
  // =====================================================
  
  // Contextura corporal
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

  // Relación cintura / talla
  const cinturaTallaRatio = datos.cintura / datos.talla;
  const riesgoCintura = cinturaTallaRatio > 0.5;


  // =====================================================
  // 7) Mostrar todos los resultados y Scroll (REPARADO)
  // =====================================================
  
  // Resultados Energía (REPARADOS)
  document.getElementById('pesoAjustadoRes').textContent = pesoUtilizar.toFixed(1).replace('.', ',');
  document.getElementById('formulaPracticaRes').textContent = formulaPractica.toFixed(1).replace('.', ',');
  document.getElementById('harrisBenedictRes').textContent = tmb.toFixed(1).replace('.', ',');
  document.getElementById('vctRes').textContent = vct.toFixed(1).replace('.', ','); 

  // Resultados IMC (REPARADOS)
  document.getElementById('imcAutoRes').textContent = imc.toFixed(2).replace('.', ',');
  // Eliminamos imcAutoCat en el HTML, solo actualizamos el chip
  const imcChip = document.getElementById('imcAutoChip');
  imcChip.className = imcClass;
  imcChip.textContent = imcCat;

  // Resultados Contextura/Peso Ideal (REPARADOS)
  document.getElementById('ctxValor').textContent = valorCtx.toFixed(2).replace('.', ',');
  document.getElementById('ctxTipo').textContent = tipoCtx;
  document.getElementById('pesoIdealRes').textContent = pesoIdeal.toFixed(1).replace('.', ',');
  document.getElementById('ppiRes').textContent = ppi.toFixed(1).replace('.', ',') + '%';
  
  // Resultados PPI (REPARADOS)
  const ppiChip = document.getElementById('ppiChip');
  ppiChip.className = ppiClass;
  ppiChip.textContent = interpretacion; 

  // Resultados Cintura/Talla (REPARADOS)
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

  // Usar requestAnimationFrame para asegurar que el scroll funcione correctamente en móviles
  window.requestAnimationFrame(() => {
    resultadosDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
}