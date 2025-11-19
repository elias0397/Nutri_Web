export default {
  async fetch(request) {
    if (request.method === "POST") {
      try {
        const datos = await request.json();

        // --- 1) Peso ideal ---
        let pesoIdeal = NaN;
        if (!isNaN(datos.x_val) && !isNaN(datos.y_val) && !isNaN(datos.z_val) && datos.z_val !== 0) {
          pesoIdeal = (datos.x_val + datos.y_val) / datos.z_val;
        }
        if (!isNaN(datos.pesoIdealManual) && datos.pesoIdealManual > 0) {
          pesoIdeal = datos.pesoIdealManual;
        }
        if (isNaN(pesoIdeal) || pesoIdeal <= 0) {
          return new Response(JSON.stringify({ error: "Peso ideal inválido" }), { status: 400 });
        }

        // --- 2) Contextura corporal ---
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
        }

        // --- 3) % Peso Ideal (PPI) ---
        const ppi = (datos.peso / pesoIdeal) * 100;
        let interpretacion = '';
        let ppiClass = '';
        if (ppi > 180)      { interpretacion = 'Obesidad mórbida'; ppiClass = 'obesidad'; }
        else if (ppi >= 140){ interpretacion = 'Obesidad II'; ppiClass = 'obesidad'; }
        else if (ppi >= 120){ interpretacion = 'Obesidad I'; ppiClass = 'sobrepeso'; }
        else if (ppi >= 110){ interpretacion = 'Sobrepeso'; ppiClass = 'sobrepeso'; }
        else if (ppi >= 90) { interpretacion = 'Normal o Estándar'; ppiClass = 'normal'; }
        else if (ppi >= 85) { interpretacion = 'Desnutrición leve'; ppiClass = 'desnutricion'; }
        else if (ppi >= 75) { interpretacion = 'Desnutrición moderada'; ppiClass = 'desnutricion'; }
        else                { interpretacion = 'Desnutrición severa'; ppiClass = 'desnutricion'; }

        // --- 4) IMC ---
        const talla_m = datos.talla / 100;
        const imc = datos.peso / (talla_m ** 2);
        let imcCategoria = '';
        if (imc < 18.5) imcCategoria = 'Bajo peso';
        else if (imc < 25) imcCategoria = 'Normal';
        else if (imc < 30) imcCategoria = 'Sobrepeso';
        else imcCategoria = 'Obesidad';

        // --- 5) Relación cintura/talla ---
        const cinturaTallaRatio = datos.cintura / datos.talla;
        const riesgoCintura = cinturaTallaRatio > 0.5;

        return new Response(JSON.stringify({
          valorCtx,
          tipoCtx,
          pesoIdeal,
          ppi,
          interpretacion,
          ppiClass,
          imc,
          imcCategoria,
          cinturaTallaRatio,
          riesgoCintura
        }), {
          headers: { "Content-Type": "application/json" }
        });

      } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
      }
    }

    return new Response("NutriWeb Worker activo", { status: 200 });
  }
}
