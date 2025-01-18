import React from "react";
import styled from "styled-components";
import { FaMicrophoneSlash, FaPhoneSlash } from "react-icons/fa"; // Icons for mute and hang up
import { FaUserCircle } from "react-icons/fa"; // Icon for the profile

// Styled Components
const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: black; /* Black page background */
  position: relative; /* Needed for positioning child elements */
`;

const VideoGrid = styled.div`
  display: grid;
  grid-template-rows: auto;
  gap: 10px;
  padding: 10px;
  flex: 1;
`;

const FullWidthVideoBox = styled.div`
  background: white; /* White video box */
  color: black; /* Text color for contrast */
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%; /* Adjust as needed */
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

  &:hover {
    background: ${(props) => props.hover || "#0056b3"};
  }
`;

const ProfileBox = styled.div`
  position: absolute;
  bottom: 60px; /* Positioned above the controls */
  right: 20px;
  background: gray;
  color: black;
  width: 100px;
  height: 100px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 8px; /* Square with slightly rounded corners */
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
`;

function App() {
  return (
    <AppContainer>
      <VideoGrid>
        {/* Full-width video box */}
        <FullWidthVideoBox></FullWidthVideoBox>
      </VideoGrid>
      <Controls>
        {/* Replaced "Mute" with microphone mute icon */}
        <ControlButton bg="#6c757d" hover="#5a6268">
          <FaMicrophoneSlash />
        </ControlButton>
        {/* Placeholder for "Video" */}
      
        {/* Replaced "Leave" with phone hang-up icon */}
        <ControlButton bg="#dc3545" hover="#c82333">
          <FaPhoneSlash />
        </ControlButton>
      </Controls>
      {/* Profile icon in the bottom right above the controls */}
      <ProfileBox>
        <FaUserCircle size={60} />
      </ProfileBox>
    </AppContainer>
  );
}

export default App;
