import type { IconType } from "react-icons";
import { MdDashboard,  MdPayment,  MdPeople, MdPerson,   MdPersonAddAlt1,  MdCalendarMonth } from "react-icons/md";
import { GiWeightLiftingUp } from "react-icons/gi";
import { GiMeal } from "react-icons/gi";
import { HiMiniDocumentCurrencyDollar } from "react-icons/hi2";
import { GiProgression } from "react-icons/gi";
import { FaMoneyBillWave } from "react-icons/fa"

export interface NavItem {
    name : string;
    path: string;
    icon: IconType;
    roles: ('admin' | 'coach' | 'member')[];
}

export const SIDEBAR_LINKS: NavItem[] = [
    { name: 'Dashboard', path: '/dashboard', icon: MdDashboard, roles: ['admin', 'coach', 'member']},
    { name: 'Profile', path: '/profile', icon: MdPerson, roles: ['admin', 'coach', 'member']},
    { name: 'My Progress', path: '/my-progress', icon: GiProgression, roles: ['member']},

    { name: 'Workout Plan', path: '/member/workout-plan', icon: GiWeightLiftingUp, roles: ['member'] },
    { name: 'Nutrition Plan', path: '/member/nutrition-plan', icon: GiMeal, roles: ['member'] },
    { name: 'Membership', path: '/member/membership', icon: MdPayment, roles: ['member'] },
    { name: 'Attendance', path: '/member/attendance', icon: MdCalendarMonth, roles: ['member'] },

    { name: 'Workout Plans', path: '/coach/plans/workout', icon: GiWeightLiftingUp, roles: ['coach']},
    { name: 'Nutrition Plans', path: '/coach/plans/nutrition', icon: GiMeal, roles: ['coach']},
    { name: 'My Clients', path: '/coach/my-clients', icon: MdPeople, roles: ['coach']},


    { name: 'Manage Members', path: '/admin/members', icon: MdPeople, roles: ['admin']},
    { name: 'Manage Coaches', path: '/admin/coaches', icon: MdPeople, roles: ['admin']},
    { name: 'Membership Plans', path: '/admin/plans', icon:  HiMiniDocumentCurrencyDollar, roles: ['admin']},
    { name: 'Add Member', path: '/admin/add-member', icon:  MdPersonAddAlt1 , roles: ['admin']},
    { name: 'Payments History', path: '/admin/payments-history', icon: FaMoneyBillWave , roles: ['admin']},




]