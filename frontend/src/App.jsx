import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import VotingPage from './pages/VotingPage';
import EmailVotingPage from './pages/EmailVotingPage';
import VotePage from './pages/VotePage';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import CandidateDetailsPage from './pages/CandidateDetailsPage';
import NewsletterSubscription from './pages/NewsletterSubscription';
import ElectionGuard from './components/ElectionGuard';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          {/* Öffentliche Seiten - bei geschlossener Wahl gesperrt */}
          <Route path="/" element={<ElectionGuard><HomePage /></ElectionGuard>} />
          <Route path="/vote/:token" element={<ElectionGuard><VotingPage /></ElectionGuard>} />
          <Route path="/email-voting" element={<ElectionGuard><EmailVotingPage /></ElectionGuard>} />
          <Route path="/vote" element={<ElectionGuard><VotePage /></ElectionGuard>} />
          <Route path="/candidate/:id" element={<ElectionGuard><CandidateDetailsPage /></ElectionGuard>} />
          <Route path="/newsletter" element={<ElectionGuard><NewsletterSubscription /></ElectionGuard>} />

          {/* Admin-Seiten - immer zugänglich */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
