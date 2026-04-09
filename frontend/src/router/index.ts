import { createRouter, createWebHistory } from "vue-router";
import type { RouteRecordRaw } from "vue-router";
import { useAuthStore } from "@/stores/auth.store";

// ─── Layout ──────────────────────────────────────────────────
const AppLayout = () => import("@/components/layout/AppLayout.vue");

// ─── Auth pages ───────────────────────────────────────────────
const LoginPage = () => import("@/pages/auth/LoginPage.vue");

// ─── App pages ────────────────────────────────────────────────
const DashboardPage      = () => import("@/pages/dashboard/DashboardPage.vue");
const EquipmentPage      = () => import("@/pages/equipment/EquipmentPage.vue");
const EquipmentListPage  = () => import("@/pages/equipment/EquipmentListPage.vue");
const EquipmentDetailPage= () => import("@/pages/equipment/EquipmentDetailPage.vue");
const ActivitiesPage     = () => import("@/pages/activities/ActivitiesPage.vue");
const SchedulePage       = () => import("@/pages/schedule/SchedulePage.vue");
const WorkOrdersPage     = () => import("@/pages/workorders/WorkOrdersPage.vue");
const WorkOrderDetail    = () => import("@/pages/workorders/WorkOrderDetailPage.vue");
const TroublePage        = () => import("@/pages/trouble/TroublePage.vue");
const ReportsPage        = () => import("@/pages/reports/ReportsPage.vue");
const UsersPage          = () => import("@/pages/users/UsersPage.vue");
const CompaniesPage      = () => import("@/pages/companies/CompaniesPage.vue");
const ProfilePage        = () => import("@/pages/profile/ProfilePage.vue");
const ErrorPage          = () => import("@/pages/error/ErrorPage.vue");

const routes: RouteRecordRaw[] = [
  // Public routes
  { path: "/login", name: "Login", component: LoginPage, meta: { public: true } },

  // App routes (require auth)
  {
    path: "/",
    component: AppLayout,
    meta: { requiresAuth: true },
    children: [
      { path: "",       redirect: "/dashboard" },
      { path: "dashboard",    name: "Dashboard",    component: DashboardPage },
      { path: "equipment",                    name: "Equipment",       component: EquipmentPage },
      { path: "equipment/type/:typeId",       name: "EquipmentList",   component: EquipmentListPage },
      { path: "equipment/detail/:eqId",       name: "EquipmentDetail", component: EquipmentDetailPage },
      { path: "activities",   name: "Activities",   component: ActivitiesPage },
      { path: "schedule",     name: "Schedule",     component: SchedulePage },
      { path: "work-orders",  name: "WorkOrders",   component: WorkOrdersPage },
      { path: "work-orders/:id", name: "WorkOrderDetail", component: WorkOrderDetail },
      { path: "trouble",      name: "Trouble",      component: TroublePage },
      { path: "companies",    name: "Companies",    component: CompaniesPage },
      { path: "reports",      name: "Reports",      component: ReportsPage },
      {
        path: "users",
        name: "Users",
        component: UsersPage,
        meta: { requiresRole: ["ADMIN", "SUPER_ADMIN"] },
      },
      { path: "profile", name: "Profile", component: ProfilePage },
    ],
  },

  // Error page
  { path: "/error", name: "Error", component: ErrorPage, meta: { public: true } },
  // Catch-all
  { path: "/unauthorized", name: "Unauthorized", component: () => import("@/pages/error/UnauthorizedPage.vue"), meta: { public: true },
  },
  {
    path: "/:pathMatch(.*)*", name: "NotFound", component: ErrorPage, meta: { public: true } },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior: () => ({ top: 0 }),
});

// ─── Navigation Guard ─────────────────────────────────────────
router.beforeEach(async (to, _from, next) => {
  const auth = useAuthStore();

  // Always allow public routes
  if (to.meta.public) return next();

  // Check session expiry client-side (6h)
  if (auth.isSessionExpired()) {
    auth.logout();
    return;
  }

  // Not authenticated → unauthorized page
  if (!auth.isAuthenticated) {
    return next({ name: "Unauthorized" });
  }

  // Lazy-fetch user if we have token but no user object yet
  if (!auth.user) {
    await auth.fetchMe().catch(() => {});
  }

  // Role guard
  if (to.meta.requiresRole && auth.user) {
    const allowed = (to.meta.requiresRole as string[]).includes(auth.userRole ?? "");
    if (!allowed) return next({ name: "Unauthorized" });
  }

  return next();
});

export default router;
