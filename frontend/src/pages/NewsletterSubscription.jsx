import { useState } from 'react';
import { Link } from 'react-router-dom';
import { subscribeNewsletter } from '../services/api';

export default function NewsletterSubscription() {
  const [formData, setFormData] = useState({
    email: '',
    groupName: '',
    facilityName: '',
    region: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await subscribeNewsletter(formData);
      setSuccess(true);
      setFormData({
        email: '',
        groupName: '',
        facilityName: '',
        region: ''
      });
    } catch (err) {
      setError(err.response?.data?.error || 'Fehler beim Anmelden. Bitte versuchen Sie es erneut.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary-50/30">
      {/* Header */}
      <header className="container mx-auto px-4 pt-12 pb-8 max-w-3xl">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-800 font-medium transition-colors duration-200 mb-6 group"
        >
          <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
          </svg>
          <span>Zurück zur Startseite</span>
        </Link>

        <div className="bg-gradient-to-br from-primary-600 to-primary-700 rounded-2xl shadow-xl p-8 md:p-12">
          <h1 className="text-4xl md:text-5xl font-bold text-center mb-3 tracking-tight text-white">
            Newsletter-Anmeldung
          </h1>
          <p className="text-center text-lg text-primary-100 font-light">
            Bleiben Sie über die Landesheimrat-Wahl informiert
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
          {/* Info Section */}
          <div className="mb-8 p-4 bg-primary-50 rounded-lg border border-primary-100">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-primary-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <p className="text-sm text-primary-900 leading-relaxed">
                Melden Sie Ihre Wohngruppe für den Newsletter an, um wichtige Updates zur Landesheimrat-Wahl zu erhalten.
                Sie erhalten eine Bestätigungs-E-Mail mit weiteren Informationen.
              </p>
            </div>
          </div>

          {/* Success Message */}
          {success && (
            <div className="mb-6 bg-green-50 border-l-4 border-green-500 text-green-800 px-6 py-4 rounded-lg shadow-md" role="alert">
              <div className="flex items-start gap-3">
                <svg className="w-6 h-6 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                </svg>
                <div>
                  <p className="font-semibold">Vielen Dank für Ihre Anmeldung!</p>
                  <p className="text-sm mt-1">Sie erhalten in Kürze eine Bestätigungs-E-Mail mit weiteren Informationen zur Wahl.</p>
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-500 text-red-800 px-6 py-4 rounded-lg shadow-md" role="alert">
              <div className="flex items-center gap-3">
                <svg className="w-6 h-6 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"></path>
                </svg>
                <p>{error}</p>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                E-Mail-Adresse <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                placeholder="organisation@beispiel.de"
              />
            </div>

            {/* Group Name */}
            <div>
              <label htmlFor="groupName" className="block text-sm font-semibold text-gray-700 mb-2">
                Wohngruppenname <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="groupName"
                name="groupName"
                value={formData.groupName}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                placeholder="Name der Wohngruppe"
              />
            </div>

            {/* Facility Name */}
            <div>
              <label htmlFor="facilityName" className="block text-sm font-semibold text-gray-700 mb-2">
                Einrichtungsname <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="facilityName"
                name="facilityName"
                value={formData.facilityName}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                placeholder="Name der Einrichtung"
              />
            </div>

            {/* Region (Optional) */}
            <div>
              <label htmlFor="region" className="block text-sm font-semibold text-gray-700 mb-2">
                Region <span className="text-gray-400">(optional)</span>
              </label>
              <input
                type="text"
                id="region"
                name="region"
                value={formData.region}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                placeholder="z.B. Nordhessen, Südhessen"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Wird gesendet...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                  </svg>
                  <span>Zum Newsletter anmelden</span>
                </>
              )}
            </button>
          </form>

          {/* Privacy Note */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500 leading-relaxed">
              <svg className="w-4 h-4 inline mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
              </svg>
              Ihre Daten werden ausschließlich für den Versand von Informationen zur Landesheimrat-Wahl verwendet und nicht an Dritte weitergegeben.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
