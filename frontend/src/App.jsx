import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import VotingPage from './pages/VotingPage';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import CandidateDetailsPage from './pages/CandidateDetailsPage';
import NewsletterSubscription from './pages/NewsletterSubscription';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/vote/:token" element={<VotingPage />} />
          <Route path="/candidate/:id" element={<CandidateDetailsPage />} />
          <Route path="/newsletter" element={<NewsletterSubscription />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
