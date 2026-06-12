import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataDir = path.join(__dirname, "data");
const outFile = path.join(__dirname, "mockRegistry.generated.js");

const files = fs.readdirSync(dataDir).filter((f) => f.endsWith(".json"));

let imports = `// ⚠️ AUTO-GENERATED FILE — DO NOT EDIT.\n`;
let registry = `export const mockRegistry = {\n`;

files.forEach((file) => {
  const entity = file.replace(".json", "");
  const varName = entity.replace(/[^a-zA-Z0-9_]/g, "_");
  imports += `import ${varName} from "./data/${file}" with { type: "json" };\n`;

  const singular = entity.endsWith("s") ? entity.slice(0, -1) : entity;

  registry += `  "/${entity}": ${varName}.default?.["${entity}"] || ${varName}["${entity}"],\n`;
  registry += `  "/${entity}/:id": ${varName}.default?.["${singular}"] || ${varName}["${singular}"],\n`;
});

registry += `};\n`;

fs.writeFileSync(outFile, imports + "\n" + registry);
console.log("✨ mockRegistry.generated.js successfully created");
