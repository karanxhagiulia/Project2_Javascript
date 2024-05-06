// When the DOM content is loaded, execute this function
document.addEventListener("DOMContentLoaded", function() {
    // Fetch list of cryptocurrencies from CoinGecko API
    fetch("https://api.coingecko.com/api/v3/coins/list")
        // Once the response is received, parse it as JSON
        .then(response => response.json())
        .then(data => {
            // Populate the select dropdown with cryptocurrency options
            const cryptoSelect = document.getElementById("cryptoSelect");
            // Iterate over each cryptocurrency in the data
            data.forEach(crypto => {
                // Create an option element for each cryptocurrency
                const option = document.createElement("option");
                // Set the value of the option to the cryptocurrency ID
                option.value = crypto.id;
                // Set the text content of the option to the cryptocurrency name
                option.textContent = crypto.name;
                // Append the option to the select dropdown
                cryptoSelect.appendChild(option);
            });
        })
        // If an error occurs during fetching or parsing, log the error
        .catch(error => {
            console.error("Error fetching cryptocurrency list:", error);
        });

    // Load saved crypto data from local storage and populate the table
    const savedData = JSON.parse(localStorage.getItem("cryptoTableData"));
    // If there is saved data
    if (savedData) {
        // get the table body element
        const tableBody = document.getElementById("cryptoTableBody");
        // Initialise total profit/loss row
        let totalProfitLoss = 0;
        // iterate over each saved cryptocurrency data
        savedData.forEach((crypto, index) => {
            // Create a table row for the cryptocurrency
            const row = createTableRow(crypto, index);
            // Append the row to the table body
            tableBody.appendChild(row);
            // Accumulate profit/loss
            totalProfitLoss += crypto.profitLoss;
        });

        // Add total profit/loss row to the total profit/loss table
        updateTotalProfitLoss(totalProfitLoss);
    }
});

// Add event listener for the form submission
document.getElementById("cryptoForm").addEventListener("submit", function(event) {
    // Prevent the default form submission behavior
    event.preventDefault();

    // Get the selected cryptocurrency ID, quantity, and purchase price from the form
    const cryptoId = document.getElementById("cryptoSelect").value;
    const quantity = parseFloat(document.getElementById("quantity").value);
    const purchasePrice = parseFloat(document.getElementById("purchasePrice").value.replace(',', '')); // Remove commas from the input

    // Check if input fields are not empty and quantity and purchase price are valid numbers and greater than zero
    if (!cryptoId || isNaN(quantity) || isNaN(purchasePrice) || quantity <= 0 || purchasePrice <= 0) {
        alert("Please enter valid values for all fields.");
        return;
    }

    // this is my API key for the CoinGecko API
    const apiKey = "CG-nJjMRUu2g1V1fbeJsqQoCGaD";

    // Fetch cryptocurrency data from the coinGecko API
    fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${cryptoId}&vs_currencies=usd&x_cg_demo_api_key=${apiKey}`)
        .then(response => response.json())
        .then(data => {
            // Get the current price of the cryptocurrency in USD
            const currentPrice = data[cryptoId].usd;
            // Calculate the current value of the cryptocurrency
            const currentValue = currentPrice * quantity;
            // Calculate the profit/loss based on the value I put and the quantity I put
            const profitLoss = currentValue - (purchasePrice * quantity);

            // Create an object with the cryptocurrency data
            const cryptoData = {
                id: cryptoId,
                name: document.getElementById("cryptoSelect").selectedOptions[0].textContent,
                quantity: quantity,
                purchasePrice: purchasePrice,
                currentPrice: currentPrice,
                totalValue: currentValue,
                profitLoss: profitLoss
            };

            // Retrieve existing data from local storage or initialize an empty array
            let tableData = JSON.parse(localStorage.getItem("cryptoTableData")) || [];

            // Add the new cryptocurrency data to the array
            tableData.push(cryptoData);

            // Save the updated array back to local storage
            localStorage.setItem("cryptoTableData", JSON.stringify(tableData));

            // Display the results
            document.getElementById("results").innerHTML = `
                <h2>Results</h2>
                <p>Crypto: ${cryptoId}</p>
                <p>Quantity Owned: ${quantity}</p>
                <p>Purchase Price: $${purchasePrice}</p>
                <p>Current Price: $${currentPrice}</p>
                <p>Total Value: $${currentValue}</p>
                <p>Profit/Loss: $${profitLoss}</p>
            `;

            // Update the table with the saved crypto data
            const tableBody = document.getElementById("cryptoTableBody");
            const row = createTableRow(cryptoData, tableData.length - 1); // Create table row
            tableBody.appendChild(row);

            // Update total profit/loss row
            const totalRow = document.getElementById("totalProfitLossRow");
            let totalProfitLoss = 0;
            tableData.forEach(crypto => {
                totalProfitLoss += crypto.profitLoss;
            });



            updateTotalProfitLoss(totalProfitLoss);
        })
        // If an error occurs during fetching or processing, log the error
        .catch(error => {
            console.error("Error fetching data:", error);
            // Display an error message
            document.getElementById("results").innerHTML = "<p>Error fetching data. Please try again later.</p>";
        });
});

// Function to create a table row for a cryptocurrency
function createTableRow(crypto, index) {
    // Create a new table row element
    const row = document.createElement("tr");
    // Set the inner HTML content of the row with cryptocurrency data
    row.innerHTML = `
        <td>${crypto.name}</td>
        <td>${crypto.quantity}</td>
        <td>$${crypto.purchasePrice}</td>
        <td>$${crypto.currentPrice}</td>
        <td>$${crypto.totalValue}</td>
        <td>$${crypto.profitLoss}</td>
        <td><button class="delete-btn" data-index="${index}">&times;</button></td>
    `;
    // Add event listener to the delete button to remove the cryptocurrency from the list
    row.querySelector(".delete-btn").addEventListener("click", function() {
        deleteCrypto(index);
    });
    // Return the created table row
    return row;
}

// Function to delete a cryptocurrency from the list
function deleteCrypto(index) {
    // Retrieve the saved crypto data from local storage
    let tableData = JSON.parse(localStorage.getItem("cryptoTableData")) || [];
    // Remove the cryptocurrency at the specified index from the list
    tableData.splice(index, 1);
    // Save the updated list back to local storage
    localStorage.setItem("cryptoTableData", JSON.stringify(tableData));
    // Reload the page to reflect the changes
    location.reload();
}

// Update total profit/loss table
function updateTotalProfitLoss(totalProfitLoss) {
    // Get the total profit/loss body element
    const totalProfitLossBody = document.getElementById("totalProfitLossBody");
    // Clear the existing content
    totalProfitLossBody.innerHTML = "";
    // Create a new row for the total profit/loss
    const totalRow = document.createElement("tr");
    // Set the HTML content of the total row with the total profit/loss
    totalRow.innerHTML = `
        <td colspan="2">Total Profit/Loss</td>
        <td colspan="4">$${totalProfitLoss}</td>
    `;
    // Append the total row to the total profit/loss body
    totalProfitLossBody.appendChild(totalRow);

    // Set the background color based on profit/loss (green/red)
    if (totalProfitLoss >= 0) {
        totalRow.classList.remove("negative-profit");
        totalRow.classList.add("positive-profit");
    } else {
        totalRow.classList.remove("positive-profit");
        totalRow.classList.add("negative-profit");
    }
}
