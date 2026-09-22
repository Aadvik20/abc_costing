import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storageSession from 'redux-persist/lib/storage/session';
import { combineReducers } from 'redux';
import userReducer from '@/features/user/userSlice';
import applicationsReducer from '@/features/applications/applicationSlice';
import tokenDataReduer from '../features/user/TokenDataSlice';
import poSlicereducer from '@/features/user/PoSlice';
import pendingInventorySliceReducer from '@/features/user/GrirItemsSlice';
import openItemSliceReducer from '@/features/user/OpenItemsSlice';
import ParkItemSliceReducer from '@/features/user/ParkButNotPosted';
import masterDatareducer from '@/features/masterData/masterSlice';
import MsmeVendorSliceReducer from '@/features/user/MsmeVendorSlice';

const persistConfig = {
  key: 'root',
  storage: storageSession,
  whitelist: ['user', 'applications'],
};

const rootReducer = combineReducers({
  user: userReducer,
  applications: applicationsReducer,
  poSlice: poSlicereducer,
  pendingInventorySlice: pendingInventorySliceReducer,
  openItemSlice: openItemSliceReducer,
  parkItemSlice: ParkItemSliceReducer,
  msmeVendorSlice: MsmeVendorSliceReducer,
  tokenData: tokenDataReduer,
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
