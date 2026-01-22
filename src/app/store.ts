import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storageSession from 'redux-persist/lib/storage/session';
import { combineReducers } from 'redux';
import userReducer from '@/features/user/userSlice';
import applicationsReducer from '@/features/applications/applicationSlice';
import masterDataReducer from '../features/masterData/masterSlice';
import tokenDataReduer from '../features/user/TokenDataSlice';
import quarterTypesReducer from '../features/quarter/QuarterTypeSlice';
import quarterDetailsReducer from '../features/quarter/quarterDetailsSlice';
import employeeListReducer from '../features/quarter/employeeListSlice';
import quarterEmployeeMapReducer from '../features/quarter/quarterEmployeeMapSlice';
import userRoleReducer from '../features/userRole/userRoles';
import masterRolesReducer from '../features/userRole/masterRoles';
import quarterEmployeeBillMapReducer from '../features/quarter/quarterEmployeeBillMapSlice';

const persistConfig = {
  key: 'root',
  storage: storageSession,
  whitelist: ['user', 'applications'],
};

const rootReducer = combineReducers({
  user: userReducer,
  applications: applicationsReducer,
  masterData: masterDataReducer,
  tokenData: tokenDataReduer,
  quarterTypes: quarterTypesReducer,
  quarterDetails: quarterDetailsReducer,
  employeeList: employeeListReducer,
  quarterEmployeeMapList: quarterEmployeeMapReducer,
  userRoles: userRoleReducer,
  masterRoles: masterRolesReducer,
  quarterEmployeeBillMap: quarterEmployeeBillMapReducer,
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
