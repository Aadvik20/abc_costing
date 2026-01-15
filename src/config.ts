const DFCCIL_UAT = {
  apiUrl: 'https://uatquarterapi.dfccil.com/api',
  orgHierarchy: 'https://uatorganization.dfccil.com/api',
  logoutUrl: 'https://uat.dfccil.com/DfcHome',
  exitUrl: 'https://uatlogin.dfccil.com/applications',
  authUrl: 'https://app2.dfccil.com',
  clientId: '5078739144764161bd53673c98c7023f',
  postLogout: 'https://uatlogin.dfccil.com/signout',
  redirectPath: 'dashboard',
  applicationId: 73,
};

const DFCCIL_PROD = {
  apiUrl: 'https://uatquarterapi.dfccil.com/api',
  orgHierarchy: 'https://orgsvc.dfccil.com/api',
  logoutUrl: 'https://it.dfccil.com/Home/Home',
  exitUrl: 'https://dashboard.dfccil.com/applications',
  authUrl: 'https://app2.dfccil.com',
  clientId: '071ed846a328407ab65d9a1d9a23847a',
  postLogout: 'https://dashboard.dfccil.com/signout',
  redirectPath: 'dashboard',
  applicationId: 4,
};

// https://github.com/DfccilIT/TransferModuleFrontEnd.git

export const environment = DFCCIL_UAT;

export const SESSION_CHECK_INTERVAL = 20 * 60 * 1000;
