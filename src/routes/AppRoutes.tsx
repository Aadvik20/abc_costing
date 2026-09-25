import React, { useEffect } from 'react';
// import { Routes, Route } from 'react-router';
import PrivateRoute from './PrivateRoute';
import Unauthorized from '@/pages/unauthorized/Unauthorized';
import NotFound from '@/pages/notFound/NotFound';
import HomePage from '@/pages/home/Home';
import FrontChannelLogout from '@/auth/FrontChannelLogout';
import { useAppSelector } from '@/app/hooks';
import { useGlobalLogout } from '@/auth/useGlobalLogout';
import { AppDispatch, RootState } from '@/app/store';
import Seo from '@/components/common/Seo';
import { useAppName } from '@/hooks/useAppName';
import { useAuth } from 'react-oidc-context';
import { useDispatch, useSelector } from 'react-redux';
import AppLayout from '@/components/layout/app-layout';
import { fetchMasterData } from '@/features/masterData/masterSlice';
import { fetchApplications } from '@/features/applications/applicationSlice';
import Dashboard from '@/pages/user/Dashboard';
import CorridorMaster from '@/pages/user/CorridorMaster';
import ProjectOffice from '@/pages/user/ProjectOffice';
import DepartmentMaster from '@/pages/user/DepartmentMaster';
import UnitDepartments from '@/pages/user/UnitDepartments';
import CostGroup from '@/pages/user/CostGroup';
import DailyTransactions from '@/pages/user/DailyTransactions';
import ActivityBasedCosting from '@/pages/user/ActivityBasedCosting';
import Login from '@/pages/Login';
import { Navigate, Route, Routes } from 'react-router';

const AppRoutes = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { fullDescription, description } = useAppName();
  const { isAuthenticated } = useAuth();
  const applications = useAppSelector((state: RootState) => state.applications.applications);

  const masterData = useSelector((state: RootState) => state.masterData.departments);
  useEffect(() => {
    if (isAuthenticated && masterData?.length === 0) {
      dispatch(fetchMasterData());
    }
  }, [masterData.length, isAuthenticated]);
  useGlobalLogout();
  useEffect(() => {
    if (applications?.length === 0) {
      dispatch(fetchApplications());
    }
  }, [applications, dispatch]);
  return (
    <>
      <Seo title={fullDescription} description={description} />
      <Routes>
  <Route path="/unauthorized" element={<Unauthorized />} />
  <Route path="/logout-notification" element={<FrontChannelLogout />} />

  {/* Login */}
  <Route path="/login" element={<Login />} />

  {/* User Application */}
  <Route element={<AppLayout isAdmin={false} />}>
    <Route element={<PrivateRoute allowedRoles={['User']} />}>
      
      {/* Root URL -> Dashboard */}
      <Route path="/" element={<Navigate to="/activitybasedcosting" replace />} />

      <Route path="/dashboard" element={<Dashboard />} />

      <Route path="/corridormaster" element={<CorridorMaster />} />
      <Route path="/projectoffice" element={<ProjectOffice />} />
      <Route path="/departmentmaster" element={<DepartmentMaster />} />
      <Route path="/unitdepartments" element={<UnitDepartments />} />
      <Route path="/costgroup" element={<CostGroup />} />
      <Route path="/dailytransactions" element={<DailyTransactions />} />
      <Route path="/activitybasedcosting" element={<ActivityBasedCosting />} />

    </Route>
  </Route>

  {/* Admin */}
  <Route element={<AppLayout isAdmin={true} />}>
    <Route element={<PrivateRoute allowedRoles={['User']} />}>
      {/* Admin routes here */}
    </Route>
  </Route>

  {/* 404 */}
  <Route path="*" element={<NotFound />} />
</Routes>
    </>
  );
};

export default AppRoutes;
