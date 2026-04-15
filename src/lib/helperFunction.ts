import { oidcConfig } from '@/auth/config';
import { format, parseISO } from 'date-fns';
import { Currency } from 'lucide-react';

export const setSessionItem = (key: string, value: any) => {
  const valueToStore = typeof value === 'object' ? JSON.stringify(value) : value;
  sessionStorage.setItem(key, valueToStore);
};
export const monthOptions = [
  { value: 1, label: 'Jan' },
  { value: 2, label: 'Feb' },
  { value: 3, label: 'Mar' },
  { value: 4, label: 'Apr' },
  { value: 5, label: 'May' },
  { value: 6, label: 'Jun' },
  { value: 7, label: 'Jul' },
  { value: 8, label: 'Aug' },
  { value: 9, label: 'Sep' },
  { value: 10, label: 'Oct' },
  { value: 11, label: 'Nov' },
  { value: 12, label: 'Dec' },
];

export const yearOptions = Array.from({ length: 7 }, (_, i) => {
  const currentYear = new Date().getFullYear();
  const y = currentYear - 3 + i;
  return { value: y, label: y.toString() };
});
export const formatDateTime = (dateString: string): string => {
  if (!dateString) return '';

  const date = parseISO(dateString);

  return format(date, 'dd-MMM-yyyy | hh:mm a');
};
export const formatDate = (dateString: string): string => {
  if (!dateString) return '';

  const date = parseISO(dateString);

  return format(date, 'dd-MMM-yyyy');
};
export const findEmployeeDetails = (employees: any, empCode: string) => {
  const employee = employees.find((emp) => emp?.empCode === empCode);
  if (employee) {
    return {
      employee,
    };
  } else {
    return null;
  }
};
export const extractUniqueUnits = (employees) => {
  // Create a Map to track unique units by unitId
  const uniqueUnitsMap = new Map();

  // Process each employee
  employees.forEach((employee) => {
    // Only add if both unitId and unitName exist
    if (employee.unitId && employee.unitName) {
      uniqueUnitsMap.set(employee.unitId, {
        unitId: employee.unitId,
        unitName: employee.unitName?.trim(),
      });
    }
  });

  // Convert Map values to array
  return Array.from(uniqueUnitsMap.values());
};

export function getObjectFromSessionStorage(key) {
  const item = sessionStorage.getItem(key);
  if (item) {
    try {
      return JSON.parse(item);
    } catch (e) {
      console.error('Error parsing JSON from sessionStorage:', e);
      return null;
    }
  }
  return null;
}

export function clearAllStorage(): void {
  localStorage.clear();
  sessionStorage.clear();
  const cookies: string[] = document.cookie.split(';');
  for (const cookie of cookies) {
    const [name] = cookie.split('=');
    document.cookie = `${name.trim()}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  }
}

export const formatRupees = (amount: number | null | undefined): string => {
  if (typeof amount !== 'number' || isNaN(amount)) {
    return '-';
  }

  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
  }).format(amount);
};

export const formatRupeeInput = (value) => {
  if (!value) return '';
  const numericValue = value.replace(/[^0-9]/g, '');
  return new Intl.NumberFormat('en-IN').format(numericValue);
};

export const getNextDate = (dateString: string) => {
  if (!dateString) return;
  const date = new Date(dateString);
  date.setDate(date.getDate() + 1);
  return date.toISOString().split('T')[0];
};

/**
 * Decodes a JWT token and returns the payload
 * @param token - The JWT token string to decode
 * @returns The decoded token payload or null if decoding fails
 */
export function decodeJwtToken(token: string): any | null {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) {
      console.error('Invalid token format: missing payload');
      return null;
    }
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding JWT token:', error);
    return null;
  }
}

/**
 * Gets the access token from session storage using OIDC configuration
 * @returns The access token string or null if not found
 */
export function getAccessTokenFromOidcSession(): string | null {
  try {
    const tokenData = getObjectFromSessionStorage(`oidc.user:${oidcConfig.authority}:${oidcConfig.client_id}`);
    return tokenData?.access_token || null;
  } catch (error) {
    console.error('Error getting access token from session:', error);
    return null;
  }
}

/**
 * Gets and decodes the access token from session storage
 * @returns The decoded token payload or null if token is not found or decoding fails
 */
export function getDecodedAccessToken(): any | null {
  const accessToken = getAccessTokenFromOidcSession();
  if (!accessToken) {
    return null;
  }
  return decodeJwtToken(accessToken);
}

/**
 * Extracts delegation information from the decoded token
 * @param decodedToken - The decoded JWT token payload
 * @returns An object containing delegation information
 */
export function extractDelegationInfo(decodedToken: any): {
  isDelegatedUser: boolean;
  delegateeEmpCode: string | null;
  delegatedApplications: string | null;
  delegatedApplicationNames: string | null;
} {
  if (!decodedToken) {
    return {
      isDelegatedUser: false,
      delegateeEmpCode: null,
      delegatedApplications: null,
      delegatedApplicationNames: null,
    };
  }

  return {
    isDelegatedUser: decodedToken.IsD === 'True',
    delegateeEmpCode: decodedToken.Duser || null,
    delegatedApplications: decodedToken.DApplications || null,
    delegatedApplicationNames: decodedToken.DApplicationNames || null,
  };
}

/**
 * Gets delegation information from the current session's access token
 * This is a convenience function that combines getting and decoding the token
 * @returns An object containing delegation information
 */
export function getDelegationInfoFromSession(): {
  isDelegatedUser: boolean;
  delegateeEmpCode: string | null;
  delegatedApplications: string | null;
  delegatedApplicationNames: string | null;
} {
  const decodedToken = getDecodedAccessToken();
  return extractDelegationInfo(decodedToken);
}

export const formatRupeesInWords = (amount: number): string => {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return '';
  }

  const belowTwenty = [
    '',
    'One',
    'Two',
    'Three',
    'Four',
    'Five',
    'Six',
    'Seven',
    'Eight',
    'Nine',
    'Ten',
    'Eleven',
    'Twelve',
    'Thirteen',
    'Fourteen',
    'Fifteen',
    'Sixteen',
    'Seventeen',
    'Eighteen',
    'Nineteen',
  ];

  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  const convertBelowThousand = (num: number): string => {
    let str = '';

    if (num >= 100) {
      str += belowTwenty[Math.floor(num / 100)] + ' Hundred ';
      num %= 100;
    }

    if (num >= 20) {
      str += tens[Math.floor(num / 10)] + ' ';
      num %= 10;
    }

    if (num > 0) {
      str += belowTwenty[num] + ' ';
    }

    return str.trim();
  };

  const convertNumber = (num: number): string => {
    if (num === 0) return '';

    let result = '';

    const crore = Math.floor(num / 10000000);
    const remainderAfterCrore = num % 10000000;

    const lakh = Math.floor(remainderAfterCrore / 100000);
    const remainderAfterLakh = remainderAfterCrore % 100000;

    const thousand = Math.floor(remainderAfterLakh / 1000);
    const hundred = remainderAfterLakh % 1000;

    // 🔥 Important: If crore > 999, recursively convert
    if (crore > 0) {
      result += convertNumber(crore) + ' Crore ';
    }

    if (lakh > 0) {
      result += convertBelowThousand(lakh) + ' Lakh ';
    }

    if (thousand > 0) {
      result += convertBelowThousand(thousand) + ' Thousand ';
    }

    if (hundred > 0) {
      result += convertBelowThousand(hundred) + ' ';
    }

    return result.trim();
  };

  const isNegative = amount < 0;
  amount = Math.abs(amount);

  const rupees = Math.floor(amount);
  const paise = Math.round((amount - rupees) * 100);

  if (rupees === 0 && paise === 0) {
    return 'Zero Rupees Only';
  }

  let result = convertNumber(rupees);

  if (paise > 0) {
    result += ' and ' + convertBelowThousand(paise) + ' Paise';
  }

  result += ' Only';

  if (isNegative) {
    result = 'Minus ' + result;
  }

  return result.replace(/\s+/g, ' ').trim();
};
