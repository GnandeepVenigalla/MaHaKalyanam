// ============================================================
// Database Initialization — Mongoose Models & Seed Data
// MaHaKalyanam Wedding Server
// ============================================================

import mongoose from 'mongoose';

// ── Schemas & Models ────────────────────────────────────────

const siteContentSchema = new mongoose.Schema({
  key:       { type: String, unique: true, required: true },
  value:     { type: String },
  updatedAt: { type: Date, default: Date.now },
});

const eventSchema = new mongoose.Schema({
  name:        { type: String, required: true },
  date:        { type: String, required: true },
  time:        { type: String },
  venue:       { type: String },
  address:     { type: String },
  description: { type: String },
  icon:        { type: String },
  sortOrder:   { type: Number, default: 0 },
});

const foodMenuSchema = new mongoose.Schema({
  category:    { type: String, required: true },
  itemName:    { type: String, required: true },
  description: { type: String },
  isVeg:       { type: Boolean, default: true },
  sortOrder:   { type: Number, default: 0 },
});

const rsvpResponseSchema = new mongoose.Schema({
  name:      { type: String, required: true },
  email:     { type: String },
  phone:     { type: String },
  numGuests: { type: Number, default: 1 },
  attending: { type: String, enum: ['yes', 'no', 'maybe'], default: 'yes' },
  dietary:   { type: String },
  message:   { type: String },
  createdAt: { type: Date, default: Date.now },
});

const mediaSchema = new mongoose.Schema({
  type:        { type: String, enum: ['youtube', 'image'], required: true },
  url:         { type: String, required: true },
  title:       { type: String },
  description: { type: String },
  sortOrder:   { type: Number, default: 0 },
});

const giftSchema = new mongoose.Schema({
  title:       { type: String, required: true },
  description: { type: String },
  type:        { type: String, default: 'item' },
  icon:        { type: String },
  link:        { type: String },
  details:     { type: String },
  sortOrder:   { type: Number, default: 0 },
});

// ── Models ──────────────────────────────────────────────────

export const SiteContent  = mongoose.model('SiteContent',  siteContentSchema);
export const Event        = mongoose.model('Event',        eventSchema);
export const FoodMenu     = mongoose.model('FoodMenu',     foodMenuSchema);
export const RsvpResponse = mongoose.model('RsvpResponse', rsvpResponseSchema);
export const Media        = mongoose.model('Media',        mediaSchema);
export const Gift         = mongoose.model('Gift',         giftSchema);

// ── Connect to MongoDB ──────────────────────────────────────

export async function connectDB() {
  try {
    const uri = process.env.MONGO_URI;
    if (!uri) {
      throw new Error('MONGO_URI is not defined in environment variables.');
    }

    await mongoose.connect(uri);

    console.log('✅ Connected to MongoDB successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    throw error;
  }
}

// ── Seed Data ───────────────────────────────────────────────

export async function seedData() {
  try {
    await seedSiteContent();
    await seedEvents();
    await seedFoodMenu();
    await seedMedia();
    await seedGifts();
    console.log('✅ Seed data check complete');
  } catch (error) {
    console.error('❌ Seed data error:', error.message);
  }
}

async function seedSiteContent() {
  const count = await SiteContent.countDocuments();
  if (count > 0) return;

  const defaults = [
    { key: 'bride_name',       value: 'Nithaya' },
    { key: 'groom_name',       value: 'Ranjith' },
    { key: 'wedding_date',     value: '2026-06-24' },
    { key: 'wedding_time',     value: '09:30 AM' },
    { key: 'tagline',          value: '#MaHaKalyanam' },
    {
      key: 'welcome_message',
      value:
        'With the blessings of Lord Venkateswara and our beloved families, we joyfully invite you to celebrate the union of Ranjith & Nithaya. Your presence will make our special day truly memorable.',
    },
    {
      key: 'hero_subtitle',
      value: 'We are getting married! Join us to celebrate our love.',
    },
    {
      key: 'couple_story',
      value:
        "What started as a chance meeting blossomed into a beautiful journey of love, laughter, and countless chai dates. Ranjith's calm demeanor perfectly complements Nithaya's vibrant energy, and together they have built a bond that is nothing short of magical. Now, surrounded by the love of family and friends, they are ready to begin their forever together.",
    },
    { key: 'bride_parents',    value: 'Mr. & Mrs. Raghunath' },
    { key: 'groom_parents',    value: 'Mr. & Mrs. Venkatesh' },
    { key: 'venue_name',       value: 'Sri Lakshmi Convention Hall' },
    { key: 'venue_address',    value: 'Hyderabad, Telangana' },
    { key: 'venue_map_link',   value: '' },
    {
      key: 'footer_message',
      value: 'Made with ❤️ for Ranjith & Nithaya | #MaHaKalyanam',
    },
    { key: 'akshintalu_count', value: '0' },
  ];

  await SiteContent.insertMany(defaults);
  console.log('   → Seeded site_content');
}

async function seedEvents() {
  const count = await Event.countDocuments();
  if (count > 0) return;

  const events = [
    {
      name: 'Haldi Ceremony',
      date: '2026-06-22',
      time: '10:00 AM',
      venue: 'Sri Lakshmi Convention Hall',
      address: 'Hyderabad, Telangana',
      description:
        'The auspicious Haldi ceremony where turmeric paste is applied to the bride and groom for a radiant glow before the wedding.',
      icon: '🌼',
      sortOrder: 1,
    },
    {
      name: 'Wedding Ceremony',
      date: '2026-06-24',
      time: '09:30 AM',
      venue: 'Sri Lakshmi Convention Hall',
      address: 'Hyderabad, Telangana',
      description:
        'The sacred Telugu wedding ceremony performed with traditional Vedic rituals, mangalsutra dharana, and saptapadi around the holy fire.',
      icon: '💍',
      sortOrder: 2,
    },
    {
      name: 'Reception',
      date: '2026-06-24',
      time: '07:00 PM',
      venue: 'Sri Lakshmi Convention Hall',
      address: 'Hyderabad, Telangana',
      description:
        'A grand reception dinner to celebrate the newlyweds with delicious food, music, and merriment.',
      icon: '🎉',
      sortOrder: 3,
    },
  ];

  await Event.insertMany(events);
  console.log('   → Seeded events');
}

async function seedFoodMenu() {
  const count = await FoodMenu.countDocuments();
  if (count > 0) return;

  const menu = [
    // Starters
    { category: 'Starters', itemName: 'Paneer Tikka',       description: 'Marinated cottage cheese grilled to perfection in a tandoor',                            isVeg: true,  sortOrder: 1  },
    { category: 'Starters', itemName: 'Veg Spring Rolls',   description: 'Crispy rolls stuffed with seasoned mixed vegetables',                                    isVeg: true,  sortOrder: 2  },
    { category: 'Starters', itemName: 'Chicken 65',         description: 'Spicy, deep-fried Hyderabadi-style chicken bites',                                       isVeg: false, sortOrder: 3  },
    // Main Course
    { category: 'Main Course', itemName: 'Hyderabadi Biryani',    description: 'Fragrant basmati rice layered with aromatic spices and tender meat, slow-cooked in dum style', isVeg: false, sortOrder: 4  },
    { category: 'Main Course', itemName: 'Paneer Butter Masala',  description: 'Soft paneer cubes in a rich, creamy tomato-based gravy',                                       isVeg: true,  sortOrder: 5  },
    { category: 'Main Course', itemName: 'Dal Makhani',           description: 'Slow-cooked black lentils in a velvety butter and cream sauce',                                isVeg: true,  sortOrder: 6  },
    { category: 'Main Course', itemName: 'Gutti Vankaya',         description: 'Traditional Andhra stuffed brinjal curry with peanut and sesame masala',                        isVeg: true,  sortOrder: 7  },
    // Desserts
    { category: 'Desserts', itemName: 'Double Ka Meetha', description: 'Classic Hyderabadi bread pudding soaked in saffron milk and topped with dry fruits', isVeg: true, sortOrder: 8  },
    { category: 'Desserts', itemName: 'Gulab Jamun',      description: 'Soft, golden milk-solid dumplings drenched in rose-cardamom sugar syrup',          isVeg: true, sortOrder: 9  },
    { category: 'Desserts', itemName: 'Ice Cream',        description: 'Assorted flavors including mango, pista, and classic vanilla',                     isVeg: true, sortOrder: 10 },
    // Beverages
    { category: 'Beverages', itemName: 'Mango Lassi',      description: 'Chilled yogurt smoothie blended with fresh Alphonso mango pulp',        isVeg: true, sortOrder: 11 },
    { category: 'Beverages', itemName: 'Filter Coffee',    description: 'Authentic South Indian filter coffee brewed with freshly ground beans',  isVeg: true, sortOrder: 12 },
    { category: 'Beverages', itemName: 'Fresh Lime Soda',  description: 'Refreshing lime soda — sweet, salty, or mixed to your taste',            isVeg: true, sortOrder: 13 },
  ];

  await FoodMenu.insertMany(menu);
  console.log('   → Seeded food_menu');
}

async function seedMedia() {
  const count = await Media.countDocuments();
  if (count > 0) return;

  await Media.create({
    type: 'youtube',
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    title: 'Harsha & Manasa — Save the Date',
    description: 'A glimpse into our beautiful journey together.',
    sortOrder: 1,
  });

  console.log('   → Seeded media');
}

async function seedGifts() {
  const count = await Gift.countDocuments();
  if (count > 0) return;

  const gifts = [
    {
      title: 'Bless with a Gift',
      description: 'Your presence is our greatest gift. However, if you wish to bless us, monetary gifts are welcome.',
      type: 'money',
      icon: '🎁',
      link: '',
      details: 'UPI: harsha@upi',
      sortOrder: 1,
    },
    {
      title: 'Gift Card',
      description: 'Send a gift card from Amazon or Flipkart for our new home.',
      type: 'link',
      icon: '🛍️',
      link: 'https://www.amazon.in/gift-cards',
      details: '',
      sortOrder: 2,
    },
    {
      title: 'Home Appliances',
      description: 'Help us set up our new home with kitchen and home appliances.',
      type: 'item',
      icon: '🏠',
      link: '',
      details: '',
      sortOrder: 3,
    },
  ];

  await Gift.insertMany(gifts);
  console.log('   → Seeded gifts');
}

export default { connectDB, seedData };
