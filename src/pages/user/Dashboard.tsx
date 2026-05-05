import { useAppSelector } from '@/app/hooks';
import { RootState } from '@/app/store';
import { useEffect } from 'react';
import { useNavigate } from 'react-router';

const Dashboard = () => {
  const navigate = useNavigate();
  const { Roles } = useAppSelector((state: RootState) => state.user);
  useEffect(() => {
    // if (Roles.includes(2000)) {
    //   navigate('/roleAssignment');
    // }
    // if (Roles.includes(1000)) {
    //   navigate('/roleAssignment');
    // }
    if (Roles.includes(2)) {
      navigate('/purchaseOrder');
    }
    if (Roles.includes(1)) {
      navigate('/finance');
    }
    if (Roles.includes(0)) {
      navigate('/purchaseOrder');
    }
    // if (Roles.includes(-1) && Roles.length === 1) {
    //   navigate('/unauthorized');
    // }
  }, [Roles]);
  return <div></div>;
};

export default Dashboard;
