import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { OpenAPIRegistry, OpenApiGeneratorV3, extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';
import { stringify } from 'yaml';
import { registerAllRoutes } from '../routes';

extendZodWithOpenApi(z);

const registry = new OpenAPIRegistry();

registry.registerComponent('securitySchemes', 'UniversityEmailOtp', {
  type: 'apiKey',
  in: 'header',
  name: 'X-University-OTP',
  description:
    'One-time passcode delivered to a verified university email address. Required to fetch personalized matches.',
});

registry.registerComponent('securitySchemes', 'StudentIdUpload', {
  type: 'http',
  scheme: 'bearer',
  bearerFormat: 'JWT',
  description:
    'Issued after uploading and verifying a valid student ID card. Required for profile updates and sensitive actions.',
});

registerAllRoutes(registry);

const generator = new OpenApiGeneratorV3(registry.definitions);

const document = generator.generateDocument({
  openapi: '3.0.3',
  info: {
    title: 'Matching App API',
    version: '0.1.0',
    description: 'API specification for the university matching platform.',
  },
  servers: [{ url: 'https://api.example.com' }],
  security: [{ UniversityEmailOtp: [] }, { StudentIdUpload: [] }],
});

const outputDir = join(process.cwd(), 'openapi');
mkdirSync(outputDir, { recursive: true });

const jsonPath = join(outputDir, 'openapi.json');
writeFileSync(jsonPath, JSON.stringify(document, null, 2), 'utf-8');

const yamlPath = join(outputDir, 'openapi.yaml');
writeFileSync(yamlPath, stringify(document), 'utf-8');

console.log(`OpenAPI files generated:\n- ${jsonPath}\n- ${yamlPath}`);
