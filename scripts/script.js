(function () {
  const entradaIp = document.getElementById('ipCompleta');
  const entradaMascara = document.getElementById('subnetCompleta');
  const botonLocal = document.getElementById('btnLocalIP');
  const botonCalcular = document.getElementById('calcular');
  const botonHistorial = document.getElementById('verHistorial');
  const divHistorial = document.getElementById('resumen-sesiones');

  //Auto-cargar IP pública
  fetch('https://api.ipify.org?format=json')
    .then((respuesta) => respuesta.json())
    .then((datos) => {
      entradaIp.value = datos.ip;
      validarIp();
    })
    .catch(() => {});

  //Validación visual IP y máscara
  function validarIp() {
    const valor = entradaIp.value.trim();
    const partes = valor.split('.');
    let esValido = partes.length === 4;

    for (let i = 0; i < partes.length; i++) {
      const numero = parseInt(partes[i], 10);
      if (isNaN(numero) || numero < 0 || numero > 255) {
        esValido = false;
        break;
      }
    }

    aplicarEstilo(entradaIp, esValido);
  }

  function validarMascara() {
    const valor = entradaMascara.value.trim();
    const numero = parseInt(valor, 10);
    if (!isNaN(numero) && numero >= 8 && numero <= 30) {
      entradaMascara.style.borderColor = '#00ff00';
      entradaMascara.style.boxShadow = '0 0 5px #00ff00';
      entradaMascara.style.color = '#00ff00';
    } else {
      entradaMascara.style.borderColor = 'red';
      entradaMascara.style.boxShadow = '0 0 5px red';
      entradaMascara.style.color = 'red';
    }
  }

  function aplicarEstilo(elemento, valido) {
    if (valido) {
      elemento.style.borderColor = '#00ff00';
      elemento.style.boxShadow = '0 0 5px #00ff00';
      elemento.style.color = '#00ff00';
    } else {
      elemento.style.borderColor = 'red';
      elemento.style.boxShadow = '0 0 5px red';
      elemento.style.color = 'red';
    }
  }

  entradaIp.addEventListener('input', validarIp);
  entradaMascara.addEventListener('input', validarMascara);

  //Rellenar máscara por defecto
  entradaIp.addEventListener('blur', function () {
    var partesIp = entradaIp.value.split('.');
    var primerOcteto = parseInt(partesIp[0], 10);

    if (primerOcteto >= 1 && primerOcteto <= 126) {
      entradaMascara.value = 8;
    } else if (primerOcteto >= 128 && primerOcteto <= 191) {
      entradaMascara.value = 16;
    } else if (primerOcteto >= 192 && primerOcteto <= 223) {
      entradaMascara.value = 24;
    }

    validarMascara();
  });

  //Obtener IP Local
  botonLocal.addEventListener('click', () => {
    const valorIpLocal = prompt("Introduce tu IP local manualmente:");
    if (valorIpLocal) {
      entradaIp.value = valorIpLocal;
      validarIp();
    }
  });

  //Coloreado binario bit a bit
  function colorearBinario(binario, bitsRed, bitsSubred) {
    const bits = binario.split('.').join('');
    let html = '';
    for (let i = 0; i < bits.length; i++) {
      let color;
      if (i < bitsRed) {
        color = 'red';
      } else if (i < bitsSubred) {
        color = 'orange';
      } else {
        color = 'limegreen';
      }
      html += '<span style="color:' + color + ';">' + bits[i] + '</span>';
      if ((i + 1) % 8 === 0 && i < bits.length - 1) {
        html += '.';
      }
    }
    return html;
  }

  //Comprueba si IP es privada
  function esPrivada(octetos) {
    var o1 = octetos[0];
    var o2 = octetos[1];
    if (o1 === 10) {
      return true;
    }
    if (o1 === 172 && o2 >= 16 && o2 <= 31) {
      return true;
    }
    if (o1 === 192 && o2 === 168) {
      return true;
    }
    return false;
  }

  //Modal
  function mostrarModal(html) {
    var divExistente = document.getElementById('resultados');
    if (divExistente) {
      divExistente.parentNode.removeChild(divExistente);
    }
    var div = document.createElement('div');
    div.id = 'resultados';
    div.className = 'ventana-emergente';
    div.innerHTML = html + '<button id="cerrarVentana">Cerrar</button>';
    document.body.appendChild(div);
    var botonCerrar = document.getElementById('cerrarVentana');
    botonCerrar.onclick = function () {
      div.parentNode.removeChild(div);
    };
  }

  //Calcular y mostrar resumen
  botonCalcular.addEventListener('click', () => {
    validarIp();
    validarMascara();
    const valorIp = entradaIp.value.trim();
    const valorMascara = parseInt(entradaMascara.value, 10);
    if (
      valorIp.split('.').length !== 4 ||
      valorIp.split('.').some((octeto) => {
      const numero = parseInt(octeto, 10);
      return isNaN(numero) || numero < 0 || numero > 255;
      }) ||
      isNaN(valorMascara) ||
      valorMascara < 8 ||
      valorMascara > 30
    ) {
      return mostrarModal('<p class="error">IP o máscara inválidas.</p>');
    }
    const octetos = valorIp.split('.').map((n) => parseInt(n, 10));
    if (octetos.some((o) => o < 0 || o > 255)) {
      return mostrarModal('<p class="error">IP inválida.</p>');
    }
    const [a, b2, b3, b4] = octetos;
    const bits = valorMascara;
    const bitsDefecto = a <= 126 ? 8 : a <= 191 ? 16 : 24;
    const mascaraInt = Math.pow(2, 32) - Math.pow(2, 32 - bits);
    const mascaraOctetos = [];
    //Sacamos los octetos de la mascara
    mascaraOctetos.push((mascaraInt >> 24) & 255);
    mascaraOctetos.push((mascaraInt >> 16) & 255);
    mascaraOctetos.push((mascaraInt >> 8) & 255);
    mascaraOctetos.push(mascaraInt & 255);
  
    const mascaraDecimal = mascaraOctetos.join('.');
    const comodin = mascaraOctetos.map((x) => 255 - x).join('.');
    const ipInt = ((a << 24) | (b2 << 16) | (b3 << 8) | b4) >>> 0;
    const redInt = ipInt & mascaraInt;
    const bcInt = redInt | (~mascaraInt >>> 0);
    const totalHosts = bits < 31 ? 2 ** (32 - bits) - 2 : bits === 31 ? 2 : 1;
    const hostMinimo = bits < 31 ? redInt + 1 : redInt;
    const hostMaximo = bits < 31 ? bcInt - 1 : bits === 31 ? redInt + 1 : redInt;
    const intAip = (i) =>
      [(i >>> 24) & 0xff, (i >>> 16) & 0xff, (i >>> 8) & 0xff, i & 0xff].join(
        '.'
      );
    const subredes = bits > bitsDefecto ? 2 ** (bits - bitsDefecto) : 1;
    const ipHexadecimal = octetos.map((x) => x.toString(16).padStart(2, '0')).join('.');
    const ipBinaria = octetos.map((x) => x.toString(2).padStart(8, '0')).join('.');
    const mascaraBinaria = mascaraOctetos
      .map((x) => x.toString(2).padStart(8, '0'))
      .join('.');
    const comodinBinario = comodin
      .split('.')
      .map((x) => parseInt(x).toString(2).padStart(8, '0'))
      .join('.');
    const redBinaria = intAip(redInt)
      .split('.')
      .map((x) => parseInt(x).toString(2).padStart(8, '0'))
      .join('.');
    const bcBinaria = intAip(bcInt)
      .split('.')
      .map((x) => parseInt(x).toString(2).padStart(8, '0'))
      .join('.');
    const esPriv = esPrivada(octetos) ? 'Privada' : 'Pública';

    const html = `
      <h2>Detalles de la IP</h2>
      <p><strong>IP:</strong> ${valorIp} (${esPriv})</p>
      <p><strong>BIN:</strong> ${colorearBinario(ipBinaria, bitsDefecto, bits)}</p>
      <p><strong>Máscara /${bits}:</strong> ${mascaraDecimal} (${colorearBinario(mascaraBinaria, bitsDefecto, bits)})</p>
      <p><strong>Comodín:</strong> ${comodin} (${colorearBinario(comodinBinario, bitsDefecto, bits)})</p>
      <p><strong>Red:</strong> ${intAip(redInt)} (${colorearBinario(redBinaria, bitsDefecto, bits)})</p>
      <p><strong>Broadcast:</strong> ${intAip(bcInt)} (${colorearBinario(bcBinaria, bitsDefecto, bits)})</p>
      <p><strong>Clase:</strong> ${
        bitsDefecto === 8 ? 'A' : bitsDefecto === 16 ? 'B' : 'C'
      }</p>
      <p><strong>Número de subredes:</strong> ${subredes}</p>
      <p><strong>Hosts totales:</strong> ${totalHosts}</p>
      <p><strong>Host mínimo:</strong> ${intAip(hostMinimo)}</p>
      <p><strong>Host máximo:</strong> ${intAip(hostMaximo)}</p>
      <p><strong>IP hexadecimal:</strong> ${ipHexadecimal}</p>
    `;
    mostrarModal(html);
  });
  
})();
