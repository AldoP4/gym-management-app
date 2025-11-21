export type Role = 'admin' | 'staff';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface GymSettings {
  name: string;
  currency: string;
  gracePeriodDays: number;
}

export interface MembershipPlan {
  id: string;
  name: string;
  durationDays: number;
  price: number;
  active: boolean;
}

export type MembershipStatus = 'active' | 'expired' | 'cancelled' | 'future';

export interface Membership {
  id: string;
  memberId: string;
  planId: string;
  planName: string;
  startDate: string; // ISO Date
  endDate: string; // ISO Date
  status: MembershipStatus;
  pricePaid: number;
  createdAt: string;
}

export interface Member {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone: string;
  active: boolean;
  notes?: string;
  photoUrl?: string;
  createdAt: string;
}

export interface Payment {
  id: string;
  memberId: string;
  membershipId?: string; // Optional because could be a product purchase (future proofing)
  amount: number;
  date: string;
  method: 'efectivo' | 'tarjeta' | 'transferencia';
  recordedByUserId: string;
  notes?: string;
}

export interface CheckIn {
  id: string;
  memberId: string;
  timestamp: string;
  statusAtCheckIn: 'valid' | 'grace_period';
  recordedByUserId: string;
}

export interface DashboardStats {
  activeMembers: number;
  expiringSoon: number;
  expiredThisMonth: number;
  monthlyIncome: number;
}