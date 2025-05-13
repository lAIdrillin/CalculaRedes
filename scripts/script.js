const inputs = document.querySelectorAll('#octeto1, #octeto2, #octeto3, #octeto4');

inputs.forEach(input => {
    input.addEventListener('input', () => {
        const octeto1 = parseInt(document.getElementById('octeto1').value) || 0;
        const octeto2 = parseInt(document.getElementById('octeto2').value) || 0;
        const octeto3 = parseInt(document.getElementById('octeto3').value) || 0;
        const octeto4 = parseInt(document.getElementById('octeto4').value) || 0;

        if (
            octeto1 < 0 || octeto1 > 255 ||
            octeto2 < 0 || octeto2 > 255 ||
            octeto3 < 0 || octeto3 > 255 ||
            octeto4 < 0 || octeto4 > 255
        ) {
            input.style.color = 'red';
        } else {
            input.style.color = 'green';
        }
    });
});


document.getElementById('calcular').addEventListener('click', () => {

    const resultadoDiv = document.getElementById('resultado');


    if (octeto1 === '' || octeto2 === '' || octeto3 === '' || octeto4 === '') {
        resultadoDiv.innerHTML = '<p class="error">Por favor, ingresa valores válidos en todos los campos.</p>';
        return;
    }
    if (octeto1 < 0 || octeto1 > 255 || octeto2 < 0 || octeto2 > 255 || octeto3 < 0 || octeto3 > 255 || octeto4 < 0 || octeto4 > 255) {
        resultadoDiv.innerHTML = '<p class="error">Los valores de los octetos deben estar entre 0 y 255.</p>';
        return;
    }

    
});