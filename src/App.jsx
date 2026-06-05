import './App.css'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import LoginScreen from './screen/LoginScreen'
import DashboardScreen from './screen/DashboardScreen'
import ChatBotScreen from './screen/ChatBotScreen'
import MasterTableScreen from './screen/MasterTableScreen'
import StationTableScreen from './screen/StationTableScreen'
import TransactionTableScreen from './screen/TransacrionTableScreen'
import ShowDictionaryScreen from './components/dictionaries/ShowDictionaryScreen'
import CreateDictionaryScreen from './components/dictionaries/CreateDictionaryScreen'

const getStoredUserCode = () => {
  const directCode = (
    localStorage.getItem('userCode') ||
    localStorage.getItem('user_code') ||
    localStorage.getItem('code') ||
    localStorage.getItem('employee_code') ||
    localStorage.getItem('employeeId')
  )

  if (directCode) {
    return directCode
  }

  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    return (
      user.userCode ||
      user.user_code ||
      user.code ||
      user.employee_code ||
      user.employeeId ||
      user.employee_id ||
      ''
    )
  } catch {
    return ''
  }
}

const isAuthenticated = () => Boolean(localStorage.getItem('authToken') && getStoredUserCode())

function ProtectedRoute({ children }) {
  return isAuthenticated() ? children : <Navigate to="/login" replace />
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginScreen />} />
        <Route path="/dashboard" element={<ProtectedRoute><DashboardScreen /></ProtectedRoute>} />
        <Route path="/chatbot" element={<ProtectedRoute><ChatBotScreen /></ProtectedRoute>} />
        <Route path='/master' element={<ProtectedRoute><MasterTableScreen /></ProtectedRoute>} />
        <Route path='/station' element={<ProtectedRoute><StationTableScreen /></ProtectedRoute>} />
        <Route path='/transaction' element={<ProtectedRoute><TransactionTableScreen /></ProtectedRoute>} />
        <Route path="/dictionary" element={<ProtectedRoute><ShowDictionaryScreen /></ProtectedRoute>} />
        <Route path="/create-dictionary" element={<ProtectedRoute><CreateDictionaryScreen /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  )
}
export default App
