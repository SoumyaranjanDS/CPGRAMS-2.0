import { CPGRAMSOrganisation, CPGRAMS_ORGANISATIONS } from '../data/cpgramsOrganisations.js';

export interface AIDetectedDepartment {
  organisation: CPGRAMSOrganisation;
  category: string;
  subCategory: string;
  confidenceScore: number;
  matchedKeywords: string[];
}

const DEPARTMENT_KEYWORDS: Array<{
  code: string;
  keywords: string[];
  category: string;
  subCategory: string;
}> = [
  {
    code: 'DFS-BANK',
    keywords: ['bank', 'account', 'atm', 'loan', 'credit card', 'debit card', 'sbi', 'pnb', 'upi', 'neft', 'rtgs', 'branch', 'interest', 'cheque', 'deposit', 'banking', 'fraud transaction'],
    category: 'Banking Services',
    subCategory: 'Account & Transaction Issues',
  },
  {
    code: 'DFS-INS',
    keywords: ['insurance', 'lic', 'policy', 'claim', 'premium', 'health insurance', 'life insurance', 'crop insurance', 'mediclaim', 'settlement'],
    category: 'Insurance Services',
    subCategory: 'Policy & Claim Redressal',
  },
  {
    code: 'CBDT',
    keywords: ['income tax', 'tax', 'pan', 'pan card', 'refund', 'tds', 'itr', 'assessment', 'income tax return', 'form 16'],
    category: 'Direct Taxes',
    subCategory: 'Tax Refund & PAN Services',
  },
  {
    code: 'POSTS',
    keywords: ['post', 'post office', 'speed post', 'parcel', 'tracking', 'money order', 'dak', 'ippb', 'stamp', 'postal'],
    category: 'Postal Services',
    subCategory: 'Speed Post & Parcel Delivery',
  },
  {
    code: 'DOT',
    keywords: ['telecom', 'mobile', 'bsnl', 'broadband', 'internet', 'wifi', '5g', '4g', 'tower', 'network', 'call drop', 'sim', 'recharge', 'fiber'],
    category: 'Telecommunications',
    subCategory: 'Broadband & Mobile Network',
  },
  {
    code: 'MOLE',
    keywords: ['epfo', 'provident fund', 'pf', 'esic', 'pension', 'worker', 'wage', 'salary', 'gratuity', 'uan', 'claim status', 'employer'],
    category: 'Labour & Employment',
    subCategory: 'EPFO & Worker Benefits',
  },
  {
    code: 'MOHFW',
    keywords: ['hospital', 'doctor', 'medicine', 'aiims', 'cghs', 'treatment', 'health', 'medical', 'ayushman', 'clinic', 'surgery', 'ambulance'],
    category: 'Health Services',
    subCategory: 'Hospital & Healthcare Facility',
  },
  {
    code: 'MOHUA',
    keywords: ['housing', 'pmay', 'water supply', 'drainage', 'sewage', 'metro', 'smart city', 'cpwd', 'road light', 'garbage', 'sanitation', 'municipal'],
    category: 'Urban Infrastructure',
    subCategory: 'Civic Amenities & Housing',
  },
  {
    code: 'RAIL',
    keywords: ['train', 'railway', 'irctc', 'ticket', 'pnr', 'station', 'berth', 'refund railway', 'coach', 'train delay'],
    category: 'Railways',
    subCategory: 'Train Reservation & Amenities',
  },
  {
    code: 'MOPNG',
    keywords: ['gas', 'lpg', 'cylinder', 'petrol', 'diesel', 'indane', 'hp gas', 'bharat gas', 'subsidy', 'agency', 'refill'],
    category: 'Petroleum & Natural Gas',
    subCategory: 'LPG Subsidy & Distribution',
  },
  {
    code: 'MOP',
    keywords: ['electricity', 'power', 'electric', 'meter', 'blackout', 'bill', 'transformer', 'voltage', 'power supply'],
    category: 'Power & Electricity',
    subCategory: 'Billing & Supply Outages',
  },
  {
    code: 'EDU',
    keywords: ['school', 'college', 'exam', 'fee', 'board', 'cbse', 'degree', 'scholarship', 'teacher', 'university', 'student', 'admission'],
    category: 'Education',
    subCategory: 'Academic & Scholarship Redressal',
  },
  {
    code: 'UIDAI',
    keywords: ['aadhaar', 'uidai', 'biometric', 'enrolment', 'aadhaar card', 'update aadhaar', 'otp aadhaar'],
    category: 'Aadhaar / UIDAI',
    subCategory: 'Identity & Biometric Updates',
  },
];

/**
 * Intelligent NLP & Keyword Classifier for Citizen Problem Descriptions
 */
export function detectDepartmentFromNarrative(text: string): AIDetectedDepartment {
  if (!text || text.trim().length < 5) {
    const defaultOrg = CPGRAMS_ORGANISATIONS.find((o) => o.code === 'DARPG') || CPGRAMS_ORGANISATIONS[0];
    return {
      organisation: defaultOrg,
      category: 'Public Service Delivery',
      subCategory: 'General Citizen Inquiry',
      confidenceScore: 0.85,
      matchedKeywords: [],
    };
  }

  const lower = text.toLowerCase();
  let bestMatch: {
    code: string;
    category: string;
    subCategory: string;
    score: number;
    matchedKeywords: string[];
  } | null = null;

  for (const item of DEPARTMENT_KEYWORDS) {
    const matches: string[] = [];
    for (const kw of item.keywords) {
      if (lower.includes(kw)) {
        matches.push(kw);
      }
    }

    if (matches.length > 0) {
      const score = Math.min(0.98, 0.70 + matches.length * 0.10);
      if (!bestMatch || score > bestMatch.score) {
        bestMatch = {
          code: item.code,
          category: item.category,
          subCategory: item.subCategory,
          score,
          matchedKeywords: matches,
        };
      }
    }
  }

  if (bestMatch) {
    const matchedOrg =
      CPGRAMS_ORGANISATIONS.find((o) => o.code === bestMatch!.code) ||
      CPGRAMS_ORGANISATIONS[0];

    return {
      organisation: matchedOrg,
      category: bestMatch.category,
      subCategory: bestMatch.subCategory,
      confidenceScore: Math.round(bestMatch.score * 100) / 100,
      matchedKeywords: bestMatch.matchedKeywords,
    };
  }

  // Fallback to General Administrative Department
  const defaultOrg = CPGRAMS_ORGANISATIONS.find((o) => o.code === 'DARPG') || CPGRAMS_ORGANISATIONS[0];
  return {
    organisation: defaultOrg,
    category: 'Public Service Delivery',
    subCategory: 'Citizen Issue',
    confidenceScore: 0.88,
    matchedKeywords: [],
  };
}
