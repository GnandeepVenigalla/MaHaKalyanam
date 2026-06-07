// ============================================================
// Content Routes — Site Content, Events, Menu, Media, Gifts, Akshintalu
// MaHaKalyanam Wedding Server (MongoDB/Mongoose)
// ============================================================

import { Router } from 'express';
import { SiteContent, Event, FoodMenu, Media, Gift } from '../db/init.js';
import { verifyToken } from '../middleware/auth.js';

const router = Router();

// ══════════════════════════════════════════════════════════════
// SITE CONTENT (key-value pairs)
// ══════════════════════════════════════════════════════════════

// GET /api/content — fetch all site content as key-value object (public)
router.get('/content', async (_req, res) => {
  try {
    const rows = await SiteContent.find({});
    const content = {};
    for (const row of rows) {
      content[row.key] = row.value;
    }
    return res.json({ success: true, data: content });
  } catch (error) {
    console.error('Content fetch error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch content.' });
  }
});

// PUT /api/content — update content (admin)
// Body: { "key1": "value1", "key2": "value2", … }
router.put('/content', verifyToken, async (req, res) => {
  try {
    const updates = req.body;

    if (!updates || typeof updates !== 'object' || Array.isArray(updates)) {
      return res.status(400).json({
        success: false,
        message: 'Body must be an object of key-value pairs.',
      });
    }

    const entries = Object.entries(updates);
    for (const [key, value] of entries) {
      await SiteContent.findOneAndUpdate(
        { key },
        { key, value: String(value), updatedAt: new Date() },
        { upsert: true, new: true }
      );
    }

    return res.json({ success: true, message: 'Content updated.' });
  } catch (error) {
    console.error('Content update error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update content.' });
  }
});

// ══════════════════════════════════════════════════════════════
// EVENTS
// ══════════════════════════════════════════════════════════════

// GET /api/events — list all events sorted by sortOrder (public)
router.get('/events', async (_req, res) => {
  try {
    const events = await Event.find({}).sort({ sortOrder: 1 });
    return res.json({ success: true, data: events });
  } catch (error) {
    console.error('Events fetch error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch events.' });
  }
});

// POST /api/events — add a new event (admin)
router.post('/events', verifyToken, async (req, res) => {
  try {
    const { name, subtitle, date, time, venue, address, description, guests_attending, icon, map_link, calendar_link, sort_order } = req.body;

    if (!name || !date) {
      return res.status(400).json({
        success: false,
        message: 'Event name and date are required.',
      });
    }

    const event = await Event.create({
      name,
      subtitle: subtitle || null,
      date,
      time: time || null,
      venue: venue || null,
      address: address || null,
      description: description || null,
      guestsAttending: guests_attending || null,
      icon: icon || null,
      mapLink: map_link || null,
      calendarLink: calendar_link || null,
      sortOrder: sort_order || 0,
    });

    return res.status(201).json({
      success: true,
      message: 'Event added.',
      data: event,
    });
  } catch (error) {
    console.error('Event add error:', error);
    return res.status(500).json({ success: false, message: 'Failed to add event.' });
  }
});

// PUT /api/events — bulk-update events (admin, accepts array of events)
router.put('/events', verifyToken, async (req, res) => {
  try {
    const events = req.body;

    if (!Array.isArray(events)) {
      return res.status(400).json({
        success: false,
        message: 'Body must be an array of event objects.',
      });
    }

    for (const row of events) {
      await Event.findByIdAndUpdate(row._id || row.id, {
        name: row.name,
        subtitle: row.subtitle || null,
        date: row.date,
        time: row.time || null,
        venue: row.venue || null,
        address: row.address || null,
        description: row.description || null,
        guestsAttending: row.guests_attending || row.guestsAttending || null,
        icon: row.icon || null,
        mapLink: row.map_link || row.mapLink || null,
        calendarLink: row.calendar_link || row.calendarLink || null,
        sortOrder: row.sort_order ?? row.sortOrder ?? 0,
      });
    }

    return res.json({ success: true, message: 'Events updated.' });
  } catch (error) {
    console.error('Events update error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update events.' });
  }
});

// DELETE /api/events/:id — delete an event (admin)
router.delete('/events/:id', verifyToken, async (req, res) => {
  try {
    const result = await Event.findByIdAndDelete(req.params.id);

    if (!result) {
      return res.status(404).json({ success: false, message: 'Event not found.' });
    }

    return res.json({ success: true, message: 'Event deleted.' });
  } catch (error) {
    console.error('Event delete error:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete event.' });
  }
});

// ══════════════════════════════════════════════════════════════
// FOOD MENU
// ══════════════════════════════════════════════════════════════

// GET /api/menu — get menu grouped by category (public)
router.get('/menu', async (_req, res) => {
  try {
    const items = await FoodMenu.find({}).sort({ sortOrder: 1 });

    // Group items by category
    const grouped = {};
    for (const item of items) {
      if (!grouped[item.category]) {
        grouped[item.category] = [];
      }
      grouped[item.category].push(item);
    }

    return res.json({ success: true, data: grouped });
  } catch (error) {
    console.error('Menu fetch error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch menu.' });
  }
});

// POST /api/menu — add a menu item (admin)
router.post('/menu', verifyToken, async (req, res) => {
  try {
    const { category, name, item_name, description, is_veg, sort_order } = req.body;
    const itemName = name || item_name;

    if (!category || !itemName) {
      return res.status(400).json({
        success: false,
        message: 'Category and item name are required.',
      });
    }

    const menuItem = await FoodMenu.create({
      category,
      itemName,
      description: description || null,
      isVeg: is_veg !== undefined ? Boolean(is_veg) : true,
      sortOrder: sort_order || 0,
    });

    return res.status(201).json({
      success: true,
      message: 'Menu item added.',
      data: menuItem,
    });
  } catch (error) {
    console.error('Menu add error:', error);
    return res.status(500).json({ success: false, message: 'Failed to add menu item.' });
  }
});

// PUT /api/menu — bulk-update menu items (admin, accepts array)
router.put('/menu', verifyToken, async (req, res) => {
  try {
    const items = req.body;

    if (!Array.isArray(items)) {
      return res.status(400).json({
        success: false,
        message: 'Body must be an array of menu item objects.',
      });
    }

    for (const row of items) {
      await FoodMenu.findByIdAndUpdate(row._id || row.id, {
        category: row.category,
        itemName: row.item_name || row.itemName,
        description: row.description || null,
        isVeg: row.is_veg !== undefined ? Boolean(row.is_veg) : (row.isVeg !== undefined ? Boolean(row.isVeg) : true),
        sortOrder: row.sort_order ?? row.sortOrder ?? 0,
      });
    }

    return res.json({ success: true, message: 'Menu updated.' });
  } catch (error) {
    console.error('Menu update error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update menu.' });
  }
});

// DELETE /api/menu/:id — delete a menu item (admin)
router.delete('/menu/:id', verifyToken, async (req, res) => {
  try {
    const result = await FoodMenu.findByIdAndDelete(req.params.id);

    if (!result) {
      return res.status(404).json({ success: false, message: 'Menu item not found.' });
    }

    return res.json({ success: true, message: 'Menu item deleted.' });
  } catch (error) {
    console.error('Menu delete error:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete menu item.' });
  }
});

// ══════════════════════════════════════════════════════════════
// MEDIA (YouTube / Images)
// ══════════════════════════════════════════════════════════════

// GET /api/media — list all media sorted by sortOrder (public)
router.get('/media', async (_req, res) => {
  try {
    const media = await Media.find({}).sort({ sortOrder: 1 });
    return res.json({ success: true, data: media });
  } catch (error) {
    console.error('Media fetch error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch media.' });
  }
});

// POST /api/media — add media (admin)
router.post('/media', verifyToken, async (req, res) => {
  try {
    const { url, title, description, sort_order } = req.body;
    let { type } = req.body;

    if (!url) {
      return res.status(400).json({
        success: false,
        message: 'Media URL is required.',
      });
    }

    // Auto-detect YouTube URLs
    if (!type) {
      type = url.includes('youtube') || url.includes('youtu.be') ? 'youtube' : 'image';
    }

    if (!['youtube', 'image'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Type must be "youtube" or "image".',
      });
    }

    const media = await Media.create({
      type,
      url,
      title: title || null,
      description: description || null,
      sortOrder: sort_order || 0,
    });

    return res.status(201).json({
      success: true,
      message: 'Media added.',
      data: media,
    });
  } catch (error) {
    console.error('Media add error:', error);
    return res.status(500).json({ success: false, message: 'Failed to add media.' });
  }
});

// PUT /api/media — bulk-update media (admin, accepts array)
router.put('/media', verifyToken, async (req, res) => {
  try {
    const items = req.body;

    if (!Array.isArray(items)) {
      return res.status(400).json({
        success: false,
        message: 'Body must be an array of media objects.',
      });
    }

    for (const row of items) {
      await Media.findByIdAndUpdate(row._id || row.id, {
        type: row.type,
        url: row.url,
        title: row.title || null,
        description: row.description || null,
        sortOrder: row.sort_order ?? row.sortOrder ?? 0,
      });
    }

    return res.json({ success: true, message: 'Media updated.' });
  } catch (error) {
    console.error('Media update error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update media.' });
  }
});

// DELETE /api/media/:id — delete a media item (admin)
router.delete('/media/:id', verifyToken, async (req, res) => {
  try {
    const result = await Media.findByIdAndDelete(req.params.id);

    if (!result) {
      return res.status(404).json({ success: false, message: 'Media not found.' });
    }

    return res.json({ success: true, message: 'Media deleted.' });
  } catch (error) {
    console.error('Media delete error:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete media.' });
  }
});

// ══════════════════════════════════════════════════════════════
// AKSHINTALU (rice blessings counter — public interactive feature)
// ══════════════════════════════════════════════════════════════

// POST /api/akshintalu — increment the akshintalu count (public)
router.post('/akshintalu', async (_req, res) => {
  try {
    const doc = await SiteContent.findOneAndUpdate(
      { key: 'akshintalu_count' },
      [
        {
          $set: {
            value: { $toString: { $add: [{ $toInt: '$value' }, 1] } },
            updatedAt: new Date(),
          },
        },
      ],
      { new: true }
    );

    return res.json({
      success: true,
      count: parseInt(doc?.value || '0', 10),
      message: 'Blessings received! 🌾',
    });
  } catch (error) {
    console.error('Akshintalu increment error:', error);
    return res.status(500).json({ success: false, message: 'Failed to add blessing.' });
  }
});

// GET /api/akshintalu — get current akshintalu count (public)
router.get('/akshintalu', async (_req, res) => {
  try {
    const doc = await SiteContent.findOne({ key: 'akshintalu_count' });

    return res.json({
      success: true,
      count: parseInt(doc?.value || '0', 10),
    });
  } catch (error) {
    console.error('Akshintalu fetch error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch count.' });
  }
});

// ══════════════════════════════════════════════════════════════
// GIFTS (Gift Registry)
// ══════════════════════════════════════════════════════════════

// GET /api/gifts — list all gifts sorted by sortOrder (public)
router.get('/gifts', async (_req, res) => {
  try {
    const gifts = await Gift.find({}).sort({ sortOrder: 1 });
    return res.json({ success: true, data: gifts });
  } catch (error) {
    console.error('Gifts fetch error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch gifts.' });
  }
});

// POST /api/gifts — add a gift option (admin)
router.post('/gifts', verifyToken, async (req, res) => {
  try {
    const { title, description, type, icon, link, details, sort_order } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'Gift title is required.',
      });
    }

    const gift = await Gift.create({
      title,
      description: description || null,
      type: type || 'item',
      icon: icon || '🎁',
      link: link || null,
      details: details || null,
      sortOrder: sort_order || 0,
    });

    return res.status(201).json({
      success: true,
      message: 'Gift option added.',
      data: gift,
    });
  } catch (error) {
    console.error('Gift add error:', error);
    return res.status(500).json({ success: false, message: 'Failed to add gift.' });
  }
});

// DELETE /api/gifts/:id — delete a gift option (admin)
router.delete('/gifts/:id', verifyToken, async (req, res) => {
  try {
    const result = await Gift.findByIdAndDelete(req.params.id);

    if (!result) {
      return res.status(404).json({ success: false, message: 'Gift not found.' });
    }

    return res.json({ success: true, message: 'Gift deleted.' });
  } catch (error) {
    console.error('Gift delete error:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete gift.' });
  }
});

// ══════════════════════════════════════════════════════════════
// THEME COLORS
// ══════════════════════════════════════════════════════════════

// GET /api/theme — fetch all theme-related keys (public)
router.get('/theme', async (_req, res) => {
  try {
    const rows = await SiteContent.find({ key: /^theme_/ });
    const theme = {};
    for (const row of rows) {
      theme[row.key] = row.value;
    }
    return res.json({ success: true, data: theme });
  } catch (error) {
    console.error('Theme fetch error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch theme.' });
  }
});

// PUT /api/theme — update theme colors (admin)
router.put('/theme', verifyToken, async (req, res) => {
  try {
    const updates = req.body;
    if (!updates || typeof updates !== 'object' || Array.isArray(updates)) {
      return res.status(400).json({ success: false, message: 'Body must be an object of key-value pairs.' });
    }
    const entries = Object.entries(updates);
    for (const [key, value] of entries) {
      if (!key.startsWith('theme_')) continue;
      await SiteContent.findOneAndUpdate(
        { key },
        { key, value: String(value), updatedAt: new Date() },
        { upsert: true, new: true }
      );
    }
    return res.json({ success: true, message: 'Theme updated.' });
  } catch (error) {
    console.error('Theme update error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update theme.' });
  }
});

// POST /api/theme/reset — reset theme to defaults (admin)
router.post('/theme/reset', verifyToken, async (_req, res) => {
  try {
    const defaults = {
      theme_primary: '#4A0E1B',
      theme_primary_deep: '#2D0A12',
      theme_primary_light: '#6B1D30',
      theme_secondary: '#3A0B15',
      theme_secondary_dark: '#1A0509',
      theme_accent: '#D4A853',
      theme_accent_light: '#E8C87A',
      theme_accent_dark: '#B8922F',
      theme_accent_pale: '#F0D78C',
      theme_text_primary: '#FFF8F0',
      theme_text_secondary: 'rgba(255, 248, 240, 0.75)',
      theme_text_accent: '#D4A853',
      theme_neutral_1: '#F5E6CC',
      theme_neutral_2: '#FFF8F0',
      theme_neutral_3: '#FDF5E8',
    };
    for (const [key, value] of Object.entries(defaults)) {
      await SiteContent.findOneAndUpdate(
        { key },
        { key, value, updatedAt: new Date() },
        { upsert: true, new: true }
      );
    }
    return res.json({ success: true, message: 'Theme reset to defaults.', data: defaults });
  } catch (error) {
    console.error('Theme reset error:', error);
    return res.status(500).json({ success: false, message: 'Failed to reset theme.' });
  }
});

export default router;
