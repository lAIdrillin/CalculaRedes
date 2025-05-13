document.getElementById('calcular').addEventListener('click', () => {
    const octeto1 = parseInt(document.getElementById('octeto1').value);
    const octeto2 = parseInt(document.getElementById('octeto2').value);
    const octeto3 = parseInt(document.getElementById('octeto3').value);
    const octeto4 = parseInt(document.getElementById('octeto4').value);
    const resultadoDiv = document.getElementById('resultado');

    // Validar los valores de los octetos
    if ([octeto1, octeto2, octeto3, octeto4].some(octeto => isNaN(octeto) || octeto < 0 || octeto > 255)) {
        resultadoDiv.innerHTML = '<p style="color: red;">Error: Todos los octetos deben ser números entre 0 y 255.</p>';
        return;
    }

    // Mostrar la IP completa
    const ipCompleta = `${octeto1}.${octeto2}.${octeto3}.${octeto4}`;
    resultadoDiv.innerHTML = `<p>IP Completa: ${ipCompleta}</p>`;

    // Determinar la clase de red
    let clase = '';
    let mascaraPorDefecto = '';
    let tipoRed = '';

    if (octeto1 >= 1 && octeto1 <= 126) {
        clase = 'A';
        mascaraPorDefecto = '255.0.0.0';
        tipoRed = (octeto1 === 10) ? 'Privada' : 'Pública';
    } else if (octeto1 >= 128 && octeto1 <= 191) {
        clase = 'B';
        mascaraPorDefecto = '255.255.0.0';
        tipoRed = (octeto1 === 172 && octeto2 >= 16 && octeto2 <= 31) ? 'Privada' : 'Pública';
    } else if (octeto1 >= 192 && octeto1 <= 223) {
        clase = 'C';
        mascaraPorDefecto = '255.255.255.0';
        tipoRed = (octeto1 === 192 && octeto2 === 168) ? 'Privada' : 'Pública';
    } else if (octeto1 >= 224 && octeto1 <= 239) {
        clase = 'D';
        mascaraPorDefecto = 'No aplica (Multicast)';
        tipoRed = 'Pública';
    } else if (octeto1 >= 240 && octeto1 <= 255) {
        clase = 'E';
        mascaraPorDefecto = 'No aplica (Experimental)';
        tipoRed = 'Pública';
    }

    // Mostrar la clase de red, máscara por defecto y tipo de red
    resultadoDiv.innerHTML += `
        <p>Clase de red: ${clase}</p>
        <p>Máscara por defecto: ${mascaraPorDefecto}</p>
        <p>Tipo de red: ${tipoRed}</p>
    `;
});


// Validar octetos en tiempo real
const inputs = document.querySelectorAll('#ip-inputs input');
inputs.forEach(input => {
    input.addEventListener('input', () => {
        const value = parseInt(input.value);
        if (!isNaN(value) && value >= 0 && value <= 255) {
            input.classList.add('valid');
            input.classList.remove('invalid');
        } else {
            input.classList.add('invalid');
            input.classList.remove('valid');
        }
    });
});