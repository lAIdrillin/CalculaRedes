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

    resultadoDiv.innerHTML = `<p>La dirección IP es <strong>${ip}</strong></p>
                              <p>Clase de red: <strong>${clase}</strong></p>
                              <p>Máscara por defecto: <strong>${mascara}</strong></p>
                              <p>Tipo de dirección: <strong>${direccion}</strong></p>`;
});
