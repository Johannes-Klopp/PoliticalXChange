import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCandidates, submitVote } from '../services/api';

export default function VotePage() {
  const navigate = useNavigate();
  const [candidates, setCandidates] = useState([]);
  const [selectedCandidates, setSelectedCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const votingEmail = sessionStorage.getItem('votingEmail');
  const votingGroupName = sessionStorage.getItem('votingGroupName');

  useEffect(() => {
    // Check if user has verified email
    if (!votingEmail) {
      navigate('/email-voting');
      return;
    }

    loadCandidates();
  }, [navigate, votingEmail]);

  const loadCandidates = async () => {
    try {
      const response = await getCandidates();
      setCandidates(response.data.candidates);
    } catch (err) {
      setError('Fehler beim Laden der Kandidaten');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCandidateToggle = (candidateId) => {
    setSelectedCandidates(prev => {
      if (prev.includes(candidateId)) {
        return prev.filter(id => id !== candidateId);
      }

      // Max 8 candidates
      if (prev.length >= 8) {
        setError('Sie können maximal 8 Kandidaten auswählen');
        setTimeout(() => setError(null), 3000);
        return prev;
      }

      return [...prev, candidateId];
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (selectedCandidates.length === 0) {
      setError('Bitte wählen Sie mindestens einen Kandidaten');
      return;
    }

    if (selectedCandidates.length > 8) {
      setError('Sie können maximal 8 Kandidaten wählen');
      return;
    }

    const confirmMessage = selectedCandidates.length === 1
      ? 'Möchten Sie Ihre Stimme wirklich abgeben?'
      : `Möchten Sie Ihre ${selectedCandidates.length} Stimmen wirklich abgeben?`;

    if (!window.confirm(confirmMessage + ' Dies kann nicht rückgängig gemacht werden.')) {
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await submitVote(votingEmail, selectedCandidates);
      setSuccess(true);
      // Clear session storage
      sessionStorage.removeItem('votingEmail');
      sessionStorage.removeItem('votingGroupName');
    } catch (err) {
      setError(err.response?.data?.error || 'Fehler beim Absenden der Stimmen');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-primary-50 via-white to-gray-100" role="status" aria-live="polite">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary-600 mx-auto mb-4"></div>
          <p className="text-xl text-gray-700 font-medium">Laden...</p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-gray-100 flex items-center justify-center p-4">
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl p-10 max-w-md w-full text-center border border-gray-100">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-500 to-green-700 rounded-full mb-6 shadow-lg">
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4">
            Vielen Dank!
          </h1>
          <p className="text-gray-700 text-lg mb-3 leading-relaxed">
            Ihre {selectedCandidates.length} {selectedCandidates.length === 1 ? 'Stimme wurde' : 'Stimmen wurden'} erfolgreich abgegeben.
          </p>
          <p className="text-gray-600 mb-8">
            Wohngruppe: <strong>{votingGroupName}</strong>
          </p>
          <button
            onClick={() => navigate('/')}
            className="group inline-flex items-center gap-2 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-semibold py-3.5 px-8 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            <span>Zur Startseite</span>
            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
            </svg>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-gray-100">
      {/* Header */}
      <header className="relative bg-gradient-to-r from-primary-600 via-primary-700 to-primary-800 text-white py-16 shadow-2xl overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-5"></div>
        <div className="container mx-auto px-4 relative z-10 max-w-4xl text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl mb-4 shadow-lg">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path>
            </svg>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-3 tracking-tight">
            Ihre Stimmen abgeben
          </h1>
          <p className="text-primary-100 text-lg font-light mb-2">
            Wählen Sie bis zu 3 Kandidaten aus
          </p>
          <p className="text-primary-200 text-sm">
            Wohngruppe: <strong>{votingGroupName}</strong>
          </p>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white to-transparent opacity-30"></div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Selection Counter */}
        <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-4 mb-8 border border-gray-100">
          <div className="flex items-center justify-between">
            <span className="text-gray-700 font-medium">Ausgewählte Kandidaten:</span>
            <div className="flex items-center gap-2">
              <span className={`text-2xl font-bold ${selectedCandidates.length === 3 ? 'text-green-600' : 'text-primary-600'}`}>
                {selectedCandidates.length}
              </span>
              <span className="text-gray-600">/ 3</span>
            </div>
          </div>
          {selectedCandidates.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {selectedCandidates.map(candidateId => {
                const candidate = candidates.find(c => c.id === candidateId);
                return candidate ? (
                  <span
                    key={candidateId}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm font-medium"
                  >
                    {candidate.name}
                    <button
                      type="button"
                      onClick={() => handleCandidateToggle(candidateId)}
                      className="ml-1 hover:text-primary-600"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                      </svg>
                    </button>
                  </span>
                ) : null;
              })}
            </div>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-800 px-6 py-4 rounded-xl mb-8 shadow-md" role="alert">
            <div className="flex items-center gap-3">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"></path>
              </svg>
              {error}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="space-y-6 mb-10">
            {candidates.map((candidate, index) => (
              <label
                key={candidate.id}
                className={`group block bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 cursor-pointer transition-all duration-300 border-2 ${
                  selectedCandidates.includes(candidate.id)
                    ? 'border-primary-500 bg-primary-50/50 shadow-xl scale-[1.02]'
                    : 'border-gray-100 hover:border-primary-200 hover:shadow-xl hover:-translate-y-1'
                }`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-start gap-4">
                  <input
                    type="checkbox"
                    name="candidates"
                    value={candidate.id}
                    checked={selectedCandidates.includes(candidate.id)}
                    onChange={() => handleCandidateToggle(candidate.id)}
                    className="mt-1.5 w-6 h-6 text-primary-600 rounded focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 cursor-pointer"
                    aria-labelledby={`candidate-${candidate.id}`}
                  />
                  <div className="flex-1">
                    <h3 id={`candidate-${candidate.id}`} className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-primary-700 transition-colors duration-200">
                      {candidate.name}
                    </h3>
                    <div className="space-y-2 mb-3">
                      {candidate.age && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <svg className="w-4 h-4 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                          </svg>
                          <span className="text-sm font-medium">{candidate.age} Jahre</span>
                        </div>
                      )}
                      <div className="flex items-start gap-2 text-gray-700">
                        <svg className="w-4 h-4 text-primary-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                        </svg>
                        <span className="text-sm font-medium">{candidate.facility_name}, {candidate.facility_location}</span>
                      </div>
                    </div>
                    {candidate.biography && (
                      <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">
                        {candidate.biography}
                      </p>
                    )}
                  </div>
                  {selectedCandidates.includes(candidate.id) && (
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                        </svg>
                      </div>
                    </div>
                  )}
                </div>
              </label>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button
              type="button"
              onClick={() => {
                sessionStorage.removeItem('votingEmail');
                sessionStorage.removeItem('votingGroupName');
                navigate('/email-voting');
              }}
              className="group inline-flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-gray-700 font-semibold py-3.5 px-8 rounded-xl border-2 border-gray-300 hover:border-gray-400 transition-all duration-300 shadow-md hover:shadow-lg"
            >
              <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
              </svg>
              <span>Abbrechen</span>
            </button>
            <button
              type="submit"
              disabled={selectedCandidates.length === 0 || submitting}
              className="group inline-flex items-center justify-center gap-2 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-semibold py-3.5 px-8 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg"
            >
              {submitting ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Wird gesendet...</span>
                </>
              ) : (
                <>
                  <span>
                    {selectedCandidates.length === 1
                      ? 'Stimme abgeben'
                      : `${selectedCandidates.length} Stimmen abgeben`}
                  </span>
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                  </svg>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Information Box */}
        <div className="mt-8 bg-blue-50 border-l-4 border-blue-500 p-6 rounded-xl shadow-md">
          <div className="flex items-start gap-3">
            <svg className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <div className="text-blue-800">
              <h3 className="font-semibold mb-2">Hinweise zur Stimmabgabe</h3>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Sie können 1 bis 3 Kandidaten auswählen</li>
                <li>Klicken Sie auf die Checkboxen, um Kandidaten auszuwählen</li>
                <li>Ihre Auswahl wird oben im Zähler angezeigt</li>
                <li>Nach dem Absenden kann Ihre Wahl nicht mehr geändert werden</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}