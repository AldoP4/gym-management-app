
import { 
  User, Member, Membership, MembershipPlan, Payment, CheckIn, GymSettings, DashboardStats 
} from '../types';
import { addDays, isBefore, isAfter, parseISO, format, subDays, startOfMonth, endOfMonth } from 'date-fns';

// --- Constants ---
const STORAGE_KEY = 'gymos_db_v1';

interface Database {
  users: User[];
  members: Member[];
  plans: MembershipPlan[];
  memberships: Membership[];
  payments: Payment[];
  checkIns: CheckIn[];
  settings: GymSettings;
}

// --- Seed Data ---
const SEED_DB: Database = {
  settings: {
    name: 'Apex Fitness Club',
    currency: 'MXN',
    gracePeriodDays: 3,
  },
  users: [
    { id: 'u1', name: 'Carlos Dueño', email: 'admin@gym.com', role: 'admin' },
    { id: 'u2', name: 'Ana Recepción', email: 'staff@gym.com', role: 'staff' },
  ],
  plans: [
    { id: 'p1', name: 'Mensual', durationDays: 30, price: 800, active: true },
    { id: 'p2', name: 'Trimestral', durationDays: 90, price: 2200, active: true },
    { id: 'p3', name: 'Anual', durationDays: 365, price: 8000, active: true },
  ],
  members: [
    { id: 'm1', firstName: 'Juan', lastName: 'Pérez', phone: '555-0101', active: true, createdAt: '2023-01-15', photoUrl: 'https://picsum.photos/200/200?random=1' },
    { id: 'm2', firstName: 'Maria', lastName: 'González', phone: '555-0102', active: true, createdAt: '2023-02-20', photoUrl: 'https://picsum.photos/200/200?random=2' },
    { id: 'm3', firstName: 'Luis', lastName: 'Ramírez', phone: '555-0103', active: true, createdAt: '2023-03-10', photoUrl: 'https://picsum.photos/200/200?random=3' },
    { id: 'm4', firstName: 'Sofia', lastName: 'López', phone: '555-0104', active: true, createdAt: '2023-05-05', photoUrl: 'https://picsum.photos/200/200?random=4' },
    { id: 'm5', firstName: 'Pedro', lastName: 'Martínez', phone: '555-0105', active: false, createdAt: '2022-11-01', photoUrl: 'https://picsum.photos/200/200?random=5' },
  ],
  memberships: [
    // Active
    { id: 'ms1', memberId: 'm1', planId: 'p1', planName: 'Mensual', startDate: format(subDays(new Date(), 10), 'yyyy-MM-dd'), endDate: format(addDays(new Date(), 20), 'yyyy-MM-dd'), status: 'active', pricePaid: 800, createdAt: '2023-10-01' },
    // Expiring Soon (in 2 days)
    { id: 'ms2', memberId: 'm2', planId: 'p1', planName: 'Mensual', startDate: format(subDays(new Date(), 28), 'yyyy-MM-dd'), endDate: format(addDays(new Date(), 2), 'yyyy-MM-dd'), status: 'active', pricePaid: 800, createdAt: '2023-09-15' },
    // Active
    { id: 'ms3', memberId: 'm3', planId: 'p2', planName: 'Trimestral', startDate: format(subDays(new Date(), 60), 'yyyy-MM-dd'), endDate: format(addDays(new Date(), 30), 'yyyy-MM-dd'), status: 'active', pricePaid: 2200, createdAt: '2023-08-10' },
    // Expired (Grace period) - expired yesterday
    { id: 'ms4', memberId: 'm4', planId: 'p1', planName: 'Mensual', startDate: format(subDays(new Date(), 31), 'yyyy-MM-dd'), endDate: format(subDays(new Date(), 1), 'yyyy-MM-dd'), status: 'expired', pricePaid: 800, createdAt: '2023-09-10' },
  ],
  payments: [
    { id: 'pay1', memberId: 'm1', membershipId: 'ms1', amount: 800, date: format(subDays(new Date(), 10), 'yyyy-MM-dd'), method: 'efectivo', recordedByUserId: 'u2' },
    { id: 'pay2', memberId: 'm2', membershipId: 'ms2', amount: 800, date: format(subDays(new Date(), 28), 'yyyy-MM-dd'), method: 'tarjeta', recordedByUserId: 'u2' },
    { id: 'pay3', memberId: 'm3', membershipId: 'ms3', amount: 2200, date: format(subDays(new Date(), 60), 'yyyy-MM-dd'), method: 'transferencia', recordedByUserId: 'u1' },
  ],
  checkIns: [
    { id: 'c1', memberId: 'm1', timestamp: new Date().toISOString(), statusAtCheckIn: 'valid', recordedByUserId: 'u2' },
    { id: 'c2', memberId: 'm2', timestamp: new Date().toISOString(), statusAtCheckIn: 'valid', recordedByUserId: 'u2' },
  ]
};

// --- Service Class ---

class GymService {
  private db: Database;

  constructor() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      this.db = JSON.parse(stored);
    } else {
      this.db = SEED_DB;
      this.save();
    }
  }

  private save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.db));
  }

  // --- Helpers ---
  private generateId(prefix: string): string {
    return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  }

  // --- Auth ---
  login(email: string): User | null {
    return this.db.users.find(u => u.email === email) || null;
  }

  // --- Dashboard ---
  getStats(): DashboardStats {
    const today = new Date();
    const activeMembers = new Set(
      this.db.memberships
        .filter(m => m.status === 'active' && isAfter(parseISO(m.endDate), subDays(today, 1))) // Simplified active check
        .map(m => m.memberId)
    ).size;

    const expiringSoon = this.db.memberships.filter(m => {
      if (m.status !== 'active') return false;
      const end = parseISO(m.endDate);
      
      // Check validity range (next 7 days)
      if (!(isAfter(end, today) && isBefore(end, addDays(today, 7)))) {
          return false;
      }

      // Check if superseded by a later active membership
      const hasLaterMembership = this.db.memberships.some(other => 
        other.memberId === m.memberId && 
        other.status === 'active' && 
        other.id !== m.id && 
        isAfter(parseISO(other.endDate), end)
      );

      return !hasLaterMembership;
    }).length;

    const startOfMonthDate = startOfMonth(today);
    const endOfMonthDate = endOfMonth(today);
    
    const expiredThisMonth = this.db.memberships.filter(m => {
        const end = parseISO(m.endDate);
        return isAfter(end, startOfMonthDate) && isBefore(end, endOfMonthDate) && isBefore(end, today);
    }).length;

    const monthlyIncome = this.db.payments
      .filter(p => {
        const date = parseISO(p.date);
        return isAfter(date, startOfMonthDate) && isBefore(date, endOfMonthDate);
      })
      .reduce((sum, p) => sum + p.amount, 0);

    return { activeMembers, expiringSoon, expiredThisMonth, monthlyIncome };
  }

  getRecentPayments(limit: number = 30) {
    return this.db.payments
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, limit)
        .map(p => {
            const member = this.getMember(p.memberId);
            return { ...p, memberName: member ? `${member.firstName} ${member.lastName}` : 'Desconocido' };
        });
  }

  getExpiringMemberships() {
    const today = new Date();
    return this.db.memberships
      .filter(m => {
        if (m.status !== 'active') return false;
        const end = parseISO(m.endDate);
        
        // Check validity range
        if (!(isAfter(end, today) && isBefore(end, addDays(today, 7)))) {
            return false;
        }

        // Check if superseded by a later active membership
        const hasLaterMembership = this.db.memberships.some(other => 
          other.memberId === m.memberId && 
          other.status === 'active' && 
          other.id !== m.id && 
          isAfter(parseISO(other.endDate), end)
        );

        return !hasLaterMembership;
      })
      .map(m => ({
        ...m,
        member: this.getMember(m.memberId)
      }));
  }

  // --- Members ---
  getMembers(search?: string) {
    let members = this.db.members;
    if (search) {
      const s = search.toLowerCase();
      members = members.filter(m => 
        m.firstName.toLowerCase().includes(s) || 
        m.lastName.toLowerCase().includes(s) ||
        m.phone.includes(s)
      );
    }
    return members.map(m => this.enrichMember(m));
  }

  getMember(id: string) {
    const member = this.db.members.find(m => m.id === id);
    return member ? this.enrichMember(member) : null;
  }

  createMember(data: Omit<Member, 'id' | 'createdAt' | 'active'>) {
    const newMember: Member = {
      id: this.generateId('m'),
      createdAt: format(new Date(), 'yyyy-MM-dd'),
      active: true,
      ...data
    };
    this.db.members.unshift(newMember);
    this.save();
    return newMember;
  }

  // Internal helper to attach latest membership status
  private enrichMember(member: Member) {
    const memberships = this.db.memberships
      .filter(ms => ms.memberId === member.id)
      .sort((a, b) => new Date(b.endDate).getTime() - new Date(a.endDate).getTime());

    const latest = memberships[0];
    let computedStatus: 'active' | 'expiring' | 'expired' | 'none' = 'none';
    let expiryDate = null;

    if (latest) {
        expiryDate = latest.endDate;
        const today = new Date();
        const end = parseISO(latest.endDate);

        if (isAfter(end, today)) {
            if (isBefore(end, addDays(today, 7))) {
                computedStatus = 'expiring';
            } else {
                computedStatus = 'active';
            }
        } else {
            computedStatus = 'expired';
        }
    }

    return { ...member, computedStatus, expiryDate, lastMembership: latest };
  }

  // --- Memberships ---
  getPlans() {
    return this.db.plans.filter(p => p.active);
  }

  createMembership(memberId: string, planId: string, userId: string, paymentMethod: 'efectivo' | 'tarjeta' | 'transferencia') {
    const plan = this.db.plans.find(p => p.id === planId);
    if (!plan) throw new Error("Plan not found");

    const startDate = new Date();
    const endDate = addDays(startDate, plan.durationDays);

    const newMembership: Membership = {
      id: this.generateId('ms'),
      memberId,
      planId,
      planName: plan.name,
      startDate: format(startDate, 'yyyy-MM-dd'),
      endDate: format(endDate, 'yyyy-MM-dd'),
      status: 'active',
      pricePaid: plan.price,
      createdAt: format(startDate, 'yyyy-MM-dd'),
    };

    const newPayment: Payment = {
      id: this.generateId('pay'),
      memberId,
      membershipId: newMembership.id,
      amount: plan.price,
      date: format(startDate, 'yyyy-MM-dd'),
      method: paymentMethod,
      recordedByUserId: userId
    };

    this.db.memberships.push(newMembership);
    this.db.payments.push(newPayment);
    this.save();
    return newMembership;
  }

  getMemberHistory(memberId: string) {
    return {
      memberships: this.db.memberships.filter(m => m.memberId === memberId).sort((a,b) => new Date(b.endDate).getTime() - new Date(a.endDate).getTime()),
      payments: this.db.payments.filter(p => p.memberId === memberId).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
      checkIns: this.db.checkIns.filter(c => c.memberId === memberId).sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()),
    };
  }

  // --- Attendance ---
  checkIn(memberId: string, userId: string): { success: boolean; message: string; status: 'valid' | 'grace' | 'expired' } {
    const member = this.getMember(memberId);
    if (!member) return { success: false, message: 'Socio no encontrado', status: 'expired' };

    const today = new Date();
    
    // Find active or grace period membership
    const relevantMembership = this.db.memberships
        .filter(m => m.memberId === memberId)
        .sort((a,b) => new Date(b.endDate).getTime() - new Date(a.endDate).getTime())[0];

    if (!relevantMembership) {
        return { success: false, message: 'Sin membresía activa. Renueve en recepción.', status: 'expired' };
    }

    const endDate = parseISO(relevantMembership.endDate);
    const gracePeriodEnd = addDays(endDate, this.db.settings.gracePeriodDays);

    let status: 'valid' | 'grace' | 'expired' = 'expired';

    // Logic: Check strict validity first, then grace
    if (isAfter(endDate, subDays(today, 1))) {
         status = 'valid';
    } else if (isAfter(gracePeriodEnd, subDays(today, 1))) {
         status = 'grace';
    } else {
        return { success: false, message: 'Membresía vencida. Renueve en recepción.', status: 'expired' };
    }

    const newCheckIn: CheckIn = {
        id: this.generateId('c'),
        memberId,
        timestamp: new Date().toISOString(),
        statusAtCheckIn: status === 'valid' ? 'valid' : 'grace_period',
        recordedByUserId: userId
    };

    this.db.checkIns.unshift(newCheckIn);
    this.save();

    const msg = status === 'valid' 
        ? 'Entrada registrada exitosamente' 
        : `Entrada registrada (Período de gracia: vence el ${format(gracePeriodEnd, 'dd/MM')})`;
    
    return { success: true, message: msg, status };
  }

  getTodayCheckIns() {
      const todayStr = format(new Date(), 'yyyy-MM-dd');
      return this.db.checkIns
        .filter(c => c.timestamp.startsWith(todayStr))
        .map(c => {
            const m = this.getMember(c.memberId);
            return { ...c, memberName: m ? `${m.firstName} ${m.lastName}` : 'Desconocido' };
        })
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }
}

export const gymService = new GymService();
