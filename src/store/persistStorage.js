import { createWebStorage } from 'redux-persist/lib/storage/createWebStorage';

const createNoopStorage = () => {
  return {
    getItem(_key) {
      return Promise.resolve(null);
    },
    setItem(_key, value) {
      return Promise.resolve(value);
    },
    removeItem(_key) {
      return Promise.resolve();
    },
  };
};

// Use real localStorage in the browser, noopStorage during SSR
const storage = typeof window !== 'undefined' ? createWebStorage('local') : createNoopStorage();

export default storage;
