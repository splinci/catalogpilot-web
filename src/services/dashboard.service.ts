import { DashboardRepository } from "@/repositories/dashboard.repository";

const repository = new DashboardRepository();

export class DashboardService {
  async getSummary() {
    return repository.getSummary();
  }
}

export const dashboardService = new DashboardService();