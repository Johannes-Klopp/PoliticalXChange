import { useEffect, useState } from 'react';
import { getResults } from '../services/api';

export default function StatisticsDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStatistics();
  }, []);

  const loadStatistics = async () => {
    try {
      const response = await getResults();
      setStats(response.data.statistics);
    } catch (error) {
      console.error('Error loading statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center text-gray-500">
        Keine Statistiken verfügbar
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Hauptstatistiken */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Gesamte Einzelstimmen</p>
              <p className="text-3xl font-bold mt-2">{stats.totalVotes}</p>
            </div>
            <svg className="w-12 h-12 text-blue-200 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path>
            </svg>
          </div>
          <p className="text-blue-100 text-xs mt-3">
            Summe aller abgegebenen Stimmen
          </p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Teilgenommen</p>
              <p className="text-3xl font-bold mt-2">{stats.votedSubscribers}</p>
            </div>
            <svg className="w-12 h-12 text-green-200 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
            </svg>
          </div>
          <p className="text-green-100 text-xs mt-3">
            von {stats.totalSubscribers} Berechtigten
          </p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Wahlbeteiligung</p>
              <p className="text-3xl font-bold mt-2">{stats.participationRate}%</p>
            </div>
            <svg className="w-12 h-12 text-purple-200 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"></path>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"></path>
            </svg>
          </div>
          <div className="mt-3 bg-purple-400 bg-opacity-30 rounded-full overflow-hidden h-2">
            <div className="bg-white h-full rounded-full transition-all duration-500" style={{ width: `${stats.participationRate}%` }}></div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm font-medium">Wohngruppen gewählt</p>
              <p className="text-3xl font-bold mt-2">{stats.uniqueVoters}</p>
            </div>
            <svg className="w-12 h-12 text-orange-200 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
            </svg>
          </div>
          <p className="text-orange-100 text-xs mt-3">
            Jede Gruppe kann 8 Stimmen abgeben
          </p>
        </div>
      </div>

      {/* Stimmverteilung */}
      {stats.voteDistribution && stats.voteDistribution.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            Stimmverteilung pro Wähler
          </h3>
          <div className="space-y-3">
            {stats.voteDistribution.map((dist) => (
              <div key={dist.votes_per_session} className="flex items-center">
                <div className="w-32 text-sm text-gray-600">
                  {dist.votes_per_session} {dist.votes_per_session === 1 ? 'Stimme' : 'Stimmen'}
                </div>
                <div className="flex-1 mx-4">
                  <div className="bg-gray-200 rounded-full h-8 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-primary-500 to-primary-600 h-full flex items-center justify-end pr-2 text-white text-xs font-medium transition-all duration-500"
                      style={{ width: `${(dist.count / stats.uniqueVoters) * 100}%` }}
                    >
                      {dist.count}
                    </div>
                  </div>
                </div>
                <div className="w-20 text-right text-sm text-gray-700 font-medium">
                  {((dist.count / stats.uniqueVoters) * 100).toFixed(1)}%
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Wahlbeteiligung nach Einrichtung */}
      {stats.participationByFacility && stats.participationByFacility.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            Wahlbeteiligung nach Einrichtung
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    Einrichtung
                  </th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">
                    Teilgenommen
                  </th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">
                    Gesamt
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                    Beteiligung
                  </th>
                </tr>
              </thead>
              <tbody>
                {stats.participationByFacility.map((facility, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <span className="text-sm text-gray-900 font-medium">
                        {facility.facility_name || 'Nicht angegeben'}
                      </span>
                    </td>
                    <td className="text-center py-3 px-4">
                      <span className="text-sm text-gray-700">{facility.voted}</span>
                    </td>
                    <td className="text-center py-3 px-4">
                      <span className="text-sm text-gray-700">{facility.total}</span>
                    </td>
                    <td className="text-right py-3 px-4">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              facility.percentage > 75
                                ? 'bg-green-500'
                                : facility.percentage > 50
                                ? 'bg-yellow-500'
                                : facility.percentage > 25
                                ? 'bg-orange-500'
                                : 'bg-red-500'
                            }`}
                            style={{ width: `${facility.percentage || 0}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-semibold text-gray-700 w-12 text-right">
                          {facility.percentage || 0}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Zeitlicher Verlauf */}
      {stats.votingTimeline && stats.votingTimeline.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            Zeitlicher Verlauf der Wahlbeteiligung
          </h3>
          <div className="space-y-2">
            {stats.votingTimeline.map((day, index) => (
              <div key={index} className="flex items-center">
                <div className="w-32 text-sm text-gray-600">
                  {new Date(day.date).toLocaleDateString('de-DE', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                  })}
                </div>
                <div className="flex-1 mx-4">
                  <div className="bg-gray-200 rounded h-6 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-blue-600 h-full flex items-center justify-end pr-2 text-white text-xs font-medium transition-all duration-500"
                      style={{
                        width: `${(day.voters_count / Math.max(...stats.votingTimeline.map(d => d.voters_count))) * 100}%`
                      }}
                    >
                      {day.voters_count} {day.voters_count === 1 ? 'Wähler' : 'Wähler'}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}