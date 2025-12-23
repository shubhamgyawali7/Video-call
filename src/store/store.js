"use client";

import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
// import storage from "./persistStorage.js";
import rootReducer from "./rootReducer.js";

const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Add your conference action and the peers path here
        ignoredActions: [
          "persist/PERSIST",
          "persist/REHYDRATE",
          "persist/PAUSE",
          "persist/PURGE",
          "persist/REGISTER",
          "conference/addPeer", // Ignore the action that carries the stream
        ],
        ignoredPaths: [
          "register",
          "conference.peers", // Ignore the path where streams are stored
        ],
      },
    }),
});

const persistor = persistStore(store);

export { store, persistor };
