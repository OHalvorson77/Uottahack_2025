
import React, { useState, useRef } from "react";
import styled from "styled-components";
import { FaMicrophone, FaMicrophoneSlash, FaPhoneSlash, FaFileUpload, FaUserCircle } from "react-icons/fa";
import axios from 'axios';
// Styled Components
const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: linear-gradient(to right, #28a745, #007bff); /* Green to Blue gradient */
  position: relative;
  color: white;
`;

const Logo = styled.div`
  position: absolute;
  
  top: 20px;
  left: 20px;
  font-size: 24px;
  font-weight: bold;
  color: black;
  z-index: 10;
`;

const VideoGrid = styled.div`
  display: grid;
  grid-template-rows: auto;
  gap: 10px;
  padding: 10px;
  flex: 1;
`;

const FullWidthVideoBox = styled.div`
  background: white;
  color: black;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  border-radius: 8px;
  overflow: hidden;
  padding: 10px;
`;

const Controls = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  background: rgba(0, 0, 0, 0.5);
  padding: 15px;
`;

const ControlButton = styled.button`
  background: ${(props) => props.bg || "#007bff"};
  color: white;
  border: none;
  border-radius: 5px;
  padding: 10px;
  margin: 0 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  width: 50px;
  height: 50px;
  position: relative;

  &:hover {
    background: ${(props) => props.hover || "#0056b3"};
  }

  input {
    position: absolute;
    opacity: 0;
    width: 100%;
    height: 100%;
    cursor: pointer;
  }
`;

const ProfileBox = styled.div`
  position: fixed;
  bottom: 5%;
  right: 5%;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  width: 150px;
  height: 150px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 10%;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
  z-index: 10;
`;

const ContentBox = styled.div`
  padding: 20px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 8px;
  margin-top: 20px;
`;

function Call() {
  const [pdfText, setPdfText] = useState("");
  const [transcript, setTranscript] = useState("");
  const [listening, setListening] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [responseMessage, setResponseMessage] = useState(""); // State to store API response message
  const silenceTimeout = useRef(null); // Reference to the timeout for silence detection

  

   

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
        const responseData = await response.json();
        setResponseMessage(responseData.message);
        const audioBlob = await fetchAudio(responseData.audio);
        const audioUrl = URL.createObjectURL(audioBlob);

        setResponseMessage(responseData.message);
        const audio = new Audio(audioUrl);
        audio.play().catch((error) => {
          console.error("Audio playback failed:", error);
        });
        setAudioUrl(audioUrl);
         // Speak the message returned by the API
      } else {
        console.error("Failed to send transcript:", response.statusText);
      }
    } catch (error) {
      console.error("Error sending transcript to API:", error);
    }
  };

  const fetchAudio = (base64String) => {
    // Decode the base64 string into binary data
    const byteArray = new Uint8Array(atob(base64String).split('').map(char => char.charCodeAt(0)));
    return new Blob([byteArray], { type: 'audio/mpeg' });
  };

 
  
 
  const startListening = () => {
    setListening(true);
    recognition.start();

    recognition.onresult = (event) => {
      const interimTranscript = Array.from(event.results)
        .map((result) => result[0].transcript)
        .join("");
      setTranscript(interimTranscript);

      if (silenceTimeout.current) {
        clearTimeout(silenceTimeout.current);
      }

      silenceTimeout.current = setTimeout(() => {
        setTranscript('');
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

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      try {
        const reader = new FileReader();
        reader.onload = async (e) => {
          const arrayBuffer = e.target.result;
          const pdfjsLib = await import("pdfjs-dist");
          pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.worker.min.mjs`;

          const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
          let text = "";
          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const content = await page.getTextContent();
            text += content.items.map((item) => item.str).join(" ");
          }
          setPdfText(text);

          const response = await fetch("http://127.0.0.1:5000/transcript", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ transcript: text }),
          });

          if (response.ok) {
            const responseData = await response.json();
            setPdfText(responseData.message);
          }
        };
        reader.readAsArrayBuffer(file);
      } catch (error) {
        console.error("Error parsing PDF:", error);
      }
    }
  };

  return (
    <AppContainer>
      <Logo>Office-Hour</Logo>
      <VideoGrid>
        <FullWidthVideoBox>
          <div style={{ color: 'black', padding: '10px', overflowY: 'scroll', maxHeight: '100%' }}>
            {pdfText}
          </div>
        </FullWidthVideoBox>
      </VideoGrid>
      <Controls>
        <ControlButton
          bg={listening ? "#dc3545" : "#6c757d"}
          hover={listening ? "#c82333" : "#5a6268"}
          onClick={() => {
            if (listening) {
              stopListening();
            } else {
              startListening();
            }
          }}
        >
          {listening ? <FaMicrophone /> : <FaMicrophoneSlash />}
          <input
            onChange={() => {
              if (listening) {
                stopListening();
              } else {
                startListening();
              }
            }}
            title={listening ? "Stop Listening" : "Start Listening"}
          />
        </ControlButton>
        <ControlButton bg="#28a745" hover="#218838">
          <FaFileUpload />
          <input
            type="file"
            accept="application/pdf"
            onChange={handleFileUpload}
            title="Upload PDF"
          />
        </ControlButton>
        <ControlButton bg="#dc3545" hover="#c82333">
          <FaPhoneSlash />
        </ControlButton>
      </Controls>
      <ProfileBox>
        <FaUserCircle size={60} />
      </ProfileBox>
      <ContentBox>
        <p>{listening ? "Listening..." : "Unmute to Speak"}</p>
        <div style={{ marginTop: "20px", fontSize: "18px", color: "#333" }}>
          <strong>Transcript:</strong>
          <p>{transcript}</p>
        </div>
        {responseMessage && (
          <div style={{ marginTop: "20px", fontSize: "18px", color: "#28a745" }}>
            <strong>Response from API:</strong>
            <p>{responseMessage}</p>
          </div>
        )}
      </ContentBox>
    </AppContainer>
  );
}

export default Call;
