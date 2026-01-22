import axios from 'axios';
import { environment } from '@/config';
import { clearAllStorage, getObjectFromSessionStorage } from '@/lib/helperFunction';
import toast from 'react-hot-toast';
import logger from '@/lib/logger';
import { oidcConfig } from '@/auth/config';
import { RootState } from '@/app/store';
let reduxStore: any = null;
export const injectStore = (store: any) => {
  reduxStore = store;
};
const axiosInstance = axios.create({
  baseURL: environment.apiUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    const tokenData = getObjectFromSessionStorage(`oidc.user:${oidcConfig.authority}:${oidcConfig.client_id}`);
    const accessToken =
      'eyJhbGciOiJSUzI1NiIsImtpZCI6IjY4MjU4MzZGMEQ2QzVDQkM4NUE4QjQxQjg5QjFCMDQ4IiwidHlwIjoiYXQrand0In0.eyJuYmYiOjE3Njg5MDg3NjQsImV4cCI6MTc2ODkwOTM2NCwiaXNzIjoiaHR0cHM6Ly9hcHAyLmRmY2NpbC5jb20iLCJhdWQiOiJhcGkxIiwiY2xpZW50X2lkIjoiN2RhNjg4YWU1OWU2NDRmYWEyMTY4MWNmY2QyNTc1ZmYiLCJzdWIiOiJGRjI5M0RERi1FMThELTRENUEtQThBQy1GOTNDMUU1QzZCREYiLCJhdXRoX3RpbWUiOjE3Njg5MDg3NjQsImlkcCI6ImxvY2FsIiwicHJlZmVycmVkX3VzZXJuYW1lIjoiRkYyOTNEREYtRTE4RC00RDVBLUE4QUMtRjkzQzFFNUM2QkRGIiwiVXNlcklkIjoiMTAxMDg5IiwidXNlcm5hbWUiOiIxMDEwODkiLCJlbWFpbCI6Im1ndXNhaW5AeW9wbWFpbC5jb20iLCJFbWFpbElkIjoibWd1c2FpbkB5b3BtYWlsLmNvbSIsIm5hbWUiOiJNQU1UQSBHVVNBSU4iLCJVbml0TmFtZSI6IkNvcnBvcmF0ZSBvZmZpY2UiLCJVbml0SWQiOiIzOTYiLCJkZXBhcnRtZW50IjoiSFIiLCJkZXNpZ25hdGlvbiI6IkRHTSIsImxldmVsIjoiRTUiLCJzZXNzaW9uX2lkIjoiMDliOTZmMGYtODNiNS00ZGRlLTlmNDktYTY1ODU4M2RhNmUzIiwibG9naW5faWQiOiJtZ3VzYWluLmRmY2MiLCJJc0QiOiJGYWxzZSIsIkR1c2VyIjoiMTAxMDg5IiwiSXNSZWFkT25seSI6IkZhbHNlIiwiSXNCIjoiRmFsc2UiLCJJc0VvZmZpY2VFbGVnaWJsZSI6InRydWUiLCJJc1NwYXJyb3dFbGVnaWJsZSI6InRydWUiLCJqdGkiOiI5Rjg0ODAxMDcxOTg3Q0IxMTI2RDA2RURBQjJGNDlFNyIsInNpZCI6IjFEMDE2MEVEREQzNUVBRDQ3NzBGNDJFRTJEN0IyNjNDIiwiaWF0IjoxNzY4OTA4NzY0LCJzY29wZSI6WyJvcGVuaWQiLCJwcm9maWxlIiwiYXBpMSJdLCJhbXIiOlsicHdkIl19.gqnzPcI_qY5jaGif3UcFhcBwPsrJsLngJHbH0neH6ktDHd_3GKVo4jofS09x736ni2io75A8J4lqY8dfFK5owM34HgHtJcZ_SZVAU8_9qSSvsq55jiK6hUxWinL6s4V5GD8LYHpDHlakBg3IvAKG184HP0YQoP6LWbDVek6O2c6rzTXrLbiy81h7ZblTQgO5HfR7PWdlj7CLSCCbrkJbpFT0iDzCakyE5xiRYukHE1EMRQ7q4ZX8sB7MWV-akhq2i1tvaW26eBWmQ1h3FG1u8RSDv-HRTIpjMRKcyA48N42fDapgbmhGmyNF3ru0YVQXrfsNAz2kg3YSzibrVTsEQQ';
    if (accessToken) {
      config.headers['Authorization'] = `Bearer ${accessToken}`;
    }
    if (reduxStore) {
      const state = reduxStore.getState() as RootState;
      const decodedToken = state.tokenData;

      const isReadOnly = decodedToken?.decoded?.IsReadOnly === 'True';
      if (isReadOnly) {
        const method = (config.method || 'get').toLowerCase();
        const isWriteMethod = ['post', 'put', 'patch', 'delete'].includes(method);
        if (isWriteMethod) {
          toast.error('You are not authorized to perform this action.');
          // Cancel this request before it hits server
          return Promise.reject(new axios.Cancel('READ_ONLY_MODE'));
        }
      }
    }
    config.headers['DeviceType'] = 'web';
    return config;
  },
  (error) => {
    logger.error(error);
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ERR_NETWORK') {
      toast.error('Your session has expired. Please log in again.');
      clearAllStorage();
      setTimeout(() => {
        window.location.href = environment.exitUrl;
      }, 500);
    }

    // Make sure error.response exists before accessing its status
    if (error.response && error.response.status === 401) {
      toast.error('Authorization failed. Your session has expired. Redirecting to login...');
      clearAllStorage();
      setTimeout(() => {
        window.location.href = environment.exitUrl;
      }, 500);
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
