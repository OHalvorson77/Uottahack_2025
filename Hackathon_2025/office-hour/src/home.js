import React from "react";
import styled from "styled-components";
import { FaUserCircle } from "react-icons/fa";

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

const ProfileIcon = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: white;
  color: black;
  border-radius: 20%;
  width: 200px;
  height: 200px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
  cursor: pointer;
  transition: transform 0.2s, background 0.2s;

  &:hover {
    transform: scale(1.1);
    background: #f1f1f1;
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

const Home = () => {
    const navigate = useNavigate();
  const handleProfileClick = (profileName) => {
    navigate(`/call?profileName=${profileName}`);
  };

  const profileImages = {
    "Owen Halvorson": "./OwenHalvorson1.png",  // Replace with actual image paths
    "Niyol Jha": "./NiyolJha.png",      // Replace with actual image paths
    "Brendan Clark": "./brendo.png",             // Replace with actual image paths
    "Madison Holdsworth": "./MH2.png",           // Replace with actual image paths
    "Tanya Gibbler" : "./TanyaGibbler.png",      // Replace with actual image paths
    "Frank Woo": "./FrankWoo.png"                // Replace with actual image paths
  };

  return (
    <HomeContainer>
      <Header>Choose a Tutor!</Header>
      <ProfileGrid>
        {["Owen Halvorson", "Niyol Jha", "Brendan Clark", "Madison Holdsworth", "Tanya Gibbler", "Frank Woo"].map((name) => (
          <ProfileIcon key={name} onClick={() => handleProfileClick(name)}>
            <ProfileImage src={profileImages[name]} alt={name} />
            <p>{name}</p>
          </ProfileIcon>
        ))}
      </ProfileGrid>
      <BottomTabs>
        <Tab>Tutors</Tab>
        <Tab>Recordings</Tab>
      </BottomTabs>
    </HomeContainer>
  );
};

export default Home;