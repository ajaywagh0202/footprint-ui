import './App.css'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import LoginScreen from './screen/LoginScreen'
import DashboardScreen from './screen/DashboardScreen'
import ChatBotScreen from './screen/ChatBotScreen'
import MasterTableScreen from './screen/MasterTableScreen'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginScreen />} />
        <Route path="/dashboard" element={<DashboardScreen />} />
        <Route path="/chatbot" element={<ChatBotScreen />} />
        <Route path='/master' element={<MasterTableScreen />} />
      </Routes>
    </BrowserRouter>
  )
}
export default App
