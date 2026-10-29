import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class GithubSyncDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  projectId?: string;
}
