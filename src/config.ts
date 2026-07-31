const DFCCIL_UAT = {
  apiUrl: 'https://uatopenpoapi.dfccil.com/api',
  TRANSFER_apiUrl: 'https://uattransferapi.dfccil.com/api',
  orgHierarchy: 'https://uatorganization.dfccil.com/api',
  logoutUrl: 'https://uat.dfccil.com/DfcHome',
  exitUrl: 'https://uatlogin.dfccil.com/applications',
  authUrl: 'https://app2.dfccil.com',
  clientId: '29d9a04b724941b3a490899d950aa3ce',
  postLogout: 'https://uatlogin.dfccil.com/signout',
  redirectPath: 'dashboard',
  applicationId: 76,
};

const DFCCIL_PROD = {
  apiUrl: 'https://uatquarterapi.dfccil.com/api',
  TRANSFER_apiUrl: 'https://uattransferapi.dfccil.com/api',
  orgHierarchy: 'https://orgsvc.dfccil.com/api',
  logoutUrl: 'https://it.dfccil.com/Home/Home',
  exitUrl: 'https://dashboard.dfccil.com/applications',
  authUrl: 'https://app2.dfccil.com',
  clientId: '29d9a04b724941b3a490899d950aa3ce',
  postLogout: 'https://dashboard.dfccil.com/signout',
  redirectPath: 'dashboard',
  applicationId: 4,
};

// https://github.com/DfccilIT/TransferModuleFrontEnd.git

export const environment = DFCCIL_UAT;

export const SESSION_CHECK_INTERVAL = 20 * 60 * 1000;
