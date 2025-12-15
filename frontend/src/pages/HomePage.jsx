import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getCandidates } from '../services/api';

export default function HomePage() {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadCandidates();
  }, []);

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


  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100" role="status" aria-live="polite">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary-600 mx-auto mb-4"></div>
          <p className="text-xl text-gray-700 font-medium">Laden...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary-50/30">
      {/* Header - Clean Floating Design */}
      <header className="container mx-auto px-4 pt-12 pb-12 max-w-7xl">
        <div className="bg-gradient-to-br from-primary-600 to-primary-700 rounded-2xl shadow-xl p-12 md:p-16">
          <h1 className="text-5xl md:text-6xl font-bold text-center mb-3 tracking-tight text-white">
            Landesheimrat-Wahl
          </h1>
          <p className="text-center text-lg md:text-xl text-primary-100 font-light">
            Wahl des Landesheimrats Hessen 2025
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-16 max-w-7xl">
        {/* Info Section */}
        <section className="bg-white rounded-2xl shadow-lg p-8 mb-12 border border-gray-100 hover:shadow-xl transition-shadow duration-300" aria-labelledby="info-heading">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <div className="flex-1">
              <h2 id="info-heading" className="text-2xl font-bold mb-4 text-gray-900">
                Informationen zur Wahl
              </h2>
              <p className="text-gray-600 mb-4 leading-relaxed">
                Willkommen zur Wahl des Landesheimrats. Jede Wohngruppe kann mit 8 Stimmen abstimmen.
                Die Wahl erfolgt über die E-Mail-Adresse, mit der Sie sich für den Newsletter angemeldet haben.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 items-start">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-50 text-primary-700 rounded-lg font-medium">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                  </svg>
                  <span>17. Dezember – 31. Dezember 2025 | Ergebnisse: 08. Januar 2026</span>
                </div>
                <Link
                  to="/email-voting"
                  className="group inline-flex items-center gap-2 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-semibold py-2.5 px-6 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path>
                  </svg>
                  <span>Jetzt abstimmen</span>
                  <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Candidates Section */}
        <section aria-labelledby="candidates-heading">
          <h2 id="candidates-heading" className="text-3xl font-bold mb-8 text-gray-900">
            Kandidaten
          </h2>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-800 px-6 py-4 rounded-lg mb-8 shadow-md" role="alert">
              <div className="flex items-center gap-3">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"></path>
                </svg>
                {error}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {candidates.map((candidate, index) => (
              <article
                key={candidate.id}
                className="group bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-primary-300 hover:-translate-y-0.5"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="p-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">
                    {candidate.name}
                  </h3>

                  <div className="space-y-2 mb-5">
                    {candidate.age && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <svg className="w-4 h-4 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                        </svg>
                        <span className="text-sm">{candidate.age} Jahre</span>
                      </div>
                    )}
                    <div className="flex items-start gap-2 text-gray-700">
                      <svg className="w-4 h-4 text-primary-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                      </svg>
                      <span className="text-sm font-medium">{candidate.facility_name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <svg className="w-4 h-4 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                      </svg>
                      <span className="text-sm">{candidate.facility_location}</span>
                    </div>
                  </div>

                  {candidate.biography && (
                    <p className="text-gray-600 text-sm line-clamp-3 mb-5 leading-relaxed">
                      {candidate.biography}
                    </p>
                  )}

                  <Link
                    to={`/candidate/${candidate.id}`}
                    className="group/btn inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2.5 px-5 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                    aria-label={`Mehr über ${candidate.name} erfahren`}
                  >
                    <span>Mehr erfahren</span>
                    <svg className="w-4 h-4 group-hover/btn:translate-x-0.5 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                    </svg>
                  </Link>
                </div>
              </article>
            ))}
          </div>

          {candidates.length === 0 && !error && (
            <div className="text-center py-16">
              <svg className="w-20 h-20 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
              </svg>
              <p className="text-xl text-gray-500 font-medium">Derzeit sind keine Kandidaten verfügbar.</p>
            </div>
          )}
        </section>


{/* Admin-Link entfernt - Zugang über /admin/login */}
      </main>
    </div>
  );
}
