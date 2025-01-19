import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";

// Styled Components
const HomeContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: linear-gradient(to right, #28a745, #007bff); /* Green to Blue gradient */
  color: white;
  align-items: center;
  justify-content: space-between;
`;

const Header = styled.div`
  margin-top: 20px;
  font-size: 24px;
  font-weight: bold;
`;

const ProfileGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  padding: 20px;
`;

const VideoBox = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: white;
  color: black;
  border-radius: 20%;
  width: 200px;
  height: 200px;
  padding: 30px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
  cursor: pointer;
  transition: transform 0.2s, background 0.2s;

  &:hover {
    transform: scale(1.1);
    background: #f1f1f1;
  }

  video {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 0%;
  }

  p {
    margin-top: 10px;
    font-size: 14px;
    color: #333;
  }
`;

const BottomTabs = styled.div`
  display: flex;
  justify-content: space-around;
  width: 100%;
  padding: 10px 0;
  background: rgba(0, 0, 0, 0.5);
  position: sticky;
  bottom: 0;
`;

const Tab = styled.div`
  color: white;
  font-size: 18px;
  cursor: pointer;
  padding: 10px 20px;
  border-radius: 5px;
  transition: background 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }
`;

const Recordings = () => {
  const [videos, setVideos] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch video data from the server
    const fetchVideos = async () => {
      try {
        const response = await fetch("http://127.0.0.1:5000/api/videos"); // Replace with actual endpoint
        if (response.ok) {
          const data = await response.json();
          setVideos(data); // Assuming the response contains an array of video objects
        } else {
          console.error("Failed to fetch videos:", response.statusText);
        }
      } catch (error) {
        console.error("Error fetching videos:", error);
      }
    };

    fetchVideos();
  }, []);

  const handleProfileClick = (profileName) => {
    navigate(`/call?profileName=${profileName}`);
  };

  const handleTutorsClick = () => {
    navigate("/"); // Navigate to the recordings page
  };

  return (
    <HomeContainer>
      <Header>Study Past Recordings!</Header>
      <ProfileGrid>
        {videos.map((video) => (
          <VideoBox key={video.id} >
            <video controls>
              <source src={video.video} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
            
          </VideoBox>
        ))}
      </ProfileGrid>
      <BottomTabs>
      <Tab onClick={handleTutorsClick}>Tutors</Tab>
        <Tab>Recordings</Tab>
      </BottomTabs>
    </HomeContainer>
  );
};

export default Recordings;
