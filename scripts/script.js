const inputs = document.querySelectorAll('#octeto1, #octeto2, #octeto3, #octeto4');

inputs.forEach(input => {
    input.addEventListener('input', (event) => {
        const value = parseInt(event.target.value) || 0;

        if (value < 0 || value > 255) {
            event.target.style.color = 'red';
            event.target.style.borderColor = 'red';
            event.target.style.boxShadow = '0 0 5px red';
        } else {
            event.target.style.color = '#00ff00';
            event.target.style.borderColor = '#00ff00'; 
            event.target.style.boxShadow = '0 0 5px #00ff00';
        }
    });
});


document.getElementById('calcular').addEventListener('click', () => {
    const ipCompleta = document.getElementById('ipCompleta').value;
    const [octeto1, octeto2, octeto3, octeto4] = ipCompleta.split('.').map(Number);
    const resultadoDiv = document.getElementById('resultado');


    if (isNaN(octeto1) || isNaN(octeto2) || isNaN(octeto3) || isNaN(octeto4)) {
        resultadoDiv.innerHTML = '<p class="error">Por favor, ingresa valores válidos en todos los campos.</p>';
        return;
    }

    else if (octeto1 < 0 || octeto1 > 255 ||octeto2 < 0 || octeto2 > 255 ||octeto3 < 0 || octeto3 > 255 ||octeto4 < 0 || octeto4 > 255) {
        resultadoDiv.innerHTML = '<p class="error">Los valores de los octetos deben estar entre 0 y 255.</p>';
        return;
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

});
