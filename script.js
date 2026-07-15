// ==========================================
// CONFIGURATION - API URL
// ==========================================
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxuXfjf1A2DC0cKBcJ23H1dhrFFz590NaHgyUZ-1nxUuY7jQnt9_bMJZWeZVOj87NObgQ/exec"; 

let currentSessionID = "";
let checkInterval;
let countdownInterval;

document.addEventListener("DOMContentLoaded", () => {
    if (window.location.pathname.includes("payment.html")) {
        generatePayment();
    }
});

async function generatePayment() {
    try {
        let response = await fetch(SCRIPT_URL + "?action=generate");
        let data = await response.json();

        if (data.success) {
            document.getElementById("payAmount").innerText = "₹" + data.amount;
            document.getElementById("upiIdDisplay").innerText = data.upiId;
            currentSessionID = data.sessionID;

            document.getElementById("loadingSection").style.display = "none";
            document.getElementById("paymentSection").style.display = "block";

            startTimer(120); 
            startCheckingPayment();
        } else {
            alert("System busy hai. " + data.message);
            window.location.href = "index.html"; 
        }
    } catch (error) {
        console.error("Error:", error);
        document.getElementById("loadingSection").innerHTML = "<h5 class='text-danger mb-3'>Connection Error!</h5><p class='text-white-50'>Check your internet or URL in script.js</p>";
    }
}

function startTimer(seconds) {
    let display = document.getElementById("timerDisplay");
    
    countdownInterval = setInterval(() => {
        let minutes = Math.floor(seconds / 60);
        let remSeconds = seconds % 60;
        
        display.innerText = (minutes < 10 ? "0" : "") + minutes + ":" + (remSeconds < 10 ? "0" : "") + remSeconds;
        
        if (seconds <= 0) {
            clearInterval(countdownInterval);
            clearInterval(checkInterval);
            window.location.href = "expired.html";
        }
        seconds--;
    }, 1000);
}

function startCheckingPayment() {
    let statusMsg = document.getElementById("statusMessage");
    
    checkInterval = setInterval(async () => {
        try {
            let response = await fetch(SCRIPT_URL + "?action=check&sessionID=" + currentSessionID);
            let data = await response.json();

            if (data.status === "success") {
                clearInterval(checkInterval);
                clearInterval(countdownInterval);
                
                statusMsg.className = "alert alert-success py-2 fw-bold";
                statusMsg.innerText = "Payment Successful! Redirecting...";
                
                setTimeout(() => {
                    window.location.href = "success.html";
                }, 2000);
            } 
            else if (data.status === "expired") {
                clearInterval(checkInterval);
                clearInterval(countdownInterval);
                window.location.href = "expired.html";
            }
        } catch (error) {
            console.error("Check Error:", error);
        }
    }, 10000); 
}
