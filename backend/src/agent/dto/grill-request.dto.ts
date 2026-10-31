import {
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';
import {
  AnswerDepth,
  Audience,
  GrillAction,
  GrillMode,
  VisitorRole,
} from '../../shared/enums.ts';
import { AGENT_MAX_MESSAGE_LENGTH } from '../constants/agent.constants.ts';

export class GrillRequestDto {
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  projectId!: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(AGENT_MAX_MESSAGE_LENGTH)
  message?: string;

  @IsOptional()
  @IsUUID()
  conversationId?: string;

  @IsOptional()
  @IsEnum(GrillMode)
  grillMode?: GrillMode;

  @IsOptional()
  @IsEnum(AnswerDepth)
  depth?: AnswerDepth;

  @IsOptional()
  @IsEnum(Audience)
  audience?: Audience;

  @IsOptional()
  @IsEnum(VisitorRole)
  visitorRole?: VisitorRole;

  @IsOptional()
  @IsEnum(GrillAction)
  action?: GrillAction;
}
