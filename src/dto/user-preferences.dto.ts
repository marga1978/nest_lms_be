import { IsString, IsBoolean, IsNumber, IsArray, IsOptional, ValidateNested, IsDateString, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

class UiSettingsDto {
  @IsOptional()
  @IsString()
  theme?: string;

  @IsOptional()
  @IsString()
  language?: string;

  @IsOptional()
  @IsBoolean()
  notifications_enabled?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(0.5)
  @Max(3.0)
  playback_speed?: number;
}

class BookmarkDto {
  @IsString()
  course_id: string;

  @IsString()
  lesson_id: string;

  @IsOptional()
  @IsDateString()
  timestamp?: Date;
}

class LearningPreferencesDto {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  favorite_topics?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  completed_courses?: string[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BookmarkDto)
  bookmarks?: BookmarkDto[];
}

class AccessibilityDto {
  @IsOptional()
  @IsBoolean()
  subtitles_default?: boolean;

  @IsOptional()
  @IsBoolean()
  high_contrast?: boolean;
}

export class CreateUserPreferencesDto {
  @IsString()
  user_id: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => UiSettingsDto)
  ui_settings?: UiSettingsDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => LearningPreferencesDto)
  learning_preferences?: LearningPreferencesDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => AccessibilityDto)
  accessibility?: AccessibilityDto;
}

export class UpdateUserPreferencesDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => UiSettingsDto)
  ui_settings?: UiSettingsDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => LearningPreferencesDto)
  learning_preferences?: LearningPreferencesDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => AccessibilityDto)
  accessibility?: AccessibilityDto;
}

export class AddBookmarkDto {
  @IsString()
  course_id: string;

  @IsString()
  lesson_id: string;
}

export class AddFavoriteTopicDto {
  @IsString()
  topic: string;
}

export class MarkCourseCompletedDto {
  @IsString()
  course_id: string;
}
