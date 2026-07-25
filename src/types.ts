export type View = 'login' | 'dashboard' | 'register-student' | 'student-list' | 'settings' | 'fee-management' | 'academics' | 'attendance' | 'examination' | 'id-cards' | 'hostel' | 'live-camera' | 'admin-360' | 'class-360' | 'due-fees' | 'teacher-panel' | 'student-panel' | 'leave-management' | 'reports' | 'calendar' | 'role-assign' | 'human-resource' | 'communicate' | 'front-office' | 'income-expense' | 'profile-settings' | 'user-logs' | 'super-admin-panel' | 'attendance-public';

export interface User {
  id: string;
  name: string;
  role: 'admin' | 'teacher' | 'student' | 'parent' | 'warden' | 'super-admin';
  permissions: string[];
  studentId?: string;
  password?: string;
  photo?: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  type: 'event' | 'holiday' | 'examination' | 'ptm' | 'festival';
  icon?: string;
  color?: string;
}

export interface HostelRoom {
  id: string;
  roomNumber: string;
  floor: string;
  capacity: number;
  type: 'AC' | 'Non-AC';
  gender: 'Male' | 'Female';
  category: string;
  price: number;
}

export interface HostelBed {
  id: string;
  roomId: string;
  bedNumber: string;
  status: 'Available' | 'Occupied' | 'Maintenance';
  studentId?: string;
}

export interface HostelStaff {
  id: string;
  name: string;
  role: 'Warden' | 'Assistant Warden' | 'Security' | 'Cleaning Staff';
  mobile: string;
  email: string;
  shift: 'Day' | 'Night';
}

export interface HostelAttendance {
  id: string;
  studentId: string;
  date: string;
  status: 'Present' | 'Absent' | 'Late' | 'Leave';
  time: string;
  remarks?: string;
}

export interface Attendance {
  id: string;
  studentId: string;
  studentName: string;
  class: string;
  section: string;
  status: 'Present' | 'Absent' | 'Late' | 'Leave' | 'Holiday';
  date: string;
  time: string;
  markedBy: string;
  period?: 'Morning' | 'Last Period';
  ipAddress?: string;
  location?: string;
}

export interface TimeTableEntry {
  day: string;
  startTime: string;
  endTime: string;
  subject: string;
  teacher: string;
}

export interface ClassTimeTable {
  id: string;
  class: string;
  section: string;
  entries: TimeTableEntry[];
}

export interface Syllabus {
  id: string;
  class: string;
  subject: string;
  title: string;
  description: string;
  fileUrl?: string;
  date: string;
  status: 'Not Started' | 'Started' | 'Completed';
}

export interface LeaveRequest {
  id: string;
  studentId: string;
  studentName: string;
  class: string;
  section: string;
  startDate: string;
  endDate: string;
  duration: number;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  appliedDate: string;
  approvedBy?: string;
  type?: 'Leave' | 'Early Leave' | 'Parent Pickup';
  pickupTime?: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  date: string;
  type: 'Info' | 'Warning' | 'Success' | 'Fee';
  targetRoles: ('admin' | 'teacher' | 'student' | 'parent')[];
  targetStudentId?: string;
}

export interface Exam {
  id: string;
  name: string;
  type: string;
  startDate: string;
  endDate: string;
  status: 'Upcoming' | 'Ongoing' | 'Completed';
}

export interface ExamSchedule {
  id: string;
  examId: string;
  class: string;
  section: string;
  subject: string;
  date: string;
  startTime: string;
  endTime: string;
  room: string;
  questionPaper?: string;
  answerSheet?: string;
}

export interface ExamResult {
  id: string;
  examScheduleId: string;
  studentId: string;
  studentName: string;
  marks: number;
  maxMarks: number;
  grade: string;
  status: 'Pass' | 'Fail';
  feedback: string;
  teacherId: string;
}

export interface HomeworkSubmission {
  studentId: string;
  studentName: string;
  file: string; // base64 or mock URL
  date: string;
}

export interface Homework {
  id: string;
  class: string;
  section: string;
  subject: string;
  title: string;
  description: string;
  dueDate: string;
  teacherName: string;
  date: string;
  file?: string;
  status?: 'Pending' | 'Completed' | 'Submitted';
  submissions: HomeworkSubmission[];
}

export interface ClassAssignment {
  id: string;
  class: string;
  section: string;
  classTeacher: string;
  subjectTeachers: { subject: string; teacher: string }[];
  session: string;
}

export interface Activity {
  id: string;
  class: string;
  section: string;
  subject: string;
  title: string;
  description: string;
  date: string;
  teacherName: string;
  fileUrl?: string;
}

export interface FeeType {
  id: string;
  name: string;
  description: string;
}

export interface FeeMaster {
  id: string;
  class: string;
  feeType: string;
  amount: number;
  frequency: 'Monthly' | 'Quarterly' | 'Half-Yearly' | 'Yearly';
  studentType?: 'New' | 'Old' | 'Both';
  session: string;
}

export interface FeeTransaction {
  id: string;
  studentId: string;
  studentName: string;
  class: string;
  section: string;
  feeType: string;
  amount: number;
  discount: number;
  discountReason: string;
  scholarship: number;
  fine: number;
  totalPaid: number;
  paymentMode: 'Cash' | 'UPI' | 'Bank Transfer';
  paymentMethod?: string;
  transactionId?: string;
  invoiceNumber?: string;
  collectedBy?: string;
  period?: string;
  remarks?: string;
  date: string;
  dueDate: string;
  status: 'Paid' | 'Partial' | 'Due';
  breakdown?: Record<string, number>;
  session: string;
}

export interface Staff {
  id: string;
  staffId: string;
  name: string;
  surname: string;
  fatherName?: string;
  motherName?: string;
  dob?: string;
  gender?: string;
  email: string;
  mobile: string;
  emergencyContact?: string;
  role: string;
  department: string;
  designation: string;
  qualification?: string;
  experience?: string;
  address?: string;
  bloodGroup?: string;
  photo?: string;
  joiningDate: string;
  status: 'Active' | 'Inactive';
  username?: string;
  password?: string;
  loginId?: string;
  loginPassword?: string;
  documents?: {
    name: string;
    file: string;
  }[];
}

export interface Department {
  id: string;
  name: string;
}

export interface Designation {
  id: string;
  name: string;
}

export interface AdmissionEnquiry {
  id: string;
  name: string;
  surname: string;
  mobile: string;
  email: string;
  class: string;
  date: string;
  source: string;
  status: 'Pending' | 'Follow-up' | 'Closed' | 'Approved';
  fatherName?: string;
  motherName?: string;
  address?: string;
  gender?: string;
}

export interface Visitor {
  id: string;
  name: string;
  mobile: string;
  role: string;
  purpose: string;
  qualification: string;
  note: string;
  date: string;
  inTime: string;
  outTime?: string;
  idCard?: string;
}

export interface Complaint {
  id: string;
  complainantName: string;
  type: string;
  source: string;
  date: string;
  description: string;
  actionTaken?: string;
  status: 'Pending' | 'Resolved';
}

export interface CommunicationTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  type: 'Email' | 'WhatsApp';
}

export interface Income {
  id: string;
  name: string;
  incomeHead: string;
  invoiceNumber: string;
  date: string;
  amount: number;
  description: string;
  file?: string;
}

export interface Expense {
  id: string;
  name: string;
  expenseHead: string;
  invoiceNumber: string;
  date: string;
  amount: number;
  description: string;
  file?: string;
}

export interface IncomeHead {
  id: string;
  name: string;
  description: string;
}

export interface ExpenseHead {
  id: string;
  name: string;
  description: string;
}

export interface Student {
  id: string;
  title?: string;
  name: string;
  surname: string;
  class: string;
  section: string;
  studentId: string;
  mobile?: string;
  dob?: string;
  caste: string;
  category: string;
  fatherName: string;
  motherName: string;
  fatherMobile: string;
  motherMobile: string;
  bloodGroup: string;
  emergencyContact: string;
  localGuardianContact: string;
  email: string;
  address: string;
  allergy: string;
  religion: string;
  gender: string;
  hasDisability: boolean;
  disabilityDetails: string;
  photo?: string;
  rollNumber?: string;
  studentType: 'New' | 'Old';
  session: string;
  admissionDate?: string;
  fatherIncome?: string;
  fatherSourceOfIncome?: string;
  motherIncome?: string;
  motherSourceOfIncome?: string;
  residentialAddress?: string;
  aadhaarNumber?: string;
  panNumber?: string;
  passportNumber?: string;
  relationsInSchool: {
    relationName: string;
    name: string;
    classSection: string;
  }[];
  documents?: {
    name: string;
    file: string;
  }[];
  roomNumber?: string;
  isHostel?: boolean;
  hostelName?: string;
  bedNumber?: string;
}
