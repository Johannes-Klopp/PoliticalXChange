import { useState, useEffect } from 'react';
import { getPublicResults } from '../services/api';

export default function ResultsPage() {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const response = await getPublicResults();
        setResults(response.data);
      } catch (err) {
        setError('Fehler beim Laden der Ergebnisse');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-100 via-gray-50 to-gray-100 flex items-center justify-center px-4">
        <div className="max-w-lg w-full text-center">
          <div className="bg-white rounded-2xl shadow-2xl p-10 border border-gray-200">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">{error}</h1>
          </div>
        </div>
      </div>
    );
  }

  const getMedal = (index) => {
    if (index === 0) return { emoji: '🥇', bg: 'bg-yellow-100', border: 'border-yellow-400', text: 'text-yellow-700' };
    if (index === 1) return { emoji: '🥈', bg: 'bg-gray-100', border: 'border-gray-400', text: 'text-gray-700' };
    if (index === 2) return { emoji: '🥉', bg: 'bg-orange-100', border: 'border-orange-400', text: 'text-orange-700' };
    return { emoji: `${index + 1}`, bg: 'bg-emerald-50', border: 'border-emerald-300', text: 'text-emerald-700' };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-100 rounded-full mb-6">
            <span className="text-4xl">🎉</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Wahlergebnisse 2025</h1>
          <p className="text-xl text-gray-600">Landesheimrat-Wahl Hessen</p>
          <div className="mt-6 flex justify-center gap-8 text-sm text-gray-500">
            <div>
              <span className="font-semibold text-emerald-600 text-2xl">{results?.statistics?.totalVotes || 0}</span>
              <p>Stimmen insgesamt</p>
            </div>
            <div>
              <span className="font-semibold text-emerald-600 text-2xl">{results?.statistics?.totalVoters || 0}</span>
              <p>Wohngruppen</p>
            </div>
          </div>
        </div>

        {/* Winners Grid */}
        <div className="grid gap-4">
          {results?.winners?.map((winner, index) => {
            const medal = getMedal(index);
            return (
              <div
                key={winner.id}
                className={`${medal.bg} border-2 ${medal.border} rounded-xl p-6 flex items-center gap-6 transition-transform hover:scale-[1.02]`}
              >
                {/* Rank */}
                <div className={`flex-shrink-0 w-16 h-16 rounded-full bg-white flex items-center justify-center text-3xl font-bold ${medal.text} shadow-lg`}>
                  {medal.emoji}
                </div>

                {/* Info */}
                <div className="flex-grow">
                  <h2 className="text-xl font-bold text-gray-900">{winner.name}</h2>
                  {winner.age && (
                    <p className="text-gray-600">{winner.age} Jahre</p>
                  )}
                  {winner.youth_care_experience && (
                    <p className="text-sm text-gray-500 mt-1">
                      <span className="font-medium">Jugendhilfeerfahrung:</span> {winner.youth_care_experience}
                    </p>
                  )}
                </div>

                {/* Vote Count */}
                <div className="flex-shrink-0 text-right">
                  <div className={`text-3xl font-bold ${medal.text}`}>{winner.vote_count}</div>
                  <div className="text-sm text-gray-500">Stimmen</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-sm text-gray-400">
          <p>Political XChange i.G. | Landesheimrat Hessen</p>
        </div>
      </div>
    </div>
  );
}
