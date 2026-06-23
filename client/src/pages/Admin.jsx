import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  verifyToken,
  fetchRSVPs, fetchRSVPStats, deleteRSVP,
  fetchContent, updateContent,
  fetchEvents, addEvent, updateEvents, deleteEvent, patchEvent,
  fetchMenu, addMenuItem, deleteMenuItem,
  fetchMedia, addMedia, deleteMedia,
  fetchGifts, addGift, deleteGift,
  fetchTheme, updateTheme, resetTheme,
  fetchTranslations, updateTranslations,
} from '../utils/api';
import {
  FiHome, FiUsers, FiEdit, FiEdit2, FiCalendar, FiCoffee, FiFilm, FiGift,
  FiLogOut, FiExternalLink, FiTrash2, FiPlus, FiSearch,
  FiCheck, FiX, FiAlertCircle, FiDroplet, FiRefreshCw,
  FiArrowUp, FiArrowDown, FiGlobe, FiSave
} from 'react-icons/fi';

/* ═══════════════════════════════════════════════════════════════ */
/*  Toast notification                                            */
/* ═══════════════════════════════════════════════════════════════ */
function Toast({ message, type, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div className={`admin-toast admin-toast--${type}`}>
      {type === 'success' ? <FiCheck /> : <FiAlertCircle />}
      <span>{message}</span>
      <button onClick={onClose}><FiX /></button>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════ */
/*  Dashboard Tab                                                 */
/* ═══════════════════════════════════════════════════════════════ */
function DashboardTab({ rsvps, stats, events }) {
  const statCards = [
    { label: 'Total RSVPs', value: stats.total || 0, color: '#6366f1' },
    { label: 'Attending', value: stats.attending || 0, color: '#22c55e' },
    { label: 'Declined', value: stats.declined || 0, color: '#ef4444' },
    { label: 'Maybe', value: stats.maybe || 0, color: '#f59e0b' },
    { label: 'Total Guests', value: stats.total_guests || 0, color: '#8b5cf6' },
  ];

  const recent = [...(rsvps || [])].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 5);

  const eventStats = {};
  (rsvps || []).forEach(r => {
    if (r.attending === 'yes' && r.events) {
      r.events.forEach(ev => {
        if (!eventStats[ev.eventName]) {
          eventStats[ev.eventName] = { adults: 0, kids: 0, total: 0 };
        }
        const a = ev.adults || 0;
        const k = ev.kids || 0;
        const g = ev.guests || 0;
        if (typeof ev.adults === 'number' || typeof ev.kids === 'number') {
          eventStats[ev.eventName].adults += a;
          eventStats[ev.eventName].kids += k;
          eventStats[ev.eventName].total += a + k;
        } else {
          eventStats[ev.eventName].total += g;
        }
      });
    }
  });

  return (
    <div className="admin-dashboard">
      <h2 className="admin-page-title">Dashboard</h2>
      <div className="admin-stats-grid">
        {statCards.map(s => (
          <div key={s.label} className="admin-stat-card" style={{ borderTopColor: s.color }}>
            <span className="admin-stat-value" style={{ color: s.color }}>{s.value}</span>
            <span className="admin-stat-label">{s.label}</span>
          </div>
        ))}
      </div>

      {Object.keys(eventStats).length > 0 && (
        <div className="admin-section">
          <h3 className="admin-section-title">Event Counts & Cost</h3>
          <div className="admin-event-stats" style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '24px' }}>
            {Object.entries(eventStats).map(([name, stat]) => {
              const evData = (events || []).find(e => e.name === name);
              const costPerGuest = evData?.costPerGuest || 0;
              const totalCost = stat.total * costPerGuest;
              return (
              <div key={name} style={{ background: '#ffffff', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', flex: '1 1 200px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                <h4 style={{ margin: '0 0 8px 0', fontSize: '1rem', color: '#1a202c' }}>{name}</h4>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#718096' }}>
                  <strong style={{ color: '#2d3748', fontSize: '1.2rem' }}>{stat.total}</strong> Total Guests<br/>
                  ({stat.adults} Adults, {stat.kids} Kids)
                </p>
                {costPerGuest > 0 && (
                  <p style={{ margin: '12px 0 0 0', paddingTop: '12px', borderTop: '1px solid #e2e8f0', fontSize: '0.9rem', color: '#22c55e', fontWeight: 'bold' }}>
                    Cost: ₹{totalCost.toLocaleString()} (₹{costPerGuest}/guest)
                  </p>
                )}
              </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="admin-section">
        <h3 className="admin-section-title">Recent RSVPs</h3>
        {recent.length === 0 ? (
          <p className="admin-empty">No RSVPs yet</p>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Status</th>
                  <th>Guests</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {recent.map(r => (
                  <tr key={r._id || r.id}>
                    <td>{r.name}</td>
                    <td><StatusBadge status={r.attending} /></td>
                    <td>{r.guests || 1}</td>
                    <td>{new Date(r.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════ */
/*  Status Badge                                                  */
/* ═══════════════════════════════════════════════════════════════ */
function StatusBadge({ status }) {
  const colors = { yes: '#22c55e', no: '#ef4444', maybe: '#f59e0b' };
  const labels = { yes: 'Attending', no: 'Declined', maybe: 'Maybe' };
  const c = colors[status] || '#6b6b80';
  return (
    <span className="admin-badge" style={{ background: `${c}18`, color: c, border: `1px solid ${c}30` }}>
      {labels[status] || status}
    </span>
  );
}

/* ═══════════════════════════════════════════════════════════════ */
/*  Guest List Tab                                                */
/* ═══════════════════════════════════════════════════════════════ */
function GuestListTab({ rsvps, events, onDelete, onRefresh }) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const filtered = (rsvps || []).filter(r => {
    const matchSearch = r.name?.toLowerCase().includes(search.toLowerCase()) ||
      r.email?.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' || r.attending === filter;
    return matchSearch && matchFilter;
  });

  const eventStats = {};
  (rsvps || []).forEach(r => {
    if (r.attending === 'yes' && r.events) {
      r.events.forEach(ev => {
        if (!eventStats[ev.eventName]) {
          eventStats[ev.eventName] = { adults: 0, kids: 0, total: 0 };
        }
        const a = ev.adults || 0;
        const k = ev.kids || 0;
        const g = ev.guests || 0;
        if (typeof ev.adults === 'number' || typeof ev.kids === 'number') {
          eventStats[ev.eventName].adults += a;
          eventStats[ev.eventName].kids += k;
          eventStats[ev.eventName].total += a + k;
        } else {
          eventStats[ev.eventName].total += g;
        }
      });
    }
  });

  return (
    <div>
      <h2 className="admin-page-title">Guest List ({filtered.length})</h2>

      {Object.keys(eventStats).length > 0 && (
        <div className="admin-event-stats" style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '24px' }}>
          {Object.entries(eventStats).map(([name, stat]) => {
            const evData = (events || []).find(e => e.name === name);
            const costPerGuest = evData?.costPerGuest || 0;
            const totalCost = stat.total * costPerGuest;
            return (
            <div key={name} style={{ background: 'var(--color-ivory)', padding: '16px', borderRadius: '8px', border: '1px solid var(--color-champagne)', flex: '1 1 200px' }}>
              <h4 style={{ margin: '0 0 8px 0', fontSize: '0.9rem', color: 'var(--color-burgundy)' }}>{name}</h4>
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                <strong>{stat.total}</strong> Total Guests<br/>
                ({stat.adults} Adults, {stat.kids} Kids)
              </p>
              {costPerGuest > 0 && (
                <p style={{ margin: '8px 0 0 0', fontSize: '0.85rem', color: '#22c55e', fontWeight: 'bold' }}>
                  Cost: ₹{totalCost.toLocaleString()} (₹{costPerGuest}/guest)
                </p>
              )}
            </div>
            );
          })}
        </div>
      )}

      <div className="admin-toolbar">
        <div className="admin-search">
          <FiSearch />
          <input
            type="text"
            placeholder="Search guests..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="admin-filters">
          {['all', 'yes', 'no', 'maybe'].map(f => (
            <button
              key={f}
              className={`admin-filter-btn ${filter === f ? 'admin-filter-btn--active' : ''}`}
              onClick={() => setFilter(f)}
            >
              {f === 'all' ? 'All' : f === 'yes' ? 'Attending' : f === 'no' ? 'Declined' : 'Maybe'}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="admin-empty">No guests found</p>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Guests (Total)</th>
                <th>Status</th>
                <th>Events Attending</th>
                <th>Message</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(r => (
                <tr key={r._id || r.id}>
                  <td>{r.name}</td>
                  <td>{r.email || '—'}</td>
                  <td>{r.phone || '—'}</td>
                  <td>{r.numGuests || 0}</td>
                  <td><StatusBadge status={r.attending} /></td>
                  <td>
                    {r.events && r.events.length > 0 ? (
                      <ul style={{ margin: 0, paddingLeft: '1rem', fontSize: '0.8rem' }}>
                        {r.events.map((ev, i) => {
                          const hasDetails = typeof ev.adults === 'number' || typeof ev.kids === 'number';
                          return (
                            <li key={i}>
                              {ev.eventName}: {hasDetails ? `${ev.adults || 0} Adults, ${ev.kids || 0} Kids` : `${ev.guests} Guests`}
                            </li>
                          );
                        })}
                      </ul>
                    ) : '—'}
                  </td>
                  <td className="admin-td-msg">{r.message || '—'}</td>
                  <td>{r.created_at ? new Date(r.created_at).toLocaleDateString() : '—'}</td>
                  <td>
                    <button className="admin-icon-btn admin-icon-btn--danger" onClick={() => onDelete(r._id || r.id)}>
                      <FiTrash2 />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════ */
/*  Content Editor Tab                                            */
/* ═══════════════════════════════════════════════════════════════ */
function ContentEditorTab({ content, onSave }) {
  const fields = [
    { key: 'bride_name', label: 'Bride Name', type: 'text' },
    { key: 'groom_name', label: 'Groom Name', type: 'text' },
    { key: 'wedding_date', label: 'Wedding Date', type: 'text' },
    { key: 'wedding_time', label: 'Wedding Time', type: 'text' },
    { key: 'tagline', label: 'Tagline', type: 'text' },
    { key: 'welcome_message', label: 'Welcome Message', type: 'text' },
    { key: 'hero_subtitle', label: 'Hero Subtitle', type: 'text' },
    { key: 'couple_story', label: 'Couple Story', type: 'textarea' },
    { key: 'bride_parents', label: 'Bride Parents', type: 'text' },
    { key: 'groom_parents', label: 'Groom Parents', type: 'text' },
    { key: 'venue_name', label: 'Venue Name', type: 'text' },
    { key: 'venue_address', label: 'Venue Address', type: 'text' },
    { key: 'venue_map_link', label: 'Venue Map Link', type: 'text' },
    { key: 'footer_message', label: 'Footer Message', type: 'text' },
  ];

  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm(content || {});
  }, [content]);

  const handleChange = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    await onSave(form);
    setSaving(false);
  };

  return (
    <div>
      <h2 className="admin-page-title">Edit Content</h2>
      <form className="admin-content-form" onSubmit={handleSubmit}>
        {fields.map(f => (
          <div key={f.key} className="admin-field">
            <label>{f.label}</label>
            {f.type === 'textarea' ? (
              <textarea
                value={form[f.key] || ''}
                onChange={e => handleChange(f.key, e.target.value)}
                rows={5}
              />
            ) : (
              <input
                type="text"
                value={form[f.key] || ''}
                onChange={e => handleChange(f.key, e.target.value)}
              />
            )}
          </div>
        ))}
        <button type="submit" className="admin-btn admin-btn--primary" disabled={saving}>
          {saving ? 'Saving...' : 'Save Content'}
        </button>
      </form>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════ */
/*  Events Editor Tab                                             */
/* ═══════════════════════════════════════════════════════════════ */
function EventsEditorTab({ events, rsvps, onAdd, onDelete, onRefresh }) {
  const EMPTY_FORM = { name: '', subtitle: '', date: '', time: '', venue: '', address: '', description: '', guests_attending: '', icon: '', map_link: '', calendar_link: '', costPerGuest: '' };
  const [form, setForm] = useState(EMPTY_FORM);
  const [adding, setAdding] = useState(false);
  const [expandedEvent, setExpandedEvent] = useState(null);

  // Edit state
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.name || !form.date) return;
    setAdding(true);
    await onAdd({ ...form, costPerGuest: Number(form.costPerGuest) || 0 });
    setForm(EMPTY_FORM);
    setAdding(false);
  };

  const handleStartEdit = (ev) => {
    setEditingId(ev._id || ev.id);
    setExpandedEvent(null); // close attendee panel when editing
    setEditForm({
      name: ev.name || '',
      subtitle: ev.subtitle || '',
      date: ev.date || '',
      time: ev.time || '',
      venue: ev.venue || '',
      address: ev.address || '',
      description: ev.description || '',
      guests_attending: ev.guestsAttending || '',
      icon: ev.icon || '',
      map_link: ev.mapLink || '',
      calendar_link: ev.calendarLink || '',
      costPerGuest: ev.costPerGuest != null ? String(ev.costPerGuest) : '',
    });
  };

  const handleSaveEdit = async (evId) => {
    if (!editForm.name || !editForm.date) return;
    setSaving(true);
    try {
      await patchEvent(evId, { ...editForm, costPerGuest: Number(editForm.costPerGuest) || 0 });
      onRefresh();
      setEditingId(null);
    } catch (err) {
      console.error(err);
    }
    setSaving(false);
  };

  const handleMove = async (index, dir) => {
    if (dir === -1 && index === 0) return;
    if (dir === 1 && index === events.length - 1) return;
    const newEvents = [...events];
    const temp = newEvents[index];
    newEvents[index] = newEvents[index + dir];
    newEvents[index + dir] = temp;
    await updateEvents(newEvents.map((ev, i) => ({ ...ev, sort_order: i })));
    onRefresh();
  };

  const eventAttendees = {};
  (rsvps || []).forEach(r => {
    if (r.attending === 'yes' && r.events && r.events.length > 0) {
      r.events.forEach(ev => {
        if (!eventAttendees[ev.eventName]) eventAttendees[ev.eventName] = [];
        eventAttendees[ev.eventName].push({
          name: r.name,
          phone: r.phone,
          adults: ev.adults || 0,
          kids: ev.kids || 0,
          total: (ev.adults || 0) + (ev.kids || 0),
        });
      });
    }
  });

  return (
    <div>
      <h2 className="admin-page-title">Wedding Events</h2>

      {/* Existing events */}
      <div className="admin-section">
        <h3 className="admin-section-title">Current Events</h3>
        {(!events || events.length === 0) ? (
          <p className="admin-empty">No events yet</p>
        ) : (
          <div className="admin-cards-list">
            {events.map((ev, i) => {
              const evId = ev.id || ev._id;
              const attendees = eventAttendees[ev.name] || [];
              const totalGuests = attendees.reduce((sum, a) => sum + a.total, 0);
              const totalAdults = attendees.reduce((sum, a) => sum + a.adults, 0);
              const totalKids = attendees.reduce((sum, a) => sum + a.kids, 0);
              const isExpanded = expandedEvent === evId;

              return (
                <div key={evId} style={{ border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden', marginBottom: '12px', background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>

                  {/* ── Event header row ── */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', gap: '16px' }}>
                    <div className="admin-list-card__info" style={{ flex: 1, margin: 0 }}>
                      <strong>{ev.icon} {ev.name}</strong>
                      <span style={{color: 'var(--color-gold-dark)'}}>{ev.subtitle}</span>
                      <span>{ev.date} {ev.time && `· ${ev.time}`}</span>
                      <span>{ev.venue}</span>
                      {ev.costPerGuest > 0 && <span style={{fontSize: '0.8rem', color: '#22c55e', fontWeight: 'bold'}}>Cost per guest: ₹{ev.costPerGuest}</span>}
                    </div>

                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexShrink: 0 }}>
                      <button
                        onClick={() => setExpandedEvent(isExpanded ? null : evId)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '6px',
                          background: attendees.length > 0 ? '#6366f112' : '#f4f6f9',
                          color: attendees.length > 0 ? '#6366f1' : '#a0aec0',
                          border: `1px solid ${attendees.length > 0 ? '#6366f130' : '#e2e8f0'}`,
                          borderRadius: '20px', padding: '7px 14px',
                          fontSize: '0.82rem', fontWeight: '600', cursor: 'pointer',
                          transition: 'all 0.2s', whiteSpace: 'nowrap',
                        }}
                        title="View attendees"
                      >
                        <FiUsers style={{ fontSize: '0.9rem' }} />
                        {totalGuests} guests · {attendees.length} RSVPs
                        <span style={{ marginLeft: '4px', fontSize: '0.65rem', opacity: 0.7 }}>
                          {isExpanded ? '▲' : '▼'}
                        </span>
                      </button>

                      {/* Edit button */}
                      <button
                        className="admin-icon-btn"
                        title="Edit event"
                        onClick={() => editingId === evId ? setEditingId(null) : handleStartEdit(ev)}
                        style={{ color: editingId === evId ? '#6366f1' : undefined, background: editingId === evId ? '#6366f110' : undefined }}
                      >
                        <FiEdit2 />
                      </button>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <button className="admin-icon-btn" onClick={() => handleMove(i, -1)} disabled={i === 0}><FiArrowUp /></button>
                        <button className="admin-icon-btn" onClick={() => handleMove(i, 1)} disabled={i === events.length - 1}><FiArrowDown /></button>
                      </div>
                      <button className="admin-icon-btn admin-icon-btn--danger" onClick={() => onDelete(ev._id || ev.id)}>
                        <FiTrash2 />
                      </button>
                    </div>
                  </div>

                  {/* ── Inline Edit Panel ── */}
                  {editingId === evId && (
                    <div style={{ borderTop: '2px solid #6366f120', padding: '20px', background: '#f8f8ff' }}>
                      <div style={{ fontWeight: '700', fontSize: '0.9rem', color: '#6366f1', marginBottom: '16px' }}>✏️ Edit Event</div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                        {[
                          { key: 'name',             label: 'Event Name *',           full: false },
                          { key: 'subtitle',         label: 'Subtitle',               full: false },
                          { key: 'date',             label: 'Date *',                 full: false },
                          { key: 'time',             label: 'Time',                   full: false },
                          { key: 'venue',            label: 'Venue Name',             full: false },
                          { key: 'address',          label: 'Full Address',           full: false },
                          { key: 'icon',             label: 'Icon Emoji',             full: false },
                          { key: 'costPerGuest',     label: 'Cost per Guest (₹)',     full: false },
                          { key: 'map_link',         label: 'Map Link URL',           full: false },
                          { key: 'calendar_link',    label: 'Calendar Link URL',      full: false },
                          { key: 'guests_attending', label: 'Guests Attending label', full: false },
                          { key: 'description',      label: 'Description',            full: true  },
                        ].map(f => (
                          <input
                            key={f.key}
                            placeholder={f.label}
                            value={editForm[f.key]}
                            onChange={e => setEditForm({ ...editForm, [f.key]: e.target.value })}
                            type={f.key === 'costPerGuest' ? 'number' : 'text'}
                            style={{ gridColumn: f.full ? '1 / -1' : undefined, padding: '9px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.85rem', outline: 'none', background: '#fff' }}
                          />
                        ))}
                      </div>
                      <div style={{ display: 'flex', gap: '10px', marginTop: '14px' }}>
                        <button
                          onClick={() => handleSaveEdit(evId)}
                          disabled={saving}
                          style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#6366f1', color: '#fff', border: 'none', borderRadius: '8px', padding: '9px 20px', fontWeight: '600', fontSize: '0.85rem', cursor: 'pointer' }}
                        >
                          <FiSave /> {saving ? 'Saving…' : 'Save Changes'}
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#f1f5f9', color: '#64748b', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '9px 20px', fontWeight: '600', fontSize: '0.85rem', cursor: 'pointer' }}
                        >
                          <FiX /> Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  {/* ── Expandable attendee panel ── */}
                  {isExpanded && (
                    <div style={{ borderTop: '2px solid #eef2ff', padding: '20px', background: '#f8f9ff' }}>

                      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '20px' }}>
                        {[
                          { label: 'Total RSVPs', value: attendees.length, color: '#6366f1', bg: '#6366f110' },
                          { label: 'Total Guests', value: totalGuests,    color: '#0ea5e9', bg: '#0ea5e910' },
                          { label: 'Adults',       value: totalAdults,    color: '#f59e0b', bg: '#f59e0b10' },
                          { label: 'Kids',         value: totalKids,      color: '#8b5cf6', bg: '#8b5cf610' },
                          ...(ev.costPerGuest > 0
                            ? [{ label: 'Est. Cost', value: `₹${(totalGuests * ev.costPerGuest).toLocaleString()}`, color: '#22c55e', bg: '#22c55e10' }]
                            : []
                          ),
                        ].map(chip => (
                          <div key={chip.label} style={{ background: chip.bg, border: `1px solid ${chip.color}22`, borderRadius: '10px', padding: '10px 16px', textAlign: 'center', minWidth: '80px' }}>
                            <div style={{ fontSize: '1.3rem', fontWeight: '700', color: chip.color, lineHeight: 1 }}>{chip.value}</div>
                            <div style={{ fontSize: '0.68rem', color: '#718096', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: '4px' }}>{chip.label}</div>
                          </div>
                        ))}
                      </div>

                      {attendees.length === 0 ? (
                        <p style={{ color: '#a0aec0', fontStyle: 'italic', textAlign: 'center', padding: '16px' }}>No RSVPs for this event yet</p>
                      ) : (
                        <div style={{ background: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 130px 60px 60px 60px', gap: '0', padding: '9px 14px', background: '#f7fafc', borderBottom: '1px solid #e2e8f0', fontSize: '0.68rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.07em', color: '#718096' }}>
                            <span>Name</span>
                            <span>Phone</span>
                            <span style={{ textAlign: 'center' }}>Adults</span>
                            <span style={{ textAlign: 'center' }}>Kids</span>
                            <span style={{ textAlign: 'center' }}>Total</span>
                          </div>
                          {attendees.map((a, idx) => (
                            <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1fr 130px 60px 60px 60px', gap: '0', padding: '10px 14px', background: idx % 2 === 0 ? '#fff' : '#fafcff', borderBottom: idx < attendees.length - 1 ? '1px solid #f0f4f8' : 'none', alignItems: 'center' }}>
                              <div style={{ fontWeight: '600', fontSize: '0.88rem', color: '#2d3748' }}>{a.name}</div>
                              <div style={{ fontSize: '0.8rem', color: '#718096' }}>{a.phone || '—'}</div>
                              <div style={{ textAlign: 'center', fontWeight: '600', color: '#f59e0b', fontSize: '0.9rem' }}>{a.adults}</div>
                              <div style={{ textAlign: 'center', fontWeight: '600', color: '#8b5cf6', fontSize: '0.9rem' }}>{a.kids}</div>
                              <div style={{ textAlign: 'center', fontWeight: '700', color: '#1a202c', fontSize: '0.9rem' }}>{a.total}</div>
                            </div>
                          ))}
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 130px 60px 60px 60px', gap: '0', padding: '10px 14px', background: '#f7fafc', borderTop: '2px solid #e2e8f0', fontSize: '0.82rem', fontWeight: '700', color: '#2d3748' }}>
                            <span>Total ({attendees.length} RSVPs)</span>
                            <span></span>
                            <span style={{ textAlign: 'center', color: '#f59e0b' }}>{totalAdults}</span>
                            <span style={{ textAlign: 'center', color: '#8b5cf6' }}>{totalKids}</span>
                            <span style={{ textAlign: 'center', color: '#0ea5e9' }}>{totalGuests}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add new */}
      <div className="admin-section">
        <h3 className="admin-section-title">Add New Event</h3>
        <form className="admin-inline-form" onSubmit={handleAdd}>
          <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', width: '100%'}}>
            <input placeholder="Event Name *" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
            <input placeholder="Subtitle (e.g. THE SACRED ENGAGEMENT)" value={form.subtitle} onChange={e => setForm({...form, subtitle: e.target.value})} />
            <input placeholder="Date (e.g. June 19, 2026) *" value={form.date} onChange={e => setForm({...form, date: e.target.value})} required />
            <input placeholder="Time (e.g. 11:50 AM)" value={form.time} onChange={e => setForm({...form, time: e.target.value})} />
            <input placeholder="Venue Name" value={form.venue} onChange={e => setForm({...form, venue: e.target.value})} />
            <input placeholder="Full Address" value={form.address} onChange={e => setForm({...form, address: e.target.value})} />
            <input placeholder="Guests Attending (e.g. 74 GUESTS ATTENDING)" value={form.guests_attending} onChange={e => setForm({...form, guests_attending: e.target.value})} />
            <input placeholder="Icon Emoji (e.g. 💍)" value={form.icon} onChange={e => setForm({...form, icon: e.target.value})} />
            <input placeholder="Map Link URL" value={form.map_link} onChange={e => setForm({...form, map_link: e.target.value})} />
            <input placeholder="Calendar Link URL" value={form.calendar_link} onChange={e => setForm({...form, calendar_link: e.target.value})} />
            <input placeholder="Cost per Guest (₹)" type="number" value={form.costPerGuest} onChange={e => setForm({...form, costPerGuest: e.target.value})} />
            <input placeholder="Description" style={{gridColumn: '1 / -1'}} value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
          </div>
          <button type="submit" className="admin-btn admin-btn--primary" disabled={adding} style={{marginTop: '16px'}}>
            <FiPlus /> {adding ? 'Adding...' : 'Add Event'}
          </button>
        </form>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════ */
/*  Menu Editor Tab                                               */
/* ═══════════════════════════════════════════════════════════════ */
function MenuEditorTab({ menu, onAdd, onDelete }) {
  const [form, setForm] = useState({ category: 'Starters', name: '', description: '', is_veg: true });
  const [adding, setAdding] = useState(false);
  const categories = ['Starters', 'Main Course', 'Desserts', 'Beverages'];

  const grouped = {};
  (menu || []).forEach(item => {
    const cat = item.category || 'Other';
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(item);
  });

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.name) return;
    setAdding(true);
    await onAdd(form);
    setForm({ category: 'Starters', name: '', description: '', is_veg: true });
    setAdding(false);
  };

  return (
    <div>
      <h2 className="admin-page-title">Food Menu</h2>

      {Object.entries(grouped).map(([cat, items]) => (
        <div key={cat} className="admin-section">
          <h3 className="admin-section-title">{cat}</h3>
          <div className="admin-cards-list">
            {items.map(item => (
              <div key={item._id || item.id} className="admin-list-card">
                <div className="admin-list-card__info">
                  <strong>
                    <span style={{ color: item.is_veg ? '#22c55e' : '#ef4444', marginRight: 6 }}>●</span>
                    {item.name}
                  </strong>
                  <span>{item.description}</span>
                </div>
                <button className="admin-icon-btn admin-icon-btn--danger" onClick={() => onDelete(item._id || item.id)}>
                  <FiTrash2 />
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="admin-section">
        <h3 className="admin-section-title">Add Menu Item</h3>
        <form className="admin-inline-form" onSubmit={handleAdd}>
          <select value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <input placeholder="Item Name *" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
          <input placeholder="Description" value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
          <label className="admin-checkbox">
            <input type="checkbox" checked={form.is_veg} onChange={e => setForm({...form, is_veg: e.target.checked})} />
            Vegetarian
          </label>
          <button type="submit" className="admin-btn admin-btn--primary" disabled={adding}>
            <FiPlus /> {adding ? 'Adding...' : 'Add Item'}
          </button>
        </form>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════ */
/*  Media Editor Tab                                              */
/* ═══════════════════════════════════════════════════════════════ */
function MediaEditorTab({ media, onAdd, onDelete }) {
  const [form, setForm] = useState({ title: '', url: '' });
  const [adding, setAdding] = useState(false);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.url) return;
    setAdding(true);
    await onAdd(form);
    setForm({ title: '', url: '' });
    setAdding(false);
  };

  return (
    <div>
      <h2 className="admin-page-title">Media / Videos</h2>

      <div className="admin-section">
        <h3 className="admin-section-title">YouTube Videos</h3>
        {(!media || media.length === 0) ? (
          <p className="admin-empty">No videos added</p>
        ) : (
          <div className="admin-cards-list">
            {media.map(m => (
              <div key={m._id || m.id} className="admin-list-card">
                <div className="admin-list-card__info">
                  <strong>{m.title || 'Untitled'}</strong>
                  <a href={m.url} target="_blank" rel="noopener noreferrer" style={{ color: '#6366f1', fontSize: '0.85rem' }}>
                    {m.url}
                  </a>
                </div>
                <button className="admin-icon-btn admin-icon-btn--danger" onClick={() => onDelete(m._id || m.id)}>
                  <FiTrash2 />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="admin-section">
        <h3 className="admin-section-title">Add Video</h3>
        <form className="admin-inline-form" onSubmit={handleAdd}>
          <input placeholder="Video Title" value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
          <input placeholder="YouTube URL *" value={form.url} onChange={e => setForm({...form, url: e.target.value})} required />
          <button type="submit" className="admin-btn admin-btn--primary" disabled={adding}>
            <FiPlus /> {adding ? 'Adding...' : 'Add Video'}
          </button>
        </form>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════ */
/*  Main Admin Component                                          */
/* ═══════════════════════════════════════════════════════════════ */
/* ═══════════════════════════════════════════════════════════════ */
/*  Gifts Editor Tab                                               */
/* ═══════════════════════════════════════════════════════════════ */
function GiftsEditorTab({ gifts, onAdd, onDelete }) {
  const [form, setForm] = useState({ title: '', description: '', type: 'item', icon: '🎁', link: '', details: '' });
  const [adding, setAdding] = useState(false);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.title) return;
    setAdding(true);
    await onAdd(form);
    setForm({ title: '', description: '', type: 'item', icon: '🎁', link: '', details: '' });
    setAdding(false);
  };

  return (
    <div>
      <h2 className="admin-page-title">Gift Registry</h2>

      <div className="admin-section">
        <h3 className="admin-section-title">Current Gift Options</h3>
        {(!gifts || gifts.length === 0) ? (
          <p className="admin-empty">No gift options yet</p>
        ) : (
          <div className="admin-cards-list">
            {gifts.map(g => (
              <div key={g.id || g._id} className="admin-list-card">
                <div className="admin-list-card__info">
                  <strong>{g.icon || '🎁'} {g.title}</strong>
                  <span>{g.description}</span>
                  {g.details && <span style={{ color: '#6366f1', fontSize: '0.85rem' }}>{g.details}</span>}
                  {g.link && <a href={g.link} target="_blank" rel="noopener noreferrer" style={{ color: '#6366f1', fontSize: '0.85rem' }}>{g.link}</a>}
                </div>
                <button className="admin-icon-btn admin-icon-btn--danger" onClick={() => onDelete(g.id || g._id)}>
                  <FiTrash2 />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="admin-section">
        <h3 className="admin-section-title">Add Gift Option</h3>
        <form className="admin-inline-form" onSubmit={handleAdd}>
          <input placeholder="Title *" value={form.title} onChange={e => setForm({...form, title: e.target.value})} required />
          <input placeholder="Description" value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
          <select value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
            <option value="money">💰 Money / UPI</option>
            <option value="link">🔗 Gift Link</option>
            <option value="item">📦 Physical Item</option>
          </select>
          <input placeholder="Icon (emoji)" value={form.icon} onChange={e => setForm({...form, icon: e.target.value})} style={{width: 80}} />
          <input placeholder="Link (optional)" value={form.link} onChange={e => setForm({...form, link: e.target.value})} />
          <input placeholder="Details (UPI ID, bank info, etc.)" value={form.details} onChange={e => setForm({...form, details: e.target.value})} />
          <button type="submit" className="admin-btn admin-btn--primary" disabled={adding}>
            <FiPlus /> {adding ? 'Adding...' : 'Add Gift'}
          </button>
        </form>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════ */
/*  Theme Editor Tab                                               */
/* ═══════════════════════════════════════════════════════════════ */
const PRESET_THEMES = [
  {
    name: 'Midnight Navy',
    emoji: '🌌',
    desc: 'Ultra-premium navy & champagne gold',
    colors: {
      theme_primary: '#0C1A3A', theme_primary_deep: '#060E22', theme_primary_light: '#1A3060',
      theme_secondary: '#0A1530', theme_secondary_dark: '#040A18',
      theme_accent: '#C9B87B', theme_accent_light: '#DED0A0', theme_accent_dark: '#A89858', theme_accent_pale: '#EDE4C4',
      theme_text_primary: '#111111', theme_text_secondary: 'rgba(17,17,17,0.65)', theme_text_accent: '#A89858',
      theme_neutral_1: '#E8E4D8', theme_neutral_2: '#FAFAFA', theme_neutral_3: '#F5F0E8',
    },
  },
  {
    name: 'Royal Burgundy',
    emoji: '🍷',
    desc: 'Classic deep wine & gold',
    colors: {
      theme_primary: '#4A0E1B', theme_primary_deep: '#2D0A12', theme_primary_light: '#6B1D30',
      theme_secondary: '#3A0B15', theme_secondary_dark: '#1A0509',
      theme_accent: '#D4A853', theme_accent_light: '#E8C87A', theme_accent_dark: '#B8922F', theme_accent_pale: '#F0D78C',
      theme_text_primary: '#2C1810', theme_text_secondary: 'rgba(44, 24, 16, 0.65)', theme_text_accent: '#D4A853',
      theme_neutral_1: '#F5E6CC', theme_neutral_2: '#FFF8F0', theme_neutral_3: '#FDF5E8',
      theme_names_font: 'Cormorant Garamond, serif', theme_names_size: '1',
    },
  },
  {
    name: 'Emerald Garden',
    emoji: '🌿',
    desc: 'Lush green & ivory elegance',
    colors: {
      theme_primary: '#0B3D2E', theme_primary_deep: '#072419', theme_primary_light: '#14654E',
      theme_secondary: '#0A3426', theme_secondary_dark: '#041A13',
      theme_accent: '#C9A84C', theme_accent_light: '#DEC06E', theme_accent_dark: '#A88B30', theme_accent_pale: '#EDD88A',
      theme_text_primary: '#162C24', theme_text_secondary: 'rgba(22,44,36,0.65)', theme_text_accent: '#C9A84C',
      theme_neutral_1: '#E8F0E4', theme_neutral_2: '#F5FFF8', theme_neutral_3: '#EAF5E6',
      theme_names_font: 'Cormorant Garamond, serif', theme_names_size: '1',
    },
  },
  {
    name: 'Rose Pink',
    emoji: '🌸',
    desc: 'Blush pink & rose gold warmth',
    colors: {
      theme_primary: '#3D1225', theme_primary_deep: '#260B18', theme_primary_light: '#5C1E3A',
      theme_secondary: '#331020', theme_secondary_dark: '#1A080F',
      theme_accent: '#E8A0B0', theme_accent_light: '#F0BCC8', theme_accent_dark: '#C47888', theme_accent_pale: '#F8D8E0',
      theme_text_primary: '#2A1A20', theme_text_secondary: 'rgba(42,26,32,0.65)', theme_text_accent: '#E8A0B0',
      theme_neutral_1: '#F5E0E4', theme_neutral_2: '#FFF5F7', theme_neutral_3: '#FDEEF0',
      theme_names_font: 'Cormorant Garamond, serif', theme_names_size: '1',
    },
  },
  {
    name: 'Classic White',
    emoji: '🤍',
    desc: 'Timeless white & champagne',
    colors: {
      theme_primary: '#1A1A1A', theme_primary_deep: '#0F0F0F', theme_primary_light: '#2D2D2D',
      theme_secondary: '#151515', theme_secondary_dark: '#0A0A0A',
      theme_accent: '#C9B87B', theme_accent_light: '#DED0A0', theme_accent_dark: '#A89858', theme_accent_pale: '#EDE4C4',
      theme_text_primary: '#111111', theme_text_secondary: 'rgba(17,17,17,0.65)', theme_text_accent: '#C9B87B',
      theme_neutral_1: '#E8E4D8', theme_neutral_2: '#FAFAFA', theme_neutral_3: '#F5F0E8',
      theme_names_font: 'Cormorant Garamond, serif', theme_names_size: '1',
    },
  },
  {
    name: 'Midnight Purple',
    emoji: '🔮',
    desc: 'Deep purple & lavender magic',
    colors: {
      theme_primary: '#1A0A30', theme_primary_deep: '#10061E', theme_primary_light: '#2D1650',
      theme_secondary: '#150828', theme_secondary_dark: '#0A0414',
      theme_accent: '#C0A0E0', theme_accent_light: '#D4BCE8', theme_accent_dark: '#9878C0', theme_accent_pale: '#E8D8F0',
      theme_text_primary: '#1A1028', theme_text_secondary: 'rgba(26,16,40,0.65)', theme_text_accent: '#C0A0E0',
      theme_neutral_1: '#E4D8F0', theme_neutral_2: '#FDFBFF', theme_neutral_3: '#F0E8F8',
      theme_names_font: 'Cormorant Garamond, serif', theme_names_size: '1',
    },
  },
];

const COLOR_GROUPS = [
  {
    label: 'Primary Colors',
    desc: 'Main background and section colors',
    keys: [
      { key: 'theme_primary', label: 'Primary' },
      { key: 'theme_primary_deep', label: 'Deep' },
      { key: 'theme_primary_light', label: 'Light' },
      { key: 'theme_secondary', label: 'Secondary' },
      { key: 'theme_secondary_dark', label: 'Darkest' },
    ],
  },
  {
    label: 'Accent Colors',
    desc: 'Buttons, borders, ornaments & highlights',
    keys: [
      { key: 'theme_accent', label: 'Accent' },
      { key: 'theme_accent_light', label: 'Light' },
      { key: 'theme_accent_dark', label: 'Dark' },
      { key: 'theme_accent_pale', label: 'Pale' },
    ],
  },
  {
    label: 'Text Colors',
    desc: 'Heading, body and accent text',
    keys: [
      { key: 'theme_text_primary', label: 'Primary' },
      { key: 'theme_text_accent', label: 'Accent' },
    ],
  },
  {
    label: 'Neutral Colors',
    desc: 'Light backgrounds and subtle accents',
    keys: [
      { key: 'theme_neutral_1', label: 'Champagne' },
      { key: 'theme_neutral_2', label: 'Ivory' },
      { key: 'theme_neutral_3', label: 'Cream' },
    ],
  },
];

const DEFAULT_THEME = PRESET_THEMES[0].colors;

function ThemeEditorTab({ themeColors, onSave, onReset, showToast }) {
  const [form, setForm] = useState({ ...DEFAULT_THEME });
  const [saving, setSaving] = useState(false);
  const [activePreset, setActivePreset] = useState(null);

  useEffect(() => {
    if (themeColors && Object.keys(themeColors).length > 0) {
      setForm(prev => ({ ...DEFAULT_THEME, ...themeColors }));
      // Detect active preset
      const match = PRESET_THEMES.findIndex(p =>
        Object.entries(p.colors).every(([k, v]) => themeColors[k] === v)
      );
      setActivePreset(match >= 0 ? match : null);
    }
  }, [themeColors]);

  useEffect(() => {
    if (!form.theme_names_font) return;
    const fontName = form.theme_names_font.split(',')[0].replace(/['"]/g, '').trim();
    if (!fontName) return;

    const linkId = 'admin-dynamic-font';
    let link = document.getElementById(linkId);
    if (!link) {
      link = document.createElement('link');
      link.id = linkId;
      link.rel = 'stylesheet';
      document.head.appendChild(link);
    }
    // Only fetch if it doesn't look like a generic system font
    if (!['serif', 'sans-serif', 'cursive', 'monospace', 'system-ui'].includes(fontName.toLowerCase())) {
      link.href = `https://fonts.googleapis.com/css2?family=${fontName.replace(/ /g, '+')}:wght@300;400;500;600&display=swap`;
    }
  }, [form.theme_names_font]);

  const handlePreset = (idx) => {
    setForm({ ...PRESET_THEMES[idx].colors });
    setActivePreset(idx);
  };

  const handleColorChange = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
    setActivePreset(null);
  };

  const handleSave = async () => {
    setSaving(true);
    await onSave(form);
    setSaving(false);
  };

  // Filter out non-hex values for color inputs (like rgba text values)
  const isHex = (v) => /^#[0-9a-fA-F]{6}$/.test(v);

  return (
    <div>
      <h2 className="admin-page-title">Theme Colors</h2>
      <p style={{ color: '#8b8ba0', marginBottom: 28, fontSize: '0.9rem', lineHeight: 1.6 }}>
        Customize your wedding website's color scheme. Pick a preset template or fine-tune individual colors.
      </p>

      {/* ── Preset Palettes ── */}
      <div className="admin-section">
        <h3 className="admin-section-title">Preset Palettes</h3>
        <div className="theme-presets-grid">
          {PRESET_THEMES.map((preset, idx) => (
            <button
              key={preset.name}
              className={`theme-preset-card ${activePreset === idx ? 'theme-preset-card--active' : ''}`}
              onClick={() => handlePreset(idx)}
            >
              <div className="theme-preset-swatches">
                <span style={{ background: preset.colors.theme_primary }} />
                <span style={{ background: preset.colors.theme_primary_light }} />
                <span style={{ background: preset.colors.theme_accent }} />
                <span style={{ background: preset.colors.theme_accent_light }} />
                <span style={{ background: preset.colors.theme_text_primary }} />
              </div>
              <div className="theme-preset-info">
                <strong>{preset.emoji} {preset.name}</strong>
                <span>{preset.desc}</span>
              </div>
              {activePreset === idx && (
                <span className="theme-preset-check"><FiCheck /></span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── Color Picker Groups ── */}
      <div className="admin-section">
        <h3 className="admin-section-title">Customize Colors</h3>
        <div className="theme-groups-grid">
          {COLOR_GROUPS.map(group => (
            <div key={group.label} className="theme-color-group">
              <div className="theme-color-group__header">
                <strong>{group.label}</strong>
                <span>{group.desc}</span>
              </div>
              <div className="theme-color-group__pickers">
                {group.keys.map(({ key, label }) => {
                  const val = form[key] || '#000000';
                  const hexVal = isHex(val) ? val : '#CCCCCC';
                  return (
                    <div key={key} className="theme-color-picker">
                      <div className="theme-color-picker__swatch-wrap">
                        <input
                          type="color"
                          value={hexVal}
                          onChange={(e) => handleColorChange(key, e.target.value)}
                          className="theme-color-picker__input"
                        />
                        <div
                          className="theme-color-picker__swatch"
                          style={{ background: val }}
                        />
                      </div>
                      <span className="theme-color-picker__label">{label}</span>
                      <span className="theme-color-picker__hex">{isHex(val) ? val : '—'}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Typography Settings ── */}
      <div className="admin-section">
        <h3 className="admin-section-title">Typography (Bride & Groom Names)</h3>
        <p style={{ fontSize: '0.85rem', color: '#718096', marginBottom: '16px' }}>Customize the font family and size specifically for the names on the Home page and Family section.</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', maxWidth: '600px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: '#4a5568', fontWeight: 600, marginBottom: '8px' }}>Font Family</label>
            <input 
              type="text" 
              className="admin-input" 
              value={form.theme_names_font || ''} 
              onChange={e => handleColorChange('theme_names_font', e.target.value)} 
              placeholder="e.g. 'Great Vibes', cursive"
            />
            <span style={{ fontSize: '0.75rem', color: '#a0aec0', display: 'block', marginTop: '4px' }}>Include fallback fonts (e.g., serif).</span>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: '#4a5568', fontWeight: 600, marginBottom: '8px' }}>Size Scale</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <input 
                type="range" 
                min="0.5" 
                max="2.5" 
                step="0.05" 
                value={form.theme_names_size || 1} 
                onChange={e => handleColorChange('theme_names_size', e.target.value)} 
                style={{ flex: 1 }}
              />
              <span style={{ fontSize: '0.9rem', color: '#2d3748', minWidth: '40px' }}>{Number(form.theme_names_size || 1).toFixed(2)}x</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Live Preview ── */}
      <div className="admin-section">
        <h3 className="admin-section-title">Live Preview</h3>
        <div className="theme-preview" style={{
          background: `linear-gradient(135deg, ${form.theme_primary_deep} 0%, ${form.theme_primary} 50%, ${form.theme_primary_light} 100%)`,
          border: `1px solid ${form.theme_accent}30`,
        }}>
          <div className="theme-preview__header" style={{ color: form.theme_text_primary }}>
            <span style={{ fontFamily: 'var(--font-cursive)', fontSize: '1.8rem', color: form.theme_accent }}>
              Preview
            </span>
            <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', color: form.theme_text_primary }}>
              Wedding Invitation
            </h4>
            <p style={{ color: form.theme_text_accent, fontSize: '0.9rem' }}>
              This is how your accent text looks
            </p>
          </div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
            <button style={{
              background: `linear-gradient(135deg, ${form.theme_accent}, ${form.theme_accent_pale})`,
              color: form.theme_primary_deep,
              padding: '10px 24px', borderRadius: 999, border: 'none',
              fontWeight: 600, fontSize: '0.85rem', cursor: 'default',
            }}>
              Gold Button
            </button>
            <button style={{
              background: 'transparent', color: form.theme_accent,
              border: `1px solid ${form.theme_accent}`,
              padding: '10px 24px', borderRadius: 999,
              fontWeight: 600, fontSize: '0.85rem', cursor: 'default',
            }}>
              Outline Button
            </button>
          </div>
          <div style={{
            marginTop: 16, padding: 16, borderRadius: 10,
            background: `${form.theme_text_primary}0a`,
            border: `1px solid ${form.theme_accent}20`,
            textAlign: 'center',
          }}>
            <span style={{ color: form.theme_text_primary, fontSize: '0.85rem' }}>Sample card with glass effect</span>
          </div>
        </div>

        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <h1 style={{ 
            fontFamily: form.theme_names_font || 'var(--font-heading)', 
            fontSize: `calc(3.5rem * ${form.theme_names_size || 1})`, 
            color: form.theme_accent,
            lineHeight: 1,
            margin: '20px 0'
          }}>
            Ranjith <span style={{ color: form.theme_accent, fontSize: '0.7em' }}>&</span> Nithya
          </h1>
        </div>

      </div>

      {/* ── Actions ── */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 8 }}>
        <button className="admin-btn admin-btn--primary" onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : '💾 Save Theme'}
        </button>
        <button className="admin-btn admin-btn--outline" onClick={onReset}>
          <FiRefreshCw /> Reset to Default
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════ */
/*  Translations Editor Tab                                        */
/* ═══════════════════════════════════════════════════════════════ */
function TranslationsEditorTab({ translations, onSave }) {
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm(translations || {});
  }, [translations]);

  const handleChange = (key, field, value) => {
    setForm(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        [field]: value
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    await onSave(form);
    setSaving(false);
  };

  return (
    <div>
      <h2 className="admin-page-title">Telugu Translations</h2>
      <p style={{ color: '#8b8ba0', marginBottom: 28, fontSize: '0.9rem', lineHeight: 1.6 }}>
        Update the Telugu text for the various parts of the website. English text is provided for reference.
      </p>
      <form className="admin-content-form" onSubmit={handleSubmit} style={{ gridTemplateColumns: '1fr', maxWidth: '900px' }}>
        {Object.entries(form).map(([key, val]) => (
          <div key={key} className="admin-field" style={{ background: '#fff', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '12px' }}>
            <label style={{ fontSize: '0.75rem', color: '#6366f1', marginBottom: '4px' }}>{key}</label>
            <div style={{ fontSize: '0.9rem', color: '#4a5568', marginBottom: '8px', padding: '8px', background: '#f7fafc', borderRadius: '4px' }}>
              <strong>English:</strong> {val.en}
            </div>
            <textarea
              value={val.te || ''}
              onChange={e => handleChange(key, 'te', e.target.value)}
              rows={2}
              placeholder="Telugu translation"
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e0', fontFamily: 'inherit' }}
            />
          </div>
        ))}
        <button type="submit" className="admin-btn admin-btn--primary" disabled={saving}>
          {saving ? 'Saving...' : 'Save Translations'}
        </button>
      </form>
    </div>
  );
}

const tabs = [
  { id: 'dashboard', label: 'Dashboard', icon: FiHome },
  { id: 'guests', label: 'Guest List', icon: FiUsers },
  { id: 'content', label: 'Edit Content', icon: FiEdit },
  { id: 'events', label: 'Events', icon: FiCalendar },
  { id: 'menu', label: 'Food Menu', icon: FiCoffee },
  { id: 'media', label: 'Media', icon: FiFilm },
  { id: 'gifts', label: 'Gifts', icon: FiGift },
  { id: 'translations', label: 'Translations', icon: FiGlobe },
  { id: 'theme', label: 'Theme Colors', icon: FiDroplet },
];

export default function Admin() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [rsvps, setRsvps] = useState([]);
  const [stats, setStats] = useState({});
  const [content, setContent] = useState({});
  const [events, setEvents] = useState([]);
  const [menu, setMenu] = useState([]);
  const [media, setMedia] = useState([]);
  const [gifts, setGifts] = useState([]);
  const [translations, setTranslations] = useState({});
  const [themeColors, setThemeColors] = useState({});
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
  }, []);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [rsvpData, statsData, contentData, eventsData, menuData, mediaData, giftsData, themeData, translationsData] = await Promise.allSettled([
        fetchRSVPs(),
        fetchRSVPStats(),
        fetchContent(),
        fetchEvents(),
        fetchMenu(),
        fetchMedia(),
        fetchGifts(),
        fetchTheme(),
        fetchTranslations(),
      ]);

      if (rsvpData.status === 'fulfilled') setRsvps(rsvpData.value || []);
      if (statsData.status === 'fulfilled') setStats(statsData.value || {});
      if (contentData.status === 'fulfilled') {
        const obj = {};
        if (Array.isArray(contentData.value)) {
          contentData.value.forEach(item => { obj[item.key] = item.value; });
        } else {
          Object.assign(obj, contentData.value);
        }
        setContent(obj);
      }
      if (eventsData.status === 'fulfilled') setEvents(eventsData.value || []);
      if (menuData.status === 'fulfilled') {
        const raw = menuData.value || [];
        if (Array.isArray(raw)) {
          setMenu(raw);
        } else if (typeof raw === 'object') {
          const flat = [];
          Object.entries(raw).forEach(([category, items]) => {
            if (Array.isArray(items)) {
              items.forEach(item => flat.push({ ...item, category, name: item.item_name || item.name }));
            }
          });
          setMenu(flat);
        }
      }
      if (mediaData.status === 'fulfilled') setMedia(mediaData.value || []);
      if (giftsData.status === 'fulfilled') setGifts(giftsData.value || []);
      if (themeData.status === 'fulfilled') setThemeColors(themeData.value || {});
      if (translationsData.status === 'fulfilled') setTranslations(translationsData.value || {});
    } catch (err) {
      showToast('Failed to load data', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  // Verify token on mount
  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      navigate('/admin/login');
      return;
    }
    verifyToken().catch(() => {
      localStorage.removeItem('admin_token');
      navigate('/admin/login');
    });
    loadData();
  }, [navigate, loadData]);

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    navigate('/admin/login');
  };

  // CRUD handlers
  const handleDeleteRSVP = async (id) => {
    if (!window.confirm('Delete this RSVP?')) return;
    try {
      await deleteRSVP(id);
      showToast('RSVP deleted');
      loadData();
    } catch { showToast('Failed to delete', 'error'); }
  };

  const handleSaveContent = async (data) => {
    try {
      await updateContent(data);
      showToast('Content saved');
      loadData();
    } catch { showToast('Failed to save', 'error'); }
  };

  const handleAddEvent = async (data) => {
    try {
      await addEvent(data);
      showToast('Event added');
      loadData();
    } catch { showToast('Failed to add event', 'error'); }
  };

  const handleDeleteEvent = async (id) => {
    if (!window.confirm('Delete this event?')) return;
    try {
      await deleteEvent(id);
      showToast('Event deleted');
      loadData();
    } catch { showToast('Failed to delete', 'error'); }
  };

  const handleAddMenuItem = async (data) => {
    try {
      await addMenuItem(data);
      showToast('Menu item added');
      loadData();
    } catch { showToast('Failed to add item', 'error'); }
  };

  const handleDeleteMenuItem = async (id) => {
    if (!window.confirm('Delete this item?')) return;
    try {
      await deleteMenuItem(id);
      showToast('Item deleted');
      loadData();
    } catch { showToast('Failed to delete', 'error'); }
  };

  const handleAddMedia = async (data) => {
    try {
      await addMedia(data);
      showToast('Video added');
      loadData();
    } catch { showToast('Failed to add video', 'error'); }
  };

  const handleDeleteMedia = async (id) => {
    if (!window.confirm('Delete this video?')) return;
    try {
      await deleteMedia(id);
      showToast('Video deleted');
      loadData();
    } catch { showToast('Failed to delete', 'error'); }
  };

  const handleAddGift = async (data) => {
    try {
      await addGift(data);
      showToast('Gift option added');
      loadData();
    } catch { showToast('Failed to add gift', 'error'); }
  };

  const handleDeleteGift = async (id) => {
    if (!window.confirm('Delete this gift option?')) return;
    try {
      await deleteGift(id);
      showToast('Gift deleted');
      loadData();
    } catch { showToast('Failed to delete', 'error'); }
  };

  const handleSaveTheme = async (data) => {
    try {
      await updateTheme(data);
      showToast('Theme colors saved');
      loadData();
    } catch { showToast('Failed to save theme', 'error'); }
  };

  const handleResetTheme = async () => {
    if (!window.confirm('Reset theme to default colors?')) return;
    try {
      await resetTheme();
      showToast('Theme reset to defaults');
      loadData();
    } catch { showToast('Failed to reset theme', 'error'); }
  };

  const handleSaveTranslations = async (data) => {
    try {
      await updateTranslations(data);
      showToast('Translations saved');
      loadData();
    } catch { showToast('Failed to save translations', 'error'); }
  };

  const renderTab = () => {
    switch (activeTab) {
      case 'dashboard': return <DashboardTab rsvps={rsvps} stats={stats} events={events} />;
      case 'guests': return <GuestListTab rsvps={rsvps} events={events} onDelete={handleDeleteRSVP} onRefresh={loadData} />;
      case 'content': return <ContentEditorTab content={content} onSave={handleSaveContent} />;
      case 'events': return <EventsEditorTab events={events} rsvps={rsvps} onAdd={handleAddEvent} onDelete={handleDeleteEvent} onRefresh={loadData} />;
      case 'menu': return <MenuEditorTab menu={menu} onAdd={handleAddMenuItem} onDelete={handleDeleteMenuItem} />;
      case 'media': return <MediaEditorTab media={media} onAdd={handleAddMedia} onDelete={handleDeleteMedia} />;
      case 'gifts': return <GiftsEditorTab gifts={gifts} onAdd={handleAddGift} onDelete={handleDeleteGift} />;
      case 'translations': return <TranslationsEditorTab translations={translations} onSave={handleSaveTranslations} />;
      case 'theme': return <ThemeEditorTab themeColors={themeColors} onSave={handleSaveTheme} onReset={handleResetTheme} showToast={showToast} />;
      default: return null;
    }
  };

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="admin-loading__spinner" />
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="admin">
      {/* Toast */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Mobile header */}
      <div className="admin-mobile-header">
        <button className="admin-hamburger" onClick={() => setSidebarOpen(!sidebarOpen)}>
          ☰
        </button>
        <span className="admin-mobile-title">Admin</span>
      </div>

      {/* Sidebar overlay */}
      {sidebarOpen && <div className="admin-overlay" onClick={() => setSidebarOpen(false)} />}

      {/* Sidebar */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'admin-sidebar--open' : ''}`}>
        <div className="admin-sidebar__header">
          <h2 className="admin-sidebar__title">#NIRA</h2>
          <span className="admin-sidebar__badge">Admin</span>
        </div>

        <nav className="admin-sidebar__nav">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`admin-sidebar__link ${activeTab === tab.id ? 'admin-sidebar__link--active' : ''}`}
              onClick={() => { setActiveTab(tab.id); setSidebarOpen(false); }}
            >
              <tab.icon />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>

        <div className="admin-sidebar__footer">
          <a href="/" target="_blank" rel="noopener noreferrer" className="admin-sidebar__link">
            <FiExternalLink />
            <span>View Site</span>
          </a>
          <button className="admin-sidebar__link admin-sidebar__link--logout" onClick={handleLogout}>
            <FiLogOut />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="admin-main">
        {renderTab()}
      </main>

      <style>{`
        /* ─── Admin Layout ─── */
        .admin {
          display: flex;
          min-height: 100vh;
          background: #f4f6f9;
          color: #2d3748;
          font-family: var(--font-body);
        }

        /* ─── Loading ─── */
        .admin-loading {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: #f4f6f9;
          color: #718096;
          gap: 16px;
        }

        .admin-loading__spinner {
          width: 36px;
          height: 36px;
          border: 3px solid #e2e8f0;
          border-top-color: #667eea;
          border-radius: 50%;
          animation: rotate 0.8s linear infinite;
        }

        /* ─── Mobile Header ─── */
        .admin-mobile-header {
          display: none;
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          height: 56px;
          background: #ffffff;
          border-bottom: 1px solid #e2e8f0;
          align-items: center;
          padding: 0 16px;
          gap: 12px;
          z-index: 200;
          box-shadow: 0 1px 3px rgba(0,0,0,0.08);
        }

        .admin-hamburger {
          font-size: 1.3rem;
          color: #4a5568;
          background: none;
          border: none;
          cursor: pointer;
          padding: 8px;
        }

        .admin-mobile-title {
          font-weight: 600;
          font-size: 1rem;
          color: #2d3748;
        }

        .admin-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.3);
          z-index: 299;
        }

        /* ─── Sidebar ─── */
        .admin-sidebar {
          width: 260px;
          min-height: 100vh;
          background: #ffffff;
          border-right: 1px solid #e2e8f0;
          display: flex;
          flex-direction: column;
          position: fixed;
          left: 0;
          top: 0;
          bottom: 0;
          z-index: 300;
          box-shadow: 2px 0 8px rgba(0,0,0,0.04);
        }

        .admin-sidebar__header {
          padding: 24px 20px;
          border-bottom: 1px solid #edf2f7;
          background: linear-gradient(135deg, #667eea08 0%, #764ba208 100%);
        }

        .admin-sidebar__title {
          font-family: var(--font-body);
          font-size: 1.2rem;
          font-weight: 700;
          color: #2d3748;
          margin-bottom: 4px;
        }

        .admin-sidebar__badge {
          font-size: 0.7rem;
          color: #667eea;
          background: #eef2ff;
          padding: 2px 8px;
          border-radius: 10px;
          font-weight: 600;
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }

        .admin-sidebar__nav {
          flex: 1;
          padding: 12px 8px;
          display: flex;
          flex-direction: column;
          gap: 2px;
          overflow-y: auto;
        }

        .admin-sidebar__link {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 14px;
          font-size: 0.9rem;
          color: #718096;
          border-radius: 8px;
          transition: all 0.15s;
          text-decoration: none;
          width: 100%;
          text-align: left;
          background: none;
          border: none;
          cursor: pointer;
          font-family: inherit;
        }

        .admin-sidebar__link:hover {
          background: #f7fafc;
          color: #4a5568;
        }

        .admin-sidebar__link--active {
          background: #eef2ff;
          color: #667eea;
          font-weight: 600;
        }

        .admin-sidebar__link--logout {
          color: #e53e3e;
        }

        .admin-sidebar__link--logout:hover {
          background: #fff5f5;
          color: #c53030;
        }

        .admin-sidebar__footer {
          padding: 12px 8px;
          border-top: 1px solid #edf2f7;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        /* ─── Main ─── */
        .admin-main {
          flex: 1;
          margin-left: 260px;
          padding: 32px;
          min-height: 100vh;
        }

        .admin-page-title {
          font-family: var(--font-body);
          font-size: 1.5rem;
          font-weight: 700;
          color: #1a202c;
          margin-bottom: 24px;
        }

        /* ─── Stats grid ─── */
        .admin-stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
          gap: 16px;
          margin-bottom: 32px;
        }

        .admin-stat-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 20px;
          border-top: 3px solid;
          box-shadow: 0 1px 3px rgba(0,0,0,0.06);
        }

        .admin-stat-value {
          font-size: 2rem;
          font-weight: 700;
          display: block;
          line-height: 1;
          margin-bottom: 6px;
        }

        .admin-stat-label {
          font-size: 0.8rem;
          color: #718096;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        /* ─── Sections ─── */
        .admin-section {
          margin-bottom: 32px;
        }

        .admin-section-title {
          font-size: 0.8rem;
          font-weight: 600;
          color: #718096;
          margin-bottom: 16px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .admin-empty {
          color: #a0aec0;
          font-style: italic;
          padding: 20px;
          text-align: center;
          background: #ffffff;
          border-radius: 8px;
          border: 1px dashed #cbd5e0;
        }

        /* ─── Table ─── */
        .admin-table-wrap {
          overflow-x: auto;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
          box-shadow: 0 1px 3px rgba(0,0,0,0.04);
        }

        .admin-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.85rem;
        }

        .admin-table th {
          padding: 12px 14px;
          text-align: left;
          background: #f7fafc;
          color: #718096;
          font-weight: 600;
          text-transform: uppercase;
          font-size: 0.7rem;
          letter-spacing: 0.08em;
          border-bottom: 1px solid #e2e8f0;
          white-space: nowrap;
        }

        .admin-table td {
          padding: 10px 14px;
          border-bottom: 1px solid #edf2f7;
          color: #4a5568;
          background: #ffffff;
        }

        .admin-table tr:hover td {
          background: #f7fafc;
        }

        .admin-td-msg {
          max-width: 200px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        /* ─── Badge ─── */
        .admin-badge {
          font-size: 0.75rem;
          padding: 3px 10px;
          border-radius: 20px;
          font-weight: 600;
          white-space: nowrap;
        }

        /* ─── Toolbar ─── */
        .admin-toolbar {
          display: flex;
          gap: 16px;
          margin-bottom: 20px;
          flex-wrap: wrap;
          align-items: center;
        }

        .admin-search {
          display: flex;
          align-items: center;
          gap: 8px;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 8px 14px;
          flex: 1;
          min-width: 200px;
          color: #a0aec0;
        }

        .admin-search input {
          background: none;
          border: none;
          color: #2d3748;
          outline: none;
          width: 100%;
          font-size: 0.9rem;
        }

        .admin-search input::placeholder {
          color: #a0aec0;
        }

        .admin-filters {
          display: flex;
          gap: 6px;
        }

        .admin-filter-btn {
          padding: 6px 14px;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 500;
          background: #ffffff;
          color: #718096;
          border: 1px solid #e2e8f0;
          cursor: pointer;
          transition: all 0.15s;
          font-family: inherit;
        }

        .admin-filter-btn:hover {
          border-color: #cbd5e0;
          color: #4a5568;
          background: #f7fafc;
        }

        .admin-filter-btn--active {
          background: #eef2ff;
          color: #667eea;
          border-color: #c7d2fe;
        }

        /* ─── Icon button ─── */
        .admin-icon-btn {
          padding: 6px;
          border-radius: 6px;
          color: #a0aec0;
          transition: all 0.15s;
          display: flex;
          align-items: center;
          background: none;
          border: none;
          cursor: pointer;
        }

        .admin-icon-btn--danger:hover {
          background: #fff5f5;
          color: #f56565;
        }

        /* ─── Cards list ─── */
        .admin-cards-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .admin-list-card {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 18px;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          gap: 12px;
          box-shadow: 0 1px 2px rgba(0,0,0,0.04);
        }

        .admin-list-card__info {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .admin-list-card__info strong {
          color: #2d3748;
          font-size: 0.95rem;
        }

        .admin-list-card__info span {
          color: #718096;
          font-size: 0.8rem;
        }

        /* ─── Forms ─── */
        .admin-content-form {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          max-width: 800px;
        }

        .admin-content-form .admin-field:has(textarea) {
          grid-column: 1 / -1;
        }

        .admin-field {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .admin-field label {
          font-size: 0.8rem;
          font-weight: 600;
          color: #718096;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        .admin-field input,
        .admin-field textarea,
        .admin-field select {
          padding: 10px 14px;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          color: #2d3748;
          font-size: 0.9rem;
          transition: border-color 0.15s;
        }

        .admin-field input:focus,
        .admin-field textarea:focus,
        .admin-field select:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102,126,234,0.1);
        }

        .admin-field textarea {
          resize: vertical;
          min-height: 100px;
        }

        .admin-inline-form {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          align-items: flex-end;
        }

        .admin-inline-form input,
        .admin-inline-form select {
          padding: 10px 14px;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          color: #2d3748;
          font-size: 0.9rem;
          flex: 1;
          min-width: 150px;
        }

        .admin-inline-form input:focus,
        .admin-inline-form select:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102,126,234,0.1);
        }

        .admin-checkbox {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.9rem;
          color: #718096;
          cursor: pointer;
          padding: 10px 0;
          white-space: nowrap;
        }

        .admin-checkbox input[type="checkbox"] {
          accent-color: #667eea;
        }

        /* ─── Buttons ─── */
        .admin-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          border-radius: 8px;
          font-size: 0.9rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s;
          border: none;
          font-family: inherit;
          white-space: nowrap;
        }

        .admin-btn--primary {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          box-shadow: 0 2px 8px rgba(102,126,234,0.3);
        }

        .admin-btn--primary:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 4px 14px rgba(102,126,234,0.4);
        }

        .admin-btn--primary:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .admin-btn--outline {
          background: #ffffff;
          color: #667eea;
          border: 1px solid #c7d2fe;
        }

        .admin-btn--outline:hover {
          background: #eef2ff;
          border-color: #a5b4fc;
        }

        .admin-content-form .admin-btn {
          grid-column: 1 / -1;
          justify-self: start;
          margin-top: 8px;
        }

        /* ─── Toast ─── */
        .admin-toast {
          position: fixed;
          top: 20px;
          right: 20px;
          z-index: 1000;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 20px;
          border-radius: 8px;
          font-size: 0.9rem;
          font-weight: 500;
          animation: slideDown 0.3s ease;
          box-shadow: 0 8px 30px rgba(0,0,0,0.15);
        }

        .admin-toast--success {
          background: #f0fff4;
          color: #276749;
          border: 1px solid #c6f6d5;
        }

        .admin-toast--error {
          background: #fff5f5;
          color: #c53030;
          border: 1px solid #fed7d7;
        }

        .admin-toast button {
          background: none;
          border: none;
          color: inherit;
          cursor: pointer;
          padding: 2px;
          opacity: 0.6;
          display: flex;
        }

        .admin-toast button:hover { opacity: 1; }

        /* ─── Theme Editor ─── */
        .theme-presets-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
          gap: 12px;
        }

        .theme-preset-card {
          display: flex;
          flex-direction: column;
          gap: 10px;
          padding: 16px;
          background: #ffffff;
          border: 2px solid #e2e8f0;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s;
          text-align: left;
          position: relative;
          font-family: inherit;
        }

        .theme-preset-card:hover {
          border-color: #a5b4fc;
          box-shadow: 0 4px 12px rgba(102,126,234,0.12);
          transform: translateY(-1px);
        }

        .theme-preset-card--active {
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102,126,234,0.15), 0 4px 12px rgba(102,126,234,0.12);
        }

        .theme-preset-swatches {
          display: flex;
          gap: 4px;
          height: 32px;
          border-radius: 6px;
          overflow: hidden;
        }

        .theme-preset-swatches span {
          flex: 1;
          border-radius: 4px;
        }

        .theme-preset-info {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .theme-preset-info strong {
          font-size: 0.9rem;
          color: #2d3748;
        }

        .theme-preset-info span {
          font-size: 0.75rem;
          color: #a0aec0;
        }

        .theme-preset-check {
          position: absolute;
          top: 10px;
          right: 10px;
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: #667eea;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.7rem;
        }

        .theme-groups-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 16px;
        }

        .theme-color-group {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 18px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.04);
        }

        .theme-color-group__header {
          margin-bottom: 14px;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .theme-color-group__header strong {
          font-size: 0.9rem;
          color: #2d3748;
        }

        .theme-color-group__header span {
          font-size: 0.75rem;
          color: #a0aec0;
        }

        .theme-color-group__pickers {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
        }

        .theme-color-picker {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
        }

        .theme-color-picker__swatch-wrap {
          position: relative;
          width: 42px;
          height: 42px;
          border-radius: 10px;
          overflow: hidden;
          cursor: pointer;
          border: 2px solid #e2e8f0;
          transition: border-color 0.15s;
        }

        .theme-color-picker__swatch-wrap:hover {
          border-color: #a5b4fc;
        }

        .theme-color-picker__input {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          opacity: 0;
          cursor: pointer;
        }

        .theme-color-picker__swatch {
          width: 100%;
          height: 100%;
        }

        .theme-color-picker__label {
          font-size: 0.68rem;
          color: #718096;
          font-weight: 500;
          text-align: center;
        }

        .theme-color-picker__hex {
          font-size: 0.6rem;
          color: #a0aec0;
          font-family: monospace;
        }

        .theme-preview {
          padding: 28px;
          border-radius: 16px;
          text-align: center;
          display: flex;
          flex-direction: column;
          gap: 16px;
          align-items: center;
        }

        .theme-preview__header {
          display: flex;
          flex-direction: column;
          gap: 6px;
          align-items: center;
        }

        /* ─── Responsive ─── */
        @media (max-width: 768px) {
          .admin-mobile-header {
            display: flex;
          }

          .admin-sidebar {
            transform: translateX(-100%);
            transition: transform 0.3s ease;
          }

          .admin-sidebar--open {
            transform: translateX(0);
          }

          .admin-main {
            margin-left: 0;
            padding: 72px 16px 16px;
          }

          .admin-stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .admin-content-form {
            grid-template-columns: 1fr;
          }

          .admin-toolbar {
            flex-direction: column;
            align-items: stretch;
          }

          .admin-filters {
            overflow-x: auto;
          }

          .theme-presets-grid {
            grid-template-columns: 1fr;
          }

          .theme-groups-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
