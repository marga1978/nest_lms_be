import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserPreferencesDocument = UserPreferences & Document;

@Schema({ collection: 'preferences_user', timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } })
export class UserPreferences {
  @Prop({ required: true, unique: true, index: true })
  user_id: string; // Reference to MySQL user ID

  @Prop({
    type: {
      theme: { type: String, default: 'light' },
      language: { type: String, default: 'it' },
      notifications_enabled: { type: Boolean, default: true },
      playback_speed: { type: Number, default: 1.0 },
    },
    default: {},
  })
  ui_settings: {
    theme: string;
    language: string;
    notifications_enabled: boolean;
    playback_speed: number;
  };

  @Prop({
    type: {
      favorite_topics: { type: [String], default: [] },
      completed_courses: { type: [String], default: [] },
      bookmarks: {
        type: [
          {
            course_id: String,
            lesson_id: String,
            timestamp: Date,
          },
        ],
        default: [],
      },
    },
    default: {},
  })
  learning_preferences: {
    favorite_topics: string[];
    completed_courses: string[];
    bookmarks: Array<{
      course_id: string;
      lesson_id: string;
      timestamp: Date;
    }>;
  };

  @Prop({
    type: {
      subtitles_default: { type: Boolean, default: false },
      high_contrast: { type: Boolean, default: false },
    },
    default: {},
  })
  accessibility: {
    subtitles_default: boolean;
    high_contrast: boolean;
  };
}

export const UserPreferencesSchema = SchemaFactory.createForClass(UserPreferences);

// Create unique index on user_id
UserPreferencesSchema.index({ user_id: 1 }, { unique: true });
