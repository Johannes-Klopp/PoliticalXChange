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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary-50/30">
      {/* Header */}
      <header className="bg-gradient-to-br from-gray-50 via-white to-primary-50/30 py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <button
            onClick={() => navigate('/')}
            className="group inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium transition-colors duration-200 mb-6"
          >
            <svg className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
            </svg>
            Zurück zur Übersicht
          </button>

          <h1 className="text-4xl md:text-5xl font-bold mb-2 text-gray-900">
            {candidate.name}
          </h1>
          {candidate.age && (
            <p className="text-gray-600 text-lg">{candidate.age} Jahre</p>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Facility Card */}
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <div className="flex items-start gap-4">
              {candidate.youth_care_experience && (
              <>
                <div className="flex-shrink-0 w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
                <div className="flex-1">
                  <h2 className="text-sm font-semibold text-gray-500 mb-1">Jugendhilfeerfahrung</h2>
                  <p className="text-lg font-bold text-gray-900">{candidate.youth_care_experience}</p>
                </div>
              </>
            )}
            </div>
          </div>

          {/* Fun Fact Card */}
          {candidate.fun_fact && (
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
                <div className="flex-1">
                  <h2 className="text-sm font-semibold text-gray-500 mb-1">Fun Fact über mich</h2>
                  <p className="text-lg font-bold text-gray-900">{candidate.fun_fact}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Biography Section */}
        {candidate.biography && (
          <article className="bg-white rounded-xl shadow-md p-8 md:p-10 border border-gray-100 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Vorstellung</h2>
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                {candidate.biography}
              </p>
            </div>
          </article>
        )}

        {/* Back Button (Bottom) */}
        <div className="text-center">
          <button
            onClick={() => navigate('/')}
            className="group inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-8 rounded-lg transition-all duration-200"
          >
            <svg className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
            </svg>
            Zurück zur Übersicht
          </button>
        </div>
      </main>
    </div>
  );
}
