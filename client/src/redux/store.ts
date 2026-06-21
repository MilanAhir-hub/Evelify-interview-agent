import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import aptitudeReducer from './slices/aptitudeSlice';

// dispatch means:- Tell Redux to update state
// reducer:- this is the function which changing the state

export const store = configureStore({
  reducer: {
    auth: authReducer,
    aptitude: aptitudeReducer,
  },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {auth: AuthState}
export type AppDispatch = typeof store.dispatch;
