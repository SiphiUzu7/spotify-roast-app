import { Routes, Route, Link } from 'react-router-dom';
import { useState } from 'react'
import './App.css'
import './index.css'
import Landing from './pages/Landing.jsx'
import Fetch from './pages/Fetch.jsx'
import Roast from './pages/Roast.jsx'

function App() {

  return (
    <>
      <Routes>
        <Route path="/" element={<Landing/>} />
        <Route path="/fetching" element={<Fetch/>} />
        <Route path="/roasted" element={<Roast/>} />
      </Routes>
    </>
  )
}

export default App

