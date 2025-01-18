import React, { useState, useRef } from "react";

const VoiceToText = () => {
  const [transcript, setTranscript] = useState("");
  const [listening, setListening] = useState(false);
  const [responseMessage, setResponseMessage] = useState(""); // State to store API response message
  const silenceTimeout = useRef(null); // Reference to the timeout for silence detection

  // Check for browser compatibility
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    return <p>Your browser does not support the Web Speech API.</p>;
  }

  const recognition = new SpeechRecognition();
  recognition.continuous = true; // Keeps listening until stopped
  recognition.interimResults = true; // Shows interim results
  recognition.lang = "en-US"; // Language (adjust as needed)

  const sendTranscriptToAPI = async (transcriptText) => {
    try {
      const response = await fetch("http://127.0.0.1:5000/transcript", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ transcript: transcriptText }),
      });

      if (response.ok) {
        // Parse the JSON response from the server
        const responseData = await response.json();
        // Set the response message in the state
        setResponseMessage(responseData.message);
        console.log("Transcript sent successfully!");
        speakText(responseData.message); // Speak the message returned by the API
      } else {
        console.error("Failed to send transcript:", response.statusText);
      }
    } catch (error) {
      console.error("Error sending transcript to API:", error);
    }
  };

  // Function to convert text to speech using Google Cloud TTS
  const speakText = (text) => {
    try {
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
  
        // Select an "AI-like" voice if available
        const voices = speechSynthesis.getVoices();
        const aiVoice = voices.find((voice) =>
          voice.name.toLowerCase().includes("google") || voice.name.toLowerCase().includes("ai")
        );
  
        if (aiVoice) {
          utterance.voice = aiVoice; // Use the selected AI-like voice
        }
  
        // Optionally, customize the pitch and rate
        utterance.pitch = 1; // Default pitch
        utterance.rate = 1;  // Default rate
  
        // Speak the text
        speechSynthesis.speak(utterance);
  
        console.log("Speech synthesis started...");
      } else {
        console.error("Your browser does not support text-to-speech.");
      }
    } catch (error) {
      console.error("Error with text-to-speech:", error);
    }
  };
  
  

  const startListening = () => {
    setListening(true);
    recognition.start();

    recognition.onresult = (event) => {
      const interimTranscript = Array.from(event.results)
        .map((result) => result[0].transcript)
        .join("");
      setTranscript(interimTranscript);

      // Clear the previous timeout and set a new one
      if (silenceTimeout.current) {
        clearTimeout(silenceTimeout.current);
      }

      // Set a timeout to send the transcript after 2 seconds of silence
      silenceTimeout.current = setTimeout(() => {
        sendTranscriptToAPI(interimTranscript);
      }, 2000); // Wait for 2 seconds of silence before sending
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
    };

    recognition.onend = () => {
      setListening(false);
    };
  };

  const stopListening = () => {
    setListening(false);
    recognition.stop();
  };

  return (
    <div style={{ padding: "20px", background: "#f9f9f9", borderRadius: "8px" }}>
      <h2>Voice to Text</h2>
      <p>{listening ? "Listening..." : "Click Start to Speak"}</p>
      <button
        onClick={startListening}
        style={{
          background: "#007bff",
          color: "white",
          border: "none",
          borderRadius: "5px",
          padding: "10px 20px",
          margin: "10px",
          cursor: "pointer",
        }}
        disabled={listening}
      >
        Start
      </button>
      <button
        onClick={stopListening}
        style={{
          background: "#dc3545",
          color: "white",
          border: "none",
          borderRadius: "5px",
          padding: "10px 20px",
          margin: "10px",
          cursor: "pointer",
        }}
        disabled={!listening}
      >
        Stop
      </button>
      <div style={{ marginTop: "20px", fontSize: "18px", color: "#333" }}>
        <strong>Transcript:</strong>
        <p>{transcript}</p>
      </div>
      {/* Display the response message from the API */}
      {responseMessage && (
        <div style={{ marginTop: "20px", fontSize: "18px", color: "#28a745" }}>
          <strong>Response from API:</strong>
          <p>{responseMessage}</p>
        </div>
      )}
    </div>
  );
};

export default VoiceToText;
