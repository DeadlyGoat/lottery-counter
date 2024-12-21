
// Object to store running totals for each denomination
let totals = {
    2: { tickets: 0, value: 0 },
    3: { tickets: 0, value: 0 },
    4: { tickets: 0, value: 0 },
    5: { tickets: 0, value: 0 },
    10: { tickets: 0, value: 0 },
    20: { tickets: 0, value: 0 },
    30: { tickets: 0, value: 0 },
    50: { tickets: 0, value: 0 },
    100: { tickets: 0, value: 0 },
};
// Object to store the history of entries for each denomination
let history = {
    2: [],
    3: [],
    4: [],
    5: [],
    10: [],
    20: [],
    30: [],
    50: [],
    100: [],
};


// Function to update totals and display them
function updateTotals() {
    let totalsList = document.getElementById('totalsList');
    let grandTotalTickets = 0;
    let grandTotalValue = 0;

    // Clear the totals list
    totalsList.innerHTML = '';

    // Loop through each denomination and update the totals
    for (let denom in totals) {
        let ticketTotal = totals[denom].tickets;
        let valueTotal = totals[denom].value;

        // Only display denominations with tickets counted
        if (ticketTotal > 0) {
            let listItem = document.createElement('li');
            listItem.textContent = `$${denom} Tickets: ${ticketTotal} | $${valueTotal}`;
            totalsList.appendChild(listItem);
        }

        // Add to grand totals
        grandTotalTickets += ticketTotal;
        grandTotalValue += valueTotal;
    }

    // Update the grand totals display
    document.getElementById('grandTotal').textContent = grandTotalTickets;
    document.getElementById('grandValue').textContent = grandTotalValue;
}

document.getElementById('addButton').addEventListener('click', function () {
    let denomination = document.getElementById('denomination').value;
    let ticketCountInput = document.getElementById('ticketCount');
    let ticketCount = parseInt(ticketCountInput.value);

    if (isNaN(ticketCount) || ticketCount <= 0) {
        ticketCountInput.style.border = '2px solid red';
        alert('Please enter a valid positive number for the ticket count.');
        return;
    } else {
        ticketCountInput.style.border = '';
    }

    // Add the entry to the history
    history[denomination].push(ticketCount);

    // Update the totals for the selected denomination
    totals[denomination].tickets += ticketCount;
    totals[denomination].value = totals[denomination].tickets * denomination;

    // Clear the input field
    ticketCountInput.value = '';

    // Update the displayed totals and history
    updateTotals();
    displayAllHistories(); // Updated to display all histories
    saveData();

});
function displayAllHistories() {
    let historyContainer = document.getElementById('historyContainer');
    historyContainer.innerHTML = ''; // Clear previous histories

    for (let denomination in history) {
        // Create a section for each denomination
        let section = document.createElement('div');
        section.classList.add('denomination-section');
        section.innerHTML = `<h4>$${denomination} Tickets</h4>`;

        // If there are no entries, show a message
        if (history[denomination].length === 0) {
            section.innerHTML += '<p>No entries yet.</p>';
        } else {
            // Display the history for this denomination
            let list = document.createElement('ul');
            history[denomination].forEach((entry, index) => {
                let listItem = document.createElement('li');
                listItem.textContent = `Entry ${index + 1}: ${entry} tickets`;
                listItem.dataset.index = index; // Store the index for undo
                listItem.dataset.denomination = denomination; // Store denomination
                listItem.addEventListener('click', function () {
                    undoSpecificEntry(denomination, index);
                });
                list.appendChild(listItem);
            });
            section.appendChild(list);
        }

        historyContainer.appendChild(section);
    }
}

function displayHistory(denomination) {
    let historyDisplay = document.getElementById('historyDisplay');
    historyDisplay.innerHTML = ''; // Clear previous history

    if (history[denomination].length === 0) {
        historyDisplay.textContent = 'No entries for this denomination.';
        return;
    }

    let list = document.createElement('ul');
    history[denomination].forEach((entry, index) => {
        let listItem = document.createElement('li');
        listItem.textContent = `Entry ${index + 1}: ${entry} tickets`;
        listItem.dataset.index = index; // Store the index for undo
        listItem.addEventListener('click', function () {
            undoSpecificEntry(denomination, index);
        });
        list.appendChild(listItem);
    });

    historyDisplay.appendChild(list);
}
function undoSpecificEntry(denomination, index) {
    let entry = history[denomination][index]; // Get the specific entry

    // Subtract the entry from totals
    totals[denomination].tickets -= entry;
    totals[denomination].value = totals[denomination].tickets * denomination;

    // Remove the entry from history
    history[denomination].splice(index, 1);

    // Update the displayed totals and histories
    updateTotals();
    displayAllHistories();

    alert(`Entry ${index + 1} (${entry} tickets) for $${denomination} has been undone.`);
    saveData();

}
document.getElementById('resetButton').addEventListener('click', function () {
    // Confirm reset action
    if (!confirm('Are you sure you want to reset all totals?')) {
        return;
    }

    // Reset all totals and histories
    for (let denomination in totals) {
        totals[denomination].tickets = 0;
        totals[denomination].value = 0;
        history[denomination] = []; // Clear the history
    }

    // Update the displayed totals and histories
    updateTotals();
    displayAllHistories();

    alert('All totals and histories have been reset.');
    saveData();

});
function saveData() {
    localStorage.setItem('totals', JSON.stringify(totals));
    localStorage.setItem('history', JSON.stringify(history));
}
function loadData() {
    const savedTotals = localStorage.getItem('totals');
    const savedHistory = localStorage.getItem('history');

    if (savedTotals) {
        totals = JSON.parse(savedTotals);
    }
    if (savedHistory) {
        history = JSON.parse(savedHistory);
    }

    // Update the displayed totals and histories
    updateTotals();
    displayAllHistories();
}
function exportData() {
    // Create the CSV header
    let csvContent = 'Denomination,Total Tickets,Total Value,History\n';

    // Add data for each denomination
    for (let denomination in totals) {
        let ticketTotal = totals[denomination].tickets;
        let valueTotal = totals[denomination].value;
        let historyEntries = history[denomination].join('; '); // Separate history by semicolons

        csvContent += `${denomination},${ticketTotal},${valueTotal},"${historyEntries}"\n`;
    }

    // Create a blob and a download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'lottery_data.csv'); // File name
    document.body.appendChild(link);
    link.click();

    // Cleanup
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}
document.getElementById('exportButton').addEventListener('click', exportData);

loadData();



