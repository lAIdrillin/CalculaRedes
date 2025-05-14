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

    if(octeto1 >= 1 && octeto1 <= 126){
        clase = 'Clase A';
        mascara = '255.0.0.0';
    }else if(octeto1 >= 128 && octeto1 <= 191){
        clase = 'Clase B';
        mascara = '255.255.0.0';
    }else if(octeto1 >= 192 && octeto1 <= 223){
        clase = 'Clase C';
        mascara = '255.255.255.0';
    }else if(octeto1 >= 224 && octeto1 <= 239){
        clase = 'Clase D';
        mascara = 'no tiene(multicast)';
    }else if(octeto1 >= 240 && octeto1 <= 255){
        clase = 'Clase E';
        mascara = 'no tiene(experiemental)';
    }else{
        const ip = `${octeto1}.${octeto2}.${octeto3}.${octeto4}`;
        let clase = '';
        let mascara = '';
        let bitsMascara = '';
        let direccion = '';
        if(octeto1 >= 1 && octeto1 <= 126){
            clase = 'Clase A';
            mascara = '255.0.0.0';
        }else if(octeto1 >= 128 && octeto1 <= 191){
            clase = 'Clase B';
            mascara = '255.255.0.0';
        }else if(octeto1 >= 192 && octeto1 <= 223){
            clase = 'Clase C';
            mascara = '255.255.255.0';
        }else if(octeto1 >= 224 && octeto1 <= 239){
            clase = 'Clase D';
            mascara = 'no tiene(multicast)';
        }else if(octeto1 >= 240 && octeto1 <= 255){
            clase = 'Clase E';
            mascara = 'no tiene(experiemental)';
        }else{
            clase = 'Clase desconocida';
            mascara = 'no tiene';
        }
        if((octeto1 === 10) && (octeto2 >= 0 && octeto2 <= 255) && (octeto3 >= 0 && octeto3 <= 255) && (octeto4 >= 0 && octeto4 <= 255)){
            direccion = 'Privada';
        }
       else if((octeto1 === 172) && (octeto2 >= 16 && octeto2 <= 31) && (octeto3 >= 0 && octeto3 <= 255) && (octeto4 >= 0 && octeto4 <= 255)){
            direccion = 'Privada';
        }
        else if((octeto1 === 192) && (octeto2 === 168) && (octeto3 >= 0 && octeto3 <= 255) && (octeto4 >= 0 && octeto4 <= 255)){
            direccion = 'Privada';
        }
        else{
            direccion = 'Pública';
        }

        function toBin(octetos){
            return octetos.map( o => o.toString(2).padStart(8, '0')).join('.');
        }
        function parseIP(ip){
            return ip.split('.').map(Number);
        }
        function ipToInt(octetos){
            return ((octetos[0]<<24) | (octetos[1]<<16) | (octetos[2]<<8) | octetos[3]) >>> 0;
        }
        function intToIP(int){
            return[
                (int >>> 24) & 0xFF,
                (int >>> 16) & 0xFF,
                (int >>> 8) & 0xFF,
                int & 0xFF
            ].join('.');
        }
        let wildcard = '';
        let red = '';
        let broadcast = '';
        let hosts = '-';
        if (bitsMascara > 0){
            const mascaraOctetos = parseIP(mascara);
            wildcard = mascaraOctetos.map(o => 255 - o).join('.');

            const ipOctetos = [octeto1, octeto2, octeto3, octeto4];
            const redInt = ipToInt(ipOctetos) & ipToInt(mascaraOctetos);
            red = intToIP(redInt);

            const broadcastint = redInt | ipToInt(wildcard.split('.').map(Number));
            broadcast = intToIP(broadcastint);

            hosts = bitsMascara < 31 ? (2 **(32 - bitMascara) - 2) : (bitsMascara === 31 ? 2 : 1);

        } else {
            wildcard = '-';
            red = '-';
            broadcast = '-';
        }
        resultadoDiv.innerHTML = `<p>La dirección IP es <strong>${ip}</strong></p>
                                  <p>Clase de red: <strong>${clase}</strong></p>
                                  <p>Máscara por defecto: <strong>${mascara}</strong></p>
                                  <p>Tipo de dirección: <strong>${direccion}</strong></p>`;
                                  
    }
    if((octeto1 === 10) && (octeto2 >= 0 && octeto2 <= 255) && (octeto3 >= 0 && octeto3 <= 255) && (octeto4 >= 0 && octeto4 <= 255)){
        direccion = 'Privada';
    }
   else if((octeto1 === 172) && (octeto2 >= 16 && octeto2 <= 31) && (octeto3 >= 0 && octeto3 <= 255) && (octeto4 >= 0 && octeto4 <= 255)){
        direccion = 'Privada';
    }
    else if((octeto1 === 192) && (octeto2 === 168) && (octeto3 >= 0 && octeto3 <= 255) && (octeto4 >= 0 && octeto4 <= 255)){
        direccion = 'Privada';
    }
    else{
        direccion = 'Pública';
    }
    resultadoDiv.innerHTML = ``;
     mostrarVentanaEmergente(ip, clase, mascara, direccion);
});
function mostrarVentanaEmergente(ip, clase, mascara, direccion) {
    const ventanaEmergente = document.createElement('div');
    ventanaEmergente.classList.add('ventana-emergente');
    ventanaEmergente.innerHTML = `
        <h2>Detalles de la IP</h2>
        <p><strong>IP:</strong> ${ip}</p>
        <p><strong>Clase:</strong> ${clase}</p>
        <p><strong>Máscara por defecto:</strong> ${mascara}</p>
        <p><strong>Tipo de dirección:</strong> ${direccion}</p>
        <button id="cerrarVentana">Cerrar</button>
    `;
    document.body.appendChild(ventanaEmergente);

    document.getElementById('cerrarVentana').addEventListener('click', () => {
        ventanaEmergente.remove();
    console.log("Mostrando ventana emergente"); 

    });
    cerrarVentana.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    ventanaEmergente.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    ventanaEmergente.style.color = 'white';
    ventanaEmergente.style.display = 'block';
    ventanaEmergente.style.position = 'fixed';     
    const resultadoHTML = `
        <div id="ventanaResultado" class="resultado">
            <div class="resultado-content">
                <h2>¡Enhorabuena, ${nombre}!</h2>
                <p>Tiempo: ${tiempo}</p>
                <p>Intentos: ${intentos}</p>
                <p>Dificultad: ${alto}x${ancho}</p>
                <button id="compartirFacebook">Compartir en Facebook</button>
                <button id="cerrarResultado">Cerrar</button>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML("beforeend", resultadoHTML);

    const resultado = document.getElementById("ventanaResultado");
    resultado.style.display = "block";

    // Cerrar el resultado al hacer clic en el botón
    document.getElementById("cerrarResultado").addEventListener("click", () => {
        console.log("Cerrando resultado"); // Verificar si el evento se ejecuta

        resultado.style.display = "none";
        resultado.remove(); // Eliminar el resultado del DOM
        location.reload();
    });
}
