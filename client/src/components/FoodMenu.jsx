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
  { id: 7, category: 'Main Course', name: 'Gutti Vankaya', description: 'Stuffed brinjal curry, Andhra style', is_veg: true },
  { id: 8, category: 'Desserts', name: 'Gulab Jamun', description: 'Deep-fried milk dumplings in rose syrup', is_veg: true },
  { id: 9, category: 'Desserts', name: 'Double Ka Meetha', description: 'Hyderabadi bread pudding with nuts', is_veg: true },
  { id: 10, category: 'Beverages', name: 'Mango Lassi', description: 'Creamy yogurt drink with fresh mangoes', is_veg: true },
  { id: 11, category: 'Beverages', name: 'Masala Chai', description: 'Spiced Indian tea with cardamom and ginger', is_veg: true },
];

const categories = ['All', 'Starters', 'Main Course', 'Desserts', 'Beverages'];

export default function FoodMenu() {
  const { menu } = useSiteData();
  const [activeCategory, setActiveCategory] = useState('All');
  const displayMenu = menu.length > 0 ? menu : defaultMenu;

  const filteredItems = activeCategory === 'All'
    ? displayMenu
    : displayMenu.filter(item => item.category === activeCategory);

  return (
    <section className="food-menu section" id="menu">
      <div className="section__container">
        <div className="section__header">
          <h2 className="section__title">Wedding Feast</h2>
          <p className="section__subtitle">A culinary celebration of flavors</p>
          <div className="section__ornament">
            <span className="section__ornament-dot" />
          </div>
        </div>

        {/* Category tabs */}
        <div className="food-menu__tabs">
          {categories.map(cat => (
            <button
              key={cat}
              className={`food-menu__tab ${activeCategory === cat ? 'food-menu__tab--active' : ''}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
              {activeCategory === cat && (
                <motion.div
                  className="food-menu__tab-indicator"
                  layoutId="menuTab"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
            </button>
          ))}
        </div>

        {/* Menu grid */}
        <motion.div className="food-menu__grid" layout>
          <AnimatePresence mode="popLayout">
            {filteredItems.map(item => (
              <motion.div
                key={item.id || item.name}
                className="food-menu__item glass-card"
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
              >
                <div className="food-menu__item-header">
                  <h4 className="food-menu__item-name">{item.name}</h4>
                  <span className={`food-menu__veg-badge ${item.is_veg ? 'food-menu__veg-badge--veg' : 'food-menu__veg-badge--nonveg'}`}>
                    <span className="food-menu__veg-dot" />
                  </span>
                </div>
                {item.description && (
                  <p className="food-menu__item-desc">{item.description}</p>
                )}
                {item.category && activeCategory === 'All' && (
                  <span className="food-menu__item-category">{item.category}</span>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>

      <style>{`
        .food-menu {
          background: var(--color-burgundy-deep);
        }

        .food-menu__tabs {
          display: flex;
          justify-content: center;
          gap: var(--space-sm);
          margin-bottom: var(--space-3xl);
          flex-wrap: wrap;
        }

        .food-menu__tab {
          position: relative;
          padding: var(--space-sm) var(--space-xl);
          font-family: var(--font-heading);
          font-size: 1rem;
          font-weight: 500;
          color: var(--text-tertiary);
          background: transparent;
          border: 1px solid transparent;
          border-radius: var(--radius-full);
          cursor: pointer;
          transition: all var(--transition-base);
          letter-spacing: 0.05em;
        }

        .food-menu__tab:hover {
          color: var(--text-primary);
        }

        .food-menu__tab--active {
          color: var(--text-on-gold);
        }

        .food-menu__tab-indicator {
          position: absolute;
          inset: 0;
          background: var(--gradient-gold);
          border-radius: var(--radius-full);
          z-index: -1;
        }

        .food-menu__grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: var(--space-lg);
          max-width: 1000px;
          margin: 0 auto;
        }

        .food-menu__item {
          padding: var(--space-xl);
        }

        .food-menu__item-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: var(--space-md);
          margin-bottom: var(--space-sm);
        }

        .food-menu__item-name {
          font-family: var(--font-heading);
          font-size: 1.15rem;
          font-weight: 600;
          color: var(--text-primary);
        }

        .food-menu__veg-badge {
          width: 18px;
          height: 18px;
          border: 1.5px solid;
          border-radius: 3px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          margin-top: 3px;
        }

        .food-menu__veg-badge--veg {
          border-color: #2ECC71;
        }

        .food-menu__veg-badge--nonveg {
          border-color: #E34234;
        }

        .food-menu__veg-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }

        .food-menu__veg-badge--veg .food-menu__veg-dot {
          background: #2ECC71;
        }

        .food-menu__veg-badge--nonveg .food-menu__veg-dot {
          background: #E34234;
        }

        .food-menu__item-desc {
          font-size: 0.9rem;
          color: var(--text-tertiary);
          line-height: 1.5;
        }

        .food-menu__item-category {
          display: inline-block;
          font-size: 0.7rem;
          color: var(--color-gold);
          background: rgba(212, 168, 83, 0.1);
          padding: 2px 10px;
          border-radius: var(--radius-full);
          margin-top: var(--space-md);
          font-weight: 500;
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }

        @media (max-width: 600px) {
          .food-menu__grid {
            grid-template-columns: 1fr;
          }
          .food-menu__tabs {
            gap: var(--space-xs);
          }
          .food-menu__tab {
            padding: var(--space-xs) var(--space-md);
            font-size: 0.9rem;
          }
        }
      `}</style>
    </section>
  );
}
