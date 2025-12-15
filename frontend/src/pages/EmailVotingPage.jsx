import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { verifyEmail } from '../services/api';

export default function EmailVotingPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [verified, setVerified] = useState(false);
  const [groupInfo, setGroupInfo] = useState(null);

  const handleEmailVerification = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await verifyEmail(email);

      if (response.data.valid) {
        setVerified(true);
        setGroupInfo({
          groupName: response.data.groupName,
          facilityName: response.data.facilityName
        });

        // Store email in session storage for voting
        sessionStorage.setItem('votingEmail', email);
        sessionStorage.setItem('votingGroupName', response.data.groupName);

        // Redirect to voting page after 2 seconds
        setTimeout(() => {
          navigate('/vote');
        }, 2000);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Fehler bei der Verifizierung');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-gray-100">
      {/* Header */}
      <header className="relative bg-gradient-to-r from-primary-600 via-primary-700 to-primary-800 text-white py-16 shadow-2xl overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-5"></div>
        <div className="container mx-auto px-4 relative z-10 max-w-4xl text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl mb-4 shadow-lg">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
            </svg>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-3 tracking-tight">
            Wahlteilnahme
          </h1>
          <p className="text-primary-100 text-lg font-light">
            Verifizieren Sie Ihre E-Mail-Adresse zur Wahlteilnahme
          </p>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white to-transparent opacity-30"></div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12 max-w-2xl">
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-gray-100">

          {!verified ? (
            <>
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-3">
                  E-Mail-Verifizierung
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  Bitte geben Sie die E-Mail-Adresse ein, mit der sich Ihre Wohngruppe für den Newsletter angemeldet hat.
                  Jede Wohngruppe kann einmal mit 8 Stimmen wählen.
                </p>
              </div>

              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 text-red-800 px-6 py-4 rounded-xl mb-6 shadow-md" role="alert">
                  <div className="flex items-center gap-3">
                    <svg className="w-6 h-6 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"></path>
                    </svg>
                    <span>{error}</span>
                  </div>
                </div>
              )}

              <form onSubmit={handleEmailVerification} className="space-y-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                    E-Mail-Adresse
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="ihre.wohngruppe@beispiel.de"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 text-gray-900 placeholder-gray-400"
                    disabled={loading}
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    type="button"
                    onClick={() => navigate('/')}
                    className="group inline-flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-gray-700 font-semibold py-3.5 px-8 rounded-xl border-2 border-gray-300 hover:border-gray-400 transition-all duration-300 shadow-md hover:shadow-lg"
                  >
                    <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                    </svg>
                    <span>Zurück</span>
                  </button>

                  <button
                    type="submit"
                    disabled={loading || !email}
                    className="flex-1 group inline-flex items-center justify-center gap-2 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-semibold py-3.5 px-8 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Wird überprüft...</span>
                      </>
                    ) : (
                      <>
                        <span>Verifizieren</span>
                        <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                        </svg>
                      </>
                    )}
                  </button>
                </div>
              </form>

            </>
          ) : (
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-500 to-green-700 rounded-full mb-6 shadow-lg">
                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <h2 className="text-3xl font-extrabold text-gray-900 mb-4">
                Verifizierung erfolgreich!
              </h2>
              <p className="text-gray-700 text-lg mb-2">
                Wohngruppe: <strong>{groupInfo?.groupName}</strong>
              </p>
              <p className="text-gray-600 mb-6">
                {groupInfo?.facilityName}
              </p>
              <p className="text-gray-600">
                Sie werden zur Wahlseite weitergeleitet...
              </p>
              <div className="mt-4">
                <svg className="animate-spin h-8 w-8 text-primary-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
            </div>
          )}
        </div>

        {/* Information Box */}
        <div className="mt-8 bg-blue-50 border-l-4 border-blue-500 p-6 rounded-xl shadow-md">
          <div className="flex items-start gap-3">
            <svg className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <div className="text-blue-800">
              <h3 className="font-semibold mb-2">Wichtige Informationen zur Wahl</h3>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Jede Wohngruppe kann einmal abstimmen</li>
                <li>Sie können bis zu 3 Kandidaten wählen</li>
                <li>Die Stimmabgabe ist anonym und geheim</li>
                <li>Nach der Stimmabgabe kann diese nicht mehr geändert werden</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}