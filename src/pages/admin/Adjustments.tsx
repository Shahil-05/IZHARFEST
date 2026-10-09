import React, { useEffect, useState } from 'react';
import { adjustmentService } from '../../services/adjustmentService';
import { teamService } from '../../services/teamService';
import { TeamPointAdjustment, Team, AdjustmentType } from '../../types/database';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { Sliders, PlusCircle, Trash2, Plus, Minus, AlertCircle, CheckCircle2 } from 'lucide-react';

export const Adjustments: React.FC = () => {
  const [adjustments, setAdjustments] = useState<TeamPointAdjustment[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);

  // Form
  const [teamId, setTeamId] = useState('');
  const [adjustmentType, setAdjustmentType] = useState<AdjustmentType>('bonus');
  const [points, setPoints] = useState<number>(5);
  const [reason, setReason] = useState('');
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Delete
  const [deleteTarget, setDeleteTarget] = useState<TeamPointAdjustment | null>(null);

  const loadData = async () => {
    try {
      const [allAdjs, allTeams] = await Promise.all([
        adjustmentService.getAdjustments(),
        teamService.getTeams(),
      ]);
      setAdjustments(allAdjs);
      setTeams(allTeams);
      if (allTeams.length > 0 && !teamId) {
        setTeamId(allTeams[0].id);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    window.addEventListener('izhar_db_updated', loadData);
    return () => window.removeEventListener('izhar_db_updated', loadData);
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setSuccessMsg('');

    if (!reason.trim()) {
      setFormError('A reason is mandatory for any bonus or penalty adjustment.');
      return;
    }

    if (points <= 0) {
      setFormError('Points must be greater than zero.');
      return;
    }

    setSaving(true);
    try {
      await adjustmentService.addAdjustment({
        team_id: teamId,
        adjustment_type: adjustmentType,
        points: Number(points),
        reason: reason.trim(),
      });
      setReason('');
      setPoints(5);
      setSuccessMsg('Point adjustment recorded. Standings updated dynamically!');
      setTimeout(() => setSuccessMsg(''), 3000);
      await loadData();
      window.dispatchEvent(new Event('izhar_db_updated'));
    } catch (err: any) {
      setFormError(err.message || 'Error recording adjustment.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await adjustmentService.deleteAdjustment(deleteTarget.id);
      setDeleteTarget(null);
      await loadData();
      window.dispatchEvent(new Event('izhar_db_updated'));
    } catch (err: any) {
      alert(err.message || 'Error deleting adjustment');
    }
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 900, color: '#fff' }}>Point Adjustments (Bonuses & Penalties)</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
          Apply committee bonuses or infractions with mandatory audit reasoning. Standings are derived dynamically.
        </p>
      </div>

      {successMsg && (
        <div
          style={{
            padding: '0.85rem 1.25rem',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid rgba(16, 185, 129, 0.35)',
            color: '#34d399',
            fontSize: '0.875rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '1.75rem',
          }}
        >
          <CheckCircle2 size={18} />
          <span>{successMsg}</span>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
        {/* Form: Add Adjustment */}
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <h3 style={{ fontSize: '1.25rem', color: '#fff', fontWeight: 800, marginBottom: '1.25rem' }}>
            Record New Adjustment
          </h3>

          {formError && (
            <div
              style={{
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#f87171',
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '1.25rem',
              }}
            >
              <AlertCircle size={16} />
              <span>{formError}</span>
            </div>
          )}

          <form onSubmit={handleAdd}>
            <div className="form-group">
              <label className="form-label">Target Team *</label>
              <select
                className="form-select"
                required
                value={teamId}
                onChange={(e) => setTeamId(e.target.value)}
              >
                {teams.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Type *</label>
                <select
                  className="form-select"
                  value={adjustmentType}
                  onChange={(e) => setAdjustmentType(e.target.value as AdjustmentType)}
                >
                  <option value="bonus">Bonus (+)</option>
                  <option value="penalty">Penalty (-)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Points *</label>
                <input
                  type="number"
                  required
                  min={1}
                  className="form-input"
                  value={points}
                  onChange={(e) => setPoints(Number(e.target.value))}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Reason * (Mandatory for audit trail)</label>
              <textarea
                className="form-textarea"
                rows={3}
                required
                placeholder="e.g. Best Discipline in Procession, Stage Cleanup Infraction..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.75rem' }} disabled={saving}>
              {saving ? 'Recording...' : `Apply ${adjustmentType === 'bonus' ? 'Bonus Points' : 'Penalty Points'}`}
            </button>
          </form>
        </div>

        {/* Existing Adjustments Log */}
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <h3 style={{ fontSize: '1.25rem', color: '#fff', fontWeight: 800, marginBottom: '1.25rem' }}>
            Adjustment Records Audit Log ({adjustments.length})
          </h3>

          <div style={{ maxHeight: '440px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {adjustments.length > 0 ? (
              adjustments.map((adj) => {
                const isBonus = adj.adjustment_type === 'bonus';
                return (
                  <div
                    key={adj.id}
                    style={{
                      padding: '0.85rem 1rem',
                      borderRadius: 'var(--radius-md)',
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: isBonus ? '1px solid rgba(16, 185, 129, 0.25)' : '1px solid rgba(239, 68, 68, 0.25)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '0.75rem',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontWeight: 800, color: '#fff', fontSize: '0.9rem' }}>
                          {adj.team?.name}
                        </span>
                        <span
                          className={`badge ${isBonus ? 'badge-published' : 'badge-cancelled'}`}
                          style={{ fontSize: '0.65rem' }}
                        >
                          {isBonus ? 'Bonus' : 'Penalty'}
                        </span>
                      </div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '0.2rem' }}>
                        {adj.reason}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span
                        style={{
                          fontWeight: 900,
                          fontSize: '1.15rem',
                          fontFamily: 'var(--font-heading)',
                          color: isBonus ? '#34d399' : '#f87171',
                        }}
                      >
                        {isBonus ? `+${adj.points}` : `-${adj.points}`}
                      </span>

                      <button
                        onClick={() => setDeleteTarget(adj)}
                        className="btn btn-danger btn-sm"
                        style={{ padding: '4px 6px' }}
                        title="Delete Adjustment"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '2rem' }}>
                No bonuses or penalties recorded yet.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title="Delete Point Adjustment"
        message={`Are you sure you want to remove this ${deleteTarget?.adjustment_type} of ${deleteTarget?.points} pts for ${deleteTarget?.team?.name}? The team's total points will be updated accordingly.`}
        confirmLabel="Remove Adjustment"
        isDanger
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};
