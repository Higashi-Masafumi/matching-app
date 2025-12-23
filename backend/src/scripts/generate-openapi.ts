import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { stringify } from 'yaml';
import { createApp, openApiConfig } from '../app';

const app = createApp();
const document = app.getOpenAPIDocument(openApiConfig);

const outputDir = join(process.cwd(), 'openapi');
mkdirSync(outputDir, { recursive: true });

const jsonPath = join(outputDir, 'openapi.json');
writeFileSync(jsonPath, JSON.stringify(document, null, 2), 'utf-8');

const yamlPath = join(outputDir, 'openapi.yaml');
writeFileSync(yamlPath, stringify(document), 'utf-8');

console.log(`OpenAPI files generated:\n- ${jsonPath}\n- ${yamlPath}`);
