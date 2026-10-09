import React, { useEffect, useState } from 'react';
import { festService } from '../../services/festService';
import { eventService } from '../../services/eventService';
import { scoringService } from '../../services/scoringService';
import { useSupabaseConfig } from '../../context/SupabaseConfigContext';
import { FestSettings, EventCategory, ScoringTemplate } from '../../types/database';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import {
  Settings as SettingsIcon,
  Save,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  AlertCircle,
  Database,
  Layers,
  Award,
  Sparkles,
  X,
} from 'lucide-react';

export const Settings: React.FC = () => {
  const { isConfigured, projectUrl, anonKey, connectionStatus, saveConfig, resetToDemo, testConnection } =
    useSupabaseConfig();

  const [activeTab, setActiveTab] = useState<'fest' | 'categories' | 'templates' | 'supabase'>('fest');

  // Fest Settings
  const [settings, setSettings] = useState<FestSettings | null>(null);
  const [festName, setFestName] = useState('');
  const [festYear, setFestYear] = useState('');
  const [description, setDescription] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [venueGeneral, setVenueGeneral] = useState('');
  const [savingFest, setSavingFest] = useState(false);
  const [festSuccess, setFestSuccess] = useState(false);

  // Categories
  const [categories, setCategories] = useState<EventCategory[]>([]);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<EventCategory | null>(null);
  const [catName, setCatName] = useState('');
  const [catDesc, setCatDesc] = useState('');
  const [deleteCatTarget, setDeleteCatTarget] = useState<EventCategory | null>(null);

  // Scoring Templates
  const [templates, setTemplates] = useState<ScoringTemplate[]>([]);
  const [templateModalOpen, setTemplateModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<ScoringTemplate | null>(null);
  const [tplName, setTplName] = useState('');
  const [tplType, setTplType] = useState<'individual' | 'group' | 'all'>('all');
  const [tplRules, setTplRules] = useState<{ id?: string; label: string; points: number; sort_order: number }[]>([]);
  const [deleteTplTarget, setDeleteTplTarget] = useState<ScoringTemplate | null>(null);

  // Supabase URL & Key in settings
  const [supaUrl, setSupaUrl] = useState(projectUrl);
  const [supaKey, setSupaKey] = useState(anonKey);
  const [supaSaving, setSupaSaving] = useState(false);
  const [supaMsg, setSupaMsg] = useState('');

  const loadData = async () => {
    const [s, c, t] = await Promise.all([
      festService.getSettings(),
      eventService.getCategories(),
      scoringService.getTemplates(),
    ]);
    setSettings(s);
    setFestName(s.fest_name);
    setFestYear(s.fest_year);
    setDescription(s.description || '');
    setContactInfo(s.contact_info || '');
    setVenueGeneral(s.venue_general || '');

    setCategories(c);
    setTemplates(t);
  };

  useEffect(() => {
    loadData();
    window.addEventListener('izhar_db_updated', loadData);
    return () => window.removeEventListener('izhar_db_updated', loadData);
  }, []);

  const handleSaveFest = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingFest(true);
    try {
      await festService.updateSettings({
        fest_name: festName,
        fest_year: festYear,
        description,
        contact_info: contactInfo,
        venue_general: venueGeneral,
      });
      setFestSuccess(true);
      setTimeout(() => setFestSuccess(false), 3000);
      window.dispatchEvent(new Event('izhar_db_updated'));
    } finally {
      setSavingFest(false);
    }
  };

  // Category Actions
  const openAddCategory = () => {
    setEditingCategory(null);
    setCatName('');
    setCatDesc('');
    setCategoryModalOpen(true);
  };

  const openEditCategory = (c: EventCategory) => {
    setEditingCategory(c);
    setCatName(c.name);
    setCatDesc(c.description || '');
    setCategoryModalOpen(true);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await eventService.updateCategory(editingCategory.id, catName, catDesc);
      } else {
        await eventService.createCategory(catName, catDesc);
      }
      setCategoryModalOpen(false);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Error saving category');
    }
  };

  const handleDeleteCategory = async () => {
    if (!deleteCatTarget) return;
    try {
      await eventService.deleteCategory(deleteCatTarget.id);
      setDeleteCatTarget(null);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Error deleting category');
    }
  };

  // Template Actions
  const openAddTemplate = () => {
    setEditingTemplate(null);
    setTplName('');
    setTplType('all');
    setTplRules([
      { label: '1st Position', points: 20, sort_order: 1 },
      { label: '2nd Position', points: 15, sort_order: 2 },
      { label: '3rd Position', points: 10, sort_order: 3 },
    ]);
    setTemplateModalOpen(true);
  };

  const openEditTemplate = (t: ScoringTemplate) => {
    setEditingTemplate(t);
    setTplName(t.name);
    setTplType(t.event_type || 'all');
    setTplRules(
      t.rules?.map((r, i) => ({
        id: r.id,
        label: r.label,
        points: r.points,
        sort_order: r.sort_order ?? i + 1,
      })) || []
    );
    setTemplateModalOpen(true);
  };

  const handleSaveTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingTemplate) {
        await scoringService.updateTemplate(editingTemplate.id, tplName, tplType, tplRules);
      } else {
        await scoringService.createTemplate(tplName, tplType, tplRules);
      }
      setTemplateModalOpen(false);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Error saving template');
    }
  };

  const handleDeleteTemplate = async () => {
    if (!deleteTplTarget) return;
    try {
      await scoringService.deleteTemplate(deleteTplTarget.id);
      setDeleteTplTarget(null);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Error deleting template');
    }
  };

  const handleSaveSupabase = async (e: React.FormEvent) => {
    e.preventDefault();
    setSupaSaving(true);
    setSupaMsg('');
    const success = await saveConfig(supaUrl, supaKey);
    setSupaSaving(false);
    setSupaMsg(success ? 'Connected successfully!' : 'Connection attempted.');
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 900, color: '#fff' }}>Fest Configuration & Settings</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
          Manage global fest branding, event categories, reusable scoring templates, and database connection.
        </p>
      </div>

      {/* Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          borderBottom: '1px solid var(--border-subtle)',
          paddingBottom: '0.85rem',
          marginBottom: '2rem',
          flexWrap: 'wrap',
        }}
      >
        <button
          className={`btn btn-sm ${activeTab === 'fest' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setActiveTab('fest')}
        >
          <Sparkles size={14} /> Fest Information
        </button>
        <button
          className={`btn btn-sm ${activeTab === 'categories' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setActiveTab('categories')}
        >
          <Layers size={14} /> Event Categories ({categories.length})
        </button>
        <button
          className={`btn btn-sm ${activeTab === 'templates' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setActiveTab('templates')}
        >
          <Award size={14} /> Scoring Templates ({templates.length})
        </button>
        <button
          className={`btn btn-sm ${activeTab === 'supabase' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setActiveTab('supabase')}
        >
          <Database size={14} /> Database & Migrations
        </button>
      </div>

      {/* TAB 1: FEST INFORMATION */}
      {activeTab === 'fest' && (
        <div className="glass-panel" style={{ padding: '2rem', maxWidth: '720px' }}>
          <h3 style={{ fontSize: '1.25rem', color: '#fff', fontWeight: 800, marginBottom: '1.5rem' }}>
            General Fest Identity
          </h3>

          {festSuccess && (
            <div
              style={{
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(16, 185, 129, 0.15)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                color: '#34d399',
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '1.5rem',
              }}
            >
              <CheckCircle2 size={16} />
              <span>Fest settings updated successfully! Public website reflects new branding immediately.</span>
            </div>
          )}

          <form onSubmit={handleSaveFest}>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Fest Name *</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  value={festName}
                  onChange={(e) => setFestName(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Fest Year *</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  value={festYear}
                  onChange={(e) => setFestYear(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Description / Theme Statement</label>
              <textarea
                className="form-textarea"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Contact Coordination</label>
                <input
                  type="text"
                  className="form-input"
                  value={contactInfo}
                  onChange={(e) => setContactInfo(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Main Campus / Venue</label>
                <input
                  type="text"
                  className="form-input"
                  value={venueGeneral}
                  onChange={(e) => setVenueGeneral(e.target.value)}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
              <button type="submit" className="btn btn-primary" disabled={savingFest} style={{ gap: '0.4rem' }}>
                <Save size={15} /> {savingFest ? 'Saving...' : 'Save Fest Settings'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 2: EVENT CATEGORIES */}
      {activeTab === 'categories' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div>
              <h3 style={{ fontSize: '1.25rem', color: '#fff', fontWeight: 800 }}>Event Categories</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Categories are completely database-driven and editable by administrators.
              </p>
            </div>
            <button className="btn btn-primary btn-sm" onClick={openAddCategory} style={{ gap: '0.35rem' }}>
              <Plus size={14} /> Add Category
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
            {categories.map((c) => (
              <div
                key={c.id}
                className="glass-panel"
                style={{
                  padding: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                    <h4 style={{ fontSize: '1.15rem', color: '#fff', fontWeight: 800 }}>{c.name}</h4>
                    <div style={{ display: 'flex', gap: '0.3rem' }}>
                      <button
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '4px 6px' }}
                        onClick={() => openEditCategory(c)}
                      >
                        <Edit2 size={12} />
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        style={{ padding: '4px 6px' }}
                        onClick={() => setDeleteCatTarget(c)}
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                  {c.description && (
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: '1.5' }}>
                      {c.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: SCORING TEMPLATES */}
      {activeTab === 'templates' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div>
              <h3 style={{ fontSize: '1.25rem', color: '#fff', fontWeight: 800 }}>Scoring Templates</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Templates provide default point schemes. Modifying a template will not alter existing competition rules.
              </p>
            </div>
            <button className="btn btn-primary btn-sm" onClick={openAddTemplate} style={{ gap: '0.35rem' }}>
              <Plus size={14} /> Add Template
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
            {templates.map((tpl) => (
              <div
                key={tpl.id}
                className="glass-panel"
                style={{
                  padding: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.85rem' }}>
                    <div>
                      <h4 style={{ fontSize: '1.15rem', color: '#fff', fontWeight: 800 }}>{tpl.name}</h4>
                      <span className="badge badge-ongoing" style={{ fontSize: '0.65rem', marginTop: '0.2rem' }}>
                        Type: {tpl.event_type?.toUpperCase()}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: '0.3rem' }}>
                      <button
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '4px 6px' }}
                        onClick={() => openEditTemplate(tpl)}
                      >
                        <Edit2 size={12} />
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        style={{ padding: '4px 6px' }}
                        onClick={() => setDeleteTplTarget(tpl)}
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>

                  {/* Rules preview */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '0.85rem' }}>
                    {tpl.rules?.map((r) => (
                      <div
                        key={r.id}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          padding: '0.4rem 0.65rem',
                          background: 'rgba(255, 255, 255, 0.03)',
                          borderRadius: '4px',
                          fontSize: '0.85rem',
                        }}
                      >
                        <span style={{ color: '#fff', fontWeight: 600 }}>{r.label}</span>
                        <span style={{ color: 'var(--gold)', fontWeight: 800 }}>+{r.points} pts</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: DATABASE & SUPABASE CONFIG */}
      {activeTab === 'supabase' && (
        <div className="glass-panel" style={{ padding: '2rem', maxWidth: '680px' }}>
          <h3 style={{ fontSize: '1.25rem', color: '#fff', fontWeight: 800, marginBottom: '0.5rem' }}>
            Supabase Connection & Environment
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            Configure your hosted Supabase credentials. All public and admin screens will interact with this database.
          </p>

          <form onSubmit={handleSaveSupabase}>
            <div className="form-group">
              <label className="form-label">VITE_SUPABASE_URL</label>
              <input
                type="url"
                className="form-input"
                placeholder="https://xyzcompany.supabase.co"
                value={supaUrl}
                onChange={(e) => setSupaUrl(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">VITE_SUPABASE_ANON_KEY</label>
              <input
                type="password"
                className="form-input"
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                value={supaKey}
                onChange={(e) => setSupaKey(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.75rem' }}>
              <button type="button" className="btn btn-outline btn-sm" onClick={resetToDemo}>
                Switch to Local Database
              </button>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={testConnection}
                >
                  Test Connection
                </button>
                <button type="submit" className="btn btn-primary btn-sm" disabled={supaSaving}>
                  {supaSaving ? 'Connecting...' : 'Save & Connect'}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Category Modal */}
      {categoryModalOpen && (
        <div className="modal-overlay" onClick={() => setCategoryModalOpen(false)}>
          <div className="modal-content" style={{ maxWidth: '440px', padding: '1.75rem' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.2rem', color: '#fff', fontWeight: 800 }}>
                {editingCategory ? 'Edit Category' : 'Add Category'}
              </h3>
              <button onClick={() => setCategoryModalOpen(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-faint)' }}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSaveCategory}>
              <div className="form-group">
                <label className="form-label">Category Name *</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  className="form-textarea"
                  rows={2}
                  value={catDesc}
                  onChange={(e) => setCatDesc(e.target.value)}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setCategoryModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Template Modal */}
      {templateModalOpen && (
        <div className="modal-overlay" onClick={() => setTemplateModalOpen(false)}>
          <div className="modal-content" style={{ maxWidth: '540px', padding: '1.75rem' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.2rem', color: '#fff', fontWeight: 800 }}>
                {editingTemplate ? 'Edit Scoring Template' : 'Add Scoring Template'}
              </h3>
              <button onClick={() => setTemplateModalOpen(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-faint)' }}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSaveTemplate}>
              <div className="form-group">
                <label className="form-label">Template Name *</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  placeholder="e.g. Individual Default"
                  value={tplName}
                  onChange={(e) => setTplName(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Format Applicability</label>
                <select
                  className="form-select"
                  value={tplType}
                  onChange={(e) => setTplType(e.target.value as any)}
                >
                  <option value="all">All Formats</option>
                  <option value="individual">Individual</option>
                  <option value="group">Group Squad</option>
                </select>
              </div>

              {/* Template Rules */}
              <div style={{ marginTop: '1rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem' }}>
                <label className="form-label" style={{ marginBottom: '0.5rem', display: 'block' }}>Default Position Rules</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  {tplRules.map((r, i) => (
                    <div key={i} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <input
                        type="text"
                        className="form-input"
                        value={r.label}
                        onChange={(e) => {
                          const copy = [...tplRules];
                          copy[i].label = e.target.value;
                          setTplRules(copy);
                        }}
                        style={{ flex: 2, padding: '0.4rem 0.65rem' }}
                      />
                      <input
                        type="number"
                        className="form-input"
                        value={r.points}
                        onChange={(e) => {
                          const copy = [...tplRules];
                          copy[i].points = Number(e.target.value);
                          setTplRules(copy);
                        }}
                        style={{ width: '80px', padding: '0.4rem 0.65rem' }}
                      />
                      <button
                        type="button"
                        onClick={() => setTplRules((prev) => prev.filter((_, idx) => idx !== i))}
                        style={{ background: 'transparent', border: 'none', color: '#f87171', cursor: 'pointer' }}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={() => setTplRules((prev) => [...prev, { label: `Rank ${prev.length + 1}`, points: 5, sort_order: prev.length + 1 }])}
                >
                  + Add Position Rule
                </button>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setTemplateModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  Save Template
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Category Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(deleteCatTarget)}
        title="Delete Category"
        message={`Are you sure you want to delete category "${deleteCatTarget?.name}"?`}
        confirmLabel="Delete Category"
        isDanger
        onConfirm={handleDeleteCategory}
        onCancel={() => setDeleteCatTarget(null)}
      />

      {/* Delete Template Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(deleteTplTarget)}
        title="Delete Scoring Template"
        message={`Are you sure you want to delete template "${deleteTplTarget?.name}"? Existing events that used this template will remain unaffected.`}
        confirmLabel="Delete Template"
        isDanger
        onConfirm={handleDeleteTemplate}
        onCancel={() => setDeleteTplTarget(null)}
      />
    </div>
  );
};
