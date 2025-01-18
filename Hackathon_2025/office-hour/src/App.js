import React from "react";
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from "react-router-dom";
import Call from "./call.js";
import  Home from './home.js';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/call" element={<Call />} />
      </Routes>
    </Router>
  );
}

export default App;





