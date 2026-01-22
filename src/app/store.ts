import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storageSession from 'redux-persist/lib/storage/session';
import { combineReducers } from 'redux';
import userReducer from '@/features/user/userSlice';
import poSlicereducer from '@/features/ManagePoSlice';
import applicationsReducer from '@/features/applications/applicationSlice';
import tokenDataReduer from '../features/user/TokenDataSlice';
import FinanceSlicereducer from '@/features/FinanceSlice';
import masterDatareducer from '@/features/masterData/masterSlice';

const persistConfig = {
  key: 'root',
  storage: storageSession,
  whitelist: ['user', 'applications'],
};

const rootReducer = combineReducers({
  user: userReducer,
  applications: applicationsReducer,
  tokenData: tokenDataReduer,
  poSlice: poSlicereducer,
  FinanceSlice: FinanceSlicereducer,
  masterData: masterDatareducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export const persister = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
