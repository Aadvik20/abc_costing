// import { useAppSelector } from '@/app/hooks';
// import { RootState } from '@/app/store';
// import { useEffect } from 'react';
// import { useNavigate } from 'react-router';

// const Dashboard = () => {
//   const navigate = useNavigate();
//   const { Roles } = useAppSelector((state: RootState) => state.user);
//   useEffect(() => {
//     if (Roles.includes('User')) {
//       navigate('/Login');
//     }
//   }, [Roles]);
//   return <div></div>;
// };

// export default Dashboard;


const Dashboard = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-primary">
        ABC Costing Dashboard
      </h1>

      <p className="mt-2 text-muted-foreground">
        Welcome to ABC Costing.
      </p>
    </div>
  );
};

export default Dashboard;

