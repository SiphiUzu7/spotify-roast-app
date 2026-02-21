import { Routes, Route, Link } from 'react-router-dom';
import './index.css'
import Landing from './pages/Landing.jsx'
import Fetch from './pages/Fetch.jsx'
import Roast from './pages/Roast.jsx'
import Callback from './pages/Callback.jsx'

function App() {

  return (
    <>
      <Routes>
        <Route path="/" element={<Landing/>} />
        <Route path="/callback" element={<Callback/>}/>
        <Route path="/fetch" element={<Fetch/>} />
        <Route path="/roast" element={<Roast/>} />
        <Route path="*" element={<Landing/>} />
      </Routes>
    </>
  )
}

export default App

