import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  verifyToken,
  fetchRSVPs, fetchRSVPStats, deleteRSVP,
  fetchContent, updateContent,
  fetchEvents, addEvent, deleteEvent,
  fetchMenu, addMenuItem, deleteMenuItem,
  fetchMedia, addMedia, deleteMedia,
  fetchGifts, addGift, deleteGift,
} from '../utils/api';
import {
  FiHome, FiUsers, FiEdit, FiCalendar, FiCoffee, FiFilm, FiGift,
  FiLogOut, FiExternalLink, FiTrash2, FiPlus, FiSearch,
  FiCheck, FiX, FiAlertCircle
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
function DashboardTab({ rsvps, stats }) {
  const statCards = [
    { label: 'Total RSVPs', value: stats.total || 0, color: '#6366f1' },
    { label: 'Attending', value: stats.attending || 0, color: '#22c55e' },
    { label: 'Declined', value: stats.declined || 0, color: '#ef4444' },
    { label: 'Maybe', value: stats.maybe || 0, color: '#f59e0b' },
    { label: 'Total Guests', value: stats.total_guests || 0, color: '#8b5cf6' },
  ];

  const recent = [...(rsvps || [])].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 5);

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
function GuestListTab({ rsvps, onDelete, onRefresh }) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const filtered = (rsvps || []).filter(r => {
    const matchSearch = r.name?.toLowerCase().includes(search.toLowerCase()) ||
      r.email?.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' || r.attending === filter;
    return matchSearch && matchFilter;
  });

  return (
    <div>
      <h2 className="admin-page-title">Guest List ({filtered.length})</h2>

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
                <th>Guests</th>
                <th>Status</th>
                <th>Dietary</th>
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
                  <td>{r.guests || 1}</td>
                  <td><StatusBadge status={r.attending} /></td>
                  <td>{r.dietary || '—'}</td>
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
function EventsEditorTab({ events, onAdd, onDelete, onRefresh }) {
  const [form, setForm] = useState({ name: '', date: '', time: '', venue: '', address: '', description: '' });
  const [adding, setAdding] = useState(false);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.name) return;
    setAdding(true);
    await onAdd(form);
    setForm({ name: '', date: '', time: '', venue: '', address: '', description: '' });
    setAdding(false);
  };

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
            {events.map(ev => (
              <div key={ev.id} className="admin-list-card">
                <div className="admin-list-card__info">
                  <strong>{ev.name}</strong>
                  <span>{ev.date} {ev.time && `· ${ev.time}`}</span>
                  <span>{ev.venue}</span>
                </div>
                <button className="admin-icon-btn admin-icon-btn--danger" onClick={() => onDelete(ev._id || ev.id)}>
                  <FiTrash2 />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add new */}
      <div className="admin-section">
        <h3 className="admin-section-title">Add New Event</h3>
        <form className="admin-inline-form" onSubmit={handleAdd}>
          <input placeholder="Event Name *" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
          <input placeholder="Date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} />
          <input placeholder="Time" value={form.time} onChange={e => setForm({...form, time: e.target.value})} />
          <input placeholder="Venue" value={form.venue} onChange={e => setForm({...form, venue: e.target.value})} />
          <input placeholder="Address" value={form.address} onChange={e => setForm({...form, address: e.target.value})} />
          <input placeholder="Description" value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
          <button type="submit" className="admin-btn admin-btn--primary" disabled={adding}>
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

const tabs = [
  { id: 'dashboard', label: 'Dashboard', icon: FiHome },
  { id: 'guests', label: 'Guest List', icon: FiUsers },
  { id: 'content', label: 'Edit Content', icon: FiEdit },
  { id: 'events', label: 'Events', icon: FiCalendar },
  { id: 'menu', label: 'Food Menu', icon: FiCoffee },
  { id: 'media', label: 'Media', icon: FiFilm },
  { id: 'gifts', label: 'Gifts', icon: FiGift },
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
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
  }, []);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [rsvpData, statsData, contentData, eventsData, menuData, mediaData, giftsData] = await Promise.allSettled([
        fetchRSVPs(),
        fetchRSVPStats(),
        fetchContent(),
        fetchEvents(),
        fetchMenu(),
        fetchMedia(),
        fetchGifts(),
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

  const renderTab = () => {
    switch (activeTab) {
      case 'dashboard': return <DashboardTab rsvps={rsvps} stats={stats} />;
      case 'guests': return <GuestListTab rsvps={rsvps} onDelete={handleDeleteRSVP} onRefresh={loadData} />;
      case 'content': return <ContentEditorTab content={content} onSave={handleSaveContent} />;
      case 'events': return <EventsEditorTab events={events} onAdd={handleAddEvent} onDelete={handleDeleteEvent} onRefresh={loadData} />;
      case 'menu': return <MenuEditorTab menu={menu} onAdd={handleAddMenuItem} onDelete={handleDeleteMenuItem} />;
      case 'media': return <MediaEditorTab media={media} onAdd={handleAddMedia} onDelete={handleDeleteMedia} />;
      case 'gifts': return <GiftsEditorTab gifts={gifts} onAdd={handleAddGift} onDelete={handleDeleteGift} />;
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
          <h2 className="admin-sidebar__title">#MaHaKalyanam</h2>
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
          background: #0f0f14;
          color: #e0e0ea;
          font-family: var(--font-body);
        }

        /* ─── Loading ─── */
        .admin-loading {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: #0f0f14;
          color: #6b6b80;
          gap: 16px;
        }

        .admin-loading__spinner {
          width: 36px;
          height: 36px;
          border: 3px solid #2a2a3a;
          border-top-color: #6366f1;
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
          background: #16161f;
          border-bottom: 1px solid #222233;
          align-items: center;
          padding: 0 16px;
          gap: 12px;
          z-index: 200;
        }

        .admin-hamburger {
          font-size: 1.3rem;
          color: #e0e0ea;
          background: none;
          border: none;
          cursor: pointer;
          padding: 8px;
        }

        .admin-mobile-title {
          font-weight: 600;
          font-size: 1rem;
        }

        .admin-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.5);
          z-index: 299;
        }

        /* ─── Sidebar ─── */
        .admin-sidebar {
          width: 260px;
          min-height: 100vh;
          background: #16161f;
          border-right: 1px solid #222233;
          display: flex;
          flex-direction: column;
          position: fixed;
          left: 0;
          top: 0;
          bottom: 0;
          z-index: 300;
        }

        .admin-sidebar__header {
          padding: 24px 20px;
          border-bottom: 1px solid #222233;
        }

        .admin-sidebar__title {
          font-family: var(--font-body);
          font-size: 1.2rem;
          font-weight: 700;
          color: #f0f0f5;
          margin-bottom: 4px;
        }

        .admin-sidebar__badge {
          font-size: 0.7rem;
          color: #6366f1;
          background: rgba(99,102,241,0.12);
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
        }

        .admin-sidebar__link {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 14px;
          font-size: 0.9rem;
          color: #8b8ba0;
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
          background: rgba(255,255,255,0.04);
          color: #e0e0ea;
        }

        .admin-sidebar__link--active {
          background: rgba(99,102,241,0.12);
          color: #818cf8;
        }

        .admin-sidebar__link--logout {
          color: #ef4444;
        }

        .admin-sidebar__link--logout:hover {
          background: rgba(239,68,68,0.08);
          color: #f87171;
        }

        .admin-sidebar__footer {
          padding: 12px 8px;
          border-top: 1px solid #222233;
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
          color: #f0f0f5;
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
          background: #1a1a24;
          border: 1px solid #222233;
          border-radius: 12px;
          padding: 20px;
          border-top: 3px solid;
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
          color: #6b6b80;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        /* ─── Sections ─── */
        .admin-section {
          margin-bottom: 32px;
        }

        .admin-section-title {
          font-size: 1rem;
          font-weight: 600;
          color: #b0b0c0;
          margin-bottom: 16px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          font-size: 0.8rem;
        }

        .admin-empty {
          color: #4a4a5a;
          font-style: italic;
          padding: 20px;
          text-align: center;
          background: #1a1a24;
          border-radius: 8px;
          border: 1px dashed #2a2a3a;
        }

        /* ─── Table ─── */
        .admin-table-wrap {
          overflow-x: auto;
          border-radius: 8px;
          border: 1px solid #222233;
        }

        .admin-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.85rem;
        }

        .admin-table th {
          padding: 12px 14px;
          text-align: left;
          background: #16161f;
          color: #6b6b80;
          font-weight: 600;
          text-transform: uppercase;
          font-size: 0.7rem;
          letter-spacing: 0.08em;
          border-bottom: 1px solid #222233;
          white-space: nowrap;
        }

        .admin-table td {
          padding: 10px 14px;
          border-bottom: 1px solid #1a1a28;
          color: #c0c0d0;
        }

        .admin-table tr:hover td {
          background: rgba(255,255,255,0.02);
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
          background: #1a1a24;
          border: 1px solid #222233;
          border-radius: 8px;
          padding: 8px 14px;
          flex: 1;
          min-width: 200px;
          color: #6b6b80;
        }

        .admin-search input {
          background: none;
          border: none;
          color: #e0e0ea;
          outline: none;
          width: 100%;
          font-size: 0.9rem;
        }

        .admin-search input::placeholder {
          color: #4a4a5a;
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
          background: #1a1a24;
          color: #8b8ba0;
          border: 1px solid #222233;
          cursor: pointer;
          transition: all 0.15s;
          font-family: inherit;
        }

        .admin-filter-btn:hover {
          border-color: #333;
          color: #e0e0ea;
        }

        .admin-filter-btn--active {
          background: rgba(99,102,241,0.12);
          color: #818cf8;
          border-color: rgba(99,102,241,0.3);
        }

        /* ─── Icon button ─── */
        .admin-icon-btn {
          padding: 6px;
          border-radius: 6px;
          color: #6b6b80;
          transition: all 0.15s;
          display: flex;
          align-items: center;
          background: none;
          border: none;
          cursor: pointer;
        }

        .admin-icon-btn--danger:hover {
          background: rgba(239,68,68,0.1);
          color: #f87171;
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
          background: #1a1a24;
          border: 1px solid #222233;
          border-radius: 8px;
          gap: 12px;
        }

        .admin-list-card__info {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .admin-list-card__info strong {
          color: #e0e0ea;
          font-size: 0.95rem;
        }

        .admin-list-card__info span {
          color: #6b6b80;
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
          color: #8b8ba0;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        .admin-field input,
        .admin-field textarea,
        .admin-field select {
          padding: 10px 14px;
          background: #12121a;
          border: 1px solid #222233;
          border-radius: 6px;
          color: #e0e0ea;
          font-size: 0.9rem;
          transition: border-color 0.15s;
        }

        .admin-field input:focus,
        .admin-field textarea:focus,
        .admin-field select:focus {
          outline: none;
          border-color: #6366f1;
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
          background: #12121a;
          border: 1px solid #222233;
          border-radius: 6px;
          color: #e0e0ea;
          font-size: 0.9rem;
          flex: 1;
          min-width: 150px;
        }

        .admin-inline-form input:focus,
        .admin-inline-form select:focus {
          outline: none;
          border-color: #6366f1;
        }

        .admin-checkbox {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.9rem;
          color: #8b8ba0;
          cursor: pointer;
          padding: 10px 0;
          white-space: nowrap;
        }

        .admin-checkbox input[type="checkbox"] {
          accent-color: #6366f1;
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
          background: #6366f1;
          color: white;
        }

        .admin-btn--primary:hover:not(:disabled) {
          background: #5558e0;
          transform: translateY(-1px);
        }

        .admin-btn--primary:disabled {
          opacity: 0.5;
          cursor: not-allowed;
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
          box-shadow: 0 8px 30px rgba(0,0,0,0.3);
        }

        .admin-toast--success {
          background: #1a2e1a;
          color: #4ade80;
          border: 1px solid rgba(74,222,128,0.2);
        }

        .admin-toast--error {
          background: #2e1a1a;
          color: #f87171;
          border: 1px solid rgba(248,113,113,0.2);
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
        }
      `}</style>
    </div>
  );
}
