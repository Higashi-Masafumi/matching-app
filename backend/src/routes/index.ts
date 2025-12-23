import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import { registerCatalogRoutes } from './catalog';
import { registerMatchRoutes } from './matches';
import { registerProfileRoutes } from './profile';

export const registerAllRoutes = (registry: OpenAPIRegistry) => {
  registerCatalogRoutes(registry);
  registerMatchRoutes(registry);
  registerProfileRoutes(registry);
};
