import { Role, NavConfig, Counselor, ApplicationRecord, StaffMember, StaffRole, ActivityEntry, Branch, CommissionRecord, Partner, AppNotification } from './types';

export const ROLE_LABELS: Record<Role, string> = {
  super_admin: 'Super Admin',
  marketing: 'Marketing',
  finance: 'Finance',
  branch_manager: 'Branch Manager',
  receptionist: 'Front Desk Officer',
  counselor: 'Counselor',
  application_officer: 'VA Officer',
};

// Maps a `staff` table row's role (Title Case, as entered in Staff Management) to the
// app's internal `Role` (snake_case, used for nav/permissions) — used by Login to build a
// `MockUser` from the `StaffMember` a credential check matches.
export const STAFF_ROLE_TO_ROLE: Record<StaffRole, Role> = {
  'Super Admin': 'super_admin',
  Marketing: 'marketing',
  Finance: 'finance',
  'Branch Manager': 'branch_manager',
  Receptionist: 'receptionist',
  Counselor: 'counselor',
  'VA Officer': 'application_officer',
};

export const NAV_CONFIG: NavConfig = {
  super_admin: [
    { key: 'overview', label: 'Dashboard', icon: 'LayoutDashboard' },
    { key: 'branches', label: 'All Branches', icon: 'Building2' },
    { key: 'students', label: 'Clients', icon: 'GraduationCap' },
    { key: 'applications', label: 'Applications', icon: 'FileText' },
    { key: 'partners', label: 'Partners', icon: 'Landmark' },
    { key: 'commissions', label: 'Commissions', icon: 'DollarSign' },
    { key: 'staff', label: 'Staff', icon: 'Users' },
    { key: 'reports', label: 'Reports', icon: 'BarChart3' },
  ],
  marketing: [
    { key: 'overview', label: 'Dashboard', icon: 'LayoutDashboard' },
    { key: 'students', label: 'Students', icon: 'GraduationCap', viewOnly: true },
    { key: 'reports', label: 'Reports', icon: 'BarChart3' },
  ],
  finance: [
    { key: 'overview', label: 'Dashboard', icon: 'LayoutDashboard' },
    { key: 'commissions', label: 'Commissions', icon: 'DollarSign' },
    { key: 'applications', label: 'Applications', icon: 'FileText', viewOnly: true },
    { key: 'reports', label: 'Reports', icon: 'BarChart3' },
  ],
  branch_manager: [
    { key: 'overview', label: 'Dashboard', icon: 'LayoutDashboard' },
    { key: 'students', label: 'Clients', icon: 'GraduationCap' },
    { key: 'applications', label: 'Applications', icon: 'FileText' },
    { key: 'staff', label: 'Staff', icon: 'Users' },
    { key: 'reports', label: 'Reports', icon: 'BarChart3' },
  ],
  receptionist: [
    { key: 'overview', label: 'Dashboard', icon: 'LayoutDashboard' },
    { key: 'new-intake', label: 'Leads', icon: 'UserPlus' },
    { key: 'students', label: 'Clients', icon: 'GraduationCap' },
    { key: 'assign-counselor', label: 'Assign Counselor', icon: 'UserCheck' },
    { key: 'assigned', label: 'Assigned', icon: 'Users' },
  ],
  counselor: [
    { key: 'overview', label: 'Dashboard', icon: 'LayoutDashboard' },
    { key: 'my-students', label: 'Assigned Clients', icon: 'GraduationCap' },
    { key: 'consultations', label: 'Enrolled', icon: 'CalendarDays' },
    { key: 'follow-ups', label: 'Follow Ups', icon: 'PhoneCall' },
    { key: 'archive', label: 'Archive', icon: 'Archive' },
  ],
  application_officer: [
    { key: 'overview', label: 'Dashboard', icon: 'LayoutDashboard' },
    { key: 'applications', label: 'Clients', icon: 'FileText' },
    { key: 'status-updates', label: 'Status Updates', icon: 'RefreshCw' },
  ],
};

export interface StatCard {
  label: string;
  value: string;
  icon: string;
  trend: string;
  trendUp: boolean;
}

export const OVERVIEW_STATS: StatCard[] = [
  { label: 'Active Applications', value: '247', icon: 'FileText', trend: '+12 this week', trendUp: true },
  { label: 'New Intakes This Month', value: '38', icon: 'UserPlus', trend: '+8% vs last month', trendUp: true },
  { label: 'Visas Granted', value: '156', icon: 'CheckCircle', trend: '+23 this month', trendUp: true },
  { label: 'Pending Lodgement', value: '34', icon: 'Clock', trend: '-5 vs last week', trendUp: false },
];

export const COUNTRIES = ['Australia', 'Canada', 'United Kingdom', 'USA', 'New Zealand'];

export const PURPOSES = ['Study', 'SOWP', 'Tourist', 'PR'];

export const MOCK_COUNSELORS: Counselor[] = [
  { id: 'c1', name: 'Ramesh Thapa', country: 'Australia', activeAssignments: 12, availability: 'Available' },
  { id: 'c2', name: 'Sita Gurung', country: 'Canada', activeAssignments: 8, availability: 'In Session' },
  { id: 'c3', name: 'Bikash Rai', country: 'United Kingdom', activeAssignments: 15, availability: 'Available' },
  { id: 'c4', name: 'Anjali Shrestha', country: 'USA', activeAssignments: 6, availability: 'Away' },
  { id: 'c5', name: 'Niraj Maharjan', country: 'New Zealand', activeAssignments: 10, availability: 'In Session' },
  { id: 'c6', name: 'Milan Gurung', country: 'Australia', activeAssignments: 10, availability: 'Available' },
];

export const MOCK_APPLICATIONS: ApplicationRecord[] = [
  {
    id: 'a1',
    name: 'Emily Park',
    phone: '+61 401 222 333',
    email: 'emily.park@gmail.com',
    country: 'New Zealand',
    purpose: 'Work',
    counselor: 'David Chen',
    consultationDate: '2026-09-13',
    consultationNotes: 'Client has valid job offer from Sydney employer. Recommended 482 visa (temporary skill shortage). All documents verified and ready for lodgement.',
    status: 'Lodgement',
    statusHistory: [
      { status: 'Preparation', date: 'Sept 13' },
      { status: 'Lodgement', date: 'Sept 14' },
    ],
    branch: 'Sydney CBD',
    collegeApplications: [],
    visaApplication: null,
  },
  {
    id: 'a2',
    name: 'Sara Khan',
    phone: '+61 478 456 789',
    email: 'sara.khan@gmail.com',
    country: 'USA',
    purpose: 'Tourist',
    counselor: 'David Chen',
    consultationDate: '2026-09-14',
    consultationNotes: 'Client applying for US B1/B2 tourist visa. Travel planned for December. Documents collected: passport, bank statements, employment letter.',
    status: 'Preparation',
    statusHistory: [
      { status: 'Preparation', date: 'Sept 14' },
    ],
    branch: 'Sydney CBD',
    collegeApplications: [],
    visaApplication: null,
  },
  {
    id: 'a3',
    name: 'Deepak Thapa',
    phone: '+61 489 654 321',
    email: 'deepak.t@gmail.com',
    country: 'Australia',
    purpose: 'Study',
    counselor: 'Sita Gurung',
    consultationDate: '2026-09-10',
    consultationNotes: 'Client applying for student visa (subclass 500). Confirmed university offer from University of Sydney. Financial documents in order.',
    status: 'Success',
    statusHistory: [
      { status: 'Preparation', date: 'Sept 10' },
      { status: 'Lodgement', date: 'Sept 12' },
      { status: 'Success', date: 'Sept 14' },
    ],
    branch: 'Sydney CBD',
    collegeApplications: [],
    visaApplication: null,
  },
  {
    id: 'a4',
    name: 'Ravi Gupta',
    phone: '+61 433 777 888',
    email: 'ravi.gupta@outlook.com',
    country: 'Canada',
    purpose: 'PR',
    counselor: 'David Chen',
    consultationDate: '2026-09-08',
    consultationNotes: 'Client seeking permanent residency via Express Entry. Reviewed education credentials and work experience. Need to arrange WES assessment.',
    status: 'Lodgement',
    statusHistory: [
      { status: 'Preparation', date: 'Sept 8' },
      { status: 'Lodgement', date: 'Sept 11' },
    ],
    branch: 'Sydney CBD',
    collegeApplications: [],
    visaApplication: null,
  },
  {
    id: 'a5',
    name: 'Arjun Mehta',
    phone: '+61 412 345 678',
    email: 'arjun.mehta@gmail.com',
    country: 'Australia',
    purpose: 'Study',
    counselor: 'Ramesh Thapa',
    consultationDate: '2026-09-09',
    consultationNotes: 'Student visa application. Client has offer from Monash University. Need to arrange OSHC health insurance and financial evidence.',
    status: 'Preparation',
    statusHistory: [
      { status: 'Preparation', date: 'Sept 9' },
    ],
    branch: 'Sydney CBD',
    collegeApplications: [],
    visaApplication: null,
  },
  {
    id: 'a6',
    name: 'Lina Zhang',
    phone: '+61 423 987 654',
    email: 'lina.zhang@outlook.com',
    country: 'Canada',
    purpose: 'PR',
    counselor: 'Bikash Rai',
    consultationDate: '2026-09-05',
    consultationNotes: 'Express Entry profile being prepared. Client has CLB 8 in IELTS. Awaiting WES credential assessment results.',
    status: 'Refused',
    statusHistory: [
      { status: 'Preparation', date: 'Sept 5' },
      { status: 'Lodgement', date: 'Sept 8' },
      { status: 'Refused', date: 'Sept 13' },
    ],
    branch: 'Sydney CBD',
    collegeApplications: [],
    visaApplication: null,
  },
  {
    id: 'a7',
    name: 'Mohammed Ali',
    phone: '+61 445 123 456',
    email: 'm.ali@yahoo.com',
    country: 'United Kingdom',
    purpose: 'Work',
    counselor: 'David Chen',
    consultationDate: '2026-09-07',
    consultationNotes: 'Client interested in skilled migration pathway. Needs IELTS assessment. Discussed employer sponsorship options.',
    status: 'Preparation',
    statusHistory: [
      { status: 'Preparation', date: 'Sept 7' },
    ],
    branch: 'Sydney CBD',
    collegeApplications: [],
    visaApplication: null,
  },
  {
    id: 'a8',
    name: 'Anna Lee',
    phone: '+61 415 555 999',
    email: 'anna.lee@gmail.com',
    country: 'Australia',
    purpose: 'Study',
    counselor: 'Ramesh Thapa',
    consultationDate: '2026-09-06',
    consultationNotes: 'Student visa application. Client has offer from University of Melbourne. Awaiting financial documents from sponsor.',
    status: 'Lodgement',
    statusHistory: [
      { status: 'Preparation', date: 'Sept 6' },
      { status: 'Lodgement', date: 'Sept 10' },
    ],
    branch: 'New Baneshwor',
    collegeApplications: [],
    visaApplication: null,
  },
  {
    id: 'a9',
    name: 'Priya Karki',
    phone: '+61 422 111 222',
    email: 'priya.karki@gmail.com',
    country: 'Canada',
    purpose: 'PR',
    counselor: 'Bikash Rai',
    consultationDate: '2026-09-03',
    consultationNotes: 'Express Entry profile under preparation. Awaiting updated language test results before proceeding.',
    status: 'Preparation',
    statusHistory: [
      { status: 'Preparation', date: 'Sept 4' },
    ],
    branch: 'Kamaladi',
    collegeApplications: [],
    visaApplication: null,
  },
  {
    id: 'a10',
    name: 'Suman Rai',
    phone: '+61 433 222 111',
    email: 'suman.rai@gmail.com',
    country: 'USA',
    purpose: 'Tourist',
    counselor: 'Milan Gurung',
    consultationDate: '2026-09-05',
    consultationNotes: 'Tourist visa application. Awaiting bank statements and travel itinerary from client.',
    status: 'Preparation',
    statusHistory: [
      { status: 'Preparation', date: 'Sept 6' },
    ],
    branch: 'Putalisadak',
    collegeApplications: [],
    visaApplication: null,
  },
];

export const MOCK_STAFF: StaffMember[] = [
  { id: 'st1', name: 'Jessica Wong', email: 'jessica@everestvisa.com', password: 'Passw0rd1', role: 'Receptionist', status: 'Active', branch: 'Sydney CBD' },
  { id: 'st2', name: 'Ramesh Thapa', email: 'ramesh@everestvisa.com', password: 'Passw0rd1', role: 'Counselor', status: 'Active', branch: 'Sydney CBD' },
  { id: 'st3', name: 'Sita Gurung', email: 'sita@everestvisa.com', password: 'Passw0rd1', role: 'Counselor', status: 'Active', branch: 'Sydney CBD' },
  { id: 'st4', name: 'Niraj Maharjan', email: 'niraj@everestvisa.com', password: 'Passw0rd1', role: 'Counselor', status: 'Inactive', branch: 'Sydney CBD' },
  { id: 'st5', name: 'Maria Santos', email: 'maria@everestvisa.com', password: 'Passw0rd1', role: 'VA Officer', status: 'Active', branch: 'Sydney CBD' },
  { id: 'st6', name: 'John Smith', email: 'john@everestvisa.com', password: 'Passw0rd1', role: 'VA Officer', status: 'Active', branch: 'Sydney CBD' },
];

export const BRANCH_MANAGER_STATS = [
  { label: 'Total Students This Month', value: '38', icon: 'GraduationCap', trend: '+8% vs last month', trendUp: true },
  { label: 'Active Consultations', value: '14', icon: 'CalendarDays', trend: '+3 this week', trendUp: true },
  { label: 'Applications In Progress', value: '22', icon: 'FileText', trend: '+5 new this week', trendUp: true },
];

export const BRANCH_DECIDED_THIS_MONTH = { granted: 9, refused: 3 };

export const MOCK_ACTIVITY_FEED: ActivityEntry[] = [
  { id: 'act1', message: 'Student Deepak Thapa assigned to Sita Gurung', timestamp: '2 min ago', type: 'assignment' },
  { id: 'act2', message: 'Application for Priya Karki moved to Lodgement', timestamp: '15 min ago', type: 'status' },
  { id: 'act3', message: 'New intake: Anna Lee submitted the intake form', timestamp: '1 hour ago', type: 'intake' },
  { id: 'act4', message: 'David Chen completed consultation for Emily Park', timestamp: '2 hours ago', type: 'consultation' },
  { id: 'act5', message: 'Application for Deepak Thapa marked as Success', timestamp: '3 hours ago', type: 'status' },
  { id: 'act6', message: 'Student Arjun Mehta assigned to Ramesh Thapa', timestamp: '5 hours ago', type: 'assignment' },
  { id: 'act7', message: 'New intake: Sara Khan submitted the intake form', timestamp: '6 hours ago', type: 'intake' },
  { id: 'act9', message: 'Student Ravi Gupta assigned to Bikash Rai', timestamp: '7 hours ago', type: 'assignment' },
  { id: 'act10', message: 'New intake: Lina Zhang submitted the intake form', timestamp: '8 hours ago', type: 'intake' },
  { id: 'act11', message: 'Application for Ravi Gupta moved to Lodgement', timestamp: '9 hours ago', type: 'status' },
  { id: 'act12', message: 'Sita Gurung completed consultation for Deepak Thapa', timestamp: '10 hours ago', type: 'consultation' },
  { id: 'act13', message: 'Student Mohammed Ali assigned to Ramesh Thapa', timestamp: '11 hours ago', type: 'assignment' },
  { id: 'act14', message: 'Application for Anna Lee moved to Lodgement', timestamp: '12 hours ago', type: 'status' },
  { id: 'act8', message: 'Application for Lina Zhang marked as Refused', timestamp: '1 day ago', type: 'status' },
];

export const MOCK_BRANCHES: Branch[] = [
  { id: 'b1', name: 'Chitwan', location: 'Chitwan', manager: 'Bishal Adhikari' },
  { id: 'b2', name: 'Butwal', location: 'Butwal', manager: 'Suresh Karki' },
  { id: 'b3', name: 'Kamaladi', location: 'Kamaladi', manager: 'Sibendra Subedi' },
  { id: 'b4', name: 'New Baneshwor', location: 'New Baneshwor', manager: 'Bidhya Basnet' },
  { id: 'b5', name: 'Putalisadak', location: 'Putalisadak', manager: 'Samjhana Khanal' },
  { id: 'b6', name: 'Kumaripati', location: 'Kumaripati', manager: 'Dilli Pokharel' },
];

export const SUPER_ADMIN_STATS = [
  { label: 'Total Students', value: '263', icon: 'GraduationCap', trend: '+38 this month', trendUp: true },
  { label: 'Active Applications', value: '71', icon: 'FileText', trend: '+12 this week', trendUp: true },
];

export const SUPER_ADMIN_DECIDED_THIS_MONTH = { granted: 105, refused: 18 };

// Last month's company-wide success rate (%), for the Success Rate card's trend comparison.
export const SUPER_ADMIN_SUCCESS_RATE_LAST_MONTH = 82;

export const MOCK_PARTNERS: Partner[] = [
  { id: 'p1', name: 'University of Sydney', type: 'University', commissionRate: 15, courses: [
    { name: 'Bachelor of Commerce', price: 45000 },
    { name: 'Master of IT', price: 42000 },
    { name: 'Master of Engineering', price: 48000 },
  ] },
  { id: 'p2', name: 'Monash University', type: 'University', commissionRate: 12, courses: [
    { name: 'Bachelor of Business', price: 40000 },
    { name: 'Master of Data Science', price: 44000 },
  ] },
  { id: 'p3', name: 'University of Melbourne', type: 'University', commissionRate: 15, courses: [
    { name: 'Master of Public Health', price: 46000 },
    { name: 'Bachelor of Science', price: 43000 },
  ] },
  { id: 'p4', name: 'University of Toronto', type: 'University', commissionRate: 10, courses: [
    { name: 'Bachelor of Arts', price: 38000 },
    { name: 'Master of Finance', price: 41000 },
  ] },
  { id: 'p5', name: 'Holmes Institute', type: 'College', commissionRate: 18, courses: [
    { name: 'Diploma of Business', price: 18000 },
    { name: 'Certificate IV in Accounting', price: 12000 },
  ] },
  { id: 'p6', name: 'William Angliss Institute', type: 'College', commissionRate: 16, courses: [
    { name: 'Diploma of Hospitality Management', price: 20000 },
    { name: 'Certificate III in Commercial Cookery', price: 14000 },
  ] },
];

export const MOCK_COMMISSIONS: CommissionRecord[] = [
  { id: 'cm1', studentName: 'Emily Park', branch: 'Chitwan', consultant: 'David Chen', partner: 'University of Sydney', fullFee: 32000, commissionRate: 15, commissionStatus: 'Pending' },
  { id: 'cm2', studentName: 'Sara Khan', branch: 'Pokhara', consultant: 'David Chen', partner: 'Monash University', fullFee: 28000, commissionRate: 12, commissionStatus: 'Pending' },
  { id: 'cm3', studentName: 'Deepak Thapa', branch: 'New Baneshwor', consultant: 'Sita Gurung', partner: 'University of Melbourne', fullFee: 35000, commissionRate: 15, commissionStatus: 'Paid' },
  { id: 'cm4', studentName: 'Ravi Gupta', branch: 'Butwal', consultant: 'David Chen', partner: 'University of Toronto', fullFee: 30000, commissionRate: 10, commissionStatus: 'Pending' },
  { id: 'cm5', studentName: 'Arjun Mehta', branch: 'Kamaltadi', consultant: 'Ramesh Thapa', partner: 'University of Sydney', fullFee: 27000, commissionRate: 15, commissionStatus: 'Pending' },
  { id: 'cm6', studentName: 'Lina Zhang', branch: 'Butwal', consultant: 'Bikash Rai', partner: 'Monash University', fullFee: 26000, commissionRate: 12, commissionStatus: 'Paid' },
  { id: 'cm7', studentName: 'Mohammed Ali', branch: 'Kamaltadi', consultant: 'David Chen', partner: 'University of Melbourne', fullFee: 31000, commissionRate: 15, commissionStatus: 'Pending' },
  { id: 'cm8', studentName: 'Anna Lee', branch: 'Pokhara', consultant: 'Ramesh Thapa', partner: 'University of Toronto', fullFee: 29000, commissionRate: 10, commissionStatus: 'Paid' },
];

const minutesAgo = (n: number) => new Date(Date.now() - n * 60000);

export const MOCK_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-seed-1',
    trigger: 'new-intake',
    studentName: 'Lina Zhang',
    messageBefore: 'New intake from ',
    messageAfter: ' — Canada, PR',
    createdAt: minutesAgo(8),
    read: false,
    role: 'receptionist',
    branch: 'Sydney CBD',
    navigateTo: 'assign-counselor',
  },
  {
    id: 'notif-seed-2',
    trigger: 'new-intake',
    studentName: 'Arjun Mehta',
    messageBefore: 'New intake from ',
    messageAfter: ' — Australia, Study',
    createdAt: minutesAgo(32),
    read: false,
    role: 'receptionist',
    branch: 'Sydney CBD',
    navigateTo: 'assign-counselor',
  },
  {
    id: 'notif-seed-3',
    trigger: 'assigned-to-counselor',
    studentName: 'Mohammed Ali',
    messageBefore: '',
    messageAfter: ' assigned to you — United Kingdom, Work',
    createdAt: minutesAgo(15),
    read: false,
    role: 'counselor',
    recipientName: 'David Chen',
    navigateTo: 'my-students',
  },
  {
    id: 'notif-seed-4',
    trigger: 'assigned-to-counselor',
    studentName: 'Emily Park',
    messageBefore: '',
    messageAfter: ' assigned to you — New Zealand, Work',
    createdAt: minutesAgo(70),
    read: true,
    role: 'counselor',
    recipientName: 'David Chen',
    navigateTo: 'my-students',
  },
  {
    id: 'notif-seed-5',
    trigger: 'consultation-ready',
    studentName: 'Deepak Thapa',
    messageBefore: '',
    messageAfter: ' ready for application — consultation complete',
    createdAt: minutesAgo(1440),
    read: true,
    role: 'application_officer',
    branch: 'Sydney CBD',
    navigateTo: 'applications',
  },
];
