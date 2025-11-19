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
    // tallaIMC: ya no se obtiene, se calcula
    sexo: document.getElementById('sexo').value,
    cintura: getData('cintura'),
    muneca: getData('muneca'),
    x_val: getData('x_val'),
    y_val: getData('y_val'),
    z_val: getData('z_val'),
    pesoIdealManual: getData('pesoIdealManual'),
    factorAF: getData('factorAF')
  };

  // =====================================================
  // 2) Validaciones básicas
  // =====================================================
  // Se quitó 'tallaIMC' de la lista de validaciones
  const numerosRequeridos = ['peso','talla','cintura','muneca', 'factorAF'];
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
  if (!isNaN(datos.x_val) && !isNaN(datos.y_val) && !isNaN(datos.z_val) && datos.z_val !== 0) {
    pesoIdeal = (datos.x_val + datos.y_val) / datos.z_val;
    document.getElementById('pesoIdealManual').value = pesoIdeal.toFixed(1).replace('.', ','); 
  }
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
  // Calcular Talla en metros a partir de Talla en CM (NUEVA LÓGICA)
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
  // Si el paciente tiene sobrepeso o es obeso (IMC >= 25 O PPI >= 110%), se usa Peso Ajustado.
  if (imc >= 25 || ppi >= 110) {
    // PA = PI + 0.25 * (Peso Actual - PI)
    const PA = pesoIdeal + 0.25 * (datos.peso - pesoIdeal);
    pesoUtilizar = PA;
  } else {
    // Si no hay sobrepeso/obesidad, se usa el Peso Actual.
    pesoUtilizar = datos.peso;
  }
  
  // Fórmula Práctica (Valor fijo según tu imagen anterior)
  const formulaPractica = 2005;

  // Harris-Benedict Revisada (Mifflin-St Jeor) - Usa Talla en CM
  let tmb;
  if (datos.sexo === 'masculino') {
    // TMB Hombres: 10 * P + 6.25 * T - 5 * E + 5
    tmb = 10 * pesoUtilizar + 6.25 * datos.talla - 5 * datos.edad + 5;
  } else {
    // TMB Mujeres: 10 * P + 6.25 * T - 5 * E - 161
    tmb = 10 * pesoUtilizar + 6.25 * datos.talla - 5 * datos.edad - 161;
  }
  
  // Valor Calórico Total (VCT) = TMB * Factor AF
  const vct = tmb * datos.factorAF;


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
  // 7) Mostrar todos los resultados
  // =====================================================
  
  // Resultados Energía
  document.getElementById('pesoAjustadoRes').textContent = pesoUtilizar.toFixed(1).replace('.', ',');
  document.getElementById('formulaPracticaRes').textContent = formulaPractica.toFixed(0);
  document.getElementById('harrisBenedictRes').textContent = tmb.toFixed(1).replace('.', ',');
  document.getElementById('vctRes').textContent = vct.toFixed(1).replace('.', ',');

  // Resultados IMC
  document.getElementById('imcAutoRes').textContent = imc.toFixed(2).replace('.', ',');
  document.getElementById('imcAutoCat').textContent = imcCat;
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

  // Mostrar la tarjeta de resultados y hacer scroll suave (solución móvil)
  setTimeout(() => {
    document.getElementById('resultados').style.display = 'block';
    document.getElementById('resultados').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 50);
}