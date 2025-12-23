import type { University } from '../domain/entities/university';
import type { ListUniversitiesParams, UniversityRepository } from '../domain/repositories/university-repository';

export class ListUniversitiesUseCase {
  constructor(private readonly universityRepository: UniversityRepository) {}

  execute(params: ListUniversitiesParams): Promise<University[]> {
    return this.universityRepository.list(params);
  }
}
