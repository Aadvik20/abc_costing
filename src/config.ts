const DFCCIL_UAT = {
  apiUrl: 'https://uatadverseapi.dfccil.com/api',
  orgHierarchy: 'https://uatorganization.dfccil.com/api',
  logoutUrl: 'https://uat.dfccil.com/DfcHome',
  exitUrl: 'https://uatlogin.dfccil.com/applications',
  authUrl: 'https://app2.dfccil.com',
  clientId: 'd46b7d786c604ab0820fedfc52f701db',
  postLogout: 'https://uatlogin.dfccil.com/signout',
  redirectPath: 'dashboard',
  applicationId: 101,
};

const DFCCIL_PROD = {
  apiUrl: 'https://uatquarterapi.dfccil.com/api',
  orgHierarchy: 'https://orgsvc.dfccil.com/api',
  logoutUrl: 'https://it.dfccil.com/Home/Home',
  exitUrl: 'https://dashboard.dfccil.com/applications',
  authUrl: 'https://app2.dfccil.com',
  clientId: '29d9a04b724941b3a490899d950aa3ce',
  postLogout: 'https://dashboard.dfccil.com/signout',
  redirectPath: 'dashboard',
  applicationId: 4,
};

export const environment = DFCCIL_UAT;
