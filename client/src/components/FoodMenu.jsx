import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSiteData } from '../context/SiteContext';

const defaultMenu = [
  { id: 1, category: 'Starters', name: 'Paneer Tikka', description: 'Marinated cottage cheese grilled in tandoor', is_veg: true },
  { id: 2, category: 'Starters', name: 'Chicken 65', description: 'Spicy deep-fried chicken with curry leaves', is_veg: false },
  { id: 3, category: 'Starters', name: 'Vegetable Samosa', description: 'Crispy pastry with spiced potato filling', is_veg: true },
  { id: 4, category: 'Main Course', name: 'Hyderabadi Biryani', description: 'Aromatic basmati rice with spices and saffron', is_veg: false },
  { id: 5, category: 'Main Course', name: 'Paneer Butter Masala', description: 'Creamy tomato gravy with cottage cheese', is_veg: true },
  { id: 6, category: 'Main Course', name: 'Dal Makhani', description: 'Slow-cooked black lentils in butter cream', is_veg: true },
  { id: 8, category: 'Desserts', name: 'Gulab Jamun', description: 'Deep-fried milk dumplings in rose syrup', is_veg: true },
  { id: 10, category: 'Beverages', name: 'Mango Lassi', description: 'Creamy yogurt drink with fresh mangoes', is_veg: true },
];

const categories = ['All', 'Starters', 'Main Course', 'Desserts', 'Beverages'];

export default function FoodMenu() {
  const { menu } = useSiteData();
  const [activeCategory, setActiveCategory] = useState('All');
  const displayMenu = menu?.length > 0 ? menu : defaultMenu;

  const filteredItems = activeCategory === 'All'
    ? displayMenu
    : displayMenu.filter(item => item.category === activeCategory);

  const groupedItems = {};
  if (activeCategory === 'All') {
    filteredItems.forEach(item => {
      if (!groupedItems[item.category]) groupedItems[item.category] = [];
      groupedItems[item.category].push(item);
    });
  } else {
    groupedItems[activeCategory] = filteredItems;
  }

  return (
    <section className="section" id="menu">
      <div className="section__container menu-container">
        <motion.div 
          className="section__header"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="section__label">The Feast</span>
          <h2 className="section__title">Culinary Delights</h2>
          <p className="section__subtitle">A curated menu for our special day</p>
          <div className="section__ornament">
            <span className="section__ornament-dot" />
          </div>
        </motion.div>

        <div className="menu-tabs">
          {categories.map(cat => (
            <button
              key={cat}
              className={`menu-tab ${activeCategory === cat ? 'menu-tab--active' : ''}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
              {activeCategory === cat && (
                <motion.div className="menu-tab-bg" layoutId="menuTabPill" />
              )}
            </button>
          ))}
        </div>

        <div className="menu-list glass-card">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeCategory}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              {Object.entries(groupedItems).map(([category, items]) => (
                <div className="menu-category" key={category}>
                  {activeCategory === 'All' && (
                    <h3 className="menu-category-title">{category}</h3>
                  )}
                  <div className="menu-items">
                    {items.map((item) => (
                      <div className="menu-item" key={item.id || item.name}>
                        <div className="menu-item-main">
                          <div className="menu-item-left">
                            <span className={`menu-veg-dot ${item.is_veg ? 'veg' : 'nonveg'}`} />
                            <span className="menu-item-name">{item.name}</span>
                          </div>
                          <div className="menu-item-dots" />
                        </div>
                        {item.description && (
                          <div className="menu-item-desc">{item.description}</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <style>{`
        .menu-container {
          max-width: 800px;
        }

        .menu-tabs {
          display: flex;
          justify-content: center;
          gap: 8px;
          margin-bottom: 48px;
          flex-wrap: wrap;
        }

        .menu-tab {
          position: relative;
          padding: 10px 24px;
          font-family: var(--font-body);
          font-size: 0.8rem;
          font-weight: 500;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--text-secondary);
          z-index: 1;
        }

        .menu-tab--active {
          color: var(--color-ivory);
        }

        .menu-tab-bg {
          position: absolute;
          inset: 0;
          background: var(--color-burgundy);
          border-radius: var(--radius-full);
          z-index: -1;
        }

        .menu-list {
          padding: 40px 48px;
        }

        .menu-category {
          margin-bottom: 40px;
        }

        .menu-category:last-child {
          margin-bottom: 0;
        }

        .menu-category-title {
          font-family: var(--font-cursive);
          font-size: 2rem;
          color: var(--color-gold-dark);
          text-align: center;
          margin-bottom: 24px;
        }

        .menu-item {
          margin-bottom: 20px;
        }

        .menu-item:last-child {
          margin-bottom: 0;
        }

        .menu-item-main {
          display: flex;
          align-items: flex-end;
          gap: 16px;
        }

        .menu-item-left {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-shrink: 0;
        }

        .menu-item-name {
          font-family: var(--font-heading);
          font-size: 1.25rem;
          color: var(--text-primary);
        }

        .menu-item-dots {
          flex: 1;
          border-bottom: 1.5px dotted var(--color-champagne);
          margin-bottom: 8px;
        }

        .menu-item-desc {
          font-family: var(--font-body);
          font-size: 0.9rem;
          color: var(--text-tertiary);
          margin-top: 4px;
          padding-left: 20px;
        }

        .menu-veg-dot {
          width: 8px; height: 8px;
          border-radius: 50%;
        }
        .menu-veg-dot.veg { background: #22c55e; box-shadow: 0 0 0 2px rgba(34,197,94,0.2); }
        .menu-veg-dot.nonveg { background: #ef4444; box-shadow: 0 0 0 2px rgba(239,68,68,0.2); }

        @media (max-width: 768px) {
          .menu-list { padding: 32px 24px; }
          .menu-item-main { flex-direction: column; align-items: flex-start; gap: 4px; }
          .menu-item-dots { display: none; }
        }
      `}</style>
    </section>
  );
}
