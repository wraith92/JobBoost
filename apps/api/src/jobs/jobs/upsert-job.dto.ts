import {
  IsBoolean,
  IsOptional,
  IsString,
} from 'class-validator';

export class UpsertJobDto {
  @IsString()
  externalId!: string;

  @IsString()
  source!: string;

  @IsString()
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  company?: string;

  @IsOptional()
  @IsString()
  contractType?: string;

  @IsOptional()
  @IsString()
  contractLabel?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  postalCode?: string;

  @IsOptional()
  @IsString()
  experience?: string;

  @IsOptional()
  @IsString()
  salary?: string;

  @IsOptional()
  @IsString()
  url?: string;

  @IsOptional()
  @IsString()
  dateCreated?: string;

  @IsOptional()
  @IsString()
  dateUpdated?: string;

  @IsOptional()
  @IsString()
  romeCode?: string;

  @IsOptional()
  @IsString()
  romeLabel?: string;

  @IsOptional()
  @IsBoolean()
  alternance?: boolean;
}