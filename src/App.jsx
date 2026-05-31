import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { SessionProvider } from './contexts/SessionContext'
import { MuralProvider } from './contexts/MuralContext'
import ProtectedRoute from './components/auth/ProtectedRoute'
import AppShell from './components/layout/AppShell'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import MuralPage from './pages/MuralPage'
import SessionStartPage from './pages/SessionStartPage'
import JourneyPage from './pages/JourneyPage'
import JourneySessionPage from './pages/JourneySessionPage'
import DayPage from './pages/DayPage'
import AssistantPage from './pages/AssistantPage'
import EvolutionPage from './pages/EvolutionPage'
import SettingsPage from './pages/SettingsPage'

export default function App() {
  return (
    <AuthProvider>
      <SessionProvider>
        <MuralProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/cadastro" element={<SignupPage />} />
              <Route path="/recuperar-senha" element={<ForgotPasswordPage />} />

              <Route element={<ProtectedRoute />}>
                <Route element={<AppShell />}>
                  <Route index element={<Navigate to="/mural" replace />} />
                  <Route path="mural" element={<MuralPage />} />
                  <Route path="jornada" element={<JourneyPage />} />
                  <Route path="jornada/iniciar" element={<SessionStartPage />} />
                  <Route path="jornada/sessao/:sessionId" element={<JourneySessionPage />} />
                  <Route path="jornada/sessao/:sessionId/dia/:dayId" element={<DayPage />} />
                  <Route path="assistente" element={<AssistantPage />} />
                  <Route path="evolucao" element={<EvolutionPage />} />
                  <Route path="configuracoes" element={<SettingsPage />} />
                </Route>
              </Route>

              <Route path="*" element={<Navigate to="/mural" replace />} />
            </Routes>
          </BrowserRouter>
        </MuralProvider>
      </SessionProvider>
    </AuthProvider>
  )
}
