async function realizarCalculos(e) {
    e.preventDefault();
  
    const datos = {
      nombre: document.getElementById('nombre').value.trim(),
      edad: parseInt(document.getElementById('edad').value,10),
      peso: parseFloat(document.getElementById('peso').value),
      talla: parseFloat(document.getElementById('talla').value),
      sexo: document.getElementById('sexo').value,
      cintura: parseFloat(document.getElementById('cintura').value),
      muneca: parseFloat(document.getElementById('muneca').value),
      x_val: parseFloat(document.getElementById('x_val').value),
      y_val: parseFloat(document.getElementById('y_val').value),
      z_val: parseFloat(document.getElementById('z_val').value),
      pesoIdealManual: parseFloat(document.getElementById('pesoIdealManual').value)
    };
  
    try {
      const res = await fetch('https://TU_WORKER.workers.dev', {
        method: 'POST',
        headers: { 'Content-Type':'application/json' },
        body: JSON.stringify(datos)
      });
  
      const resultado = await res.json();
  
      if (res.ok) {
        document.getElementById('ctxValor').textContent = resultado.valorCtx.toFixed(2);
        document.getElementById('ctxTipo').textContent = resultado.tipoCtx;
        document.getElementById('pesoIdealRes').textContent = resultado.pesoIdeal.toFixed(1);
        document.getElementById('ppiRes').textContent = resultado.ppi.toFixed(1);
        document.getElementById('ppiChip').textContent = resultado.interpretacion;
        document.getElementById('imcRes').textContent = resultado.imc.toFixed(1);
        document.getElementById('imcCat').textContent = resultado.imcCategoria;
        document.getElementById('cinturaTalla').textContent = resultado.cinturaTallaRatio.toFixed(2);
        document.getElementById('riesgoCintura').style.display = resultado.riesgoCintura ? 'block':'none';
        document.getElementById('resultados').style.display = 'block';
      } else {
        alert(resultado.error);
      }
  
    } catch(err) {
      alert("Error conectando al Worker: "+err.message);
    }
  }
  