import { createRouter, createWebHistory } from "vue-router";
import LoginPage from "../pages/LoginPage.vue";
import ClientDashboardPage from "../pages/ClientDashboardPage.vue";
import CreateTicketPage from "../pages/CreateTicketPage.vue";
import TicketDetailsPage from "../pages/TicketDetailsPage.vue";
import SupportDashboardPage from "../pages/SupportDashboardPage.vue";
import SupportTicketDetailsPage from "../pages/SupportTicketDetailsPage.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      redirect: "/login",
    },
    {
      path: "/login",
      name: "login",
      component: LoginPage,
    },
    {
      path: "/client-dashboard",
      name: "client-dashboard",
      component: ClientDashboardPage,
    },
    {
      path: "/tickets/create",
      name: "create-ticket",
      component: CreateTicketPage,
    },
    {
      path: "/tickets/:id",
      name: "ticket-details",
      component: TicketDetailsPage,
    },
    {
      path: "/support-dashboard",
      name: "support-dashboard",
      component: SupportDashboardPage,
    },
    {
      path: "/support/tickets/:id",
      name: "support-ticket-details",
      component: SupportTicketDetailsPage,
    },
  ],
});

export default router;
