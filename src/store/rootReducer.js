import { combineReducers } from "@reduxjs/toolkit";
import { persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import conferenceReducer from "./conferenceSlice.js";

// Configuration for the conference slice specifically
const conferencePersistConfig = {
  key: "conference",
  storage,
  // We ONLY want to save user and room info
  whitelist: ["user", "room"],
  // We NEVER want to save live streams or temporary peer data
  blacklist: ["peers"],
};

const rootReducer = combineReducers({
  // Apply the nested persistReducer here
  conference: persistReducer(conferencePersistConfig, conferenceReducer),
});

export default rootReducer;
