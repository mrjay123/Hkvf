// ==========================================
// CONFIGURATION
// ==========================================
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxuXfjf1A2DC0cKBcJ23H1dhrFFz590NaHgyUZ-1nxUuY7jQnt9_bMJZWeZVOj87NObgQ/exec"; 
const ADMIN_PASS = "12345"; 

let globalTransactions = [];

function checkPassword() {
    let input = document.getElementById("adminPassword").value;
    
    if (input === ADMIN_PASS) {
        document.getElementById("loginSection").classList.remove("d-flex");
        document.getElementById("loginSection").style.display = "none";
        
        document.getElementById("dashboardSection").style.display = "block";
        loadDashboardData();
    } else {
        alert("Incorrect Password! Access Denied.");
    }
}

function logout() {
    document.getElementById("adminPassword").value = "";
    document.getElementById("dashboardSection").style.display = "none";
    document.getElementById("loginSection").style.display = "";
    document.getElementById("loginSection").classList.add("d-flex");
}

document.getElementById("adminPassword").addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
        event.preventDefault();
        checkPassword();
    }
});

async function loadDashboardData() {
    try {
        let response = await fetch(SCRIPT_URL + "?action=dashboard");
        let data = await response.json();

        if (data.success) {
            document.getElementById("totalRevenue").innerText = "₹" + data.revenue;
            document.getElementById("totalCount").innerText = data.count;
            globalTransactions = data.transactions;
            renderTable(globalTransactions);
        } else {
            alert("Error loading data from database!");
        }
    } catch (error) {
        console.error("Fetch Error:", error);
        document.getElementById("transactionBody").innerHTML = 
            "<tr><td colspan='5' class='text-center text-danger py-5'><i class='bi bi-wifi-off fs-1 d-block mb-2'></i>Connection Failed. Please check URL or internet.</td></tr>";
    }
}

function renderTable(transactionsData) {
    let tbody = document.getElementById("transactionBody");
    tbody.innerHTML = ""; 

    if (transactionsData.length === 0) {
        tbody.innerHTML = "<tr><td colspan='5' class='text-center text-white-50 py-5'><i class='bi bi-inbox fs-1 d-block mb-2'></i>No transactions found</td></tr>";
        return;
    }

    transactionsData.forEach((txn, index) => {
        let tr = document.createElement("tr");
        tr.innerHTML = `
            <td class="text-white-50 fw-bold">${index + 1}</td>
            <td class="text-success fw-bold fs-5">₹${txn.amount}</td>
            <td class="text-info font-monospace" style="letter-spacing: 1px;">${txn.txnId}</td>
            <td class="text-white-50"><i class="bi bi-clock me-1 text-secondary"></i>${txn.time}</td>
            <td class="text-center"><span class="badge bg-success rounded-pill px-3 py-2 shadow-sm"><i class="bi bi-check2-all me-1"></i>Verified</span></td>
        `;
        tbody.appendChild(tr);
    });
}

function filterTable() {
    let input = document.getElementById("searchInput").value.toLowerCase();
    let filteredData = globalTransactions.filter(txn => {
        return txn.txnId.toLowerCase().includes(input) || txn.amount.toString().includes(input);
    });
    renderTable(filteredData);
}

function exportToCSV() {
    if (globalTransactions.length === 0) {
        alert("No data to export!");
        return;
    }

    let csvContent = "S.No,Amount (INR),Transaction ID,Date & Time,Status\n";

    globalTransactions.forEach((txn, index) => {
        let row = `${index + 1},${txn.amount},${txn.txnId},"${txn.time}",Verified`;
        csvContent += row + "\n";
    });

    let blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    let link = document.createElement("a");
    
    if (link.download !== undefined) {
        let url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", "PhonePe_Transactions_" + new Date().getTime() + ".csv");
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}
