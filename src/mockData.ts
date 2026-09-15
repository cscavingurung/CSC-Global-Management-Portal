import { Role, NavItem, NavConfig, MockUser, IntakeStudent, Counselor, CounselorStudent, ApplicationRecord, StaffMember, ActivityEntry, Branch, CommissionRecord } from './types';

export const ROLE_LABELS: Record<Role, string> = {
  super_admin: 'Super Admin',
  marketing: 'Marketing',
  finance: 'Finance',
  branch_manager: 'Branch Manager',
  receptionist: 'Receptionist',
  counselor: 'Counselor',
  application_officer: 'Application Officer',
};

export const MOCK_USERS: Record<Role, MockUser> = {
  super_admin: { name: 'Rajesh Sharma', role: 'super_admin', branch: 'Head Office', email: 'rajesh@everestvisa.com' },
  marketing: { name: 'Priya Patel', role: 'marketing', branch: 'Head Office', email: 'priya@everestvisa.com' },
  finance: { name: 'Amit Kumar', role: 'finance', branch: 'Head Office', email: 'amit@everestvisa.com' },
  branch_manager: { name: 'Bishal Adhikari', role: 'branch_manager', branch: 'Sydney CBD', email: 'sunita@everestvisa.com' },
  receptionist: { name: 'Jessica Wong', role: 'receptionist', branch: 'Sydney CBD', email: 'jessica@everestvisa.com' },
  counselor: { name: 'David Chen', role: 'counselor', branch: 'Parramatta', email: 'david@everestvisa.com' },
  application_officer: { name: 'Maria Santos', role: 'application_officer', branch: 'Sydney CBD', email: 'maria@everestvisa.com' },
};

export const NAV_CONFIG: NavConfig = {
  super_admin: [
    { key: 'overview', label: 'Overview', icon: 'LayoutDashboard' },
    { key: 'branches', label: 'All Branches', icon: 'Building2' },
    { key: 'students', label: 'Students', icon: 'GraduationCap' },
    { key: 'applications', label: 'Applications', icon: 'FileText' },
    { key: 'commissions', label: 'Commissions', icon: 'DollarSign' },
    { key: 'staff', label: 'Staff', icon: 'Users' },
    { key: 'reports', label: 'Reports', icon: 'BarChart3' },
  ],
  marketing: [
    { key: 'overview', label: 'Overview', icon: 'LayoutDashboard' },
    { key: 'students', label: 'Students', icon: 'GraduationCap', viewOnly: true },
    { key: 'reports', label: 'Reports', icon: 'BarChart3' },
  ],
  finance: [
    { key: 'overview', label: 'Overview', icon: 'LayoutDashboard' },
    { key: 'commissions', label: 'Commissions', icon: 'DollarSign' },
    { key: 'applications', label: 'Applications', icon: 'FileText', viewOnly: true },
    { key: 'reports', label: 'Reports', icon: 'BarChart3' },
  ],
  branch_manager: [
    { key: 'overview', label: 'Overview', icon: 'LayoutDashboard' },
    { key: 'students', label: 'Students', icon: 'GraduationCap' },
    { key: 'applications', label: 'Applications', icon: 'FileText' },
    { key: 'staff', label: 'Staff', icon: 'Users' },
    { key: 'reports', label: 'Reports', icon: 'BarChart3' },
  ],
  receptionist: [
    { key: 'overview', label: 'Overview', icon: 'LayoutDashboard' },
    { key: 'new-intake', label: 'New Intake', icon: 'UserPlus' },
    { key: 'students', label: 'Students', icon: 'GraduationCap' },
    { key: 'assign-counselor', label: 'Assign Counselor', icon: 'UserCheck' },
  ],
  counselor: [
    { key: 'overview', label: 'Overview', icon: 'LayoutDashboard' },
    { key: 'my-students', label: 'My Students', icon: 'GraduationCap' },
    { key: 'consultations', label: 'Consultations', icon: 'CalendarDays' },
  ],
  application_officer: [
    { key: 'overview', label: 'Overview', icon: 'LayoutDashboard' },
    { key: 'applications', label: 'Applications', icon: 'FileText' },
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

export const PURPOSES = ['Study', 'Work', 'Tourist', 'PR'];

export const MOCK_COUNSELORS: Counselor[] = [
  { id: 'c1', name: 'Ramesh Thapa', branch: 'Sydney CBD', activeAssignments: 12 },
  { id: 'c2', name: 'Sita Gurung', branch: 'Sydney CBD', activeAssignments: 8 },
  { id: 'c3', name: 'Bikash Rai', branch: 'Parramatta', activeAssignments: 15 },
  { id: 'c4', name: 'Anjali Shrestha', branch: 'Parramatta', activeAssignments: 6 },
  { id: 'c5', name: 'Niraj Maharjan', branch: 'Sydney CBD', activeAssignments: 10 },
  { id: 'c5', name: 'Milan Gurung', branch: 'Chitwan', activeAssignments: 10 },
];

export const MOCK_STUDENTS: IntakeStudent[] = [
  { id: 's1', name: 'Arjun Mehta', phone: '+61 412 345 678', email: 'arjun.mehta@gmail.com', country: 'Australia', purpose: 'Study', preferredDate: '2026-09-16T10:00', submittedAt: '2026-09-14 09:15 AM', status: 'New', assignedCounselor: null, branch: 'Chitwan' },
  { id: 's2', name: 'Lina Zhang', phone: '+61 423 987 654', email: 'lina.zhang@outlook.com', country: 'Canada', purpose: 'PR', preferredDate: '2026-09-18T14:00', submittedAt: '2026-09-14 08:42 AM', status: 'New', assignedCounselor: null, branch: 'Butwal' },
  { id: 's3', name: 'Mohammed Ali', phone: '+61 445 123 456', email: 'm.ali@yahoo.com', country: 'United Kingdom', purpose: 'Work', preferredDate: '2026-09-17T11:30', submittedAt: '2026-09-13 03:20 PM', status: 'Assigned', assignedCounselor: 'Ramesh Thapa', branch: 'Kamaltadi' },
  { id: 's4', name: 'Sara Khan', phone: '+61 478 456 789', email: 'sara.khan@gmail.com', country: 'USA', purpose: 'Tourist', preferredDate: '2026-09-20T09:00', submittedAt: '2026-09-13 01:10 PM', status: 'New', assignedCounselor: null, branch: 'Pokhara' },
  { id: 's5', name: 'Deepak Thapa', phone: '+61 489 654 321', email: 'deepak.t@gmail.com', country: 'Australia', purpose: 'Study', preferredDate: '2026-09-19T15:00', submittedAt: '2026-09-12 11:45 AM', status: 'Assigned', assignedCounselor: 'Sita Gurung', branch: 'New Baneshwor' },
  { id: 's6', name: 'Emily Park', phone: '+61 401 222 333', email: 'emily.park@gmail.com', country: 'New Zealand', purpose: 'Work', preferredDate: '2026-09-21T13:00', submittedAt: '2026-09-12 10:30 AM', status: 'New', assignedCounselor: null, branch: 'Chitwan' },
  { id: 's7', name: 'Ravi Gupta', phone: '+61 433 777 888', email: 'ravi.gupta@outlook.com', country: 'Canada', purpose: 'PR', preferredDate: '2026-09-18T16:00', submittedAt: '2026-09-11 02:15 PM', status: 'Assigned', assignedCounselor: 'Bikash Rai', branch: 'Butwal' },
  { id: 's8', name: 'Anna Lee', phone: '+61 415 555 999', email: 'anna.lee@gmail.com', country: 'Australia', purpose: 'Study', preferredDate: '2026-09-22T10:30', submittedAt: '2026-09-11 09:00 AM', status: 'New', assignedCounselor: null, branch: 'Pokhara' },
];

export const MOCK_COUNSELOR_STUDENTS: CounselorStudent[] = [
  { id: 'cs1', name: 'Arjun Mehta', phone: '+61 412 345 678', email: 'arjun.mehta@gmail.com', country: 'Australia', purpose: 'Study', submittedAt: '2026-09-14 09:15 AM', assignedDate: '2026-09-14', assignedCounselor: 'David Chen', consultationStatus: 'Awaiting Consultation', consultationNotes: '', completedDate: null, sentToApplication: false },
  { id: 'cs2', name: 'Mohammed Ali', phone: '+61 445 123 456', email: 'm.ali@yahoo.com', country: 'United Kingdom', purpose: 'Work', submittedAt: '2026-09-13 03:20 PM', assignedDate: '2026-09-13', assignedCounselor: 'David Chen', consultationStatus: 'In Progress', consultationNotes: 'Client interested in skilled migration pathway. Needs IELTS assessment. Discussed employer sponsorship options.', completedDate: null, sentToApplication: false },
  { id: 'cs3', name: 'Emily Park', phone: '+61 401 222 333', email: 'emily.park@gmail.com', country: 'New Zealand', purpose: 'Work', submittedAt: '2026-09-12 10:30 AM', assignedDate: '2026-09-12', assignedCounselor: 'David Chen', consultationStatus: 'Consultation Complete', consultationNotes: 'Client has valid job offer from Sydney employer. Recommended 482 visa (temporary skill shortage). All documents verified and ready for lodgement.', completedDate: '2026-09-13', sentToApplication: true },
  { id: 'cs4', name: 'Ravi Gupta', phone: '+61 433 777 888', email: 'ravi.gupta@outlook.com', country: 'Canada', purpose: 'PR', submittedAt: '2026-09-11 02:15 PM', assignedDate: '2026-09-11', assignedCounselor: 'David Chen', consultationStatus: 'In Progress', consultationNotes: 'Client seeking permanent residency via Express Entry. Reviewed education credentials and work experience. Need to arrange WES assessment.', completedDate: null, sentToApplication: false },
  { id: 'cs5', name: 'Anna Lee', phone: '+61 415 555 999', email: 'anna.lee@gmail.com', country: 'Australia', purpose: 'Study', submittedAt: '2026-09-11 09:00 AM', assignedDate: '2026-09-11', assignedCounselor: 'David Chen', consultationStatus: 'Awaiting Consultation', consultationNotes: '', completedDate: null, sentToApplication: false },
  { id: 'cs6', name: 'Sara Khan', phone: '+61 478 456 789', email: 'sara.khan@gmail.com', country: 'USA', purpose: 'Tourist', submittedAt: '2026-09-13 01:10 PM', assignedDate: '2026-09-13', assignedCounselor: 'David Chen', consultationStatus: 'Consultation Complete', consultationNotes: 'Client applying for US B1/B2 tourist visa. Travel planned for December. Documents collected: passport, bank statements, employment letter.', completedDate: '2026-09-14', sentToApplication: false },
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
    branch: 'Chitwan',
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
    branch: 'Pokhara',
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
    branch: 'New Baneshwor',
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
    branch: 'Butwal',
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
    branch: 'Kamaltadi',
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
    branch: 'Butwal',
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
    branch: 'Kamaltadi',
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
    branch: 'Pokhara',
  },
];

export const MOCK_STAFF: StaffMember[] = [
  { id: 'st1', name: 'Jessica Wong', email: 'jessica@everestvisa.com', role: 'Receptionist', status: 'Active', branch: 'Sydney CBD' },
  { id: 'st2', name: 'Ramesh Thapa', email: 'ramesh@everestvisa.com', role: 'Counselor', status: 'Active', branch: 'Sydney CBD' },
  { id: 'st3', name: 'Sita Gurung', email: 'sita@everestvisa.com', role: 'Counselor', status: 'Active', branch: 'Sydney CBD' },
  { id: 'st4', name: 'Niraj Maharjan', email: 'niraj@everestvisa.com', role: 'Counselor', status: 'Inactive', branch: 'Sydney CBD' },
  { id: 'st5', name: 'Maria Santos', email: 'maria@everestvisa.com', role: 'Application Officer', status: 'Active', branch: 'Sydney CBD' },
  { id: 'st6', name: 'John Smith', email: 'john@everestvisa.com', role: 'Application Officer', status: 'Active', branch: 'Sydney CBD' },
];

export const BRANCH_MANAGER_STATS = [
  { label: 'Total Students This Month', value: '38', icon: 'GraduationCap', trend: '+8% vs last month', trendUp: true },
  { label: 'Active Consultations', value: '14', icon: 'CalendarDays', trend: '+3 this week', trendUp: true },
  { label: 'Applications In Progress', value: '22', icon: 'FileText', trend: '+5 new this week', trendUp: true },
  { label: 'Visas Granted (This Month)', value: '9', icon: 'CheckCircle', trend: '+2 this week', trendUp: true },
  { label: 'Visas Refused (This Month)', value: '3', icon: 'XCircle', trend: '-1 vs last month', trendUp: false },
];

export const MOCK_ACTIVITY_FEED: ActivityEntry[] = [
  { id: 'act1', message: 'Sita Gurung assigned to Ramesh Thapa', timestamp: '2 min ago', type: 'assignment' },
  { id: 'act2', message: 'Application for Priya Karki moved to Lodgement', timestamp: '15 min ago', type: 'status' },
  { id: 'act3', message: 'New intake: Anna Lee submitted the intake form', timestamp: '1 hour ago', type: 'intake' },
  { id: 'act4', message: 'David Chen completed consultation for Emily Park', timestamp: '2 hours ago', type: 'consultation' },
  { id: 'act5', message: 'Application for Deepak Thapa marked as Success', timestamp: '3 hours ago', type: 'status' },
  { id: 'act6', message: 'Arjun Mehta assigned to Ramesh Thapa', timestamp: '5 hours ago', type: 'assignment' },
  { id: 'act7', message: 'New intake: Sara Khan submitted the intake form', timestamp: '6 hours ago', type: 'intake' },
  { id: 'act8', message: 'Application for Lina Zhang marked as Refused', timestamp: '1 day ago', type: 'status' },
];

export const MOCK_BRANCHES: Branch[] = [
  { id: 'b1', name: 'Chitwan', location: 'Chitwan', manager: 'BIshal Adhikari', staffCount: 8, activeStudents: 45, applicationsInProgress: 12, visasGranted: 18 },
  { id: 'b2', name: 'Butwal', location: 'Butwal', manager: 'DB-Rayamajhi', staffCount: 6, activeStudents: 32, applicationsInProgress: 8, visasGranted: 14 },
  { id: 'b3', name: 'Kamaladi', location: 'Kamaladi', manager: 'Sibendra Subedi', staffCount: 7, activeStudents: 38, applicationsInProgress: 10, visasGranted: 11 },
  { id: 'b4', name: 'New Baneshwor', location: 'New Baneshwor', manager: 'Bidhya Basnet', staffCount: 5, activeStudents: 28, applicationsInProgress: 6, visasGranted: 9 },
  { id: 'b5', name: 'Putalisadak', location: 'Putalisadak', manager: 'Samjhana Khanal', staffCount: 9, activeStudents: 52, applicationsInProgress: 15, visasGranted: 22 },
  { id: 'b6', name: 'Kumaripati', location: 'Kumaripati', manager: 'Dilli Pokharel', staffCount: 12, activeStudents: 68, applicationsInProgress: 20, visasGranted: 31 },
];

export const SUPER_ADMIN_STATS = [
  { label: 'Total Students', value: '263', icon: 'GraduationCap', trend: '+38 this month', trendUp: true },
  { label: 'Active Applications', value: '71', icon: 'FileText', trend: '+12 this week', trendUp: true },
  { label: 'Visas Granted (This Month)', value: '105', icon: 'CheckCircle', trend: '+23 this month', trendUp: true },
  { label: 'Visas Refused (This Month)', value: '18', icon: 'XCircle', trend: '-4 vs last month', trendUp: false },
  { label: 'Total Branches', value: '6', icon: 'Building2', trend: '2 added this year', trendUp: true },
  { label: 'Total Staff', value: '47', icon: 'Users', trend: '+5 this quarter', trendUp: true },
];

export const MOCK_COMMISSIONS: CommissionRecord[] = [
  { id: 'cm1', studentName: 'Emily Park', branch: 'Chitwan', consultant: 'David Chen', applicationStatus: 'Lodgement', amount: 2500, commissionStatus: 'Pending' },
  { id: 'cm2', studentName: 'Sara Khan', branch: 'Pokhara', consultant: 'David Chen', applicationStatus: 'Preparation', amount: 1800, commissionStatus: 'Pending' },
  { id: 'cm3', studentName: 'Deepak Thapa', branch: 'New Baneshwor', consultant: 'Sita Gurung', applicationStatus: 'Success', amount: 3200, commissionStatus: 'Paid' },
  { id: 'cm4', studentName: 'Ravi Gupta', branch: 'Butwal', consultant: 'David Chen', applicationStatus: 'Lodgement', amount: 2800, commissionStatus: 'Pending' },
  { id: 'cm5', studentName: 'Arjun Mehta', branch: 'Kamaltadi', consultant: 'Ramesh Thapa', applicationStatus: 'Preparation', amount: 1500, commissionStatus: 'Pending' },
  { id: 'cm6', studentName: 'Lina Zhang', branch: 'Butwal', consultant: 'Bikash Rai', applicationStatus: 'Refused', amount: 0, commissionStatus: 'Paid' },
  { id: 'cm7', studentName: 'Mohammed Ali', branch: 'Kamaltadi', consultant: 'David Chen', applicationStatus: 'Preparation', amount: 2200, commissionStatus: 'Pending' },
  { id: 'cm8', studentName: 'Anna Lee', branch: 'Pokhara', consultant: 'Ramesh Thapa', applicationStatus: 'Lodgement', amount: 2600, commissionStatus: 'Paid' },
];
