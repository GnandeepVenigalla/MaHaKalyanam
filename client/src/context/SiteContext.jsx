import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { fetchContent, fetchEvents, fetchMenu, fetchMedia, fetchGifts } from '../utils/api';

const SiteContext = createContext(null);

export function SiteProvider({ children }) {
  const [content, setContent] = useState({});
  const [events, setEvents] = useState([]);
  const [menu, setMenu] = useState([]);
  const [media, setMedia] = useState([]);
  const [gifts, setGifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [contentData, eventsData, menuData, mediaData, giftsData] = await Promise.allSettled([
        fetchContent(),
        fetchEvents(),
        fetchMenu(),
        fetchMedia(),
        fetchGifts(),
      ]);

      if (contentData.status === 'fulfilled') {
        // Transform array of { key, value } into an object
        const contentObj = {};
        if (Array.isArray(contentData.value)) {
          contentData.value.forEach(item => {
            contentObj[item.key] = item.value;
          });
        } else {
          Object.assign(contentObj, contentData.value);
        }
        setContent(contentObj);
      }

      if (eventsData.status === 'fulfilled') {
        setEvents(eventsData.value || []);
      }

      if (menuData.status === 'fulfilled') {
        // Menu may come as grouped object { Starters: [...], ... } or flat array
        const raw = menuData.value || [];
        if (Array.isArray(raw)) {
          setMenu(raw);
        } else if (typeof raw === 'object') {
          // Flatten grouped object into a flat array
          const flat = [];
          Object.entries(raw).forEach(([category, items]) => {
            if (Array.isArray(items)) {
              items.forEach(item => flat.push({ ...item, category, name: item.item_name || item.name }));
            }
          });
          setMenu(flat);
        }
      }

      if (mediaData.status === 'fulfilled') {
        setMedia(mediaData.value || []);
      }

      if (giftsData.status === 'fulfilled') {
        setGifts(giftsData.value || []);
      }
    } catch (err) {
      setError(err.message);
      console.error('Failed to load site data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const value = {
    content,
    events,
    menu,
    media,
    gifts,
    loading,
    error,
    refresh: loadData,
  };

  return (
    <SiteContext.Provider value={value}>
      {children}
    </SiteContext.Provider>
  );
}

export function useSiteData() {
  const context = useContext(SiteContext);
  if (!context) {
    throw new Error('useSiteData must be used within a SiteProvider');
  }
  return context;
}

export default SiteContext;
