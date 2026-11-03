import dotenvx from '@dotenvx/dotenvx';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
export const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
export function loadEnvironment() {
  dotenvx.config({
    path: [path.join(root, 'config/.env.mongo'), path.join(root, 'backend/.env')],
    quiet: true
  });
  // Keep the shared sign-in database separate from this application's data.
  process.env.ECOSPHERE_MONGO_URI ||= process.env.MONGO_URI;
  dotenvx.config({path:path.join(root,'barrow-herbs-and-spices/backend/.env'),quiet:true});
  const appUri=new URL(process.env.MONGO_URI);
  appUri.pathname=`/${process.env.MONGO_DB_NAME||'herbs_spices'}`;
  process.env.MONGO_URI=appUri.toString();
}
