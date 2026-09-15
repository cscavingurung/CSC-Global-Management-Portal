import { useState, useMemo } from 'react';
import Login from './components/Login';
import DashboardShell from './components/DashboardShell';
import OverviewPage from './components/OverviewPage';
import BranchManagerOverview from './components/BranchManagerOverview';
import SuperAdminOverview from './components/SuperAdminOverview';
import AllBranches from './components/AllBranches';
import CommissionsPage from './components/CommissionsPage';
import ComingSoon from './components/ComingSoon';
import NewIntakeForm from './components/NewIntakeForm';
import StudentList from './components/StudentList';
import MyStudents from './components/MyStudents';
import ConsultationsPage from './components/ConsultationsPage';
import ApplicationsList from './components/ApplicationsList';
import StatusUpdatesKanban from './components/StatusUpdatesKanban';
import StaffManagement from './components/StaffManagement';
import ReportsPage from './components/ReportsPage';
import { MockUser, IntakeStudent, CounselorStudent, ApplicationRecord, StaffMember, Branch, CommissionRecord } from './types';
import {
  NAV_CONFIG, MOCK_STUDENTS, MOCK_COUNSELOR_STUDENTS,
  MOCK_APPLICATIONS, MOCK_STAFF, MOCK_BRANCHES, MOCK_COMMISSIONS,
} from './mockData';

export default function App() {
  const isIntakeForm = window.location.pathname === '/intake';

  const [user, setUser] = useState<MockUser | null>(null);
  const [activeKey, setActiveKey] = useState<string>('overview');
  const [students, setStudents] = useState<IntakeStudent[]>(MOCK_STUDENTS);
  const [counselorStudents, setCounselorStudents] = useState<CounselorStudent[]>(MOCK_COUNSELOR_STUDENTS);
  const [applications, setApplications] = useState<ApplicationRecord[]>(MOCK_APPLICATIONS);
  const [staff, setStaff] = useState<StaffMember[]>(MOCK_STAFF);
  const [branches, setBranches] = useState<Branch[]>(MOCK_BRANCHES);
  const [commissions, setCommissions] = useState<CommissionRecord[]>(MOCK_COMMISSIONS);

  const handleLogin = (mockUser: MockUser) => {
    setUser(mockUser);
    setActiveKey('overview');
  };

  const handleLogout = () => {
    setUser(null);
    setActiveKey('overview');
  };

  const handleAssign = (studentId: string, counselorName: string) => {
    setStudents((prev) =>
      prev.map((s) =>
        s.id === studentId
          ? { ...s, status: 'Assigned', assignedCounselor: counselorName }
          : s
      )
    );
  };

  const handleUpdateCounselorStudent = (id: string, updates: Partial<CounselorStudent>) => {
    setCounselorStudents((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updates } : s))
    );
  };

  const handleUpdateApplication = (id: string, updates: Partial<ApplicationRecord>) => {
    setApplications((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ...updates } : a))
    );
  };

  const handleAddStaff = (member: StaffMember) => {
    setStaff((prev) => [...prev, member]);
  };

  const handleRemoveStaff = (id: string) => {
    setStaff((prev) => prev.filter((s) => s.id !== id));
  };

  const handleAddBranch = (branch: Branch) => {
    setBranches((prev) => [...prev, branch]);
  };

  const handleUpdateCommission = (id: string, updates: Partial<CommissionRecord>) => {
    setCommissions((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
    );
  };

  const branchNames = useMemo(() => branches.map((b) => b.name), [branches]);

  if (isIntakeForm) {
    return <NewIntakeForm />;
  }

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  const navItems = NAV_CONFIG[user.role];
  const activeItem = navItems.find((item) => item.key === activeKey);
  const isSuperAdmin = user.role === 'super_admin';

  const renderPage = () => {
    if (activeKey === 'overview') {
      if (isSuperAdmin) return <SuperAdminOverview />;
      if (user.role === 'branch_manager') return <BranchManagerOverview />;
      return <OverviewPage />;
    }
    if (activeKey === 'branches')
      return <AllBranches branches={branches} staff={staff} onAddBranch={handleAddBranch} />;
    if (activeKey === 'students')
      return (
        <StudentList
          students={students}
          onAssign={handleAssign}
          branches={branchNames}
          showBranchFilter={isSuperAdmin}
        />
      );
    if (activeKey === 'my-students')
      return <MyStudents students={counselorStudents} onUpdateStudent={handleUpdateCounselorStudent} />;
    if (activeKey === 'consultations') return <ConsultationsPage students={counselorStudents} />;
    if (activeKey === 'applications')
      return (
        <ApplicationsList
          applications={applications}
          onUpdateApplication={handleUpdateApplication}
          branches={branchNames}
          showBranchFilter={isSuperAdmin}
        />
      );
    if (activeKey === 'status-updates')
      return <StatusUpdatesKanban applications={applications} onUpdateApplication={handleUpdateApplication} />;
    if (activeKey === 'commissions')
      return <CommissionsPage commissions={commissions} onUpdateCommission={handleUpdateCommission} />;
    if (activeKey === 'staff')
      return (
        <StaffManagement
          staff={staff}
          onAddStaff={handleAddStaff}
          onRemoveStaff={handleRemoveStaff}
          branches={branchNames}
          showBranchFilter={isSuperAdmin}
        />
      );
    if (activeKey === 'reports')
      return <ReportsPage branches={branchNames} showBranchFilter={isSuperAdmin} />;
    return <ComingSoon pageName={activeItem?.label || 'This page'} />;
  };

  return (
    <DashboardShell
      user={user}
      navItems={navItems}
      activeKey={activeKey}
      onNavigate={setActiveKey}
      onLogout={handleLogout}
    >
      {renderPage()}
    </DashboardShell>
  );
}
