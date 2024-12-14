document.addEventListener("DOMContentLoaded", () => {
    // Get the elements
    const mainSection = document.getElementById("main-section");
    const loginButton = document.getElementById("login-button");
    const registerButton = document.getElementById("register-button");
    const registerSection = document.getElementById("register-section");
    const loginSection = document.getElementById("login-section");
    const chatbotSection = document.getElementById("chatbot-section");
    const welcomeMessage = document.getElementById("welcome-message");

    // Event listener for Register button
    registerButton.addEventListener("click", () => {
        mainSection.style.display = "none";
        loginSection.style.display = "none";
        registerSection.style.display = "block";
    });

    // Event listener for Login button
    loginButton.addEventListener("click", () => {
        mainSection.style.display = "none";
        registerSection.style.display = "none";
        loginSection.style.display = "block";
    });

    // Event listeners for Back buttons
    document.getElementById("register-back-button").addEventListener("click", () => {
        registerSection.style.display = "none";
        mainSection.style.display = "block";
    });

    document.getElementById("login-back-button").addEventListener("click", () => {
        loginSection.style.display = "none";
        mainSection.style.display = "block";
    });

    document.getElementById("chatbot-back-button").addEventListener("click", () => {
        chatbotSection.style.display = "none";
        mainSection.style.display = "block";
        welcomeMessage.style.display = "none"; // Hide welcome message on return to main screen
    });

    // Registration and login functionality
    const registerForm = document.getElementById("register-form");
    const registerError = document.getElementById("register-error");
    const loginForm = document.getElementById("login-form");
    const loginError = document.getElementById("login-error");

    // Registration Functionality
    registerForm.addEventListener("submit", (e) => {
        e.preventDefault();
        
        const patientName = document.getElementById("patient-name").value;
        const surname = document.getElementById("surname").value;
        const contactNumber = document.getElementById("contact-number").value;
        const address = document.getElementById("address").value;
        const gender = document.getElementById("gender").value;
        const age = document.getElementById("age").value;
        const username = document.getElementById("username").value;
        const password = document.getElementById("password").value;
        const confirmPassword = document.getElementById("confirm-password").value;

        if (password !== confirmPassword) {
            registerError.style.display = "block";
            registerError.textContent = "Passwords do not match. Please try again.";
        } else {
            registerError.style.display = "none";
            const patientData = {
                patientName,
                surname,
                contactNumber,
                address,
                gender,
                age,
                username,
                password
            };
            localStorage.setItem("patientData", JSON.stringify(patientData));
            registerSection.style.display = "none";
            loginSection.style.display = "block";
        }
    });

    // Login Functionality
    loginForm.addEventListener("submit", (e) => {
        e.preventDefault();
        
        const loginUsername = document.getElementById("login-username").value;
        const loginPassword = document.getElementById("login-password").value;
        const storedPatientData = JSON.parse(localStorage.getItem("patientData"));

        if (storedPatientData && loginUsername === storedPatientData.username && loginPassword === storedPatientData.password) {
            loginError.style.display = "none";
            loginSection.style.display = "none";
            chatbotSection.style.display = "block";
            welcomeMessage.textContent = `Hello, ${storedPatientData.patientName}`;
            welcomeMessage.style.display = "block";
        } else {
            loginError.style.display = "block";
            loginError.textContent = "Invalid credentials, please try again.";
        }
    });
});

const sendButton = document.getElementById("send-btn");
const voiceButton = document.getElementById("voice-btn");
const stopButton = document.getElementById("stop-btn"); // Get the stop button element
const chatWindow = document.getElementById("chat-window");
const userInput = document.getElementById("user-input");

// Function to append message to chat window
function appendMessage(message, sender) {
    const msgDiv = document.createElement("div");
    msgDiv.className = "message " + sender;
    msgDiv.textContent = message;
    chatWindow.appendChild(msgDiv);
    chatWindow.scrollTop = chatWindow.scrollHeight;
}

// Function to communicate with Flowise AI
async function sendMessageToAI(text) {
    try {
        console.log("Sending message to AI:", text);  // Debug: log outgoing message

        appendMessage("AI is thinking...", "info"); // Display loading text
        
        const response = await fetch("http://localhost:3000/api/v1/prediction/50cd4d7d-c7ba-47c2-9935-ac886cd2ba64", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ question: text }),
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.statusText}`);
        }

        const data = await response.json();
        console.log("Received data from AI:", data);  // Debug: log incoming data

        // Extract AI response from the "text" field
        const aiReply = data.text || "No response from AI"; // The AI's response is in the 'text' field
        appendMessage(aiReply, "ai");
        readOutLoud(aiReply);  // Speak the AI response

    } catch (error) {
        console.error("Error communicating with AI:", error);  // Debug: log error details
        appendMessage("Error communicating with AI: " + error.message, "error");
    } finally {
        // Remove the "thinking" message
        const infoMessages = document.querySelectorAll('.info');
        infoMessages.forEach(msg => msg.remove());
    }
}

// Send button click handler
sendButton.addEventListener("click", () => {
    const message = userInput.value.trim();
    if (message) {
        appendMessage(message, "user");
        sendMessageToAI(message);
        userInput.value = "";
    }
});

// Voice recognition using Web Speech API
voiceButton.addEventListener("click", () => {
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = 'en-IN';
    recognition.start();
    recognition.onresult = (event) => {
        const voiceInput = event.results[0][0].transcript;
        appendMessage(voiceInput, "user");
        sendMessageToAI(voiceInput);
    };  
});

// Function to read AI's reply out loud
function readOutLoud(text) {
    const speech = new SpeechSynthesisUtterance(text);
    speech.lang = "en-IN";
    window.speechSynthesis.speak(speech);
}

// Stop button functionality to stop voice response
stopButton.addEventListener("click", () => {
    window.speechSynthesis.cancel();  // Stop any ongoing speech synthesis
    console.log("Speech stopped by user.");
});