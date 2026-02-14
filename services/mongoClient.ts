/**
 * MongoDB Client Simulation
 * Mimics the MongoDB Node.js Driver API (find, insertOne, updateOne, etc.)
 * This provides the exact structure needed to move to a real MongoDB Atlas backend.
 */

class MongoCollection<T extends { _id: string }> {
  private collectionName: string;

  constructor(name: string) {
    this.collectionName = `mongodb_collection_${name}`;
  }

  private getData(): T[] {
    const data = localStorage.getItem(this.collectionName);
    return data ? JSON.parse(data) : [];
  }

  private saveData(data: T[]): void {
    localStorage.setItem(this.collectionName, JSON.stringify(data));
  }

  async find(query: Partial<T> = {}): Promise<T[]> {
    // Simulate network latency
    await new Promise(r => setTimeout(r, 150));
    const data = this.getData();
    return data.filter(item => {
      for (const key in query) {
        if (item[key] !== query[key]) return false;
      }
      return true;
    });
  }

  async findOne(query: Partial<T>): Promise<T | null> {
    const results = await this.find(query);
    return results[0] || null;
  }

  async insertOne(doc: Omit<T, '_id'>): Promise<T> {
    const data = this.getData();
    // Use unknown cast to fix overlapping type error
    const newDoc = {
      ...doc,
      _id: `657f${Math.random().toString(16).slice(2, 10)}${Date.now().toString(16)}`, // Simulated ObjectId
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    } as unknown as T;
    data.push(newDoc);
    this.saveData(data);
    return newDoc;
  }

  async updateOne(query: Partial<T>, updates: Partial<T>): Promise<boolean> {
    const data = this.getData();
    const index = data.findIndex(item => {
      for (const key in query) {
        if (item[key] !== query[key]) return false;
      }
      return true;
    });

    if (index !== -1) {
      data[index] = { ...data[index], ...updates, updatedAt: new Date().toISOString() };
      this.saveData(data);
      return true;
    }
    return false;
  }

  async deleteOne(query: Partial<T>): Promise<boolean> {
    const data = this.getData();
    const index = data.findIndex(item => {
      for (const key in query) {
        if (item[key] !== query[key]) return false;
      }
      return true;
    });

    if (index !== -1) {
      data.splice(index, 1);
      this.saveData(data);
      return true;
    }
    return false;
  }
}

export const db = {
  users: new MongoCollection<any>('users'),
  requests: new MongoCollection<any>('requests'),
  hospitals: new MongoCollection<any>('hospitals'),
  stocks: new MongoCollection<any>('stocks'),
  feedback: new MongoCollection<any>('feedback'),
  messages: new MongoCollection<any>('messages'),
  logs: new MongoCollection<any>('security_logs'),
  keys: new MongoCollection<any>('emergency_keys'),
  appointments: new MongoCollection<any>('appointments'),
  certificates: new MongoCollection<any>('certificates'),
  campaigns: new MongoCollection<any>('campaigns')
};