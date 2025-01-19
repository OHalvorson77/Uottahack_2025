import React from "react";
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from "react-router-dom";
import Call from "./call.js";
import  Home from './home.js';
import Recordings from "./recordings.js";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/call" element={<Call />} />
        <Route path="/recordings" element={<Recordings />} />
      </Routes>
    </Router>
  );
}

export default App;





