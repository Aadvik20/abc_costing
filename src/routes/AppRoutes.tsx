import React from 'react';
import { Routes, Route } from 'react-router';
import { useEffect } from 'react';
import PrivateRoute from './PrivateRoute';
import Unauthorized from '@/pages/unauthorized/Unauthorized';
import NotFound from '@/pages/notFound/NotFound';
import HomePage from '@/pages/home/Home';
import AdminDashboard from '@/pages/admin/AdminDashboard';
import FrontChannelLogout from '@/auth/FrontChannelLogout';
import { useAppSelector } from '@/app/hooks';
import { useGlobalLogout } from '@/auth/useGlobalLogout';
import { AppDispatch, RootState } from '@/app/store';
import Seo from '@/components/common/Seo';
import { useAppName } from '@/hooks/useAppName';
import { useAuth } from 'react-oidc-context';
import { useDispatch, useSelector } from 'react-redux';
import AppLayout from '@/components/layout/app-layout';
import Finance from '@/pages/Finance';
import PurchaseOrderV2 from '@/pages/Version-2/PurchaseOrderV2';
import FinanceV2 from '@/pages/Version-2/FinanceV2';
import { fetchMasterData } from '@/features/masterData/masterSlice';
import { fetchApplications } from '@/features/applications/applicationSlice';
import PurchaseOrder from '@/pages/PurchaseOrder';
import RoleAssignment from '@/pages/RoleAssignment';

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
          <Route element={<PrivateRoute allowedRoles={['user']} />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/dashboard" element={<PurchaseOrder />} />
            <Route path="/finance" element={<Finance />} />
            <Route path="/roleAssignment" element={<RoleAssignment />} />

            <Route path="/purchaseOrderV2" element={<PurchaseOrderV2 />} />
            <Route path="/financeV2" element={<FinanceV2 />} />
          </Route>
        </Route>
        <Route element={<AppLayout isAdmin={true} />}>
          <Route element={<PrivateRoute allowedRoles={['user']} />}></Route>
        </Route>
        <Route element={<AppLayout isAdmin={true} />}>
          <Route element={<PrivateRoute allowedRoles={['admin', 'superAdmin']} />}>
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
          </Route>
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
};

export default AppRoutes;
