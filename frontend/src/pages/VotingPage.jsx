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
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Laden...</div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
          <div className="text-green-600 text-6xl mb-4">✓</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Vielen Dank!
          </h1>
          <p className="text-gray-700 mb-6">
            Ihre Stimme wurde erfolgreich abgegeben.
          </p>
          <button
            onClick={() => navigate('/')}
            className="bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2 px-6 rounded"
          >
            Zur Startseite
          </button>
        </div>
      </div>
    );
  }

  if (!tokenValid) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-red-50 to-white flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Ungültiger Token</h1>
          <p className="text-gray-700 mb-6">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-6 rounded"
          >
            Zur Startseite
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Ihre Stimme abgeben
          </h1>
          <p className="text-gray-600">
            Bitte wählen Sie einen Kandidaten aus
          </p>
        </header>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 mb-8">
            {candidates.map((candidate) => (
              <label
                key={candidate.id}
                className={`block bg-white rounded-lg shadow-md p-6 cursor-pointer transition-all duration-200 ${
                  selectedCandidate === candidate.id
                    ? 'ring-4 ring-primary-500 bg-blue-50'
                    : 'hover:shadow-lg'
                }`}
              >
                <div className="flex items-start">
                  <input
                    type="radio"
                    name="candidate"
                    value={candidate.id}
                    checked={selectedCandidate === candidate.id}
                    onChange={() => setSelectedCandidate(candidate.id)}
                    className="mt-1 w-5 h-5 text-primary-600 focus:ring-primary-500"
                    aria-labelledby={`candidate-${candidate.id}`}
                  />
                  <div className="ml-4 flex-1">
                    <h3 id={`candidate-${candidate.id}`} className="text-xl font-bold text-gray-900">
                      {candidate.name}
                    </h3>
                    {candidate.age && (
                      <p className="text-gray-600">Alter: {candidate.age}</p>
                    )}
                    <p className="text-gray-700 mt-1">
                      {candidate.facility_name}, {candidate.facility_location}
                    </p>
                    {candidate.biography && (
                      <p className="text-gray-600 mt-3">{candidate.biography}</p>
                    )}
                  </div>
                </div>
              </label>
            ))}
          </div>

          <div className="flex justify-center gap-4">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 px-8 rounded-lg"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              disabled={!selectedCandidate || submitting}
              className="bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-8 rounded-lg disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {submitting ? 'Wird gesendet...' : 'Stimme abgeben'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
