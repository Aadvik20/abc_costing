import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router';
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
import PurchaseOrderExcelFormate from '@/pages/user/PurchaseOrderExcelFormate';
import PurchaseOrderV2 from '@/pages/user/PurchaseOrderV2';

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
        <Route element={<AppLayout isAdmin={false} />}>
          <Route element={<PrivateRoute allowedRoles={[-1]} />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/dashboard" element={<Dashboard />} />
          </Route>
          <Route element={<PrivateRoute allowedRoles={[-1]} />}>
            <Route path="/paymentDetails" element={<PurchaseOrderExcelFormate />} />
            <Route path="/paymentDetailsV2" element={<PurchaseOrderV2 />} />
          </Route>
        </Route>
        <Route element={<AppLayout isAdmin={true} />}>
          <Route element={<PrivateRoute allowedRoles={[-1]} />}></Route>
        </Route>
        <Route element={<AppLayout isAdmin={true} />}></Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
};

export default AppRoutes;
