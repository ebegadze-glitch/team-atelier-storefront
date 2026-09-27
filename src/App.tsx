import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from 'react-router-dom'
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage'
import HomePage from './pages/HomePage' 
import ProtectedRoute from './routes/ProtectedRoute' 
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
       <Route element={<ProtectedRoute />}>
  <Route path="/home" element={<HomePage />} />
</Route> 
        <Route
          path="/forgot-password"
          element={<ForgotPasswordPage />}
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App