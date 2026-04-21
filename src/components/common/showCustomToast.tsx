import toast from 'react-hot-toast';
import CustomToast from './CustomToast';

type ShowToastProps = {
  title?: string;
  message: string;
  type?: 'success' | 'error' | 'info' | 'warning';
};

export const showCustomToast = ({ title, message, type = 'success' }: ShowToastProps) => {
  toast.custom((t) => <CustomToast t={t} title={title} type={type} message={message} />);
};
