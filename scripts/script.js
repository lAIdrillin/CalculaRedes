(function(){
  const ipInput   = document.getElementById('ipCompleta');
  const maskInput = document.getElementById('subnetCompleta');
  const btnLocal  = document.getElementById('btnLocalIP');
  const btnCalc   = document.getElementById('calcular');
  const btnHist   = document.getElementById('verHistorial');
  const histDiv   = document.getElementById('resumen-sesiones');

  // 1) Auto-cargar IP pública
  fetch('https://api.ipify.org?format=json')
    .then(r => r.json())
    .then(d => {
      ipInput.value = d.ip;
      validateIp();
    }).catch(()=>{});

  // 2) Validación visual IP y máscara
  function validateIp() {
    const val = ipInput.value.trim();
    const regex = /^(\d{1,3}\.){3}\d{1,3}$/;
    let ok = regex.test(val);
    if (ok) {
      const octs = val.split('.').map(n=>parseInt(n,10));
      ok = octs.every(o=>o>=0 && o<=255);
    }
    setStyle(ipInput, ok);
  }

  function validateMask() {
    const v = parseInt(maskInput.value,10);
    setStyle(maskInput, !isNaN(v) && v>=8 && v<=30);
  }

  function setStyle(el, valid) {
    if (valid) {
      el.style.borderColor = '#00ff00';
      el.style.boxShadow   = '0 0 5px #00ff00';
      el.style.color       = '#00ff00';
    } else {
      el.style.borderColor = 'red';
      el.style.boxShadow   = '0 0 5px red';
      el.style.color       = 'red';
    }
  }

  ipInput.addEventListener('input', validateIp);
  maskInput.addEventListener('input', validateMask);

  // 3) Rellenar máscara por defecto al blur de IP
  ipInput.addEventListener('blur', () => {
    const first = parseInt(ipInput.value.split('.')[0],10);
    if      (first>=1 && first<=126)     maskInput.value = 8;
    else if (first>=128 && first<=191)   maskInput.value = 16;
    else if (first>=192 && first<=223)   maskInput.value = 24;
    validateMask();
  });

  // 4) Obtener IP Local via WebRTC
  btnLocal.addEventListener('click', () => {
    let found = false;
    const pc = new RTCPeerConnection({iceServers:[]});
    pc.createDataChannel('');
    pc.createOffer().then(o=>pc.setLocalDescription(o));
    pc.onicecandidate = e => {
      if (!e.candidate) { pc.close(); return; }
      const m = e.candidate.candidate.match(/(\d{1,3}(?:\.\d{1,3}){3})/);
      if (m && !found) {
        found = true;
        ipInput.value = m[1];
        validateIp();
        pc.close();
      }
    };
    setTimeout(()=>pc.close(),1500);
  });

  // 5) Coloreado binario bit a bit
  function colorBin(binStr, netBits, subBits) {
    const bits = binStr.replace(/\./g,'');
    let html = '';
    for (let i = 0; i < bits.length; i++) {
      const bit = bits[i];
      let color = i < netBits ? 'red' : (i < subBits ? 'orange' : 'limegreen');
      html += `<span style="color:${color};">${bit}</span>`;
      if ((i+1) % 8 === 0 && i < bits.length - 1) html += '.';
    }
    return html;
  }

  // 6) Modal
  function showModal(html) {
    document.getElementById('resultados')?.remove();
    const div = document.createElement('div');
    div.id = 'resultados';
    div.className = 'ventana-emergente';
    div.innerHTML = html + '<button id="cerrarVentana">Cerrar</button>';
    document.body.appendChild(div);
    document.getElementById('cerrarVentana').onclick = () => div.remove();
  }

  // 7) Calcular
  btnCalc.addEventListener('click', () => {
    validateIp(); validateMask();
    const valIp = ipInput.value.trim();
    const valM  = parseInt(maskInput.value,10);
    const regex = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (!regex.test(valIp) || valM < 8 || valM > 30) {
      return showModal('<p class="error">IP o máscara inválidas.</p>');
    }
    const octs = valIp.split('.').map(n=>parseInt(n,10));
    if (octs.some(o=>o<0||o>255)) {
      return showModal('<p class="error">IP inválida.</p>');
    }
    const [a,b2,b3,b4] = octs;
    const b = valM;
    const defBits = a<=126?8:(a<=191?16:24);
    const maskInt = (0xFFFFFFFF << (32-b))>>>0;
    const maskOct = [(maskInt>>>24)&0xFF,(maskInt>>>16)&0xFF,(maskInt>>>8)&0xFF,maskInt&0xFF];
    const maskDec = maskOct.join('.');
    const wild    = maskOct.map(x=>255-x).join('.');
    const ipInt   = ((a<<24)|(b2<<16)|(b3<<8)|b4)>>>0;
    const netInt  = ipInt & maskInt;
    const bcInt   = netInt | (~maskInt>>>0);
    const hosts   = b<31?2**(32-b)-2:(b===31?2:1);
    const minH    = b<31?netInt+1:netInt;
    const maxH    = b<31?bcInt-1:(b===31?netInt+1:netInt);
    const intToIp = i=>[(i>>>24)&0xFF,(i>>>16)&0xFF,(i>>>8)&0xFF,i&0xFF].join('.');
    const subs    = b>defBits?2**(b-defBits):1;
    const hexIp   = octs.map(x=>x.toString(16).padStart(2,'0')).join('.');
    const ipBin   = octs.map(x=>x.toString(2).padStart(8,'0')).join('.')
    const maskBin = maskOct.map(x=>x.toString(2).padStart(8,'0')).join('.')
    const wildBin = wild.split('.').map(x=>parseInt(x).toString(2).padStart(8,'0')).join('.')
    const netBin  = intToIp(netInt).split('.').map(x=>parseInt(x).toString(2).padStart(8,'0')).join('.')
    const bcBin   = intToIp(bcInt).split('.').map(x=>parseInt(x).toString(2).padStart(8,'0')).join('.')
    const html = `
      <h2>Detalles</h2>
      <p><strong>IP:</strong> ${valIp}<br><strong>BIN:</strong> ${colorBin(ipBin,defBits,b)}</p>
      <p><strong>Mask /${b}:</strong> ${maskDec}<br><strong>BIN:</strong> ${colorBin(maskBin,defBits,b)}</p>
      <p><strong>Wildcard:</strong> ${wild}<br><strong>BIN:</strong> ${colorBin(wildBin,defBits,b)}</p>
      <p><strong>Red:</strong> ${intToIp(netInt)}<br><strong>BIN:</strong> ${colorBin(netBin,defBits,b)}</p>
      <p><strong>Broadcast:</strong> ${intToIp(bcInt)}<br><strong>BIN:</strong> ${colorBin(bcBin,defBits,b)}</p>
      <p><strong>Clase:</strong> ${defBits===8?'A':defBits===16?'B':'C'}</p>
      <p><strong>Subredes:</strong> ${subs}</p>
      <p><strong>Hosts totales:</strong> ${hosts}</p>
      <p><strong>Host mínimo:</strong> ${intToIp(minH)}</p>
      <p><strong>Host máximo:</strong> ${intToIp(maxH)}</p>
      <p><strong>IP hex:</strong> ${hexIp}</p>
    `;
    showModal(html);
    // guardar historial
    const ses = JSON.parse(localStorage.getItem('sesiones')||'[]');
    ses.push({time:Date.now(),ip:valIp,mask:b,red:intToIp(netInt),bc:intToIp(bcInt),hosts,subs,hex:hexIp});
    localStorage.setItem('sesiones',JSON.stringify(ses));
  });

  // 8) Historial
  btnHist.addEventListener('click',()=>{
    const ses = JSON.parse(localStorage.getItem('sesiones')||'[]');
    let html='<h2>Historial</h2>';
    if(!ses.length) html+='<p>No hay sesiones.</p>';
    else ses.forEach(s=>{
      html+=`<div style="margin-bottom:8px;border-bottom:1px solid #00ff00;padding:4px 0;">
        <strong>${new Date(s.time).toLocaleString('es-ES')}:</strong>
        IP ${s.ip}/${s.mask}, red ${s.red}, bc ${s.bc}, hosts ${s.hosts}, subs ${s.subs}, hex ${s.hex}
      </div>`;
    });
    showModal(html);
  });
})();
