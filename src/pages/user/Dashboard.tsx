import { useAppSelector } from '@/app/hooks';
import { RootState } from '@/app/store';
import { useEffect } from 'react';
import { useNavigate } from 'react-router';

const Dashboard = () => {
  const navigate = useNavigate();
  const { Roles } = useAppSelector((state: RootState) => state.user);
  useEffect(() => {
    if (Roles.includes('User')) {
      navigate('/corridormaster');
    }
  }, [Roles]);
  return <div></div>;
};

export default Dashboard;
