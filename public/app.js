// Permite coma como separador decimal
function num(v) {
    if (!v) return NaN;
    return parseFloat(v.toString().replace(",", "."));
}

document.getElementById('fecha').valueAsDate = new Date();

document.getElementById("formCalculos").addEventListener("submit", realizarCalculos);

function realizarCalculos(e) {
    e.preventDefault();

    const datos = {
        nombre: document.getElementById('nombre').value.trim(),
        fecha: document.getElementById('fecha').value,
        edad: parseInt(document.getElementById('edad').value, 10),
        peso: num(document.getElementById('peso').value),
        talla: num(document.getElementById('talla').value),
        sexo: document.getElementById('sexo').value,
        cintura: num(document.getElementById('cintura').value),
        muneca: num(document.getElementById('muneca').value),

        x_val: num(document.getElementById('x_val').value),
        y_val: num(document.getElementById('y_val').value),
        z_val: num(document.getElementById('z_val').value),

        pesoIdealManual: num(document.getElementById('pesoIdealManual').value),

        dxMedico: document.getElementById('dxMedico').value.trim(),
        dxNutricional: document.getElementById('dxNutricional').value.trim()
    };

    const req = ['peso','talla','cintura','muneca'];
    for (const key of req) {
        if (isNaN(datos[key]) || datos[key] <= 0) {
            alert("Valores numéricos inválidos.");
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
        alert("No se pudo calcular el Peso Ideal.");
        return;
    }

    const valorCtx = datos.talla / datos.muneca;
    let tipoCtx = "";

    if (datos.sexo === "masculino") {
        if (valorCtx > 10.4) tipoCtx = "Pequeña";
        else if (valorCtx >= 9.6) tipoCtx = "Mediana";
        else tipoCtx = "Grande";
    } else {
        if (valorCtx > 11) tipoCtx = "Pequeña";
        else if (valorCtx >= 10.1) tipoCtx = "Mediana";
        else tipoCtx = "Grande";
    }

    const ppi = (datos.peso / pesoIdeal) * 100;
    let interpretacion = "";
    let ppiClass = "";

    if (ppi > 180)      { interpretacion = "Obesidad mórbida"; ppiClass = "chip obesidad"; }
    else if (ppi >= 140){ interpretacion = "Obesidad II"; ppiClass = "chip obesidad"; }
    else if (ppi >= 120){ interpretacion = "Obesidad I"; ppiClass = "chip sobrepeso"; }
    else if (ppi >= 110){ interpretacion = "Sobrepeso"; ppiClass = "chip sobrepeso"; }
    else if (ppi >= 90) { interpretacion = "Normal"; ppiClass = "chip normal"; }
    else if (ppi >= 85) { interpretacion = "Desnutrición leve"; ppiClass = "chip desnutricion"; }
    else if (ppi >= 75) { interpretacion = "Desnutrición moderada"; ppiClass = "chip desnutricion"; }
    else                { interpretacion = "Desnutrición severa"; ppiClass = "chip desnutricion"; }

    const talla_m = datos.talla / 100;
    const imc = datos.peso / (talla_m * talla_m);

    let imcCat = "";
    if (imc < 18.5) imcCat = "Bajo peso";
    else if (imc < 25) imcCat = "Normal";
    else if (imc < 30) imcCat = "Sobrepeso";
    else imcCat = "Obesidad";

    const ratio = datos.cintura / datos.talla;
    const riesgo = ratio > 0.5;

    document.getElementById('ctxValor').textContent = valorCtx.toFixed(2).replace(".", ",");
    document.getElementById('ctxTipo').textContent = tipoCtx;
    document.getElementById('pesoIdealRes').textContent = pesoIdeal.toFixed(1).replace(".", ",");
    document.getElementById('ppiRes').textContent = ppi.toFixed(1).replace(".", ",");
    document.getElementById('ppiChip').className = ppiClass;
    document.getElementById('ppiChip').textContent = interpretacion;
    document.getElementById('imcRes').textContent = imc.toFixed(1).replace(".", ",");
    document.getElementById('imcCat').textContent = imcCat;
    document.getElementById('cinturaTalla').textContent = ratio.toFixed(2).replace(".", ",");

    document.getElementById('riesgoCintura').style.display = riesgo ? "block" : "none";
    document.getElementById('resultados').style.display = "block";
}
