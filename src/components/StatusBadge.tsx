import React from 'react';
import { EventStatus, ResultStatus } from '../types/database';

interface StatusBadgeProps {
  status?: EventStatus;
  resultStatus?: ResultStatus;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, resultStatus }) => {
  if (resultStatus) {
    switch (resultStatus) {
      case 'published':
        return <span className="badge badge-published">● Results Out</span>;
      case 'draft':
        return <span className="badge badge-draft">Draft Score</span>;
      case 'not_entered':
        return <span className="badge badge-not-entered">Results Pending</span>;
    }
  }

  if (status) {
    switch (status) {
      case 'ongoing':
        return <span className="badge badge-ongoing">● Live Now</span>;
      case 'upcoming':
        return <span className="badge badge-upcoming">Upcoming</span>;
      case 'completed':
        return <span className="badge badge-completed">Completed</span>;
      case 'cancelled':
        return <span className="badge badge-cancelled">Cancelled</span>;
    }
  }

  return null;
};
