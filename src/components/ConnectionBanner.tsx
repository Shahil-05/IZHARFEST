import React, { useState } from 'react';
import { useSupabaseConfig } from '../context/SupabaseConfigContext';
import { SupabaseConfigModal } from './SupabaseConfigModal';

export const ConnectionBanner: React.FC = () => {
  const { connectionStatus } = useSupabaseConfig();
  const [modalOpen, setModalOpen] = useState(false);

  const dotColor =
    connectionStatus === 'connected'
      ? '#10b981' // green
      : connectionStatus === 'error'
      ? '#ef4444' // red
      : '#3b82f6'; // blue (local/in-app)

  const statusLabel =
    connectionStatus === 'connected'
      ? 'Database: Live Connected'
      : connectionStatus === 'error'
      ? 'Database: Setup Needed'
      : 'Database: In-App Store';

  return (
    <>
      <button
        onClick={() => setModalOpen(true)}
        style={{
          background: 'none',
          border: 'none',
          padding: '6px',
          cursor: 'pointer',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          outline: 'none',
        }}
        title={`${statusLabel} (Click for database details)`}
        aria-label={statusLabel}
      >
        <span
          style={{
            display: 'inline-block',
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: dotColor,
            boxShadow: `0 0 8px ${dotColor}`,
            transition: 'all 0.2s ease',
          }}
        />
      </button>

      <SupabaseConfigModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
};
