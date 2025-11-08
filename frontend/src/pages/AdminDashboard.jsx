import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getCandidates,
  createCandidate,
  deleteCandidate,
  getResults,
  exportResults,
  getFacilities,
  addFacility,
  bulkUploadCandidates,
  getAuditLogs,
  getNewsletterSubscribers,
} from '../services/api';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('candidates');
  const [candidates, setCandidates] = useState([]);
  const [facilities, setFacilities] = useState([]);
  const [results, setResults] = useState({ results: [], totalVotes: 0 });
  const [auditLogs, setAuditLogs] = useState([]);
  const [newsletterSubscribers, setNewsletterSubscribers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [newCandidate, setNewCandidate] = useState({
    name: '', age: '', facility_name: '', facility_location: '', biography: '',
  });

  const [newFacility, setNewFacility] = useState({
    name: '', email: '', location: '',
  });

  const [bulkCandidates, setBulkCandidates] = useState('');

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
      } else if (activeTab === 'facilities') {
        const response = await getFacilities();
        setFacilities(response.data.facilities);
      } else if (activeTab === 'results') {
        const response = await getResults();
        setResults(response.data);
      } else if (activeTab === 'audit') {
        const response = await getAuditLogs(100, 0);
        setAuditLogs(response.data.logs);
      } else if (activeTab === 'newsletter') {
        const response = await getNewsletterSubscribers();
        setNewsletterSubscribers(response.data.subscribers);
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
      setNewCandidate({ name: '', age: '', facility_name: '', facility_location: '', biography: '' });
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

  const handleAddFacility = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await addFacility(newFacility);
      setSuccess('Einrichtung hinzugefügt und Token versendet');
      setNewFacility({ name: '', email: '', location: '' });
      loadData();
    } catch (err) {
      setError(err.response?.data?.error || 'Fehler beim Hinzufügen');
    }
  };

  const handleBulkUpload = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const lines = bulkCandidates.trim().split('\n');
      const candidatesArray = lines.map(line => {
        const [name, age, facility_name, facility_location, biography] = line.split(',').map(s => s.trim());
        return { name, age: age || null, facility_name, facility_location, biography: biography || '' };
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
      link.setAttribute('download', 'wahlergebnisse.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setError('Fehler beim Exportieren');
    }
  };

  const tabs = [
    { id: 'candidates', label: 'Kandidaten', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
    { id: 'bulk', label: 'Bulk Upload', icon: 'M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12' },
    { id: 'facilities', label: 'Einrichtungen', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
    { id: 'results', label: 'Ergebnisse', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
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
                        placeholder="Einrichtung *"
                        value={newCandidate.facility_name}
                        onChange={(e) => setNewCandidate({ ...newCandidate, facility_name: e.target.value })}
                        className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                        required
                      />
                      <input
                        type="text"
                        placeholder="Standort *"
                        value={newCandidate.facility_location}
                        onChange={(e) => setNewCandidate({ ...newCandidate, facility_location: e.target.value })}
                        className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                        required
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
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Einrichtung</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Standort</th>
                          <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Aktionen</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {candidates.map((candidate) => (
                          <tr key={candidate.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{candidate.name}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-gray-600">{candidate.age || '-'}</td>
                            <td className="px-6 py-4 text-gray-900">{candidate.facility_name}</td>
                            <td className="px-6 py-4 text-gray-600">{candidate.facility_location}</td>
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

            {/* Facilities Tab */}
            {activeTab === 'facilities' && (
              <div className="space-y-8">
                <section className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
                  <h2 className="text-2xl font-bold mb-6 text-gray-900 flex items-center gap-3">
                    <div className="w-1 h-8 bg-gradient-to-b from-primary-500 to-primary-700 rounded-full"></div>
                    Neue Einrichtung hinzufügen
                  </h2>
                  <form onSubmit={handleAddFacility} className="space-y-5">
                    <div className="grid grid-cols-3 gap-5">
                      <input
                        type="text"
                        placeholder="Name *"
                        value={newFacility.name}
                        onChange={(e) => setNewFacility({ ...newFacility, name: e.target.value })}
                        className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                        required
                      />
                      <input
                        type="email"
                        placeholder="E-Mail *"
                        value={newFacility.email}
                        onChange={(e) => setNewFacility({ ...newFacility, email: e.target.value })}
                        className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                        required
                      />
                      <input
                        type="text"
                        placeholder="Standort *"
                        value={newFacility.location}
                        onChange={(e) => setNewFacility({ ...newFacility, location: e.target.value })}
                        className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      className="inline-flex items-center gap-2 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-semibold px-8 py-3 rounded-xl transition-all shadow-md hover:shadow-xl"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                      </svg>
                      <span>Einrichtung hinzufügen & Token senden</span>
                    </button>
                  </form>
                </section>

                <section className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                  <div className="px-8 py-6 border-b border-gray-200 bg-gray-50">
                    <h2 className="text-xl font-bold text-gray-900">Alle Einrichtungen ({facilities.length})</h2>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">E-Mail</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Standort</th>
                          <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Token gesendet</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {facilities.map((facility) => (
                          <tr key={facility.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{facility.name}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-gray-600">{facility.email}</td>
                            <td className="px-6 py-4 text-gray-600">{facility.location}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              {facility.token_sent ? (
                                <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                                  </svg>
                                  Ja
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm font-medium">
                                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"></path>
                                  </svg>
                                  Nein
                                </span>
                              )}
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
                        <p className="text-4xl font-extrabold text-gray-900">{results.totalVotes}</p>
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
                    <span>Als CSV exportieren</span>
                  </button>
                </div>

                <section className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                  <div className="px-8 py-6 border-b border-gray-200 bg-gray-50">
                    <h2 className="text-xl font-bold text-gray-900">Wahlergebnisse</h2>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Rang</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Einrichtung</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Standort</th>
                          <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Stimmen</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {results.results.map((result, index) => (
                          <tr key={result.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold ${
                                index === 0 ? 'bg-yellow-100 text-yellow-800' :
                                index === 1 ? 'bg-gray-100 text-gray-800' :
                                index === 2 ? 'bg-orange-100 text-orange-800' :
                                'bg-gray-50 text-gray-600'
                              }`}>
                                {index + 1}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{result.name}</td>
                            <td className="px-6 py-4 text-gray-900">{result.facility_name}</td>
                            <td className="px-6 py-4 text-gray-600">{result.facility_location}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-right">
                              <span className="inline-flex items-center px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm font-bold">
                                {result.vote_count}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
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
                      Kandidaten (CSV-Format: Name, Alter, Einrichtung, Standort, Biografie)
                    </label>
                    <textarea
                      value={bulkCandidates}
                      onChange={(e) => setBulkCandidates(e.target.value)}
                      rows="10"
                      placeholder="Max Mustermann, 25, Kinder- und Jugendheim Frankfurt, Frankfurt, Biografie...&#10;Anna Schmidt, 23, Jugendhilfe Kassel, Kassel, Biografie..."
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

            {/* Newsletter Tab */}
            {activeTab === 'newsletter' && (
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-gray-100">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-1 h-8 bg-gradient-to-b from-primary-500 to-primary-700 rounded-full"></div>
                  <h2 className="text-3xl font-extrabold text-gray-900">Newsletter-Abonnenten</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gradient-to-r from-primary-50 to-primary-100 border-b border-primary-200">
                        <th className="px-6 py-4 text-left text-xs font-bold text-primary-900 uppercase tracking-wider">E-Mail</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-primary-900 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-primary-900 uppercase tracking-wider">Angemeldet am</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {newsletterSubscribers.map((sub) => (
                        <tr key={sub.id} className="hover:bg-primary-50/50 transition-colors duration-150">
                          <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{sub.email}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {sub.confirmed ? (
                              <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                                </svg>
                                Bestätigt
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"></path>
                                </svg>
                                Ausstehend
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                            {new Date(sub.created_at).toLocaleDateString('de-DE')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {newsletterSubscribers.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                      Keine Abonnenten vorhanden
                    </div>
                  )}
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
