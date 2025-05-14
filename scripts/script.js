const inputs = document.querySelectorAll('#octeto1, #octeto2, #octeto3, #octeto4');

const input = document.getElementById('ipCompleta');

input.addEventListener('input', () => {
    const ipCompleta = input.value.trim();
    const octetos = ipCompleta.split('.').map(octeto => parseInt(octeto));

    if (
        octetos.length !== 4 || 
        octetos.some(octeto => isNaN(octeto) || octeto < 0 || octeto > 255)
    ) {
        input.style.borderColor = 'red';
        input.style.boxShadow = '0 0 5px red';
        input.style.color = 'red';
    } else {
        input.style.borderColor = '#00ff00';
        input.style.boxShadow = '0 0 5px #00ff00';
        input.style.color = '#00ff00';
    }
});


document.getElementById('calcular').addEventListener('click', () => {
    const ipCompleta = document.getElementById('ipCompleta').value.trim();
    const octetos = ipCompleta.split('.').map(octeto => parseInt(octeto));
    const resultadoDiv = document.getElementById('resultado');

    if (
        octetos.length !== 4 || 
        octetos.some(octeto => isNaN(octeto) || octeto < 0 || octeto > 255)
    ) {
        resultadoDiv.innerHTML = '<p class="error">Por favor, ingresa una dirección IP válida con 4 octetos separados por puntos.</p>';
        return;
    }

    const [octeto1, octeto2, octeto3, octeto4] = octetos;
    const ip = `${octeto1}.${octeto2}.${octeto3}.${octeto4}`;
    let clase = '';
    let mascara = '';
    let direccion = '';
    let wildcard = '';
    let red = '';
    let broadcast = '';
    let hosts = '-';
    let bitsMascara = 24; // Ajusta según sea necesario

    // Determinar la clase de red
    if (octeto1 >= 1 && octeto1 <= 126) {
        clase = 'Clase A';
        mascara = '255.0.0.0';
        bitsMascara = 8;
    } else if (octeto1 >= 128 && octeto1 <= 191) {
        clase = 'Clase B';
        mascara = '255.255.0.0';
        bitsMascara = 16;
    } else if (octeto1 >= 192 && octeto1 <= 223) {
        clase = 'Clase C';
        mascara = '255.255.255.0';
        bitsMascara = 24;
    } else if (octeto1 >= 224 && octeto1 <= 239) {
        clase = 'Clase D';
        mascara = 'no tiene (multicast)';
    } else if (octeto1 >= 240 && octeto1 <= 255) {
        clase = 'Clase E';
        mascara = 'no tiene (experimental)';
    } else {
        clase = 'Clase desconocida';
        mascara = 'no tiene';
    }

    // Determinar si la dirección es privada o pública
    if (
        (octeto1 === 10) ||
        (octeto1 === 172 && octeto2 >= 16 && octeto2 <= 31) ||
        (octeto1 === 192 && octeto2 === 168)
    ) {
        direccion = 'Privada';
    } else {
        direccion = 'Pública';
    }

    // Calcular wildcard, red, broadcast y hosts
    function toBin(octetos) {
        return octetos.map(o => o.toString(2).padStart(8,'0')).join('.');
    }
    function parseIP(ip) {
        return ip.split('.').map(Number);
    }

    function ipToInt(octetos) {
        return ((octetos[0] << 24) | (octetos[1] << 16) | (octetos[2] << 8) | octetos[3]) >>> 0;
    }

    function intToIP(int) {
        return [
            (int >>> 24) & 0xFF,
            (int >>> 16) & 0xFF,
            (int >>> 8) & 0xFF,
            int & 0xFF
        ].join('.');
    }

    if (bitsMascara > 0) {
        const mascaraOctetos = parseIP(mascara);
        wildcard = mascaraOctetos.map(o => 255 - o).join('.');

        const ipOctetos = [octeto1, octeto2, octeto3, octeto4];
        const redInt = ipToInt(ipOctetos) & ipToInt(mascaraOctetos);
        red = intToIP(redInt);

        const broadcastInt = redInt | ipToInt(wildcard.split('.').map(Number));
        broadcast = intToIP(broadcastInt);

        hosts = bitsMascara < 31 ? (2 ** (32 - bitsMascara) - 2) : (bitsMascara === 31 ? 2 : 1);
        } else {
        wildcard = '-';
        red = '-';
        broadcast = '-';
        }

        // Mostrar ventana emergente con los resultados
        mostrarVentanaEmergente(ip.trim(), clase, mascara, direccion, wildcard, red, broadcast, hosts, bitsMascara);
    });
    function mostrarVentanaEmergente(ip, clase, mascara, direccion, wildcard, red, broadcast, hosts, bitsMascara) {
        const ventanaEmergente = document.createElement('div');
        ventanaEmergente.classList.add('ventana-emergente');
        ventanaEmergente.setAttribute('id', 'resultados');

        const [octeto1, octeto2, octeto3, octeto4] = ip.split('.').map(octeto => octeto.trim());
        const ipFormatted = `
        <span style="color: red;">${octeto1} . ${octeto2} . ${octeto3} .
        </span><span style="color: green;">${octeto4}</span>
        `;

        ventanaEmergente.innerHTML = `
        <h2>Detalles de la IP</h2>
        <p><strong>IP:</strong> ${ipFormatted}</p>
        <p><strong>Clase:</strong> ${clase}</p>
        <p><strong>Máscara por defecto:</strong> ${mascara}</p>
        <p><strong>Tipo de dirección:</strong> ${direccion}</p>
        <p><strong>Wildcard:</strong> ${wildcard}</p>
        <p><strong>Dirección de red:</strong> ${red}</p>
        <p><strong>Dirección de broadcast:</strong> ${broadcast}</p>
        <p><strong>Hosts disponibles:</strong> ${hosts}</p>
        <p><strong>Bits de máscara:</strong> ${bitsMascara}</p>
        <button id="cerrarVentana">Cerrar</button>
        `;
        document.body.appendChild(ventanaEmergente);

        document.getElementById('cerrarVentana').addEventListener('click', () => {
        ventanaEmergente.remove();
        });
    }
