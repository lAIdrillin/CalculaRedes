const inputs = document.querySelectorAll('#octeto1, #octeto2, #octeto3, #octeto4');

inputs.forEach(input => {
    input.addEventListener('input', (event) => {
        const value = parseInt(event.target.value) || 0;

        if (value < 0 || value > 255) {
            event.target.style.color = 'red';
            event.target.style.borderColor = 'red';
            event.target.style.boxShadow = '0 0 5px red';
        } else {
            event.target.style.color = 'green';
            event.target.style.borderColor = 'green';
            event.target.style.boxShadow = '0 0 5px green';
        }
    });
});


document.getElementById('calcular').addEventListener('click', () => {
    const octeto1 = parseInt(document.getElementById('octeto1').value) || '';
    const octeto2 = parseInt(document.getElementById('octeto2').value) || '';
    const octeto3 = parseInt(document.getElementById('octeto3').value) || '';
    const octeto4 = parseInt(document.getElementById('octeto4').value) || '';
    const resultadoDiv = document.getElementById('resultado');


    if (octeto1 === '' || octeto2 === '' || octeto3 === '' || octeto4 === '') {
        resultadoDiv.innerHTML = '<p class="error">Por favor, ingresa valores válidos en todos los campos.</p>';
        return;
    }

    else if (octeto1 < 0 || octeto1 > 255 ||octeto2 < 0 || octeto2 > 255 ||octeto3 < 0 || octeto3 > 255 ||octeto4 < 0 || octeto4 > 255) {
        resultadoDiv.innerHTML = '<p class="error">Los valores de los octetos deben estar entre 0 y 255.</p>';
        return;
    }else{
        const ip = `${octeto1}.${octeto2}.${octeto3}.${octeto4}`;
        let clase = '';
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
            direccion = 'Publica';
        }

        resultadoDiv.innerHTML = `<p>La direccion IP es <strong>${ip}</strong></p>
                                  <p>Clase de red: <strong>${clase}</strong></p>
                                  <p>Máscara por defecto: <strong>${mascara}</strong></p>
                                  <p>Tipo de direccion: <strong>${direccion}</strong></p>`;
                                  
    }

});