(function () {
  const ipInput = document.getElementById('ipCompleta');
  const maskInput = document.getElementById('subnetCompleta');
  const btnLocal = document.getElementById('btnLocalIP');
  const btnCalc = document.getElementById('calcular');
  const btnHist = document.getElementById('verHistorial');
  const histDiv = document.getElementById('resumen-sesiones');

  // 1) Auto-cargar IP pública
  fetch('https://api.ipify.org?format=json')
    .then((r) => r.json())
    .then((d) => {
      ipInput.value = d.ip;
      validateIp();
    })
    .catch(() => {});

   //2) Validación visual IP y máscara
  function validateIp() {
    const val = ipInput.value.trim();
    const parts = val.split('.');
    let isValid = parts.length === 4;

    for (let i = 0; i < parts.length; i++) {
      const num = parseInt(parts[i], 10);
      if (isNaN(num) || num < 0 || num > 255) {
        isValid = false;
        break;
      }
    }

    setStyle(ipInput, isValid);
  }

  function validateMask() {
    const value = maskInput.value.trim();
    const number = parseInt(value, 10);
    if (!isNaN(number) && number >= 8 && number <= 30) {
      maskInput.style.borderColor = '#00ff00';
      maskInput.style.boxShadow = '0 0 5px #00ff00';
      maskInput.style.color = '#00ff00';
    } else {
      maskInput.style.borderColor = 'red';
      maskInput.style.boxShadow = '0 0 5px red';
      maskInput.style.color = 'red';
    }
  }

  function setStyle(el, valid) {
    if (valid) {
      el.style.borderColor = '#00ff00';
      el.style.boxShadow = '0 0 5px #00ff00';
      el.style.color = '#00ff00';
    } else {
      el.style.borderColor = 'red';
      el.style.boxShadow = '0 0 5px red';
      el.style.color = 'red';
    }
  }

  ipInput.addEventListener('input', validateIp);
  maskInput.addEventListener('input', validateMask);

  // 3) Rellenar máscara por defecto
  ipInput.addEventListener('blur', function () {
    var ipParts = ipInput.value.split('.');
    var firstOctet = parseInt(ipParts[0], 10);

    if (firstOctet >= 1 && firstOctet <= 126) {
      maskInput.value = 8;
    } else if (firstOctet >= 128 && firstOctet <= 191) {
      maskInput.value = 16;
    } else if (firstOctet >= 192 && firstOctet <= 223) {
      maskInput.value = 24;
    }

    validateMask();
  });

  // 4) Obtener IP Local 
  btnLocal.addEventListener('click', () => {
    const ipInputValue = prompt("Introduce tu IP local manualmente:");
    if (ipInputValue) {
      ipInput.value = ipInputValue;
      validateIp();
    }
  });

  // 5) Coloreado binario bit a bit
  function colorBin(binStr, netBits, subBits) {
    const bits = binStr.split('.').join('');
    let html = '';
    for (let i = 0; i < bits.length; i++) {
      let color;
      if (i < netBits) {
        color = 'red';
      } else if (i < subBits) {
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

  // 6) Comprueba si IP es privada
  function isPrivateIp(octs) {
    var o1 = octs[0];
    var o2 = octs[1];
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

  // 7) Modal
  function showModal(html) {
    var existingDiv = document.getElementById('resultados');
    if (existingDiv) {
      existingDiv.parentNode.removeChild(existingDiv);
    }
    var div = document.createElement('div');
    div.id = 'resultados';
    div.className = 'ventana-emergente';
    div.innerHTML = html + '<button id="cerrarVentana">Cerrar</button>';
    document.body.appendChild(div);
    var closeButton = document.getElementById('cerrarVentana');
    closeButton.onclick = function () {
      div.parentNode.removeChild(div);
    };
  }

  // 8) Calcular y mostrar resumen
  btnCalc.addEventListener('click', () => {
    validateIp();
    validateMask();
    const valIp = ipInput.value.trim();
    const valM = parseInt(maskInput.value, 10);
    const regex = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (!regex.test(valIp) || valM < 8 || valM > 30) {
      return showModal('<p class="error">IP o máscara inválidas.</p>');
    }
    const octs = valIp.split('.').map((n) => parseInt(n, 10));
    if (octs.some((o) => o < 0 || o > 255)) {
      return showModal('<p class="error">IP inválida.</p>');
    }
    const [a, b2, b3, b4] = octs;
    const b = valM;
    const defBits = a <= 126 ? 8 : a <= 191 ? 16 : 24;
    const maskInt = (0xffffffff << (32 - b)) >>> 0;
    const maskOct = [
      (maskInt >>> 24) & 0xff,
      (maskInt >>> 16) & 0xff,
      (maskInt >>> 8) & 0xff,
      maskInt & 0xff,
    ];
    const maskDec = maskOct.join('.');
    const wild = maskOct.map((x) => 255 - x).join('.');
    const ipInt = ((a << 24) | (b2 << 16) | (b3 << 8) | b4) >>> 0;
    const netInt = ipInt & maskInt;
    const bcInt = netInt | (~maskInt >>> 0);
    const totalHosts = b < 31 ? 2 ** (32 - b) - 2 : b === 31 ? 2 : 1;
    const minHost = b < 31 ? netInt + 1 : netInt;
    const maxHost = b < 31 ? bcInt - 1 : b === 31 ? netInt + 1 : netInt;
    const intToIp = (i) =>
      [(i >>> 24) & 0xff, (i >>> 16) & 0xff, (i >>> 8) & 0xff, i & 0xff].join(
        '.'
      );
    const subnets = b > defBits ? 2 ** (b - defBits) : 1;
    const hexIp = octs.map((x) => x.toString(16).padStart(2, '0')).join('.');
    const ipBin = octs.map((x) => x.toString(2).padStart(8, '0')).join('.');
    const maskBin = maskOct
      .map((x) => x.toString(2).padStart(8, '0'))
      .join('.');
    const wildBin = wild
      .split('.')
      .map((x) => parseInt(x).toString(2).padStart(8, '0'))
      .join('.');
    const netBin = intToIp(netInt)
      .split('.')
      .map((x) => parseInt(x).toString(2).padStart(8, '0'))
      .join('.');
    const bcBin = intToIp(bcInt)
      .split('.')
      .map((x) => parseInt(x).toString(2).padStart(8, '0'))
      .join('.');
    const isPriv = isPrivateIp(octs) ? 'Privada' : 'Pública';

    const html = `
      <h2>Detalles de la IP</h2>
      <p><strong>IP:</strong> ${valIp} (${isPriv})</p>
      <p><strong>BIN:</strong> ${colorBin(ipBin, defBits, b)}</p>
      <p><strong>Mask /${b}:</strong> ${maskDec} (${colorBin(maskBin, defBits, b)})</p>
      <p><strong>Wildcard:</strong> ${wild} (${colorBin(wildBin, defBits, b)})</p>
      <p><strong>Red:</strong> ${intToIp(netInt)} (${colorBin(netBin, defBits, b)})</p>
      <p><strong>Broadcast:</strong> ${intToIp(bcInt)} (${colorBin(bcBin, defBits, b)})</p>
      <p><strong>Clase:</strong> ${
        defBits === 8 ? 'A' : defBits === 16 ? 'B' : 'C'
      }</p>
      <p><strong>Número de subredes:</strong> ${subnets}</p>
      <p><strong>Hosts totales:</strong> ${totalHosts}</p>
      <p><strong>Host mínimo:</strong> ${intToIp(minHost)}</p>
      <p><strong>Host máximo:</strong> ${intToIp(maxHost)}</p>
      <p><strong>IP hexadecimal:</strong> ${hexIp}</p>
    `;
    showModal(html);
  });
})();
