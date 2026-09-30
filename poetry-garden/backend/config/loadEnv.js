import dotenvx from "@dotenvx/dotenvx";
import path from "path";
import {fileURLToPath} from "url";

const __filename=fileURLToPath(import.meta.url);
const __dirname=path.dirname(__filename);

dotenvx.config({path:path.resolve(__dirname,"../.env"),quiet:true});
