import mongoose from 'mongoose';
import { Department } from '../models/Department.js';
import { Category } from '../models/Category.js';
import { User } from '../models/User.js';
import { connectDB } from '../config/db.js';

export const SEED_DEPARTMENTS = [
  {
    departmentId: 'DEP-PENSION-OD',
    code: 'SSEPD_OD',
    name: 'Department of Social Security & Empowerment (SSEPD)',
    ministry: 'Government of Odisha / Ministry of Social Justice',
    jurisdiction: 'STATE',
    state: 'Odisha',
    nodalOfficerName: 'Dr. Debasis Pattnaik',
    nodalOfficerEmail: 'gro.ssepd@odisha.gov.in',
    supportEmail: 'ssepd.helpdesk@odisha.gov.in',
    slaDays: 21,
    isActive: true,
  },
  {
    departmentId: 'DEP-BMC-SAN',
    code: 'BMC_SAN',
    name: 'Bhubaneswar Municipal Corporation (Sanitation & Drainage)',
    ministry: 'Housing & Urban Development Department, Odisha',
    jurisdiction: 'MUNICIPAL',
    state: 'Odisha',
    nodalOfficerName: 'Er. Rajesh Tripathy',
    nodalOfficerEmail: 'gro.bmc@gov.in',
    supportEmail: 'sanitation.bmc@gov.in',
    slaDays: 21,
    isActive: true,
  },
  {
    departmentId: 'DEP-TPCODL-PWR',
    code: 'TPCODL_PWR',
    name: 'TP Central Odisha Distribution Limited (TPCODL Power)',
    ministry: 'Department of Energy, Odisha & Tata Power',
    jurisdiction: 'STATE',
    state: 'Odisha',
    nodalOfficerName: 'Er. Sandeep Mohanty',
    nodalOfficerEmail: 'gro.tpcodl@tpcentralodisha.com',
    supportEmail: 'care@tpcentralodisha.com',
    slaDays: 21,
    isActive: true,
  },
  {
    departmentId: 'DEP-PWD-ROADS',
    code: 'PWD_RDS',
    name: 'Works Department (Public Works & State Highways)',
    ministry: 'Works Department, Government of Odisha',
    jurisdiction: 'STATE',
    state: 'Odisha',
    nodalOfficerName: 'Er. Manoranjan Sahoo',
    nodalOfficerEmail: 'gro.works@odisha.gov.in',
    supportEmail: 'roads.works@odisha.gov.in',
    slaDays: 21,
    isActive: true,
  },
  {
    departmentId: 'DEP-FS-CIVIL',
    code: 'FS_CW',
    name: 'Food Supplies & Consumer Welfare Department (Ration & NFSA)',
    ministry: 'Ministry of Consumer Affairs & Food Supplies',
    jurisdiction: 'STATE',
    state: 'Odisha',
    nodalOfficerName: 'Smt. Alokita Ray',
    nodalOfficerEmail: 'gro.foodsupplies@odisha.gov.in',
    supportEmail: 'nfsa.support@odisha.gov.in',
    slaDays: 21,
    isActive: true,
  },
  {
    departmentId: 'DEP-CENTRAL-CBDT',
    code: 'CBDT_IT',
    name: 'Central Board of Direct Taxes (Income Tax / Refunds)',
    ministry: 'Ministry of Finance, Government of India',
    jurisdiction: 'CENTRAL',
    state: 'National',
    nodalOfficerName: 'Shri Vikramaditya Sharma, IRS',
    nodalOfficerEmail: 'gro.cbdt@incometax.gov.in',
    supportEmail: 'grievances@incometax.gov.in',
    slaDays: 21,
    isActive: true,
  },
];

export const SEED_CATEGORIES = [
  {
    categoryId: 'CAT-PENSION-DELAY',
    code: 'PENS_01',
    departmentId: 'DEP-PENSION-OD',
    mainCategory: 'Pensions & Disability Allowances',
    subCategory: 'Non-Credit / Delay of Monthly Pension',
    description: 'Complaints related to Madhu Babu Pension Yojana (MBPY) or National Social Assistance Programme (NSAP) delay.',
    defaultSlaDays: 21,
    keywords: ['pension', 'madhu babu', 'disability', 'widow', 'old age', 'dbt', 'pfms', 'arrears'],
    requiresDocument: true,
    isActive: true,
  },
  {
    categoryId: 'CAT-SAN-DRAINAGE',
    code: 'SAN_01',
    departmentId: 'DEP-BMC-SAN',
    mainCategory: 'Municipal Sanitation & Drainage',
    subCategory: 'Overflowing Drain / Open Manhole Hazard',
    description: 'Blocked stormwater drains, open sewer manholes, garbage accumulation in urban civic areas.',
    defaultSlaDays: 21,
    keywords: ['drain', 'sewer', 'manhole', 'garbage', 'waste', 'smell', 'overflow', 'waterlogging'],
    requiresDocument: false,
    isActive: true,
  },
  {
    categoryId: 'CAT-PWR-OUTAGE',
    code: 'PWR_01',
    departmentId: 'DEP-TPCODL-PWR',
    mainCategory: 'Electricity & Power Supply',
    subCategory: 'Damaged Transformer / Frequent Low Voltage',
    description: 'Burnt transformers, dangerous low-hanging live cables, or unannounced power cuts.',
    defaultSlaDays: 21,
    keywords: ['transformer', 'electricity', 'voltage', 'power cut', 'wire', 'tpcodl', 'meter'],
    requiresDocument: false,
    isActive: true,
  },
  {
    categoryId: 'CAT-RDS-POTHOLES',
    code: 'RDS_01',
    departmentId: 'DEP-PWD-ROADS',
    mainCategory: 'Public Works & Roads',
    subCategory: 'Severe Road Potholes / Broken Culverts',
    description: 'Dangerous craters, damaged speed breakers, collapsed side walls on municipal/state roads.',
    defaultSlaDays: 21,
    keywords: ['road', 'pothole', 'broken', 'tar', 'culvert', 'accident hazard', 'street'],
    requiresDocument: false,
    isActive: true,
  },
  {
    categoryId: 'CAT-RATION-NFSA',
    code: 'RAT_01',
    departmentId: 'DEP-FS-CIVIL',
    mainCategory: 'Ration & Food Security',
    subCategory: 'Ration Card Allotment / Dealer Under-weighing',
    description: 'Denial of subsidized food grains, RCMS portal errors, dealer overcharging.',
    defaultSlaDays: 21,
    keywords: ['ration', 'pds', 'rice', 'wheat', 'quota', 'dealer', 'nfsa', 'rcms'],
    requiresDocument: true,
    isActive: true,
  },
];

export const PIN_DATABASE: Record<
  string,
  {
    state: string;
    district: string;
    locality: string;
    subDivision: string;
    localBody: string;
    postOffice: string;
  }
> = {
  '751001': {
    state: 'Odisha',
    district: 'Khordha',
    locality: 'Saheed Nagar / Unit 9',
    subDivision: 'Bhubaneswar Urban',
    localBody: 'Bhubaneswar Municipal Corporation (BMC)',
    postOffice: 'Bhubaneswar Head Post Office',
  },
  '751024': {
    state: 'Odisha',
    district: 'Khordha',
    locality: 'Patia / Infocity / KIIT Road',
    subDivision: 'Bhubaneswar Urban',
    localBody: 'Bhubaneswar Municipal Corporation (BMC)',
    postOffice: 'KIIT Post Office',
  },
  '751010': {
    state: 'Odisha',
    district: 'Khordha',
    locality: 'Nayapalli / IRC Village',
    subDivision: 'Bhubaneswar Urban',
    localBody: 'Bhubaneswar Municipal Corporation (BMC)',
    postOffice: 'Nayapalli Sub Post Office',
  },
  '752054': {
    state: 'Odisha',
    district: 'Puri',
    locality: 'Konark Sun Temple Area',
    subDivision: 'Puri Sub-Division',
    localBody: 'Konark NAC',
    postOffice: 'Konark Sub Post Office',
  },
  '753001': {
    state: 'Odisha',
    district: 'Cuttack',
    locality: 'Choudhury Bazar / Buxi Bazar',
    subDivision: 'Cuttack Urban',
    localBody: 'Cuttack Municipal Corporation (CMC)',
    postOffice: 'Cuttack Head Post Office',
  },
  '110001': {
    state: 'Delhi',
    district: 'New Delhi',
    locality: 'Connaught Place / Parliament Street',
    subDivision: 'Chanakyapuri',
    localBody: 'New Delhi Municipal Council (NDMC)',
    postOffice: 'New Delhi G.P.O.',
  },
  '400001': {
    state: 'Maharashtra',
    district: 'Mumbai City',
    locality: 'Fort / Nariman Point',
    subDivision: 'Mumbai South',
    localBody: 'Brihanmumbai Municipal Corporation (BMC)',
    postOffice: 'Mumbai G.P.O.',
  },
};

export const seedDatabase = async () => {
  const isConnected = await connectDB();
  if (!isConnected) {
    console.log('⚠️ Seed skipped because live MongoDB connection is not active.');
    return;
  }

  try {
    console.log('🌱 Starting CPGRAMS 2.0 Database Seeding...');

    // 1. Seed Departments
    for (const dept of SEED_DEPARTMENTS) {
      await Department.findOneAndUpdate({ departmentId: dept.departmentId }, dept, {
        upsert: true,
        new: true,
      });
    }
    console.log(`✅ Seeded ${SEED_DEPARTMENTS.length} Public Departments.`);

    // 2. Seed Categories
    for (const cat of SEED_CATEGORIES) {
      await Category.findOneAndUpdate({ categoryId: cat.categoryId }, cat, {
        upsert: true,
        new: true,
      });
    }
    console.log(`✅ Seeded ${SEED_CATEGORIES.length} Grievance Categories.`);

    // 3. Seed Mock Officers
    const mockOfficers = [
      {
        userId: 'OFF-OD-8812',
        name: 'Dr. Debasis Pattnaik (GRO)',
        phone: '+919811223344',
        phoneVerified: true,
        email: 'gro.ssepd@odisha.gov.in',
        emailVerified: true,
        role: 'GRO_OFFICER',
        departmentId: 'DEP-PENSION-OD',
        designation: 'Grievance Redressal Officer, SSEPD',
        address: {
          pinCode: '751001',
          locality: 'Secretariat Complex',
          district: 'Khordha',
          state: 'Odisha',
        },
      },
      {
        userId: 'APP-OD-9001',
        name: 'Shri Manoj Ahuja, IAS (Appellate Authority)',
        phone: '+919877001122',
        phoneVerified: true,
        email: 'appellate.darpg@gov.in',
        emailVerified: true,
        role: 'APPELLATE_OFFICER',
        departmentId: 'DEP-PENSION-OD',
        designation: 'Principal Secretary & Appellate Authority',
      },
    ];

    for (const off of mockOfficers) {
      await User.findOneAndUpdate({ userId: off.userId }, off, {
        upsert: true,
        new: true,
      });
    }
    console.log('✅ Seeded Nodal Officers and Appellate Authorities.');

    console.log('🎉 Database Seeding Completed Successfully!');
  } catch (error) {
    console.error('❌ Seeding Error:', error);
  }
};

// Direct script execution support
if (process.argv[1]?.endsWith('seedData.ts') || process.argv[1]?.endsWith('seedData.js')) {
  seedDatabase().then(() => {
    mongoose.connection.close();
    process.exit(0);
  });
}
