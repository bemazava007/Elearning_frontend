// // E:\Teach-platform\frontend\services\module.service.ts
// import { apiService } from "./api.service";

// export interface ModuleData {
//   formationId: string;
//   titre: string;
//   description?: string | null;
//   ordre: number;
//   duree: number;
//   image: string;
//   estGratuit?: boolean;
//   prerequisIds?: string[];
//   createurId: string;
//   publicId?: string;
// }

// class ModuleService {
//   private readonly BASE_ENDPOINT = "/modules";

//   async create(data: ModuleData) {
//     return apiService.post(this.BASE_ENDPOINT, data);
//   }

//   async update(id: string, data: Partial<ModuleData>) {
//     return apiService.patch(`${this.BASE_ENDPOINT}/${id}`, data);
//   }

//   async getById(id: string) {
//     return apiService.get(`${this.BASE_ENDPOINT}/${id}`);
//   }

//   async list(formationId?: string) {
//     const params = formationId ? `?formationId=${formationId}` : "";
//     return apiService.get(`${this.BASE_ENDPOINT}${params}`);
//   }
// }

// export const moduleService = new ModuleService();

// E:\Teach-platform\frontend\services\module.service.ts
import { apiService } from "./api.service";

export interface ModuleData {
  formationId: string;
  titre: string;
  description?: string | null;
  ordre: number;
  duree: number;
  image: string;
  estGratuit?: boolean;
  prerequisIds?: string[];
  createurId: string;
  publicId?: string;
}

class ModuleService {
  private readonly BASE_ENDPOINT = "/modules";
  private readonly SINGLE_ENDPOINT = "/module"; // ✅ /module/:id (sans s)

  async create(data: ModuleData) {
    return apiService.post(this.BASE_ENDPOINT, data);
  }

  // ✅ PATCH /module/:id
  async update(id: string, data: Partial<ModuleData>) {
    return apiService.patch(`${this.SINGLE_ENDPOINT}/${id}`, data);
  }

  // ✅ GET /module/:id
  async getById(id: string) {
    return apiService.get(`${this.SINGLE_ENDPOINT}/${id}`);
  }

  // ✅ DELETE /module/:id
  async delete(id: string) {
    return apiService.delete(`${this.SINGLE_ENDPOINT}/${id}`);
  }

  async list(formationId?: string) {
    const params = formationId ? `?formationId=${formationId}` : "";
    return apiService.get(`${this.BASE_ENDPOINT}${params}`);
  }
}

export const moduleService = new ModuleService();
