(function () {
  const ipInput = document.getElementById('ipCompleta');
  const maskInput = document.getElementById('subnetCompleta');
  const btnLocal = document.getElementById('btnLocalIP');
  const btnCalc = document.getElementById('calcular');


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

  // 5) Colores binarios
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

  // 8) Calcular y mostrar resumen (cada constante en función sencilla)
  function getDefBits(a) {
    if (a <= 126) return 8;
    else if (a <= 191) return 16;
    else return 24;
  }

  function getMaskInt(bits) {
    var m = 0xFFFFFFFF;
    m = m << (32 - bits);
    m = m >>> 0;
    return m;
  }

  function getMaskOct(maskInt) {
    return [
      (maskInt >>> 24) & 0xff,
      (maskInt >>> 16) & 0xff,
      (maskInt >>> 8) & 0xff,
      maskInt & 0xff
    ];
  }

  function getWildOct(maskOct) {
    var arr = [];
    for (var i = 0; i < 4; i++) {
      arr[i] = 255 - maskOct[i];
    }
    return arr;
  }

  function ipToInt(a, b, c, d) {
    return ((a << 24) | (b << 16) | (c << 8) | d) >>> 0;
  }

  function getNetInt(ipInt, maskInt) {
    return ipInt & maskInt;
  }

  function getBcInt(netInt, maskInt) {
    return netInt | (~maskInt >>> 0);
  }

  function getTotalHosts(bits) {
    if (bits < 31) return Math.pow(2, 32 - bits) - 2;
    else if (bits === 31) return 2;
    else return 1;
  }

  function getHostMin(netInt, bits) {
    if (bits < 31) return netInt + 1;
    else return netInt;
  }

  function getHostMax(bcInt, netInt, bits) {
    if (bits < 31) return bcInt - 1;
    else if (bits === 31) return netInt + 1;
    else return netInt;
  }

  function intToIp(i) {
    return [
      (i >>> 24) & 0xff,
      (i >>> 16) & 0xff,
      (i >>> 8) & 0xff,
      i & 0xff
    ].join('.');
  }

  function getSubnets(bits, defBits) {
    if (bits > defBits) return Math.pow(2, bits - defBits);
    return 1;
  }

  function getHexIp(octs) {
    var out = '';
    for (var i = 0; i < 4; i++) {
      var h = octs[i].toString(16);
      if (h.length < 2) h = "0" + h;
      out += h;
      if (i < 3) out += ".";
    }
    return out;
  }

  function getBin(octs) {
    var out = '';
    for (var i = 0; i < 4; i++) {
      var b = octs[i].toString(2);
      while (b.length < 8) b = "0" + b;
      out += b;
      if (i < 3) out += ".";
    }
    return out;
  }

  btnCalc.addEventListener('click', function () {
    validateIp();
    validateMask();
    var ipVal = ipInput.value.trim();
    var mVal = parseInt(maskInput.value, 10);
    var ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (!ipRegex.test(ipVal) || mVal < 8 || mVal > 30) {
      showModal('<p class="error">IP o máscara inválidas.</p>');
      return;
    }
    var octs = ipVal.split('.');
    var ok = true;
    for (var i = 0; i < 4; i++) {
      var n = parseInt(octs[i]);
      if (n < 0 || n > 255) ok = false;
      octs[i] = n;
    }
    if (!ok) {
      showModal('<p class="error">IP inválida.</p>');
      return;
    }
    var a = octs[0], b = octs[1], c = octs[2], d = octs[3];
    var defBits = getDefBits(a);
    var maskInt = getMaskInt(mVal);
    var maskOct = getMaskOct(maskInt);
    var maskDec = maskOct.join('.');
    var wildOct = getWildOct(maskOct);
    var wild = wildOct.join('.');
    var ipInt = ipToInt(a, b, c, d);
    var netInt = getNetInt(ipInt, maskInt);
    var bcInt = getBcInt(netInt, maskInt);
    var totalHosts = getTotalHosts(mVal);
    var hostMin = getHostMin(netInt, mVal);
    var hostMax = getHostMax(bcInt, netInt, mVal);
    var subnets = getSubnets(mVal, defBits);
    var hexIp = getHexIp(octs);
    var ipBin = getBin(octs);
    var maskBin = getBin(maskOct);
    var wildBin = getBin(wildOct);
    var netIpArr = intToIp(netInt).split('.').map(Number);
    var netBin = getBin(netIpArr);
    var bcIpArr = intToIp(bcInt).split('.').map(Number);
    var bcBin = getBin(bcIpArr);
    var tipo = isPrivateIp(octs) ? "Privada" : "Pública";
    var clase = "";
    switch (defBits) {
      case 8: clase = "A"; break;
      case 16: clase = "B"; break;
      case 24: clase = "C"; break;
      default: clase = "?";
    }
    var html = "";
    html += "<h2>Resumen de la IP</h2>";
    html += "<p><strong>IP:</strong> " + ipVal + " (" + tipo + ")</p>";
    html += "<p><strong>Binario:</strong> " + colorBin(ipBin, defBits, mVal) + "</p>";
    html += "<p><strong>Máscara /" + mVal + ":</strong> " + maskDec + " (" + colorBin(maskBin, defBits, mVal) + ")</p>";
    html += "<p><strong>Wildcard:</strong> " + wild + " (" + colorBin(wildBin, defBits, mVal) + ")</p>";
    html += "<p><strong>Red:</strong> " + intToIp(netInt) + " (" + colorBin(netBin, defBits, mVal) + ")</p>";
    html += "<p><strong>Broadcast:</strong> " + intToIp(bcInt) + " (" + colorBin(bcBin, defBits, mVal) + ")</p>";
    html += "<p><strong>Clase:</strong> " + clase + "</p>";
    html += "<p><strong>Número de subredes:</strong> " + subnets + "</p>";
    html += "<p><strong>Hosts totales:</strong> " + totalHosts + "</p>";
    html += "<p><strong>Host mínimo:</strong> " + intToIp(hostMin) + "</p>";
    html += "<p><strong>Host máximo:</strong> " + intToIp(hostMax) + "</p>";
    html += "<p><strong>IP hexadecimal:</strong> " + hexIp + "</p>";
    showModal(html);
  });
})();
