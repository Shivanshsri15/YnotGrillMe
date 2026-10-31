import { IsEnum, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { ResumeVariant } from '../../shared/enums.ts';

export class JdRequestDto {
  @IsString()
  @MinLength(40)
  @MaxLength(12_000)
  jdText!: string;

  @IsOptional()
  @IsEnum(ResumeVariant)
  resumeVariant?: ResumeVariant;
}
