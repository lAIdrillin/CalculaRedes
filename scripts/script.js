const inputs = document.querySelectorAll('#octeto1, #octeto2, #octeto3, #octeto4');
const input = document.getElementById('ipCompleta');

input.addEventListener('input', () => {
    const ipCompleta = input.value.trim();
    const octetos = ipCompleta.split('.').map(octeto => parseInt(octeto));

    // Autocompletar mascaraRed dinámicamente
    const mascaraRed = document.getElementById('subnetCompleta');
    if (octetos.length === 4 && octetos.every(o => !isNaN(o) && o >= 0 && o <= 255)) {
        if (octetos[0] >= 1 && octetos[0] <= 126) {
            mascaraRed.value = 8;
        } else if (octetos[0] >= 128 && octetos[0] <= 191) {
            mascaraRed.value = 16;
        } else if (octetos[0] >= 192 && octetos[0] <= 223) {
            mascaraRed.value = 24;
        } else if (octetos[0] >= 224 && octetos[0] <= 239) {
            mascaraRed.value = 'N/A';
        } else if (octetos[0] >= 240 && octetos[0] <= 255) {
            mascaraRed.value = 'N/A';
        }
    }

    
    // Validar la dirección IP
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
    const mascaraInput = document.getElementById('mascaraInput').value.trim();
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
    let bitsMascara = 24; 
    let mascaraOctetos = [];

    if(/^\d{1,2}$/.test(mascaraInput)){
        bitsMascara = parseInt(mascaraInput);
        if (bitsMascara < 0 || bitsMascara > 32) {
            resultadoDiv.innerHTML = '<p class="error">Por favor, ingresa una máscara válida entre 0 y 32.</p>';
            return;
        }
        const mask = (0xFFFFFFFF << (32 - bitsMascara)) >>> 0;
        mascaraOctetos = [
            (mask >>> 24) & 0xFF,
            (mask >>> 16) & 0xFF,
            (mask >>> 8) & 0xFF,
            mask & 0xFF
        ];
        mascara = mascaraOctetos.join('.');
    } else if (/^(\d{1,3}\.){3}\d{1,3}$/.test(mascaraInput)) {
        mascaraOctetos = mascaraInput.split('.').map(Number);
        if(
            mascaraOctetos.lenght !== 4 ||
            mascaraOctetos.some(o => isNaN(o) || o < 0 || o > 255)
        ){
            resultadoDiv.innerHTML = '<p class="error>La mascara debe tener 4 octetos entre 0 y 255.</p>';
            return;
        }
        bitsMascara = maskInt.toString(2).replace(/0/g, '').length;
        mascara = mascaraInput;
    } else{
        resultadoDiv.innerHTML = '<p class="error">Introduce la mascara en formato decimal (255.255.255.0) o de bits (24).</p>';
        return;
    }

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
        clase = 'Clase D (Multicast)';
        mascara = 'No tiene (Multicast)';
        wildcard = 'N/A';
        red = 'N/A';
        broadcast = 'N/A';
        hosts = 'N/A';
        bitsMascara = 'N/A';
    } else if (octeto1 >= 240 && octeto1 <= 255) {
        clase = 'Clase E (Experimental)';
        mascara = 'No tiene (Experimental)';
        wildcard = 'N/A';
        red = 'N/A';
        broadcast = 'N/A';
        hosts = 'N/A';
        bitsMascara = 'N/A';
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

    // Calcular wildcard, red, broadcast y hosts solo si la clase no es D o E
    if (bitsMascara !== 'N/A') {
        function toBin(octetos) {
            return octetos.map(o => o.toString(2).padStart(8, '0')).join('.');
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

        const mascaraOctetos = bitsMascara <= 32
            ? [
                (0xFFFFFFFF << (32 - bitsMascara) >>> 0) >>> 24,
                (0xFFFFFFFF << (32 - bitsMascara) >>> 0) >>> 16 & 0xFF,
                (0xFFFFFFFF << (32 - bitsMascara) >>> 0) >>> 8 & 0xFF,
                (0xFFFFFFFF << (32 - bitsMascara) >>> 0) & 0xFF
            ]
            : [255, 255, 255, 255]; // Default to full mask if bitsMascara > 32
        mascara = mascaraOctetos.join('.');

        wildcard = mascaraOctetos.map(o => 255 - o).join('.');

        const ipOctetos = [octeto1, octeto2, octeto3, octeto4];
        const redInt = ipToInt(ipOctetos) & ipToInt(mascaraOctetos);
        red = intToIP(redInt);

        const broadcastInt = redInt | ipToInt(wildcard.split('.').map(Number));
        broadcast = intToIP(broadcastInt);

        hosts = bitsMascara < 31 ? (2 ** (32 - bitsMascara) - 2) : (bitsMascara === 31 ? 2 : 1);
        

        // Mostrar ventana emergente con los resultados
        mostrarVentanaEmergente(ip, clase, mascara, direccion, wildcard, red, broadcast, hosts, bitsMascara);
        } else {
        // Mostrar ventana emergente con N/A si la clase es D o E
        mostrarVentanaEmergente(ip, clase, mascara, direccion, wildcard, red, broadcast, hosts, bitsMascara);
        }
    });

    function mostrarVentanaEmergente(ip, clase, mascara, direccion, wildcard, red, broadcast, hosts, bitsMascara) {
        const ventanaEmergente = document.createElement('div');
        ventanaEmergente.classList.add('ventana-emergente');
        ventanaEmergente.setAttribute('id', 'resultados');

        let ipFormatted = ip;
        let ipBinFormatted = ip.split('.').map(octeto => parseInt(octeto).toString(2).padStart(8, '0')).join('.');
        let mascaraBin = mascara.split('.').map(octeto => parseInt(octeto).toString(2).padStart(8, '0')).join('.');
        let wildcardBin = wildcard.split('.').map(octeto => parseInt(octeto).toString(2).padStart(8, '0')).join('.');
        let redBin = red.split('.').map(octeto => parseInt(octeto).toString(2).padStart(8, '0')).join('.');
        let broadcastBin = broadcast.split('.').map(octeto => parseInt(octeto).toString(2).padStart(8, '0')).join('.');

        // Apply coloring only if a valid mask exists
        if (mascara !== 'No tiene (Multicast)' && mascara !== 'No tiene (Experimental)' && mascara !== 'no tiene') {
            const ipOctetos = ip.split('.');
            const mascaraOctetos = mascara.split('.').map(Number);

            // Determine the boundary between network and host parts
            const networkBits = mascaraOctetos.map(o => o.toString(2).padStart(8, '0')).join('').indexOf('0');
            const ipBits = ip.split('.').map(o => parseInt(o).toString(2).padStart(8, '0')).join('');

            const networkPart = ipBits.slice(0, networkBits);
            const hostPart = ipBits.slice(networkBits);

            // Format the IP with colors
            ipFormatted = `
                <span style="color: red;">${ipOctetos.slice(0, Math.floor(networkBits / 8)).join(' . ')}.</span>
                <span style="color: green;">${ipOctetos.slice(Math.floor(networkBits / 8)).join(' . ')}</span>
            `;

            // Format the binary IP with colors
            ipBinFormatted = `
                <span style="color: red;">${networkPart.match(/.{1,8}/g).join('.')}</span>
                <span style="color: green;">.${hostPart.match(/.{1,8}/g).join('.')}</span>
            `;
        }

        ventanaEmergente.innerHTML = `
        <h2>Detalles de la IP</h2>
        <p style="margin-bottom: 25px;"><strong>IP:</strong> ${ipFormatted} <br><strong>BINARIO: </strong> ${ipBinFormatted}</p>
        <p style="margin-bottom: 25px;"><strong>Máscara por defecto:</strong> ${mascara} <br><strong>BINARIO: </strong> ${mascaraBin}</p>
        <p style="margin-bottom: 25px;"><strong>Wildcard:</strong> ${wildcard} <br><strong>BINARIO: </strong> ${wildcardBin}</p>
        <p style="margin-bottom: 25px;"><strong>Dirección de red:</strong> ${red} <br><strong>BINARIO: </strong> ${redBin}</p>
        <p style="margin-bottom: 25px;"><strong>Dirección de broadcast:</strong> ${broadcast} <br><strong>BINARIO: </strong> ${broadcastBin}</p>
        <p style="margin-bottom: 25px;"><strong>Clase:</strong> ${clase}</p>
        <p style="margin-bottom: 25px;"><strong>Hosts disponibles:</strong> ${hosts}</p>
        <p style="margin-bottom: 25px;"><strong>Bits de máscara:</strong> ${bitsMascara}</p>
        <p style="margin-bottom: 25px;"><strong>Tipo de dirección:</strong> ${direccion}</p>
        <button id="cerrarVentana">Cerrar</button>
        `;

        document.body.appendChild(ventanaEmergente);

        document.getElementById('cerrarVentana').addEventListener('click', () => {
            ventanaEmergente.remove();
        });
    }
