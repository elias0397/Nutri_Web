// Guardamos la fecha actual en el input
document.getElementById('fecha').valueAsDate = new Date();

// Función principal: toma todos los valores, valida, calcula y muestra resultados
function realizarCalculos(e) {
  e.preventDefault();

  const datos = {
    nombre: document.getElementById('nombre').value.trim(),
    fecha: document.getElementById('fecha').value,
    edad: parseInt(document.getElementById('edad').value, 10),
    peso: parseFloat(document.getElementById('peso').value),
    talla: parseFloat(document.getElementById('talla').value),
    sexo: document.getElementById('sexo').value,
    cintura: parseFloat(document.getElementById('cintura').value),
    muneca: parseFloat(document.getElementById('muneca').value),
    x_val: parseFloat(document.getElementById('x_val').value),
    y_val: parseFloat(document.getElementById('y_val').value),
    z_val: parseFloat(document.getElementById('z_val').value),
    pesoIdealManual: parseFloat(document.getElementById('pesoIdealManual').value),
    dxMedico: document.getElementById('dxMedico').value.trim(),
    dxNutricional: document.getElementById('dxNutricional').value.trim()
  };

  const numerosRequeridos = ['peso','talla','cintura','muneca'];
  for (const key of numerosRequeridos) {
    if (isNaN(datos[key]) || datos[key] <= 0) {
      alert('Por favor ingresa valores numéricos válidos para peso, talla, cintura y muñeca.');
      return;
    }
  }

  let pesoIdeal = NaN;
  if (!isNaN(datos.x_val) && !isNaN(datos.y_val) && !isNaN(datos.z_val) && datos.z_val !== 0) {
    pesoIdeal = (datos.x_val + datos.y_val) / datos.z_val;
  }
  if (!isNaN(datos.pesoIdealManual) && datos.pesoIdealManual > 0) {
    pesoIdeal = datos.pesoIdealManual;
  }
  if (isNaN(pesoIdeal) || pesoIdeal <= 0) {
    alert('No se pudo calcular el Peso Ideal. Completa X, Y, Z correctamente o ingresa manualmente el Peso Ideal.');
    return;
  }

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
    tipoCtx = 'No definido (sexo no seleccionado)';
  }

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

  const talla_m = datos.talla / 100;
  const imc = datos.peso / (talla_m * talla_m);
  let imcCategoria = '';
  if (imc < 18.5) imcCategoria = 'Bajo peso';
  else if (imc < 25) imcCategoria = 'Normal';
  else if (imc < 30) imcCategoria = 'Sobrepeso';
  else imcCategoria = 'Obesidad';

  const cinturaTallaRatio = datos.cintura / datos.talla;
  const riesgoCintura = cinturaTallaRatio > 0.5;

  document.getElementById('ctxValor').textContent = valorCtx.toFixed(2);
  document.getElementById('ctxTipo').textContent = tipoCtx;
  document.getElementById('pesoIdealRes').textContent = pesoIdeal.toFixed(1);
  document.getElementById('ppiRes').textContent = ppi.toFixed(1);
  document.getElementById('interpretacionRes').textContent = interpretacion;

  const chip = document.getElementById('ppiChip');
  chip.className = ppiClass;
  chip.textContent = interpretacion;

  document.getElementById('imcRes').textContent = imc.toFixed(1);
  document.getElementById('imcCat').textContent = imcCategoria;
  document.getElementById('cinturaTalla').textContent = cinturaTallaRatio.toFixed(2);

  const riesgoElem = document.getElementById('riesgoCintura');
  riesgoElem.style.display = riesgoCintura ? 'block' : 'none';

  document.getElementById('resultados').style.display = 'block';

  // Abre en otra pestaña los resultados en HTML simple
  const newWin = window.open('', '_blank');
  newWin.document.write(`<h1>Resultados de ${datos.nombre}</h1>
  <p>Peso Ideal: ${pesoIdeal.toFixed(1)} kg</p>
  <p>% Peso Ideal (PPI): ${ppi.toFixed(1)} — ${interpretacion}</p>
  <p>IMC: ${imc.toFixed(1)} — ${imcCategoria}</p>
  <p>Relación cintura/talla: ${cinturaTallaRatio.toFixed(2)} ${riesgoCintura ? '- Riesgo cardiovascular' : ''}</p>
  <p>Contextura corporal: ${tipoCtx} (${valorCtx.toFixed(2)})</p>
  `);
  newWin.document.close();
}
