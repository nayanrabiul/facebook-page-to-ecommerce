import fs from 'fs';
import path from 'path';

const dbPath = path.resolve(__dirname, '../db.json');

export function readDb(): any {
  const db = fs.readFileSync(dbPath, 'utf-8');
  return JSON.parse(db);
}

export function writeDb(data: any): void {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
}

export const db = readDb();