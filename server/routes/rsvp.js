// ============================================================
// RSVP Routes — Guest Response Management
// MaHaKalyanam Wedding Server (MongoDB/Mongoose)
// ============================================================

import { Router } from 'express';
import { RsvpResponse } from '../db/init.js';
import { verifyToken } from '../middleware/auth.js';

const router = Router();

// ------------------------------------------------------------------
// POST /api/rsvp — Submit an RSVP (public)
// ------------------------------------------------------------------
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, events, dietary, message } = req.body;

    // Basic validation
    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Name is required.',
      });
    }

    let totalGuests = 0;
    let attendingEvents = [];
    if (events && Array.isArray(events)) {
      events.forEach(ev => {
        const adults = parseInt(ev.adults) || 0;
        const kids = parseInt(ev.kids) || 0;
        if (adults > 0 || kids > 0) {
          totalGuests += (adults + kids);
          attendingEvents.push({
            eventId: ev.eventId,
            eventName: ev.eventName,
            adults,
            kids
          });
        }
      });
    }

    const attending = totalGuests > 0 ? 'yes' : 'no';

    const rsvp = await RsvpResponse.create({
      name: name.trim(),
      email: email?.trim() || null,
      phone: phone?.trim() || null,
      numGuests: totalGuests,
      attending,
      events: attendingEvents,
      dietary: dietary?.trim() || null,
      message: message?.trim() || null,
    });

    return res.status(201).json({
      success: true,
      message: 'RSVP submitted successfully! Thank you.',
      data: rsvp,
    });
  } catch (error) {
    console.error('RSVP submit error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to submit RSVP. Please try again.',
    });
  }
});

// ------------------------------------------------------------------
// GET /api/rsvp — List all RSVPs (admin only)
// ------------------------------------------------------------------
router.get('/', verifyToken, async (_req, res) => {
  try {
    const responses = await RsvpResponse.find({}).sort({ createdAt: -1 });
    return res.json({ success: true, data: responses });
  } catch (error) {
    console.error('RSVP list error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch RSVPs.',
    });
  }
});

// ------------------------------------------------------------------
// DELETE /api/rsvp/:id — Delete a single RSVP (admin only)
// ------------------------------------------------------------------
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const result = await RsvpResponse.findByIdAndDelete(req.params.id);

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'RSVP not found.',
      });
    }

    return res.json({ success: true, message: 'RSVP deleted.' });
  } catch (error) {
    console.error('RSVP delete error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete RSVP.',
    });
  }
});

// ------------------------------------------------------------------
// GET /api/rsvp/stats — RSVP statistics (admin only)
// ------------------------------------------------------------------
router.get('/stats', verifyToken, async (_req, res) => {
  try {
    const stats = await RsvpResponse.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          attending: {
            $sum: { $cond: [{ $eq: ['$attending', 'yes'] }, 1, 0] },
          },
          declined: {
            $sum: { $cond: [{ $eq: ['$attending', 'no'] }, 1, 0] },
          },
          maybe: {
            $sum: { $cond: [{ $eq: ['$attending', 'maybe'] }, 1, 0] },
          },
          total_guests: {
            $sum: {
              $cond: [{ $eq: ['$attending', 'yes'] }, '$numGuests', 0],
            },
          },
        },
      },
    ]);

    const data = stats[0] || {
      total: 0,
      attending: 0,
      declined: 0,
      maybe: 0,
      total_guests: 0,
    };

    // Remove the _id field from aggregate output
    delete data._id;

    return res.json({ success: true, data });
  } catch (error) {
    console.error('RSVP stats error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch RSVP stats.',
    });
  }
});

export default router;
