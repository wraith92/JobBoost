import { IsDateString, IsOptional, IsString } from 'class-validator';

export class CreateEducationDto {
  @IsString()
  school: string;

  @IsString()
  degree: string;

  @IsOptional()
  @IsString()
  field?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsString()
  description?: string;
}