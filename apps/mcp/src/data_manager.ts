import { writeDb } from 'db';
import { Product } from './product_generator';

export interface PageMetadata {
  name: string;
  description: string;
}

export function saveData(productsData: Product[], pageMetadata: PageMetadata): void {
  console.log('Saving data to the database...');

  const data = {
    store_info: pageMetadata,
    products: productsData,
  };

  writeDb(data);

  console.log('Data saved successfully.');
}