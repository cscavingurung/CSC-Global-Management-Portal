import { useState, useMemo } from 'react';
import Login from './components/Login';
import DashboardShell from './components/DashboardShell';
import OverviewPage from './components/OverviewPage';
import BranchManagerOverview from './components/BranchManagerOverview';
import SuperAdminOverview from './components/SuperAdminOverview';
import AllBranches from './components/AllBranches';
import PartnersPage from './components/PartnersPage';
import CommissionsPage from './components/CommissionsPage';
import ComingSoon from './components/ComingSoon';
import NewIntakeForm, { IntakeFormData } from './components/NewIntakeForm';
import StudentList from './components/StudentList';
import AssignCounselorPage from './components/AssignCounselorPage';
import MyStudents from './components/MyStudents';
import ConsultationsPage from './components/ConsultationsPage';
import ApplicationsList from './components/ApplicationsList';
import StatusUpdatesKanban from './components/StatusUpdatesKanban';
import StaffManagement from './components/StaffManagement';
import ReportsPage from './components/ReportsPage';
import { MockUser, IntakeStudent, CounselorStudent, ApplicationRecord, StaffMember, Branch, CommissionRecord, Partner } from './types';
import {
  NAV_CONFIG, MOCK_STUDENTS, MOCK_COUNSELOR_STUDENTS,
  MOCK_APPLICATIONS, MOCK_STAFF, MOCK_BRANCHES, MOCK_COMMISSIONS, MOCK_PARTNERS,
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
  const [partners, setPartners] = useState<Partner[]>(MOCK_PARTNERS);

  const handleLogin = (mockUser: MockUser) => {
    setUser(mockUser);
    setActiveKey('overview');
  };

  const handleLogout = () => {
    setUser(null);
    setActiveKey('overview');
  };

  const handleAddStudent = (data: IntakeFormData) => {
    const newStudent: IntakeStudent = {
      id: `s${Date.now()}`,
      ...data,
      submittedAt: new Date().toLocaleString('en-AU', {
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', hour12: true,
      }),
      status: 'New',
      assignedCounselor: null,
      branch: user?.branch ?? '',
    };
    setStudents((prev) => [newStudent, ...prev]);
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
    if (member.role === 'Branch Manager') {
      setBranches((prev) =>
        prev.map((b) => (b.name === member.branch ? { ...b, manager: member.name } : b))
      );
    }
  };

  const handleUpdateStaff = (id: string, updates: Partial<StaffMember>) => {
    setStaff((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)));
  };

  const handleRemoveStaff = (id: string) => {
    const target = staff.find((s) => s.id === id);
    setStaff((prev) => prev.filter((s) => s.id !== id));
    if (target?.role === 'Branch Manager') {
      setBranches((prev) =>
        prev.map((b) => (b.manager === target.name ? { ...b, manager: null } : b))
      );
    }
  };

  const handleAddBranch = (branch: Branch) => {
    setBranches((prev) => [...prev, branch]);
  };

  const handleDeleteBranch = (id: string) => {
    setBranches((prev) => prev.filter((b) => b.id !== id));
  };

  const handleAddPartner = (partner: Partner) => {
    setPartners((prev) => [...prev, partner]);
  };

  const handleUpdatePartner = (id: string, updates: Partial<Partner>) => {
    setPartners((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));
  };

  const handleDeletePartner = (id: string) => {
    setPartners((prev) => prev.filter((p) => p.id !== id));
  };

  const handleUpdateCommission = (id: string, updates: Partial<CommissionRecord>) => {
    setCommissions((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
    );
  };

  const branchNames = useMemo(() => branches.map((b) => b.name), [branches]);

  const upcomingConsultations = useMemo(() => {
    const pending = counselorStudents.filter((s) => s.consultationStatus !== 'Consultation Complete');
    if (user?.role === 'counselor') {
      return pending.filter((s) => s.assignedCounselor === user.name);
    }
    return pending;
  }, [counselorStudents, user]);

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
      return <OverviewPage upcomingConsultations={upcomingConsultations} />;
    }
    if (activeKey === 'branches')
      return (
        <AllBranches
          branches={branches}
          onAddBranch={handleAddBranch}
          onDeleteBranch={handleDeleteBranch}
        />
      );
    if (activeKey === 'new-intake')
      return <NewIntakeForm embedded onSubmit={handleAddStudent} />;
    if (activeKey === 'students')
      return (
        <StudentList
          students={students}
          onAssign={handleAssign}
          branches={branchNames}
          showBranchFilter={isSuperAdmin}
        />
      );
    if (activeKey === 'assign-counselor')
      return <AssignCounselorPage students={students} onAssign={handleAssign} />;
    if (activeKey === 'partners')
      return (
        <PartnersPage
          partners={partners}
          onAddPartner={handleAddPartner}
          onUpdatePartner={handleUpdatePartner}
          onDeletePartner={handleDeletePartner}
        />
      );
    if (activeKey === 'my-students')
      return <MyStudents students={counselorStudents} onUpdateStudent={handleUpdateCounselorStudent} />;
    if (activeKey === 'consultations')
      return <ConsultationsPage students={counselorStudents} onUpdateStudent={handleUpdateCounselorStudent} />;
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
      return (
        <CommissionsPage
          commissions={commissions}
          partners={partners}
          onUpdateCommission={handleUpdateCommission}
        />
      );
    if (activeKey === 'staff')
      return (
        <StaffManagement
          staff={staff}
          onAddStaff={handleAddStaff}
          onUpdateStaff={handleUpdateStaff}
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
