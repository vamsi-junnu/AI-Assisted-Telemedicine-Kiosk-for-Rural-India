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
// Login validation function
function validateLogin(username, password) {
    const validUsername = "Teja";  // Replace with actual username
    const validPassword = "Teja";  // Replace with actual password
    return username === validUsername && password === validPassword;
}

// Handle login form submission
const loginForm = document.getElementById("login-form");
const loginSection = document.getElementById("login-section");
const chatbotSection = document.getElementById("chatbot-section");
const loginError = document.getElementById("login-error");

loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    
    if (validateLogin(username, password)) {
        // Hide login section and show chatbot section on successful login
        loginSection.style.display = "none";
        chatbotSection.style.display = "block";
    } else {
        // Show error message if credentials are invalid
        loginError.style.display = "block";
    }
});
