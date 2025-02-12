// Diccionario de monedas con banderas
const currencyList = {
    "USD": { name: "Dólar estadounidense", flag: "us" },
    "EUR": { name: "Euro", flag: "eu" },
    "GBP": { name: "Libra esterlina", flag: "gb" },
    "JPY": { name: "Yen japonés", flag: "jp" },
    "MXN": { name: "Peso mexicano", flag: "mx" },
    "BRL": { name: "Real brasileño", flag: "br" },
    "ARS": { name: "Peso argentino", flag: "ar" },
    "CAD": { name: "Dólar canadiense", flag: "ca" },
    "CNY": { name: "Yuan chino", flag: "cn" },
    "INR": { name: "Rupia india", flag: "in" }
};

// Elementos del DOM
const fromCurrency = document.getElementById("fromCurrency");
const toCurrency = document.getElementById("toCurrency");
const fromFlag = document.getElementById("fromFlag");
const toFlag = document.getElementById("toFlag");
const amountInput = document.getElementById("amount");
const convertButton = document.getElementById("convert");
const resultText = document.getElementById("result");
const loader = document.getElementById("loader");

// Función para llenar los select con las monedas
function loadCurrencies() {
    fromCurrency.innerHTML = "";
    toCurrency.innerHTML = "";

    for (let currency in currencyList) {
        let option = document.createElement("option");
        option.value = currency;
        option.innerText = currency;
        fromCurrency.appendChild(option.cloneNode(true));
        toCurrency.appendChild(option);
    }

    // Establecer valores predeterminados
    fromCurrency.value = "USD";
    toCurrency.value = "EUR";

    // Actualizar banderas al inicio
    updateFlag("fromCurrency", "fromFlag");
    updateFlag("toCurrency", "toFlag");
}

// Función para actualizar la bandera según la moneda seleccionada
function updateFlag(selectId, flagId) {
    const select = document.getElementById(selectId);
    const flag = document.getElementById(flagId);
    const currency = select.value;

    if (currencyList[currency]) {
        flag.src = `https://flagcdn.com/w40/${currencyList[currency].flag}.png`;
    }
}

// Cargar monedas al iniciar
document.addEventListener("DOMContentLoaded", () => {
    loadCurrencies();
    fromCurrency.addEventListener("change", () => updateFlag("fromCurrency", "fromFlag"));
    toCurrency.addEventListener("change", () => updateFlag("toCurrency", "toFlag"));
});

// Función para obtener tasas de cambio y convertir la moneda
async function convertCurrency() {
    let from = fromCurrency.value;
    let to = toCurrency.value;
    let amount = parseFloat(amountInput.value);

    // Validar el monto ingresado
    if (isNaN(amount) || amount <= 0) {
        resultText.innerText = "⚠️ Ingresa un monto válido";
        return;
    }

    loader.style.display = "block"; // Mostrar loader

    try {
        console.log(`Obteniendo tasa de cambio de ${from} a ${to}...`);

        // Llamar a la API con la moneda correcta
        let response = await fetch(`https://v6.exchangerate-api.com/v6/8ec0495239885847b4d8bf2c/latest/${from}`);
        let data = await response.json();

        console.log("Respuesta de la API:", data);

        if (!data.conversion_rates) {
            throw new Error("La API no devolvió tasas de cambio");
        }

        let rate = data.conversion_rates[to];

        if (!rate) {
            throw new Error(`No se encontró una tasa de cambio para ${to}`);
        }

        console.log(`Tasa de cambio: 1 ${from} = ${rate} ${to}`);

        // Calcular el monto convertido
        let convertedAmount = (amount * rate).toFixed(2);
        resultText.innerText = `${amount} ${from} = ${convertedAmount} ${to}`;
    } catch (error) {
        console.error("Error en la conversión:", error);
        resultText.innerText = "❌ Error al obtener tasas de cambio";
    }

    loader.style.display = "none"; // Ocultar loader después de la conversión
}

// Función para obtener y actualizar tasas de cambio en vivo
async function updateLiveRates() {
    const tickerElement = document.getElementById("liveRates");

    // Mostrar el mensaje de carga
    tickerElement.innerText = "⏳ Cargando tasas en vivo...";

    try {
        const response = await fetch("https://api.frankfurter.app/latest?from=USD");
        const data = await response.json();

        if (!data.rates) throw new Error("No se pudieron obtener los datos");

        // Construimos el texto del ticker
        let tickerText = "💰 Tasas en tiempo real: ";
        for (let currency in data.rates) {
            tickerText += `1 USD = ${data.rates[currency]} ${currency} | `;
        }

        // Esperar 5 segundos antes de actualizar el texto
        setTimeout(() => {
            tickerElement.innerText = tickerText;
        }, 5000); // 5000ms = 5 segundos

    } catch (error) {
        console.error("Error obteniendo tasas en tiempo real:", error);
        tickerElement.innerText = "❌ Error al cargar tasas en tiempo real";
    }
}
// Función para obtener las cotizaciones del dólar en Argentina
async function fetchArgentinaDollarRates() {
    const ratesList = document.getElementById("ratesList");
    ratesList.innerHTML = "⏳ Cargando cotizaciones...";

    try {
        const response = await fetch("https://dolarapi.com/v1/dolares");
        const data = await response.json();

        if (!Array.isArray(data)) {
            throw new Error("La API no devolvió una lista válida.");
        }

        // Limpiar la lista antes de mostrar los valores
        ratesList.innerHTML = "";

        data.forEach(rate => {
            let listItem = document.createElement("li");
            listItem.innerHTML = `<strong>${rate.nombre}:</strong> Compra: ${rate.compra} | Venta: ${rate.venta}`;
            ratesList.appendChild(listItem);
        });

    } catch (error) {
        console.error("Error obteniendo cotizaciones del dólar en Argentina:", error);
        ratesList.innerHTML = "❌ No se pudieron cargar las cotizaciones.";
    }
}

// Llamamos a la función al iniciar y la actualizamos cada 60 segundos
fetchArgentinaDollarRates();
setInterval(fetchArgentinaDollarRates, 60000);


// Llamamos a la función al inicio y la actualizamos cada 60 segundos
updateLiveRates();
setInterval(updateLiveRates, 60000);

// Evento para ejecutar la conversión al hacer clic en el botón
convertButton.addEventListener("click", convertCurrency);
