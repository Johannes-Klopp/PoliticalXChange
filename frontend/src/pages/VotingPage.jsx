import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCandidates, verifyVotingToken, submitVote } from '../services/api';

export default function VotingPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [candidates, setCandidates] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    verifyAndLoadCandidates();
  }, [token]);

  const verifyAndLoadCandidates = async () => {
    try {
      const tokenResponse = await verifyVotingToken(token);

      if (!tokenResponse.data.valid) {
        setError(tokenResponse.data.reason || 'Ungültiger Token');
        setLoading(false);
        return;
      }

      setTokenValid(true);
      const candidatesResponse = await getCandidates();
      setCandidates(candidatesResponse.data.candidates);
    } catch (err) {
      setError('Fehler beim Laden der Wahl');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedCandidate) {
      setError('Bitte wählen Sie einen Kandidaten');
      return;
    }

    if (!window.confirm('Möchten Sie Ihre Stimme wirklich abgeben? Dies kann nicht rückgängig gemacht werden.')) {
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await submitVote(token, selectedCandidate);
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Fehler beim Absenden der Stimme');
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
          <p className="text-gray-700 text-lg mb-8 leading-relaxed">
            Ihre Stimme wurde erfolgreich abgegeben.
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

  if (!tokenValid) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-gray-100 flex items-center justify-center p-4">
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl p-10 max-w-md w-full border border-gray-100">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-red-500 to-red-700 rounded-full mb-6 shadow-lg mx-auto">
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 mb-4 text-center">Ungültiger Token</h1>
          <p className="text-gray-700 mb-8 text-center leading-relaxed">{error}</p>
          <div className="text-center">
            <button
              onClick={() => navigate('/')}
              className="group inline-flex items-center gap-2 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-semibold py-3.5 px-8 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
              </svg>
              <span>Zur Startseite</span>
            </button>
          </div>
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
            Ihre Stimme abgeben
          </h1>
          <p className="text-primary-100 text-lg font-light">
            Bitte wählen Sie einen Kandidaten aus
          </p>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white to-transparent opacity-30"></div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12 max-w-4xl">
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
                  selectedCandidate === candidate.id
                    ? 'border-primary-500 bg-primary-50/50 shadow-xl scale-[1.02]'
                    : 'border-gray-100 hover:border-primary-200 hover:shadow-xl hover:-translate-y-1'
                }`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-start gap-4">
                  <input
                    type="radio"
                    name="candidate"
                    value={candidate.id}
                    checked={selectedCandidate === candidate.id}
                    onChange={() => setSelectedCandidate(candidate.id)}
                    className="mt-1.5 w-6 h-6 text-primary-600 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 cursor-pointer"
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
                </div>
              </label>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="group inline-flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-gray-700 font-semibold py-3.5 px-8 rounded-xl border-2 border-gray-300 hover:border-gray-400 transition-all duration-300 shadow-md hover:shadow-lg"
            >
              <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
              </svg>
              <span>Abbrechen</span>
            </button>
            <button
              type="submit"
              disabled={!selectedCandidate || submitting}
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
                  <span>Stimme abgeben</span>
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                  </svg>
                </>
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
