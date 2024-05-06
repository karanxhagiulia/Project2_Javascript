document.addEventListener("DOMContentLoaded", function() {
    // Fetch list of cryptocurrencies from CoinGecko
    fetch("https://api.coingecko.com/api/v3/coins/list")
        .then(response => response.json())
        .then(data => {
            // Populate the select dropdown with cryptocurrency options
            const cryptoSelect = document.getElementById("cryptoSelect");
            data.forEach(crypto => {
                const option = document.createElement("option");
                option.value = crypto.id;
                option.textContent = crypto.name;
                cryptoSelect.appendChild(option);
            });
        })
        .catch(error => {
            console.error("Error fetching cryptocurrency list:", error);
        });
});

document.getElementById("cryptoForm").addEventListener("submit", function(event) {
    event.preventDefault();

    const cryptoId = document.getElementById("cryptoSelect").value;
    const quantity = parseFloat(document.getElementById("quantity").value);
    const purchasePrice = parseFloat(document.getElementById("purchasePrice").value);

    const apiKey = "CG-nJjMRUu2g1V1fbeJsqQoCGaD"; // this is my API

    fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${cryptoId}&vs_currencies=usd&x_cg_demo_api_key=${apiKey}`)
        .then(response => response.json())
        .then(data => {
            const currentPrice = data[cryptoId].usd;
            const currentValue = currentPrice * quantity;
            const profitLoss = currentValue - (purchasePrice * quantity);

            document.getElementById("results").innerHTML = `
                <h2>Results</h2>
                <p>Crypto: ${cryptoId}</p>
                <p>Quantity Owned: ${quantity}</p>
                <p>Purchase Price: $${purchasePrice}</p>
                <p>Current Price: $${currentPrice}</p>
                <p>Total Value: $${currentValue}</p>
                <p>Profit/Loss: $${profitLoss}</p>
            `;
        })
        .catch(error => {
            console.error("Error fetching data:", error);
            document.getElementById("results").innerHTML = "<p>Error fetching data. Please try again later.</p>";
        });
});
