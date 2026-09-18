import { useState, useMemo, useEffect } from 'react';
import Login from './components/Login';
import DashboardShell from './components/DashboardShell';
import OverviewPage from './components/OverviewPage';
import BranchManagerOverview from './components/BranchManagerOverview';
import SuperAdminOverview from './components/SuperAdminOverview';
import ReceptionistOverview from './components/ReceptionistOverview';
import CounselorOverview from './components/CounselorOverview';
import ApplicationOfficerOverview from './components/ApplicationOfficerOverview';
import AllBranches from './components/AllBranches';
import PartnersPage from './components/PartnersPage';
import CommissionsPage from './components/CommissionsPage';
import ComingSoon from './components/ComingSoon';
import NewIntakeForm, { IntakeFormData } from './components/NewIntakeForm';
import StudentList from './components/StudentList';
import AssignCounselorPage from './components/AssignCounselorPage';
import AssignedClientsPage from './components/AssignedClientsPage';
import MyStudents from './components/MyStudents';
import ConsultationsPage from './components/ConsultationsPage';
import ApplicationsList from './components/ApplicationsList';
import StatusUpdatesKanban from './components/StatusUpdatesKanban';
import StaffManagement from './components/StaffManagement';
import ArchivePage from './components/ArchivePage';
import FollowUpsPage from './components/FollowUpsPage';
import ReportsPage from './components/ReportsPage';
import { MockUser, IntakeStudent, CounselorStudent, ApplicationRecord, StaffMember, Branch, CommissionRecord, Partner, AppNotification, Counselor } from './types';
import {
  NAV_CONFIG,
  MOCK_COMMISSIONS, MOCK_PARTNERS,
} from './mockData';
import { createIntakeNotification, createAssignmentNotification, createConsultationReadyNotification, createBranchManagerNotification } from './notifications';
import { formatSubmittedAt } from './dateTime';
import { fetchNotifications, insertNotification, markNotificationRead, markNotificationsRead } from './lib/notificationsApi';
import { fetchCounselorStudents, updateCounselorStudent, upsertCounselorStudent } from './lib/counselorStudentsApi';
import { fetchStudents, insertStudent, updateStudent } from './lib/studentsApi';
import { fetchCounselors, insertCounselor, updateCounselor, deleteCounselor } from './lib/counselorsApi';
import { fetchApplications, updateApplication, insertApplication } from './lib/applicationsApi';
import { fetchStaff, insertStaff, updateStaff, deleteStaff } from './lib/staffApi';
import { fetchBranches, insertBranch, updateBranch, deleteBranch } from './lib/branchesApi';
import { subscribeToTable } from './lib/realtimeSubscribe';

export default function App() {
  const isIntakeForm = window.location.pathname === '/intake';

  const [user, setUser] = useState<MockUser | null>(null);
  const [activeKey, setActiveKey] = useState<string>('overview');
  const [students, setStudents] = useState<IntakeStudent[]>([]);
  const [counselors, setCounselors] = useState<Counselor[]>([]);
  const [counselorStudents, setCounselorStudents] = useState<CounselorStudent[]>([]);
  const [applications, setApplications] = useState<ApplicationRecord[]>([]);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [commissions, setCommissions] = useState<CommissionRecord[]>(MOCK_COMMISSIONS);
  const [partners, setPartners] = useState<Partner[]>(MOCK_PARTNERS);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  useEffect(() => {
    const load = () =>
      fetchCounselorStudents()
        .then(setCounselorStudents)
        .catch((err) => console.error('Failed to load counselor_students from Supabase', err));
    load();
    return subscribeToTable('counselor_students', load);
  }, []);

  useEffect(() => {
    const load = () =>
      fetchStudents()
        .then(setStudents)
        .catch((err) => console.error('Failed to load students from Supabase', err));
    load();
    return subscribeToTable('students', load);
  }, []);

  useEffect(() => {
    const load = () =>
      fetchCounselors()
        .then(setCounselors)
        .catch((err) => console.error('Failed to load counselors from Supabase', err));
    load();
    return subscribeToTable('counselors', load);
  }, []);

  useEffect(() => {
    const load = () =>
      fetchApplications()
        .then(setApplications)
        .catch((err) => console.error('Failed to load applications from Supabase', err));
    load();
    return subscribeToTable('applications', load);
  }, []);

  useEffect(() => {
    const load = () =>
      fetchStaff()
        .then(setStaff)
        .catch((err) => console.error('Failed to load staff from Supabase', err));
    load();
    return subscribeToTable('staff', load);
  }, []);

  useEffect(() => {
    const load = () =>
      fetchBranches()
        .then(setBranches)
        .catch((err) => console.error('Failed to load branches from Supabase', err));
    load();
    return subscribeToTable('branches', load);
  }, []);

  useEffect(() => {
    const load = () =>
      fetchNotifications()
        .then(setNotifications)
        .catch((err) => console.error('Failed to load notifications from Supabase', err));
    load();
    return subscribeToTable('notifications', load);
  }, []);

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
      submittedAt: formatSubmittedAt(new Date()),
      status: 'New',
      assignedCounselor: null,
      branch: user?.branch ?? '',
    };
    setStudents((prev) => [newStudent, ...prev]);
    insertStudent(newStudent).catch((err) => console.error('Failed to insert student in Supabase', err));
    const notification = createIntakeNotification(newStudent.name, newStudent.country, newStudent.purpose, newStudent.branch);
    const managerNotification = createBranchManagerNotification(
      'new-intake', newStudent.name, 'New intake from ', ` — ${newStudent.country}, ${newStudent.purpose}`, newStudent.branch, 'students'
    );
    setNotifications((prev) => [managerNotification, notification, ...prev]);
    insertNotification(notification).catch((err) => console.error('Failed to insert notification in Supabase', err));
    insertNotification(managerNotification).catch((err) => console.error('Failed to insert notification in Supabase', err));
  };

  const handleAssign = (studentId: string, counselorName: string) => {
    setStudents((prev) =>
      prev.map((s) =>
        s.id === studentId
          ? { ...s, status: 'Assigned', assignedCounselor: counselorName }
          : s
      )
    );
    updateStudent(studentId, { status: 'Assigned', assignedCounselor: counselorName }).catch((err) =>
      console.error('Failed to update student in Supabase', err)
    );
    const student = students.find((s) => s.id === studentId);
    if (student) {
      const notification = createAssignmentNotification(student.name, student.country, student.purpose, counselorName);
      const managerNotification = createBranchManagerNotification(
        'assigned-to-counselor', student.name, '', ` assigned to ${counselorName} — ${student.country}, ${student.purpose}`, student.branch, 'students'
      );
      setNotifications((prev) => [managerNotification, notification, ...prev]);
      insertNotification(notification).catch((err) => console.error('Failed to insert notification in Supabase', err));
      insertNotification(managerNotification).catch((err) => console.error('Failed to insert notification in Supabase', err));

      const existingCs = counselorStudents.find((cs) => cs.id === student.id);
      const newCounselorStudent: CounselorStudent = existingCs
        ? { ...existingCs, assignedCounselor: counselorName, assignedDate: new Date().toISOString().slice(0, 10) }
        : {
            id: student.id,
            name: student.name,
            phone: student.phone,
            email: student.email,
            country: student.country,
            purpose: student.purpose,
            dob: student.dob,
            gender: student.gender,
            maritalStatus: student.maritalStatus,
            academicQualification: student.academicQualification,
            ieltsPte: student.ieltsPte,
            workExperience: student.workExperience,
            submittedAt: student.submittedAt,
            assignedDate: new Date().toISOString().slice(0, 10),
            assignedCounselor: counselorName,
            consultationStatus: 'Awaiting Consultation',
            consultationNotes: '',
            followUpDate: null,
            completedDate: null,
            outcome: 'Pending',
          };
      setCounselorStudents((prev) =>
        prev.some((cs) => cs.id === newCounselorStudent.id)
          ? prev.map((cs) => (cs.id === newCounselorStudent.id ? newCounselorStudent : cs))
          : [newCounselorStudent, ...prev]
      );
      upsertCounselorStudent(newCounselorStudent).catch((err) =>
        console.error('Failed to upsert counselor_students in Supabase', err)
      );

      // activeAssignments is now derived live from counselor_students — no DB write needed.
    }
  };

  const handleUpdateCounselorStudent = (id: string, updates: Partial<CounselorStudent>) => {
    setCounselorStudents((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updates } : s))
    );
    updateCounselorStudent(id, updates).catch((err) =>
      console.error('Failed to update counselor_students in Supabase', err)
    );
    if (updates.outcome === 'Proceeding') {
      const student = counselorStudents.find((s) => s.id === id);
      if (student) {
        const notification = createConsultationReadyNotification(student.name, user?.branch ?? '');
        const managerNotification = createBranchManagerNotification(
          'consultation-ready', student.name, '', ' ready for application — consultation complete', user?.branch ?? '', 'applications'
        );
        setNotifications((prev) => [managerNotification, notification, ...prev]);
        insertNotification(notification).catch((err) => console.error('Failed to insert notification in Supabase', err));
        insertNotification(managerNotification).catch((err) => console.error('Failed to insert notification in Supabase', err));

        const now = new Date();
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];
        const historyDate = `${monthNames[now.getMonth()]} ${now.getDate()}`;
        const newApplication: ApplicationRecord = {
          id: `a${Date.now()}`,
          name: student.name,
          phone: student.phone,
          email: student.email,
          country: student.country,
          purpose: student.purpose,
          dob: student.dob,
          gender: student.gender,
          maritalStatus: student.maritalStatus,
          academicQualification: student.academicQualification,
          ieltsPte: student.ieltsPte,
          workExperience: student.workExperience,
          counselor: student.assignedCounselor,
          consultationDate: student.completedDate ?? now.toISOString().slice(0, 10),
          consultationNotes: student.consultationNotes,
          status: 'Preparation',
          statusHistory: [{ status: 'Preparation', date: historyDate }],
          branch: user?.branch ?? '',
          collegeApplications: [],
          visaApplication: null,
        };
        setApplications((prev) => [newApplication, ...prev]);
        insertApplication(newApplication).catch((err) => console.error('Failed to insert application in Supabase', err));
      }
    }
  };

  const handleMarkNotificationRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    markNotificationRead(id).catch((err) => console.error('Failed to mark notification read in Supabase', err));
  };

  const handleMarkAllNotificationsRead = (ids: string[]) => {
    setNotifications((prev) => prev.map((n) => (ids.includes(n.id) ? { ...n, read: true } : n)));
    markNotificationsRead(ids).catch((err) => console.error('Failed to mark notifications read in Supabase', err));
  };

  const handleUpdateApplication = (id: string, updates: Partial<ApplicationRecord>) => {
    setApplications((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ...updates } : a))
    );
    updateApplication(id, updates).catch((err) =>
      console.error('Failed to update application in Supabase', err)
    );
  };

  const handleAddStaff = (member: StaffMember, counselorCountry?: string) => {
    setStaff((prev) => [...prev, member]);
    insertStaff(member).catch((err) => console.error('Failed to insert staff in Supabase', err));
    if (member.role === 'Branch Manager') {
      setBranches((prev) =>
        prev.map((b) => (b.name === member.branch ? { ...b, manager: member.name } : b))
      );
      const target = branches.find((b) => b.name === member.branch);
      if (target) {
        updateBranch(target.id, { manager: member.name }).catch((err) =>
          console.error('Failed to update branch manager in Supabase', err)
        );
      }
    }
    if (member.role === 'Counselor') {
      const newCounselor: Counselor = {
        id: `c${Date.now()}`,
        name: member.name,
        country: counselorCountry ?? '',
        activeAssignments: 0,
        availability: 'Available',
      };
      setCounselors((prev) => [...prev, newCounselor]);
      insertCounselor(newCounselor).catch((err) => console.error('Failed to insert counselor in Supabase', err));
    }
  };

  const handleUpdateStaff = (id: string, updates: Partial<StaffMember>) => {
    setStaff((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)));
    updateStaff(id, updates).catch((err) => console.error('Failed to update staff in Supabase', err));
  };

  const handleRemoveStaff = (id: string) => {
    const target = staff.find((s) => s.id === id);
    setStaff((prev) => prev.filter((s) => s.id !== id));
    deleteStaff(id).catch((err) => console.error('Failed to delete staff in Supabase', err));
    if (target?.role === 'Branch Manager') {
      setBranches((prev) =>
        prev.map((b) => (b.manager === target.name ? { ...b, manager: null } : b))
      );
      const targetBranch = branches.find((b) => b.manager === target.name);
      if (targetBranch) {
        updateBranch(targetBranch.id, { manager: null }).catch((err) =>
          console.error('Failed to update branch manager in Supabase', err)
        );
      }
    }
    if (target?.role === 'Counselor') {
      const targetCounselor = counselors.find((c) => c.name === target.name);
      setCounselors((prev) => prev.filter((c) => c.name !== target.name));
      if (targetCounselor) {
        deleteCounselor(targetCounselor.id).catch((err) =>
          console.error('Failed to delete counselor in Supabase', err)
        );
      }
    }
  };

  const handleAddBranch = (branch: Branch) => {
    setBranches((prev) => [...prev, branch]);
    insertBranch(branch).catch((err) => console.error('Failed to insert branch in Supabase', err));
  };

  const handleDeleteBranch = (id: string) => {
    setBranches((prev) => prev.filter((b) => b.id !== id));
    deleteBranch(id).catch((err) => console.error('Failed to delete branch in Supabase', err));
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

  // Branch Manager's Staff page is scoped to their own branch and to branch-level roles —
  // company-wide roles (Super Admin/Marketing/Finance) never belong to a single branch, so
  // they're excluded even in the unlikely case their `branch` value collides with this one.
  const branchStaff = useMemo(() => {
    if (!user || user.role !== 'branch_manager') return staff;
    return staff.filter(
      (s) => s.branch === user.branch && s.role !== 'Super Admin' && s.role !== 'Marketing' && s.role !== 'Finance'
    );
  }, [staff, user]);

  // Every non-Super-Admin role's Students/Applications/Assign Counselor pages are scoped to
  // their own branch — StudentList and ApplicationsList only render a branch filter dropdown
  // for Super Admin (showBranchFilter), so without pre-filtering here a Branch Manager,
  // Receptionist or VA Officer would see every branch's data.
  const branchStudents = useMemo(() => {
    if (!user || user.role === 'super_admin') return students;
    return students.filter((s) => s.branch === user.branch);
  }, [students, user]);

  const branchApplications = useMemo(() => {
    if (!user || user.role === 'super_admin') return applications;
    return applications.filter((a) => a.branch === user.branch);
  }, [applications, user]);

  // Recompute activeAssignments live from counselor_students so the count always reflects
  // real data rather than the stale integer stored in the counselors table.
  const counselorsWithLiveCounts = useMemo(() => {
    return counselors.map((c) => ({
      ...c,
      activeAssignments: counselorStudents.filter(
        (s) => s.assignedCounselor === c.name && s.consultationStatus !== 'Consultation Complete'
      ).length,
    }));
  }, [counselors, counselorStudents]);

  // Counselor rows carry no `branch` of their own — resolved via their staff record
  // (matched by name), same technique used in computeBranchOverviewStats.
  const branchCounselors = useMemo(() => {
    if (!user || user.role === 'super_admin') return counselorsWithLiveCounts;
    const counselorBranchByName = new Map(staff.filter((s) => s.role === 'Counselor').map((s) => [s.name, s.branch]));
    return counselorsWithLiveCounts.filter((c) => counselorBranchByName.get(c.name) === user.branch);
  }, [counselorsWithLiveCounts, staff, user]);


  const upcomingConsultations = useMemo(() => {
    const pending = counselorStudents.filter((s) => s.consultationStatus !== 'Consultation Complete');
    if (user?.role === 'counselor') {
      return pending.filter((s) => s.assignedCounselor === user.name);
    }
    return pending;
  }, [counselorStudents, user]);

  // A counselor's Assigned Clients/Enrolled/Archive pages are scoped to their own clients —
  // without this, App.tsx would hand every counselor's full counselor_students list down.
  const myCounselorStudents = useMemo(() => {
    if (!user || user.role !== 'counselor') return counselorStudents;
    return counselorStudents.filter((s) => s.assignedCounselor === user.name);
  }, [counselorStudents, user]);

  if (isIntakeForm) {
    return <NewIntakeForm />;
  }

  if (!user) {
    return <Login staff={staff} onLogin={handleLogin} />;
  }

  const navItems = NAV_CONFIG[user.role];
  const activeItem = navItems.find((item) => item.key === activeKey);
  const isSuperAdmin = user.role === 'super_admin';

  const renderPage = () => {
    if (activeKey === 'overview') {
      if (isSuperAdmin)
        return (
          <SuperAdminOverview
            branches={branches}
            staff={staff}
            students={students}
            counselorStudents={counselorStudents}
            applications={applications}
          />
        );
      if (user.role === 'branch_manager')
        return (
          <BranchManagerOverview
            branch={user.branch}
            students={branchStudents}
            counselorStudents={counselorStudents}
            applications={branchApplications}
            counselors={branchCounselors}
            staff={staff}
            notifications={notifications}
          />
        );
      if (user.role === 'receptionist')
        return (
          <ReceptionistOverview
            students={branchStudents}
            upcomingConsultations={upcomingConsultations}
            counselors={branchCounselors}
          />
        );
      if (user.role === 'counselor')
        return (
          <CounselorOverview
            counselorName={user.name}
            counselorStudents={counselorStudents}
            applications={applications}
          />
        );
      if (user.role === 'application_officer')
        return <ApplicationOfficerOverview branch={user.branch} applications={applications} />;
      return <OverviewPage upcomingConsultations={upcomingConsultations} />;
    }
    if (activeKey === 'branches')
      return (
        <AllBranches
          branches={branches}
          staff={staff}
          students={students}
          applications={applications}
          onAddBranch={handleAddBranch}
          onDeleteBranch={handleDeleteBranch}
        />
      );
    if (activeKey === 'new-intake')
      return <NewIntakeForm embedded onSubmit={handleAddStudent} />;
    if (activeKey === 'students')
      return (
        <StudentList
          students={branchStudents}
          counselors={branchCounselors}
          counselorStudents={counselorStudents}
          onAssign={handleAssign}
          branches={branchNames}
          showBranchFilter={isSuperAdmin}
        />
      );
    if (activeKey === 'assign-counselor')
      return <AssignCounselorPage students={branchStudents} counselors={branchCounselors} onAssign={handleAssign} />;
    if (activeKey === 'assigned')
      return <AssignedClientsPage counselorStudents={counselorStudents} />;
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
      return <MyStudents students={myCounselorStudents} onUpdateStudent={handleUpdateCounselorStudent} />;
    if (activeKey === 'consultations')
      return <ConsultationsPage students={myCounselorStudents} onUpdateStudent={handleUpdateCounselorStudent} />;
    if (activeKey === 'follow-ups')
      return <FollowUpsPage students={myCounselorStudents} onUpdateStudent={handleUpdateCounselorStudent} />;
    if (activeKey === 'archive')
      return <ArchivePage students={myCounselorStudents} onUpdateStudent={handleUpdateCounselorStudent} />;
    if (activeKey === 'applications')
      return (
        <ApplicationsList
          applications={branchApplications}
          onUpdateApplication={handleUpdateApplication}
          branches={branchNames}
          showBranchFilter={isSuperAdmin}
          partners={user.role === 'application_officer' ? partners : undefined}
        />
      );
    if (activeKey === 'status-updates')
      return <StatusUpdatesKanban applications={branchApplications} onUpdateApplication={handleUpdateApplication} />;
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
          staff={branchStaff}
          onAddStaff={handleAddStaff}
          onUpdateStaff={handleUpdateStaff}
          onRemoveStaff={handleRemoveStaff}
          branches={branchNames}
          showBranchFilter={isSuperAdmin}
          currentUserEmail={user.email}
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
      notifications={notifications}
      onMarkNotificationRead={handleMarkNotificationRead}
      onMarkAllNotificationsRead={handleMarkAllNotificationsRead}
    >
      {renderPage()}
    </DashboardShell>
  );
}
