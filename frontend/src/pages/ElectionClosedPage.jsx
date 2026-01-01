export default function ElectionClosedPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 via-gray-50 to-gray-100 flex items-center justify-center px-4">
      <div className="max-w-lg w-full text-center">
        <div className="bg-white rounded-2xl shadow-2xl p-10 border border-gray-200">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Wahl geschlossen</h1>
          <p className="text-gray-600 mb-6">
            Die Landesheimrat-Wahl ist beendet. Vielen Dank an alle, die teilgenommen haben!
          </p>
          <p className="text-gray-500 text-sm mb-8">
            Die Ergebnisse werden am 08. Januar 2026 bekannt gegeben.
          </p>
          <div className="text-xs text-gray-400">
            Political XChange i.G. | Landesheimrat Hessen
          </div>
        </div>
      </div>
    </div>
  );
}
