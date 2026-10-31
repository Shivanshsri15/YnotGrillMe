import { IsEmail, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { CONTACT_MAX_MESSAGE_LENGTH } from '../constants/contact.constants.ts';

export class ContactMessageDto {
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  name!: string;

  @IsEmail()
  @MaxLength(200)
  email!: string;

  @IsString()
  @MinLength(10)
  @MaxLength(CONTACT_MAX_MESSAGE_LENGTH)
  message!: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  company?: string;
}
