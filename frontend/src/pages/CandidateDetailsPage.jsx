import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCandidate } from '../services/api';

export default function CandidateDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCandidate();
  }, [id]);

  const loadCandidate = async () => {
    try {
      const response = await getCandidate(id);
      setCandidate(response.data.candidate);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
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

  if (!candidate) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-primary-50 via-white to-gray-100">
        <div className="text-center">
          <svg className="w-20 h-20 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <p className="text-xl text-gray-500 font-medium">Kandidat nicht gefunden</p>
          <button
            onClick={() => navigate('/')}
            className="mt-6 inline-flex items-center gap-2 text-primary-600 hover:text-primary-800 font-semibold transition-colors duration-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
            </svg>
            Zurück zur Übersicht
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-gray-100">
      {/* Header */}
      <header className="relative bg-gradient-to-r from-primary-600 via-primary-700 to-primary-800 text-white py-12 shadow-2xl overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-5"></div>
        <div className="container mx-auto px-4 relative z-10 max-w-4xl">
          <button
            onClick={() => navigate('/')}
            className="group inline-flex items-center gap-2 text-white/90 hover:text-white font-semibold transition-all duration-200 mb-6 bg-white/10 hover:bg-white/20 backdrop-blur-sm px-4 py-2 rounded-xl"
          >
            <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
            </svg>
            Zurück zur Übersicht
          </button>

          <h1 className="text-4xl md:text-5xl font-extrabold mb-2 tracking-tight">
            {candidate.name}
          </h1>
          {candidate.age && (
            <p className="text-primary-100 text-lg font-light">{candidate.age} Jahre</p>
          )}
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white to-transparent opacity-30"></div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {/* Facility Card */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                </svg>
              </div>
              <div className="flex-1">
                <h2 className="text-sm font-semibold text-gray-500 mb-1">Einrichtung</h2>
                <p className="text-lg font-bold text-gray-900">{candidate.facility_name}</p>
              </div>
            </div>
          </div>

          {/* Location Card */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                </svg>
              </div>
              <div className="flex-1">
                <h2 className="text-sm font-semibold text-gray-500 mb-1">Standort</h2>
                <p className="text-lg font-bold text-gray-900">{candidate.facility_location}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Biography Section */}
        {candidate.biography && (
          <article className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 md:p-10 border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-1 h-8 bg-gradient-to-b from-primary-500 to-primary-700 rounded-full"></div>
              <h2 className="text-3xl font-extrabold text-gray-900">Vorstellung</h2>
            </div>
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-700 whitespace-pre-line leading-relaxed text-lg">
                {candidate.biography}
              </p>
            </div>
          </article>
        )}

        {/* Back Button (Bottom) */}
        <div className="mt-12 text-center">
          <button
            onClick={() => navigate('/')}
            className="group inline-flex items-center gap-2 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-semibold py-3.5 px-8 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
            </svg>
            Zurück zur Übersicht
          </button>
        </div>
      </main>
    </div>
  );
}
