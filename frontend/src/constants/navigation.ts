import type { IconType } from "react-icons";
import { MdDashboard, MdFitnessCenter, MdPeople, MdPerson, MdRestaurantMenu } from "react-icons/md";

export interface NavItem {
    name : string;
    path: string;
    icon: IconType;
    roles: ('admin' | 'coach' | 'member')[];
}

export const SIDEBAR_LINKS: NavItem[] = [
    { name: 'Dashboard', path: '/dashboard', icon: MdDashboard, roles: ['admin', 'coach', 'member']},
    { name: 'Profile', path: '/profile', icon: MdPerson, roles: ['admin', 'coach', 'member']},
    { name: 'Workouts', path: '/workouts', icon: MdFitnessCenter, roles: ['member', 'coach']},
    { name: 'Nutrition', path: '/nutrition', icon: MdRestaurantMenu, roles: ['member']},

    { name: 'Manage Members', path: '/admin/members', icon: MdPeople, roles: ['admin']},
    { name: 'Manage Coaches', path: '/admin/coaches', icon: MdPeople, roles: ['admin']},

    { name: 'My Clients', path: '/coach/my-clients', icon: MdPeople, roles: ['coach']},


]