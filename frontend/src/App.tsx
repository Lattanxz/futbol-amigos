import { Navigate, Route, Routes } from "react-router-dom"
import { AuthProvider } from "./auth/AuthContext"
import { ProtectedRoute } from "./auth/ProtectedRoute"
import { AppLayout } from "./components/layout/AppLayout"
import { HomePage } from "./pages/HomePage"
import { LoginPage } from "./pages/LoginPage"
import { MatchDetailPage } from "./pages/MatchDetailPage"
import { MatchHistoryPage } from "./pages/MatchHistoryPage"
import { MatchWizardPage } from "./pages/MatchWizard/MatchWizardPage"
import { PlayerProfilePage } from "./pages/PlayerProfilePage"
import { PlayersListPage } from "./pages/PlayersListPage"
import { RankingPage } from "./pages/RankingPage"

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/jugadores" element={<PlayersListPage />} />
            <Route path="/jugadores/:id" element={<PlayerProfilePage />} />
            <Route path="/partidos" element={<MatchHistoryPage />} />
            <Route path="/partidos/nuevo" element={<MatchWizardPage />} />
            <Route path="/partidos/:id/editar" element={<MatchWizardPage />} />
            <Route path="/partidos/:id" element={<MatchDetailPage />} />
            <Route path="/ranking" element={<RankingPage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  )
}

export default App
