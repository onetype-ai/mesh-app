import { resolve } from 'path';

process.loadEnvFile(resolve(import.meta.dirname, '..', '.env'));
