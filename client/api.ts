// Простая реализация клиентского API.
// Возвращает демонстрационные данные, чтобы страницы не были пустыми.
export const apiClient = {
  async getCurrentUser() {
    return { id: '1', name: 'Demo Admin', isAdmin: true };
  },
  async getUserSubscriptions() {
    return [
      {
        id: 'sub1',
        planName: 'Basic',
        status: 'active',
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        ipAddress: '192.168.1.1',
        bandwidth: 12.5,
      },
    ];
  },
  async getSubscriptionStats() {
    return {
      activeCount: 1,
      expiredCount: 0,
      totalBandwidth: 12.5,
      totalSubscriptions: 1,
    };
  },
  async getNews(_opts?: { onlyPublished?: boolean }) {
    return [
      {
        id: 'news1',
        title: 'Добро пожаловать',
        content: 'Веб-интерфейс XRAYGUI успешно запущен.',
        publishDate: new Date().toISOString(),
      },
    ];
  },
  async getUserDiscounts() {
    return [];
  },
  async applyDiscountCode(input: { code: string }) {
    if (input.code === 'PROMO10') {
      return { success: true, discount: { code: 'PROMO10', percentage: 10, isGift: false } };
    }
    return { success: false };
  },
  async getAllOffers() {
    return [
      { id: 'offer1', title: 'Premium', description: 'Полный доступ без ограничений', price: 9.99 },
    ];
  },
  async createOffer(data: any) {
    return { id: 'new', ...data };
  },
  async updateOffer(_data: any) {
    return { success: true };
  },
  async deleteOffer(_data: any) {
    return { success: true };
  },
  async getAllDiscounts() {
    return [];
  },
  async getDiscountStats() {
    return { totalCount: 0, activeCount: 0, expiredCount: 0 };
  },
  async getUsers() {
    return [
      { id: '1', name: 'Demo Admin', role: 'admin' },
      { id: '2', name: 'Demo User', role: 'user' },
    ];
  },
  async generatePromoCode() {
    return { code: 'PROMO' + Math.floor(Math.random() * 1000) };
  },
  async setDiscount(_data: any) {
    return { success: true };
  },
  async updateDiscount(_data: any) {
    return { success: true };
  },
  async deleteDiscount(_data: any) {
    return { success: true };
  },
  async sendAdminNewsletter(_data: any) {
    return { success: true };
  },
} as const;
