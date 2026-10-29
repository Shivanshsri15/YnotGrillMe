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
  ResumeVariant,
  VisitorRole,
} from '../../shared/enums.ts';
import { AGENT_MAX_MESSAGE_LENGTH } from '../constants/agent.constants.ts';

export class ChatRequestDto {
  @IsString()
  @MinLength(1)
  @MaxLength(AGENT_MAX_MESSAGE_LENGTH)
  message!: string;

  @IsOptional()
  @IsUUID()
  conversationId?: string;

  @IsOptional()
  @IsEnum(GrillMode)
  grillMode?: GrillMode;

  /**
   * Progressive chain depth. Defaults to hook for warm_up, deep otherwise,
   * unless explicitly set (e.g. suggestion click sends depth=deep).
   */
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
  @IsEnum(ResumeVariant)
  resumeVariant?: ResumeVariant;

  @IsOptional()
  @IsEnum(GrillAction)
  action?: GrillAction;
}
