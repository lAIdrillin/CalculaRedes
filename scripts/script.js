const inputs = document.querySelectorAll('#octeto1, #octeto2, #octeto3, #octeto4');
const input = document.getElementById('ipCompleta');
const cidr = document.getElementById('cidr');
const mascaraPersonalizada = document.getElementById('mascaraPersonalizada');  // ahora es el elemento


function generarMascaraDesdeCIDR(bits) {
    const unos = '1'.repeat(bits);
    const ceros = '0'.repeat(32 - bits);
    const binarioMask = unos + ceros;

    return [
        binarioMask.slice(0, 8),
        binarioMask.slice(8, 16),
        binarioMask.slice(16, 24),
        binarioMask.slice(24, 32)
    ].map(octBin => parseInt(octBin, 2)).join('.');
}

input.addEventListener('input', () => {
    const ipCompleta = input.value.trim();
    const octetos = ipCompleta.split('.').map(octeto => parseInt(octeto));
    
    // Validar IP: Debe tener 4 octetos y cada uno entre 0 y 255
    const esValida = (
        octetos.length === 4 &&
        octetos.every(octeto => !isNaN(octeto) && octeto >= 0 && octeto <= 255)
    );

    if (!esValida) {
        input.style.borderColor = 'red';
        input.style.boxShadow = '0 0 5px red';
        input.style.color = 'red';
        cidr.value = '';  // Limpiamos CIDR si IP no es válida
        return;           // Salimos para no procesar más
    }

    // Si la IP es válida, ponemos estilos verdes
    input.style.borderColor = '#00ff00';
    input.style.boxShadow = '0 0 5px #00ff00';
    input.style.color = '#00ff00';

    const primerOcteto = octetos[0];
    let cidrValue = '';

    if (primerOcteto >= 1 && primerOcteto <= 126) {
        cidrValue = 8;
    } else if (primerOcteto >= 128 && primerOcteto <= 191) {
        cidrValue = 16;
    } else if (primerOcteto >= 192 && primerOcteto <= 223) {
        cidrValue = 24;
    }

    cidr.value = cidrValue;
    // y auto-completar máscara por defecto
    if (cidrValue) {
        mascaraPersonalizada.value = generarMascaraDesdeCIDR(cidrValue);
    }
});

cidr.addEventListener('input', () => {
    const cidrok = cidr.value.trim();

    if (isNaN(cidrok) || cidrok < 8 || cidrok > 30) {
        cidr.style.borderColor = 'red';
        cidr.style.boxShadow = '0 0 5px red';
        cidr.style.color = 'red';
    } else {
        cidr.style.borderColor = '#00ff00';
        cidr.style.boxShadow = '0 0 5px #00ff00';
        cidr.style.color = '#00ff00';

        const bits = parseInt(cidrok, 10);
        mascaraPersonalizada.value = generarMascaraDesdeCIDR(bits);
    }
});

document.getElementById('calcular').addEventListener('click', () => {
    const cidrInput = document.getElementById('cidr').value.trim();
    const cidrval = parseInt(cidrInput, 10);
    const ipCompleta = document.getElementById('ipCompleta').value.trim();
    const octetos = ipCompleta.split('.').map(octeto => parseInt(octeto));
    const resultadoDiv = document.getElementById('resultado');

    if (
        octetos.length !== 4 || 
        octetos.some(octeto => isNaN(octeto) || octeto < 0 || octeto > 255) ||
        isNaN(parseInt(cidr.value)) || cidr.value.trim() === '' || parseInt(cidr.value) < 8 || parseInt(cidr.value) > 30
    ) {
        resultadoDiv.innerHTML = '<p class="error">Por favor, ingresa una dirección IP y un protocolo CIDR válidos.</p>';
        return;
    } else {
        resultadoDiv.innerHTML = ''; // limpiar errores previos
    }

    const [octeto1, octeto2, octeto3, octeto4] = octetos;
    const ip = `${octeto1}.${octeto2}.${octeto3}.${octeto4}`;
    let clase = '';
    let wildcard = '';
    let mascara = '';
    let mascaraCompleta = '';
    let direccionRedBinario = '';
    let direccionRedDec = '';
        //pasar a binario la ip
        const binarioCompleto = binario(octeto1, octeto2, octeto3, octeto4);
        //pasar a hexadecimal la ip
        const iphexa = Hexadecimal(octeto1, octeto2, octeto3, octeto4);
    // Diferenciar host y red en binario
    let binarioColores = '';
    const binariosSinPuntos = binarioCompleto.replace(/\./g, '');
    // Determinar los bits que corresponden a la red por clase
    let redPorDefecto = 0;
    if (octeto1 >= 1 && octeto1 <= 126) redPorDefecto = 8;
    else if (octeto1 >= 128 && octeto1 <= 191) redPorDefecto = 16;
    else if (octeto1 >= 192 && octeto1 <= 223) redPorDefecto = 24;

    // Determinar cuántos bits de subred hay
    const bitsSubred = cidrval - redPorDefecto;

    // Recorremos los bits sin puntos y coloreamos según corresponda
    for (let i = 0; i < binariosSinPuntos.length; i++) {
        if (i < redPorDefecto) {
            // Parte de red (rojo)
            binarioColores += '<span style="color: #ff0000;">' + binariosSinPuntos[i] + '</span>';
        } else if (i < cidrval) {
            // Parte de subred (naranja)
            binarioColores += '<span style="color: orange;">' + binariosSinPuntos[i] + '</span>';
        } else {
            // Parte de host (verde)
            binarioColores += '<span style="color: #00ff00;">' + binariosSinPuntos[i] + '</span>';
        }
    }

    // Insertar puntos cada 8 bits, sin romper los tags HTML
    let binarioCompletoColoreado = '';
    let bitCounter = 0;
    let insideTag = false;

    for (let i = 0; i < binarioColores.length; i++) {
        const char = binarioColores[i];
        binarioCompletoColoreado += char;

        if (char === '<') {
            insideTag = true;
        } else if (char === '>') {
            insideTag = false;
        } else if (!insideTag) {
            // Solo contamos bits fuera de etiquetas
            bitCounter++;
            if (bitCounter % 8 === 0 && bitCounter !== 32) {
                binarioCompletoColoreado += '.';
            }
        }
    }
    

    //CALCULOS 
        
        //calculos clase y mascara
        if (octeto1 >= 1 && octeto1 <= 126) {
            clase = 'Clase A';
            mascara = '255.0.0.0';
        } else if (octeto1 >= 128 && octeto1 <= 191) {
            clase = 'Clase B';
            mascara = '255.255.0.0';
        } else if (octeto1 >= 192 && octeto1 <= 223) {
            clase = 'Clase C';
            mascara = '255.255.255.0';
        } else if (octeto1 >= 224 && octeto1 <= 239) {
            clase = 'Clase D (Multicast)';
        } else if (octeto1 >= 240 && octeto1 <= 255) {
            clase = 'Clase E (Experimental)';
        } else {
            clase = 'Clase desconocida';
        }

        // Direccion privada o pública
        if (
            (octeto1 === 10) ||
            (octeto1 === 172 && octeto2 >= 16 && octeto2 <= 31) ||
            (octeto1 === 192 && octeto2 === 168)
        ) {
            direccion = 'Privada';
        } else {
            direccion = 'Pública';
        }
    
        //Calcular numero de hosts
        
        let bits_host = 32 - cidrval;
        let total_direcciones = Math.pow(2, bits_host);
        numHosts = total_direcciones - 2;

        if(clase === 'Clase D (Multicast)' || clase === 'Clase E (Experimental)' || clase === 'Clase desconocida'){
            wildcard = 'N/A';
            mascara = 'N/A';
            mascaraCompleta = 'N/A';
            direccionRedBinario = 'N/A';
            direccionRedDec = 'N/A';
            wildcardBinario = 'N/A';
            direccionBroadcastDec = 'N/A';
            direccionBroadcastBin = 'N/A';
            numSubRed = 'N/A';
            hostMin = 'N/A';
            hostMax = 'N/A';
            


            
            // Llamar a la función que muestra la ventana emergente con los datos hasta wildcard
            mostrarVentanaEmergente(ip, clase, mascara, direccion, wildcard, binarioCompletoColoreado, mascaraCompleta,
                 direccionRedDec, direccionRedBinario, wildcardBinario, direccionBroadcastDec, direccionBroadcastBin, numHosts, numSubRed, hostMin, hostMax, iphexa);
            
        }else{
         // Calcular wildcard
        const [w1, w2, w3, w4] = mascara.split('.').map(Number);
        const max = '255.255.255.255';
        const [max1, max2, max3, max4] = max.split('.').map(Number);
        wildcard = `${max1 - w1}.${max2 - w2}.${max3 - w3}.${max4 - w4}`;
        //Pasar a binario la wildcard
        const wildcardBinario = binario(max1 - w1, max2 - w2, max3 - w3, max4 - w4)

            //pasar a binario la mascara de red
            const mascaraCompleta = binario(w1, w2, w3, w4);

        //Calcular dirección de red
        const [ib1, ib2, ib3, ib4] = binarioCompleto.split('.');
        const [mb1, mb2, mb3, mb4] = mascaraCompleta.split('.');
        let redbin1 = ''
        for (i = 0; i<8; i++){
            if(ib1[i] === '1' && mb1[i] === '1'){
                redbin1 += '1';              
            }else{
                redbin1 += '0';
            }
        }
        let redbin2 = ''
         for (i = 0; i<8; i++){
            if(ib2[i] === '1' && mb2[i] === '1'){
                redbin2 += '1';              
            }else{
                redbin2 += '0';
            }
        }
        let redbin3 = ''
         for (i = 0; i<8; i++){
            if(ib3[i] === '1' && mb3[i] === '1'){
                redbin3 += '1';              
            }else{
                redbin3 += '0';
            }
        }
        let redbin4 = ''
         for (i = 0; i<8; i++){
            if(ib4[i] === '1' && mb4[i] === '1'){
                redbin4 += '1';              
            }else{
                redbin4 += '0';
            }
        }

        let direccionRedBinario = `${redbin1}.${redbin2}.${redbin3}.${redbin4}`;
        let direccionRedDec = decimal(redbin1, redbin2, redbin3, redbin4); 

        //Calcular dirección de Broadcast
        const [wb1, wb2, wb3, wb4] = wildcardBinario.split('.');
        let broadBin1 = ''
        for (i = 0; i<8; i++){
            if(redbin1[i] === '0' && wb1[i] === '0'){
                broadBin1 += '0';
            }else{
                broadBin1 += '1';
            }
        }
        let broadBin2 = ''
        for (i = 0; i<8; i++){
            if(redbin2[i] === '0' && wb2[i] === '0'){
                broadBin2 += '0';
            }else{
                broadBin2 += '1';
            }
        }
        let broadBin3 = ''
        for (i = 0; i<8; i++){
            if(redbin3[i] === '0' && wb3[i] === '0'){
                broadBin3 += '0';
            }else{
                broadBin3 += '1';
            }
        }
        let broadBin4 = ''
        for (i = 0; i<8; i++){
            if(redbin4[i] === '0' && wb4[i] === '0'){
                broadBin4 += '0';
            }else{
                broadBin4 += '1';
            }
        }

        let direccionBroadcastBin = `${broadBin1}.${broadBin2}.${broadBin3}.${broadBin4}`;
        let direccionBroadcastDec = decimal(broadBin1, broadBin2, broadBin3, broadBin4);

        //calcular numero de subredes
        let defmasc = ''; 

        if (clase === 'Clase A'){
            defmasc = 8;
        }else if(clase === 'Clase B'){
            defmasc = 16;
        }else if(clase === 'Clase C'){
            defmasc = 24;
        }else{
            defmasc = '';
        }


        let bitsExtra = cidrval - defmasc;
        numSubRed = Math.pow(2, bitsExtra);

        //calcular host minimo
        let dec1 = parseInt(redbin1, 2);
        let dec2 = parseInt(redbin2, 2);
        let dec3 = parseInt(redbin3, 2);
        let dec4 = parseInt(redbin4, 2) + 1;

        let hostMin = `${dec1}.${dec2}.${dec3}.${dec4}`;
        //calcular host maximo
        let brdec1 = parseInt(broadBin1, 2);
        let brdec2 = parseInt(broadBin2, 2);
        let brdec3 = parseInt(broadBin3, 2);
        let brdec4 = parseInt(broadBin4, 2) - 1;
        
        let hostMax = `${brdec1}.${brdec2}.${brdec3}.${brdec4}`

        // Llamar a la función que muestra la ventana emergente con los datos hasta wildcard
        mostrarVentanaEmergente(ip, clase, mascara, direccion, wildcard, binarioCompletoColoreado, mascaraCompleta,
             direccionRedDec, direccionRedBinario, wildcardBinario, direccionBroadcastDec, direccionBroadcastBin, numHosts, numSubRed, hostMin, hostMax, iphexa);
        }
        

    //FUNCIONES PARA CONVERTIR A BINARIO, DECIMAL
    function binario(n1, n2, n3, n4) {
        let bin = n1.toString(2); 
        let bin2 = n2.toString(2);
        let bin3 = n3.toString(2);
        let bin4 = n4.toString(2);
        const resultado = `${bin.padStart(8, '0')}.${bin2.padStart(8, '0')}.${bin3.padStart(8, '0')}.${bin4.padStart(8, '0')}`;
        return resultado;
    }
    function decimal(n1, n2, n3, n4){
        let dec = parseInt(n1, 2);
        let dec2 = parseInt(n2, 2);
        let dec3 = parseInt(n3, 2);
        let dec4 = parseInt(n4, 2);
        const resultado = `${dec}.${dec2}.${dec3}.${dec4}`;
        return resultado;
    }   
    function Hexadecimal(n1, n2, n3, n4) {
        let h1 = n1.toString(16).padStart(2, '0');
        let h2 = n2.toString(16).padStart(2, '0');
        let h3 = n3.toString(16).padStart(2, '0');
        let h4 = n4.toString(16).padStart(2, '0');
        return `${h1}.${h2}.${h3}.${h4}`.toUpperCase(); 
}

});

//función para mostrar la ventana emergente
function mostrarVentanaEmergente(ip, clase, mascara, direccion, wildcard, binarioCompletoColoreado, mascaraCompleta, direccionRedDec, 
    direccionRedBinario, wildcardBinario, direccionBroadcastDec, direccionBroadcastBin, numHosts, numSubRed, hostMin, hostMax, iphexa) {
    const ventanaEmergente = document.createElement('div');
    ventanaEmergente.classList.add('ventana-emergente');
    ventanaEmergente.setAttribute('id', 'resultados');

    // Leyenda en la esquina superior derecha
    ventanaEmergente.innerHTML = `
    <div style="position: absolute; top: 10px; right: 15px; font-size: 17px; color: #333;">
        <span>🟥: red</span> &nbsp;
        <span>🟧: subred</span> 
        <span>🟩: host</span>
    </div>
    <h2>Detalles de la IP</h2>
    <p style="margin-bottom: 25px;"><strong>IP:</strong> ${ip} (${direccion})<br><strong>Binario: </strong>${binarioCompletoColoreado}<br><strong>Hexadecimal:</strong>${iphexa}</p>
    <p style="margin-bottom: 25px;"><strong>Máscara por defecto:</strong> ${mascara} <br><strong>Binario: </strong>${mascaraCompleta}</p>
    <p><strong>Wildcard:</strong> ${wildcard}<br><strong>Binario: </strong>${wildcardBinario}</p>
    <p><strong>Dirección de red:</strong>${direccionRedDec}<br><strong>Binario: </strong>${direccionRedBinario}</p>
    <p><strong>Dirección de broadcast:</strong>${direccionBroadcastDec}<br><strong>Binario: </strong>${direccionBroadcastBin}</p>
    <p><strong>Clase:</strong> ${clase}</p>
    <p><strong>Nº Hosts:</strong>${numHosts}</p>
    <p><strong>Host mínimo: </strong>${hostMin}</p>
    <p><strong>Host máximo: </strong>${hostMax}</p>
    <p><strong>Nº De Subredes</strong> ${numSubRed}</p>
    <button id="cerrarVentana">Cerrar</button>
    `;

    document.body.appendChild(ventanaEmergente);

    document.getElementById('cerrarVentana').addEventListener('click', () => {
        ventanaEmergente.remove();
    });
}

// Función para obtener y poner la IP pública por defecto en el input
function ponerIpPublicaPorDefecto() {
    fetch('https://api.ipify.org?format=json')
        .then(response => response.json())
        .then(data => {
            if (data && data.ip) {
                input.value = data.ip;
                input.dispatchEvent(new Event('input'));
            }
        })
        .catch(() => {});
}
ponerIpPublicaPorDefecto();
