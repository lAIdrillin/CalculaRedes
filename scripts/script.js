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
        mostrarVentanaEmergente(ip, clase, mascara, direccion);
        resultadoDiv.innerHTML = `<p>La dirección IP es <strong>${ip}</strong></p>
                                  <p>Clase de red: <strong>${clase}</strong></p>
                                  <p>Máscara por defecto: <strong>${mascara}</strong></p>
                                  <p>Tipo de dirección: <strong>${direccion}</strong></p>`;
        
        
                                  
    }

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