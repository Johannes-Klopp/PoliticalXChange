import { useState, useEffect } from 'react';
import { getElectionStatus } from '../services/api';
import ElectionClosedPage from '../pages/ElectionClosedPage';

export default function ElectionGuard({ children }) {
  const [electionClosed, setElectionClosed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = await getElectionStatus();
        setElectionClosed(response.data.electionClosed);
      } catch (err) {
        console.error('Error checking election status:', err);
      } finally {
        setLoading(false);
      }
    };
    checkStatus();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (electionClosed) {
    return <ElectionClosedPage />;
  }

  return children;
}
