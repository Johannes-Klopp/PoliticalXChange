import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import StatisticsDashboard from '../components/StatisticsDashboard';
import {
  getCandidates,
  createCandidate,
  deleteCandidate,
  getResults,
  exportResults,
  bulkUploadCandidates,
  getAuditLogs,
  getNewsletterSubscribers,
  adminAddSubscriber,
  deleteNewsletterSubscriber,
  sendVotingStartEmail,
  sendVotingReminderEmail,
  getCampaignStats,
} from '../services/api';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('statistics');
  const [candidates, setCandidates] = useState([]);
  const [results, setResults] = useState({ results: [], totalVotes: 0 });
  const [auditLogs, setAuditLogs] = useState([]);
  const [newsletterSubscribers, setNewsletterSubscribers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [newCandidate, setNewCandidate] = useState({
    name: '', age: '', youth_care_experience: '', fun_fact: '', biography: '',
  });


  const [newNewsletterSub, setNewNewsletterSub] = useState({
    email: '', groupName: '', facilityName: '', region: '',
  });

  const [bulkCandidates, setBulkCandidates] = useState('');
  const [campaignStats, setCampaignStats] = useState({ totalSubscribers: 0, votedSubscribers: 0, notVotedSubscribers: 0 });
  const [selectedEmail, setSelectedEmail] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      navigate('/admin/login');
      return;
    }
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'candidates') {
        const response = await getCandidates();
        setCandidates(response.data.candidates);
      } else if (activeTab === 'results') {
        const response = await getResults();
        setResults(response.data);
      } else if (activeTab === 'audit') {
        const response = await getAuditLogs(100, 0);
        setAuditLogs(response.data.logs);
      } else if (activeTab === 'newsletter') {
        const response = await getNewsletterSubscribers();
        setNewsletterSubscribers(response.data.subscribers);
      } else if (activeTab === 'email') {
        const [statsRes, subsRes] = await Promise.all([
          getCampaignStats(),
          getNewsletterSubscribers()
        ]);
        setCampaignStats(statsRes.data);
        setNewsletterSubscribers(subsRes.data.subscribers);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Fehler beim Laden');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    navigate('/admin/login');
  };

  const handleAddCandidate = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await createCandidate(newCandidate);
      setSuccess('Kandidat erfolgreich hinzugefügt');
      setNewCandidate({ name: '', age: '', youth_care_experience: '', fun_fact: '', biography: '' });
      loadData();
    } catch (err) {
      setError(err.response?.data?.error || 'Fehler beim Hinzufügen');
    }
  };

  const handleDeleteCandidate = async (id) => {
    if (!window.confirm('Kandidat wirklich löschen?')) return;
    try {
      await deleteCandidate(id);
      setSuccess('Kandidat gelöscht');
      loadData();
    } catch (err) {
      setError(err.response?.data?.error || 'Fehler beim Löschen');
    }
  };


  const handleBulkUpload = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const lines = bulkCandidates.trim().split('\n');
      const candidatesArray = lines.map(line => {
        const [name, age, youth_care_experience, fun_fact, biography] = line.split(',').map(s => s.trim());
        return { name, age: age || null, youth_care_experience, fun_fact, biography: biography || '' };
      });
      await bulkUploadCandidates(candidatesArray);
      setSuccess(`${candidatesArray.length} Kandidaten erfolgreich hochgeladen`);
      setBulkCandidates('');
      loadData();
    } catch (err) {
      setError(err.response?.data?.error || 'Fehler beim Bulk-Upload');
    }
  };

  const handleExportResults = async () => {
    try {
      const response = await exportResults();
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      const today = new Date().toISOString().split('T')[0];
      link.setAttribute('download', `Wahlergebnisse_${today}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      setSuccess('Excel-Datei wurde erfolgreich heruntergeladen');
    } catch (err) {
      setError('Fehler beim Exportieren der Excel-Datei');
    }
  };

  const tabs = [
    { id: 'statistics', label: 'Statistiken', icon: 'M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z' },
    { id: 'candidates', label: 'Kandidaten', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
    { id: 'bulk', label: 'Bulk Upload', icon: 'M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12' },
    { id: 'results', label: 'Ergebnisse', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
    { id: 'email', label: 'E-Mail Kampagne', icon: 'M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76' },
    { id: 'newsletter', label: 'Newsletter', icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
    { id: 'audit', label: 'Audit Log', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-primary-600 via-primary-700 to-primary-800 text-white shadow-2xl">
        <div className="container mx-auto px-6 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight">Admin Dashboard</h1>
              <p className="text-primary-100 text-sm mt-1">Landesheimrat-Wahl Verwaltung</p>
            </div>
            <button
              onClick={handleLogout}
              className="group flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm px-5 py-2.5 rounded-xl transition-all duration-300 border border-white/20"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
              </svg>
              <span className="font-semibold">Abmelden</span>
            </button>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-6">
          <div className="flex gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`group relative flex items-center gap-3 px-6 py-4 font-semibold transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'text-primary-700'
                    : 'text-gray-600 hover:text-primary-600'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={tab.icon}></path>
                </svg>
                <span>{tab.label}</span>
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-500 to-primary-700 rounded-t-full"></div>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="container mx-auto px-6 py-8 max-w-7xl">
        {/* Notifications */}
        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 text-red-800 px-6 py-4 rounded-xl shadow-md animate-fade-in">
            <div className="flex items-center gap-3">
              <svg className="w-6 h-6 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"></path>
              </svg>
              <span className="font-medium">{error}</span>
              <button onClick={() => setError('')} className="ml-auto">
                <svg className="w-5 h-5 hover:text-red-900" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path>
                </svg>
              </button>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-50 border-l-4 border-green-500 text-green-800 px-6 py-4 rounded-xl shadow-md animate-fade-in">
            <div className="flex items-center gap-3">
              <svg className="w-6 h-6 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
              </svg>
              <span className="font-medium">{success}</span>
              <button onClick={() => setSuccess('')} className="ml-auto">
                <svg className="w-5 h-5 hover:text-green-900" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path>
                </svg>
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary-600 mx-auto mb-4"></div>
              <p className="text-gray-600 font-medium">Laden...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Statistics Tab */}
            {activeTab === 'statistics' && (
              <div className="animate-fade-in">
                <StatisticsDashboard />
              </div>
            )}

            {/* Candidates Tab */}
            {activeTab === 'candidates' && (
              <div className="space-y-8">
                <section className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
                  <h2 className="text-2xl font-bold mb-6 text-gray-900 flex items-center gap-3">
                    <div className="w-1 h-8 bg-gradient-to-b from-primary-500 to-primary-700 rounded-full"></div>
                    Neuen Kandidaten hinzufügen
                  </h2>
                  <form onSubmit={handleAddCandidate} className="space-y-5">
                    <div className="grid grid-cols-2 gap-5">
                      <input
                        type="text"
                        placeholder="Name *"
                        value={newCandidate.name}
                        onChange={(e) => setNewCandidate({ ...newCandidate, name: e.target.value })}
                        className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                        required
                      />
                      <input
                        type="number"
                        placeholder="Alter"
                        value={newCandidate.age}
                        onChange={(e) => setNewCandidate({ ...newCandidate, age: e.target.value })}
                        className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                      />
                      <input
                        type="text"
                        placeholder="Jugendhilfeerfahrung"
                        value={newCandidate.youth_care_experience}
                        onChange={(e) => setNewCandidate({ ...newCandidate, youth_care_experience: e.target.value })}
                        className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                      />
                      <input
                        type="text"
                        placeholder="Fun Fact über mich"
                        value={newCandidate.fun_fact}
                        onChange={(e) => setNewCandidate({ ...newCandidate, fun_fact: e.target.value })}
                        className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                      />
                    </div>
                    <textarea
                      placeholder="Biografie (max 2000 Zeichen)"
                      value={newCandidate.biography}
                      onChange={(e) => setNewCandidate({ ...newCandidate, biography: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all resize-none"
                      rows="4"
                      maxLength="2000"
                    />
                    <button
                      type="submit"
                      className="inline-flex items-center gap-2 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-semibold px-8 py-3 rounded-xl transition-all shadow-md hover:shadow-xl"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                      </svg>
                      <span>Kandidat hinzufügen</span>
                    </button>
                  </form>
                </section>

                <section className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                  <div className="px-8 py-6 border-b border-gray-200 bg-gray-50">
                    <h2 className="text-xl font-bold text-gray-900">Alle Kandidaten ({candidates.length})</h2>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Alter</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Jugendhilfeerfahrung</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Fun Fact</th>
                          <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Aktionen</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {candidates.map((candidate) => (
                          <tr key={candidate.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{candidate.name}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-gray-600">{candidate.age || '-'}</td>
                            <td className="px-6 py-4 text-gray-900">{candidate.youth_care_experience || '-'}</td>
                            <td className="px-6 py-4 text-gray-600">{candidate.fun_fact || '-'}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-right">
                              <button
                                onClick={() => handleDeleteCandidate(candidate.id)}
                                className="text-red-600 hover:text-red-800 font-medium transition-colors"
                              >
                                Löschen
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              </div>
            )}


            {/* Results Tab */}
            {activeTab === 'results' && (
              <div className="space-y-8">
                {/* Gewinner-Anzeige */}
                {results.results && results.results.length > 0 && results.results[0].vote_count > 0 && (
                  <div className="bg-gradient-to-br from-yellow-400 via-yellow-500 to-orange-500 rounded-2xl shadow-2xl p-8 text-white">
                    <div className="flex items-center justify-center mb-4">
                      <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </div>
                    <h2 className="text-center text-3xl font-extrabold mb-2">GEWINNER</h2>
                    <div className="text-center">
                      <p className="text-4xl font-bold mb-2">{results.results[0].name}</p>
                      <p className="text-xl opacity-90">{results.results[0].youth_care_experience}</p>
                      <p className="text-lg opacity-80">{results.results[0].fun_fact}</p>
                      <div className="mt-4 inline-flex items-center gap-2 bg-white/20 backdrop-blur px-6 py-3 rounded-full">
                        <span className="text-2xl font-bold">{results.results[0].vote_count}</span>
                        <span className="text-lg">{results.results[0].vote_count === 1 ? 'Stimme' : 'Stimmen'}</span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 flex-1 mr-4">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 font-medium">Gesamtstimmen</p>
                        <p className="text-4xl font-extrabold text-gray-900">{results.totalVotes || 0}</p>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={handleExportResults}
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold px-8 py-4 rounded-xl transition-all shadow-lg hover:shadow-xl"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                    <span>Als Excel exportieren</span>
                  </button>
                </div>

                <section className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                  <div className="px-8 py-6 border-b border-gray-200 bg-gray-50">
                    <h2 className="text-xl font-bold text-gray-900">Vollständige Wahlergebnisse</h2>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Platz</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Jugendhilfeerfahrung</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Fun Fact</th>
                          <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Stimmen</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {results.results && results.results.map((result, index) => (
                          <tr key={result.id} className={`transition-colors ${
                            index === 0 ? 'bg-yellow-50 hover:bg-yellow-100' :
                            index === 1 ? 'bg-gray-50 hover:bg-gray-100' :
                            index === 2 ? 'bg-orange-50 hover:bg-orange-100' :
                            'hover:bg-gray-50'
                          }`}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className={`inline-flex items-center justify-center w-10 h-10 rounded-full font-bold text-sm ${
                                index === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-500 text-white shadow-lg' :
                                index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-400 text-white shadow-md' :
                                index === 2 ? 'bg-gradient-to-br from-orange-400 to-orange-500 text-white shadow-md' :
                                'bg-gray-100 text-gray-600'
                              }`}>
                                {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
                              </div>
                            </td>
                            <td className={`px-6 py-4 whitespace-nowrap font-medium ${
                              index === 0 ? 'text-yellow-900 text-lg' : 'text-gray-900'
                            }`}>{result.name}</td>
                            <td className="px-6 py-4 text-gray-900">{result.youth_care_experience || '-'}</td>
                            <td className="px-6 py-4 text-gray-600">{result.fun_fact || '-'}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-right">
                              <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-bold ${
                                index === 0 ? 'bg-yellow-200 text-yellow-900' :
                                index === 1 ? 'bg-gray-200 text-gray-900' :
                                index === 2 ? 'bg-orange-200 text-orange-900' :
                                'bg-primary-100 text-primary-800'
                              }`}>
                                {result.vote_count}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {(!results.results || results.results.length === 0) && (
                      <div className="text-center py-12 text-gray-500">
                        Noch keine Wahlergebnisse vorhanden
                      </div>
                    )}
                  </div>
                </section>
              </div>
            )}

            {/* Bulk Upload Tab */}
            {activeTab === 'bulk' && (
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-gray-100">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-1 h-8 bg-gradient-to-b from-primary-500 to-primary-700 rounded-full"></div>
                  <h2 className="text-3xl font-extrabold text-gray-900">Bulk Upload Kandidaten</h2>
                </div>
                <form onSubmit={handleBulkUpload} className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Kandidaten (CSV-Format: Name, Alter, Jugendhilfeerfahrung, Fun Fact, Biografie)
                    </label>
                    <textarea
                      value={bulkCandidates}
                      onChange={(e) => setBulkCandidates(e.target.value)}
                      rows="10"
                      placeholder="Max Mustermann, 25, 5 Jahre in der Jugendhilfe, Spielt gerne Gitarre, Biografie...&#10;Anna Schmidt, 23, 3 Jahre Erfahrung, Liebt Wandern, Biografie..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 font-mono text-sm"
                      required
                    />
                    <p className="mt-2 text-sm text-gray-500">
                      Ein Kandidat pro Zeile, Felder getrennt durch Kommas
                    </p>
                  </div>
                  <button
                    type="submit"
                    className="group inline-flex items-center gap-2 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path>
                    </svg>
                    <span>Hochladen</span>
                  </button>
                </form>
              </div>
            )}

            {/* Email Kampagne Tab */}
            {activeTab === 'email' && (
              <div className="space-y-8">
                {/* Statistik-Karten */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-xl p-6 text-white">
                    <p className="text-blue-100 text-sm font-medium">Registrierte Wohngruppen</p>
                    <p className="text-3xl font-bold mt-2">{campaignStats.totalSubscribers}</p>
                  </div>
                  <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-xl p-6 text-white">
                    <p className="text-green-100 text-sm font-medium">Bereits abgestimmt</p>
                    <p className="text-3xl font-bold mt-2">{campaignStats.votedSubscribers}</p>
                  </div>
                  <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-xl p-6 text-white">
                    <p className="text-orange-100 text-sm font-medium">Noch nicht abgestimmt</p>
                    <p className="text-3xl font-bold mt-2">{campaignStats.notVotedSubscribers}</p>
                  </div>
                </div>

                {/* Wahl-Start Email */}
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-gray-100">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-1 h-8 bg-gradient-to-b from-blue-500 to-blue-700 rounded-full"></div>
                    <h2 className="text-2xl font-extrabold text-gray-900">Wahl-Start E-Mail senden</h2>
                  </div>
                  <p className="text-gray-600 mb-6">
                    Informiert alle registrierten Wohngruppen, dass die Wahl begonnen hat und sie jetzt abstimmen können.
                  </p>
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                      <select
                        value={selectedEmail}
                        onChange={(e) => setSelectedEmail(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Alle Wohngruppen ({campaignStats.totalSubscribers})</option>
                        {newsletterSubscribers.filter(s => s.confirmed).map((sub) => (
                          <option key={sub.id} value={sub.email}>
                            {sub.group_name || sub.facility_name} - {sub.email}
                          </option>
                        ))}
                      </select>
                    </div>
                    <button
                      onClick={async () => {
                        if (!window.confirm(selectedEmail
                          ? `Wahl-Start E-Mail an ${selectedEmail} senden?`
                          : `Wahl-Start E-Mail an alle ${campaignStats.totalSubscribers} Wohngruppen senden?`
                        )) return;
                        setSendingEmail(true);
                        setError('');
                        setSuccess('');
                        try {
                          const res = await sendVotingStartEmail(selectedEmail || null);
                          setSuccess(`${res.data.results.sent} E-Mail(s) erfolgreich versendet`);
                          if (res.data.results.failed > 0) {
                            setError(`${res.data.results.failed} E-Mail(s) fehlgeschlagen`);
                          }
                        } catch (err) {
                          setError(err.response?.data?.error || 'Fehler beim Versenden');
                        } finally {
                          setSendingEmail(false);
                        }
                      }}
                      disabled={sendingEmail}
                      className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold px-8 py-3 rounded-lg transition-all disabled:opacity-50"
                    >
                      {sendingEmail ? (
                        <>
                          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span>Wird gesendet...</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
                          </svg>
                          <span>Wahl-Start senden</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Erinnerungs-Email */}
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-gray-100">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-1 h-8 bg-gradient-to-b from-orange-500 to-orange-700 rounded-full"></div>
                    <h2 className="text-2xl font-extrabold text-gray-900">Erinnerungs-E-Mail senden</h2>
                  </div>
                  <p className="text-gray-600 mb-6">
                    Erinnert nur Wohngruppen, die noch <strong>nicht abgestimmt</strong> haben.
                  </p>
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                      <select
                        value={selectedEmail}
                        onChange={(e) => setSelectedEmail(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      >
                        <option value="">Alle die noch nicht gewählt haben ({campaignStats.notVotedSubscribers})</option>
                        {newsletterSubscribers.filter(s => s.confirmed && !s.has_voted).map((sub) => (
                          <option key={sub.id} value={sub.email}>
                            {sub.group_name || sub.facility_name} - {sub.email}
                          </option>
                        ))}
                      </select>
                    </div>
                    <button
                      onClick={async () => {
                        if (!window.confirm(selectedEmail
                          ? `Erinnerung an ${selectedEmail} senden?`
                          : `Erinnerung an alle ${campaignStats.notVotedSubscribers} Wohngruppen senden, die noch nicht abgestimmt haben?`
                        )) return;
                        setSendingEmail(true);
                        setError('');
                        setSuccess('');
                        try {
                          const res = await sendVotingReminderEmail(selectedEmail || null);
                          setSuccess(`${res.data.results.sent} Erinnerungs-E-Mail(s) erfolgreich versendet`);
                          if (res.data.results.failed > 0) {
                            setError(`${res.data.results.failed} E-Mail(s) fehlgeschlagen`);
                          }
                        } catch (err) {
                          setError(err.response?.data?.error || 'Fehler beim Versenden');
                        } finally {
                          setSendingEmail(false);
                        }
                      }}
                      disabled={sendingEmail || campaignStats.notVotedSubscribers === 0}
                      className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold px-8 py-3 rounded-lg transition-all disabled:opacity-50"
                    >
                      {sendingEmail ? (
                        <>
                          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span>Wird gesendet...</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
                          </svg>
                          <span>Erinnerung senden</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Newsletter Tab */}
            {activeTab === 'newsletter' && (
              <div className="space-y-8">
                {/* Neue Wohngruppe registrieren */}
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-gray-100">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-1 h-8 bg-gradient-to-b from-primary-500 to-primary-700 rounded-full"></div>
                    <h2 className="text-3xl font-extrabold text-gray-900">Wohngruppe registrieren</h2>
                  </div>
                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      setLoading(true);
                      setError('');
                      setSuccess('');
                      try {
                        await adminAddSubscriber(newNewsletterSub);
                        setSuccess('Wohngruppe erfolgreich registriert');
                        setNewNewsletterSub({ email: '', groupName: '', facilityName: '', region: '' });
                        const response = await getNewsletterSubscribers();
                        setNewsletterSubscribers(response.data.subscribers);
                      } catch (err) {
                        setError(err.response?.data?.error || 'Fehler beim Registrieren');
                      } finally {
                        setLoading(false);
                      }
                    }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-4"
                  >
                    <input
                      type="text"
                      placeholder="Wohngruppenname"
                      value={newNewsletterSub.groupName}
                      onChange={(e) => setNewNewsletterSub({ ...newNewsletterSub, groupName: e.target.value })}
                      required
                      className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                    <input
                      type="text"
                      placeholder="Einrichtungsname"
                      value={newNewsletterSub.facilityName}
                      onChange={(e) => setNewNewsletterSub({ ...newNewsletterSub, facilityName: e.target.value })}
                      required
                      className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                    <input
                      type="text"
                      placeholder="Region (optional)"
                      value={newNewsletterSub.region}
                      onChange={(e) => setNewNewsletterSub({ ...newNewsletterSub, region: e.target.value })}
                      className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                    <input
                      type="email"
                      placeholder="E-Mail-Adresse"
                      value={newNewsletterSub.email}
                      onChange={(e) => setNewNewsletterSub({ ...newNewsletterSub, email: e.target.value })}
                      required
                      className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                    <button
                      type="submit"
                      disabled={loading}
                      className="md:col-span-2 bg-gradient-to-r from-primary-600 to-primary-700 text-white py-3 px-6 rounded-lg hover:from-primary-700 hover:to-primary-800 transition-all duration-200 disabled:opacity-50"
                    >
                      Wohngruppe registrieren
                    </button>
                  </form>
                </div>

                {/* Registrierte Wohngruppen */}
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-gray-100">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-1 h-8 bg-gradient-to-b from-primary-500 to-primary-700 rounded-full"></div>
                    <h2 className="text-3xl font-extrabold text-gray-900">Registrierte Wohngruppen</h2>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gradient-to-r from-primary-50 to-primary-100 border-b border-primary-200">
                          <th className="px-6 py-4 text-left text-xs font-bold text-primary-900 uppercase tracking-wider">Wohngruppe</th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-primary-900 uppercase tracking-wider">Einrichtung</th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-primary-900 uppercase tracking-wider">Region</th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-primary-900 uppercase tracking-wider">E-Mail</th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-primary-900 uppercase tracking-wider">Angemeldet</th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-primary-900 uppercase tracking-wider">Aktionen</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {newsletterSubscribers.map((sub) => (
                          <tr key={sub.id} className="hover:bg-primary-50/50 transition-colors duration-150">
                            <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{sub.group_name || '-'}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-gray-700">{sub.facility_name || '-'}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-gray-600">{sub.region || '-'}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-gray-700">{sub.email}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                              {new Date(sub.created_at).toLocaleDateString('de-DE')}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <button
                                onClick={async () => {
                                  if (!window.confirm('Newsletter-Anmeldung wirklich löschen?')) return;
                                  try {
                                    await deleteNewsletterSubscriber(sub.id);
                                    setSuccess('Anmeldung erfolgreich gelöscht');
                                    loadData();
                                  } catch (err) {
                                    setError(err.response?.data?.error || 'Fehler beim Löschen');
                                  }
                                }}
                                className="text-red-600 hover:text-red-800 font-medium transition-colors"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                                </svg>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {newsletterSubscribers.length === 0 && (
                      <div className="text-center py-12 text-gray-500">
                        Keine Wohngruppen registriert
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Audit Log Tab */}
            {activeTab === 'audit' && (
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-gray-100">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-1 h-8 bg-gradient-to-b from-primary-500 to-primary-700 rounded-full"></div>
                  <h2 className="text-3xl font-extrabold text-gray-900">Audit Log</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gradient-to-r from-primary-50 to-primary-100 border-b border-primary-200">
                        <th className="px-6 py-4 text-left text-xs font-bold text-primary-900 uppercase tracking-wider">Zeitstempel</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-primary-900 uppercase tracking-wider">Aktion</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-primary-900 uppercase tracking-wider">Typ</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-primary-900 uppercase tracking-wider">Entity-ID</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-primary-900 uppercase tracking-wider">IP-Adresse</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {auditLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-primary-50/50 transition-colors duration-150">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {new Date(log.created_at).toLocaleString('de-DE')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                              log.action === 'INSERT' ? 'bg-green-100 text-green-800' :
                              log.action === 'UPDATE' ? 'bg-blue-100 text-blue-800' :
                              log.action === 'DELETE' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {log.action}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{log.entity_type || '-'}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-600">{log.entity_id || '-'}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-600 font-mono text-xs">{log.ip_address || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {auditLogs.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                      Keine Audit-Logs vorhanden
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
