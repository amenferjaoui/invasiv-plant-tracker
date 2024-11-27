import { Client } from 'pg';

class Database {
  private static instance: Database;
  private client: Client;

  private constructor() {
    this.client = new Client({
      user: 'postgres',        
      host: 'db',           
      database: 'postgres',   
      password: 'invasiv',
      port: 5432,                  
    });
  }

  
  public static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  public async connect(): Promise<void> {
    try {
      await this.client.connect();
      console.log('Connected to the database');
    } catch (error) {
      console.error('Error connecting to the database:', error);
    }
  }

  public async query(queryText: string, params?: any[]): Promise<any> {
    try {
      const res = await this.client.query(queryText, params);
      return res.rows;
    } catch (error) {
      console.error('Error executing query:', error);
      throw error;
    }
  }


  public async disconnect(): Promise<void> {
    try {
      await this.client.end();
      console.log('Disconnected from the database');
    } catch (error) {
      console.error('Error disconnecting from the database:', error);
    }
  }
}

export default Database;
