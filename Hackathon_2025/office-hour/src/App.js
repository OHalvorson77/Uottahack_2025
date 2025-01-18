import React, { useState } from "react";
import styled from "styled-components";
import { FaMicrophoneSlash, FaPhoneSlash, FaFileUpload, FaUserCircle } from "react-icons/fa";
import VoiceToText from "./VoiceToText";



// Styled Components
const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: black;
  position: relative;
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
`;

const Controls = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  background: #333;
  color: white;
  padding: 10px;
`;

const ControlButton = styled.button`
  background: ${(props) => props.bg || "#007bff"};
  color: white;
  border: none;
  border-radius: 5px;
  padding: 10px;
  margin: 0 5px;
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
  background: gray;
  color: black;
  width: 150px;
  height: 150px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 10%;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
  z-index: 10;
`;

function App() {
  const [pdfText, setPdfText] = useState("");
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      try {
        const reader = new FileReader();
        reader.onload = async (e) => {
          const arrayBuffer = e.target.result;
  
          // Set workerSrc for pdfjs
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
  
          
          // Send the text to the API
          const response= await fetch("http://127.0.0.1:5000/transcript", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ transcript: text }),
          });

          if (response.ok){

            const responseData = await response.json();
        // Set the response message in the state
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
        <FullWidthVideoBox> <div style={{ color: 'black', padding: '10px', overflowY: 'scroll', maxHeight: '100%' }}>
            {pdfText}
          </div></FullWidthVideoBox>
      </VideoGrid>
      <Controls>
        <ControlButton bg="#6c757d" hover="#5a6268">
          <FaMicrophoneSlash />
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
      <VoiceToText />
    </AppContainer>
  );
}

export default App;
