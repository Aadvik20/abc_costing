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
import { fetchApplications } from '@/features/applications/applicationSlice';
import AppLayout from '@/components/layout/app-layout';
import Seo from '@/components/common/Seo';
import { useAppName } from '@/hooks/useAppName';
import { useAuth } from 'react-oidc-context';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMasterData } from '@/features/masterData/masterSlice';
import EmployeeQuarterAllocation from '@/pages/admin/EmployeeQuarterAllocation';
import GradePositionMapping from '@/pages/admin/GradePositionMapping';
import QuarterDetailsManagement from '@/pages/admin/QuarterDetailsManagement';
import QuarterRentManagement from '@/pages/admin/QuarterRentManagement';
import QuarterTypeManagement from '@/pages/admin/QuarterTypeManagement';
import Dashboard from '@/pages/user/Dashboard';

const AppRoutes = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { fullDescription, description } = useAppName();
  const applications = useAppSelector((state: RootState) => state.applications.applications);
  const { isAuthenticated } = useAuth();
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
            <Route path="/employee-quarter-allocation" element={<EmployeeQuarterAllocation />} />
            <Route path="/grade-position-mapping" element={<GradePositionMapping />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/quarter-details-management" element={<QuarterDetailsManagement />} />
            <Route path="/quarter-rent-management" element={<QuarterRentManagement />} />
            <Route path="/quarter-type-management" element={<QuarterTypeManagement />} />
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
