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
        resultadoDiv.innerHTML = `<p>La direccion IP es <strong>${ip}</strong></p>`;
    }

});