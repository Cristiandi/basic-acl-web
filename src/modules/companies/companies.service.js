class CompanyService {
  constructor() {
    this.companies = [
      {
        id: 1,
        name: 'Pepito perez LTDA',
        uuid: '01C'
      },
      {
        id: 2,
        name: 'Si señor S.A.S',
        uuid: '02C'
      },
      {
        id: 3,
        name: 'Hola soy yo S.A.S',
        uuid: '03C'
      }
    ];
  }

  async getCompanies() {
    return Promise.resolve(this.companies);
  }

  async createCompany(company) {
    this.companies = [
      ...this.companies,
      {
        ...company,
        id: this.companies[this.companies.length - 1].id + 1
      }
    ];

    return Promise.resolve(this.companies[this.companies.length - 1]);
  }

  async updateCompany(id, company) {
    const existing = this.companies.find(item => item.id === id);

    if (!existing) {
      throw new Error(`can not get the company ${id}`);
    }

    let updated = {};

    this.companies = this.companies.map(item => {
      if (item.id === id) {
        updated = {
          ...item,
          ...company,
          id: item.id
        };

        return updated;
      }

      return item;
    });

    return Promise.resolve(updated);
  }

  async removeCompany(id) {
    const existing = this.companies.find(item => item.id === id);

    if (!existing) {
      throw new Error(`can not get the company ${id}`);
    }

    this.companies = this.companies.filter(item => item.id !== existing.id);

    return Promise.resolve(existing);
  }
}

export const companiesService = new CompanyService();