
import React, { useState, useRef, useEffect } from "react";
import styled from "styled-components";
import { FaMicrophone, FaMicrophoneSlash, FaPhoneSlash, FaFileUpload, FaUserCircle, FaPen, FaVideo, FaStop } from "react-icons/fa";
import axios from 'axios';

import { useLocation } from 'react-router-dom';

import { useNavigate } from "react-router-dom";

import { saveAs } from "file-saver";


// Styled Components
const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: linear-gradient(to right,rgb(167, 40, 125), #007bff); /* Green to Blue gradient */
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
  height: 100%; /* Full viewport height */
  border-radius: 8px;
  overflow: hidden;
  padding: 10px;
  position: relative;
`;
const TextContainer = styled.div`
  color: red;
  padding: 10px;
  overflow-y: auto;
  max-height: 100%;
  font-family: 'Permanent Marker', cursive; /* Use a marker-like font */
  font-size: 20px;
  font-weight: bold;
  white-space: pre-wrap;
  word-wrap: break-word;
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
  width: 200px;
  height: 200px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 10%;
  border: 2.5px solid ${(props) => (props.isActive ? "#ff000" : "white")}
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
  z-index: 10;

  animation: ${(props) =>
    props.isActive
    ? "pulse 1.5s infinite"
    : "none"}; /*Apply animation if active*/

  @keyframes pulse {
    0% {
      box-shadow: 0 0 10px 2px rgba(255, 0, 0, 0.5);
    }
    50% {
      box-shadow: 0 0 20px 4px rgba(255, 0, 0, 0.8);
    }
    100% {
      box-shadow: 0 0 10px 2px rgba(255, 0, 0, 0.5)
    }
  }
`;

const ContentBox = styled.div`
  padding: 20px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 8px;
  margin-top: 20px;
`;

const ProfileImage = styled.img`
  border-radius: 50%;
  width: 150px;
  height: 150px;
  object-fit: cover;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
  cursor: pointer;
  transition: transform 0.2s, background 0.2s;

  &:hover {
    transform: scale(1.1);
    background: #f1f1f1;
  }
`;


function Call() {
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const profileName = params.get('profileName');
  const [pdfText, setPdfText] = useState("");
  const [transcript, setTranscript] = useState("");
  const [listening, setListening] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [responseMessage, setResponseMessage] = useState(""); // State to store API response message
  const [noteMessage, setNoteMessage] = useState(""); // State to store API response message
  const silenceTimeout = useRef(null); // Reference to the timeout for silence detection
  const [displayedMessage, setDisplayedMessage] =useState("");

  const profileImages = {
    "Owen Halvorson": "./OwenHalvorson1.png",  // Replace with actual image paths
    "Niyol Jha": "./NiyolJha.png",      // Replace with actual image paths
    "Brendan Clark": "./brendo.png",             // Replace with actual image paths
    "Madison Holdsworth": "./MH2.png",           // Replace with actual image paths
    "Tanya Gibbler" : "./TanyaGibbler.png",      // Replace with actual image paths
    "Frank Woo": "./FrankWoo.png"                // Replace with actual image paths
  };

  const voiceIDs = {
    "Owen Halvorson": "CZnaDN40v7JYigHcaARz",  // Replace with actual image paths
    "Niyol Jha": "Ro2kf5sy0BztesU9FJcd",      // Replace with actual image paths
    "Brendan Clark": "zaX2nGJAhQF8XhOyv5iY",             // Replace with actual image paths
    "Madison Holdsworth": "MF3mGyEYCl7XYWbV9V6O",           // Replace with actual image paths
    "Tanya Gibbler" : "oWAxZDx7w5VEj9dCyTzz",      // Replace with actual image paths
    "Frank Woo": "bVMeCyTHy58xNoL34h3p"                // Replace with actual image paths
  };

  const typingSpeed = 100;

  const [markerIcons, setMarkerIcons] = useState([]);

  const [isRecording, setIsRecording] = useState(false);
  const [recordedChunks, setRecordedChunks] = useState([]);
  const mediaRecorderRef = useRef(null);
  const videoRef = useRef(null);

  const navigate = useNavigate();
  const handlePhoneClick = (profileName) => {
    navigate("/");
  };

useEffect(() => {
  if (noteMessage && noteMessage.length > 0) {
    let index = 0;
    const intervalId = setInterval(() => {
      setDisplayedMessage((prev) => prev + noteMessage[index]);
      setMarkerIcons((prev) => [...prev, index]); // Add the index of the marker icon
      index += 1;

      if (index === noteMessage.length) {
        clearInterval(intervalId);
      }
    }, typingSpeed);

    return () => clearInterval(intervalId);
  }
}, [noteMessage]);

const startRecording = async () => {
  try {
    const stream = await navigator.mediaDevices.getDisplayMedia({
      video: true,
      audio: true,
    });

    // Preview the screen in the video element
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
      videoRef.current.play();
    }

    const mediaRecorder = new MediaRecorder(stream);
    mediaRecorderRef.current = mediaRecorder;

    // Collect data chunks
    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        setRecordedChunks((prev) => [...prev, event.data]);
      }
    };

    // Start recording
    mediaRecorder.start();
    setIsRecording(true);
  } catch (error) {
    console.error("Error starting screen recording:", error);
  }
};
const stopRecording = async () => {
  if (mediaRecorderRef.current) {
    mediaRecorderRef.current.stop();
    setIsRecording(false);

    // Stop all tracks to release resources
    const tracks = mediaRecorderRef.current.stream.getTracks();
    tracks.forEach((track) => track.stop());
  }

  // Save the recording
  if (recordedChunks.length > 0) {
    const blob = new Blob(recordedChunks, { type: "video/webm" });
    saveAs(blob, "screen-recording.webm"); // Save the file

    // Send the recorded video to the backend
    try {
      const formData = new FormData();
      formData.append("video", blob, "screen-recording.webm");

      const response = await fetch("http://localhost:5000/api/upload", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        console.log("Video uploaded successfully");
      } else {
        console.error("Error uploading video");
      }
    } catch (error) {
      console.error("Error sending video to server:", error);
    }

    setRecordedChunks([]); // Clear the chunks
  }
};



   

  

   

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
    recognition.stop();

    setNoteMessage("");
    try {
      const response = await fetch("http://127.0.0.1:5000/transcript", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ transcript: transcriptText, voiceID: voiceIDs[profileName] }),
      });

      if (response.ok) {

        
        const responseData = await response.json();
        setResponseMessage(responseData.message);

        setNoteMessage(responseData.notes);
        const audioBlob = await fetchAudio(responseData.audio);
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        audio.play().catch((error) => {
          console.error("Audio playback failed:", error);
        });
        setAudioUrl(audioUrl);
         // Speak the message returned by the API

      
         setListening(false);
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
    setIsActive(true);
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
      setIsActive(false);
    };
  };

  const stopListening = () => {
    recognition.stop();
    setListening(false);
    setIsActive(false);
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

          const response = await fetch("http://127.0.0.1:5000/sendNotes", {
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
      
      <VideoGrid>
      <FullWidthVideoBox>
      <TextContainer>
  {displayedMessage}
 
</TextContainer>

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
        {/* Start Recording Button */}
        {!isRecording && (
          <ControlButton bg="#007bff" hover="#0056b3" onClick={startRecording}>
            <FaVideo />
          </ControlButton>
        )}

        {/* Stop Recording Button */}
        {isRecording && (
          <ControlButton bg="#dc3545" hover="#c82333" onClick={stopRecording}>
            <FaStop />
          </ControlButton>
        )}

        <ControlButton bg="#dc3545" hover="#c82333" onClick={() => {
            handlePhoneClick();
          }}>
          <FaPhoneSlash />
        </ControlButton>
      </Controls>
      <ProfileBox isActive={isActive}>
       
        <ProfileImage src={profileImages[profileName]} alt={profileName} />
      </ProfileBox>
      
    </AppContainer>
  );
}

export default Call;
