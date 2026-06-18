// //E:\Teach-platform\frontend\services\api.service.ts
// class ApiService {
//   private readonly BASE_URL =
//     process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

//   private async request<T>(
//     endpoint: string,
//     options: RequestInit = {},
//   ): Promise<T> {
//     const response = await fetch(`${this.BASE_URL}${endpoint}`, {
//       ...options,
//       headers: {
//         "Content-Type": "application/json",
//         ...options.headers,
//       },
//       credentials: "include", // Important pour les cookies
//     });

//     if (!response.ok) {
//       const error = await response.json();
//       throw new Error(error.error || error.message || "Erreur API");
//     }

//     return response.json();
//   }

//   async post<T>(endpoint: string, data: any): Promise<T> {
//     return this.request<T>(endpoint, {
//       method: "POST",
//       body: JSON.stringify(data),
//     });
//   }

//   async get<T>(endpoint: string): Promise<T> {
//     return this.request<T>(endpoint, { method: "GET" });
//   }

//   async patch<T>(endpoint: string, data: any): Promise<T> {
//     return this.request<T>(endpoint, {
//       method: "PATCH",
//       body: JSON.stringify(data),
//     });
//   }

//   async delete<T>(endpoint: string): Promise<T> {
//     return this.request<T>(endpoint, { method: "DELETE" });
//   }
// }

// export const apiService = new ApiService();

// // Services spécifiques
// export const formationService = {
//   create: (data: any) => apiService.post("/formations", data),
//   update: (id: string, data: any) =>
//     apiService.patch(`/formations/${id}`, data),
//   getById: (id: string) => apiService.get(`/formations/${id}`),
//   list: (params?: any) =>
//     apiService.get(`/formations?${new URLSearchParams(params)}`),
// };
// E:\Teach-platform\frontend\services\api.service.ts
class ApiService {
  private readonly BASE_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  private isRefreshing = false;
  private refreshSubscribers: ((token: string) => void)[] = [];

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    retry = true,
  ): Promise<T> {
    const response = await fetch(`${this.BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      credentials: "include", // important pour les cookies HTTP‑only
    });

    // Gestion des erreurs 401 : tentative de refresh si possible
    if (response.status === 401 && retry) {
      const refreshed = await this.refreshToken();
      if (refreshed) {
        // Rejouer la requête originale avec le nouveau token (le cookie sera automatiquement renvoyé)
        return this.request<T>(endpoint, options, false);
      } else {
        // Refresh impossible → redirection vers login
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
        throw new Error("Session expirée, veuillez vous reconnecter.");
      }
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || error.message || "Erreur API");
    }

    return response.json();
  }

  private async refreshToken(): Promise<boolean> {
    if (this.isRefreshing) {
      // Si un refresh est déjà en cours, attendre sa résolution
      return new Promise((resolve) => {
        this.refreshSubscribers.push(() => resolve(true));
      });
    }

    this.isRefreshing = true;
    try {
      const res = await fetch(`${this.BASE_URL}/auth/refresh`, {
        method: "POST",
        credentials: "include",
      });
      if (res.ok) {
        // Notifier tous les abonnés
        this.refreshSubscribers.forEach((cb) => cb(""));
        this.refreshSubscribers = [];
        return true;
      }
      return false;
    } catch (error) {
      console.error("Refresh token failed", error);
      return false;
    } finally {
      this.isRefreshing = false;
    }
  }

  // Méthodes publiques
  async post<T>(endpoint: string, data: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: "GET" });
  }

  async patch<T>(endpoint: string, data: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: "DELETE" });
  }
}

export const apiService = new ApiService();

// Services spécifiques (optionnel)
export const formationService = {
  create: (data: any) => apiService.post("/formations", data),
  update: (id: string, data: any) =>
    apiService.patch(`/formations/${id}`, data),
  getById: (id: string) => apiService.get(`/formations/${id}`),
  list: (params?: any) =>
    apiService.get(`/formations?${new URLSearchParams(params)}`),
};
