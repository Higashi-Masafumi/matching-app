import type { University } from '../entities/university';

export type ListUniversitiesParams = {
  search?: string;
  program?: string;
  country?: string;
  limit?: number;
};

export interface UniversityRepository {
  list(params: ListUniversitiesParams): Promise<University[]>;
}
