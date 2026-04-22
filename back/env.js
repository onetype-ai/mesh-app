import { existsSync } from 'fs';
import { resolve } from 'path';

const path = resolve(import.meta.dirname, '..', '.env');

if(!existsSync(path))
{
	console.error('');
	console.error('  Missing .env file at ' + path);
	console.error('  Copy .env.example to .env and fill in the required values:');
	console.error('');
	console.error('    cp .env.example .env');
	console.error('');
	process.exit(1);
}

process.loadEnvFile(path);
