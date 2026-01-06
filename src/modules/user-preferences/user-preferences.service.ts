import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserPreferences, UserPreferencesDocument } from './schemas/user-preferences.schema';
import {
  CreateUserPreferencesDto,
  UpdateUserPreferencesDto,
  AddBookmarkDto,
  AddFavoriteTopicDto,
  MarkCourseCompletedDto,
} from './dto/user-preferences.dto';

@Injectable()
export class UserPreferencesService {
  constructor(
    @InjectModel(UserPreferences.name)
    private userPreferencesModel: Model<UserPreferencesDocument>,
  ) {}

  /**
   * Crea nuove preferenze per un utente
   */
  async create(createDto: CreateUserPreferencesDto): Promise<UserPreferences> {
    try {
      const preferences = new this.userPreferencesModel(createDto);
      return await preferences.save();
    } catch (error) {
      if (error.code === 11000) {
        throw new ConflictException(`Preferenze per user_id "${createDto.user_id}" già esistenti`);
      }
      throw error;
    }
  }

  /**
   * Ottieni tutte le preferenze (admin endpoint)
   */
  async findAll(): Promise<UserPreferences[]> {
    return this.userPreferencesModel.find().exec();
  }

  /**
   * Ottieni preferenze per user_id
   */
  async findByUserId(userId: string): Promise<UserPreferences> {
    const preferences = await this.userPreferencesModel.findOne({ user_id: userId }).exec();

    if (!preferences) {
      throw new NotFoundException(`Preferenze per user_id "${userId}" non trovate`);
    }

    return preferences;
  }

  /**
   * Aggiorna preferenze complete per user_id
   */
  async updateByUserId(userId: string, updateDto: UpdateUserPreferencesDto): Promise<UserPreferences> {
    const preferences = await this.userPreferencesModel
      .findOneAndUpdate(
        { user_id: userId },
        { $set: updateDto },
        { new: true, runValidators: true },
      )
      .exec();

    if (!preferences) {
      throw new NotFoundException(`Preferenze per user_id "${userId}" non trovate`);
    }

    return preferences;
  }

  /**
   * Elimina preferenze per user_id
   */
  async deleteByUserId(userId: string): Promise<void> {
    const result = await this.userPreferencesModel.deleteOne({ user_id: userId }).exec();

    if (result.deletedCount === 0) {
      throw new NotFoundException(`Preferenze per user_id "${userId}" non trovate`);
    }
  }

  /**
   * Aggiungi un bookmark
   */
  async addBookmark(userId: string, bookmarkDto: AddBookmarkDto): Promise<UserPreferences> {
    const bookmark = {
      ...bookmarkDto,
      timestamp: new Date(),
    };

    const preferences = await this.userPreferencesModel
      .findOneAndUpdate(
        { user_id: userId },
        { $push: { 'learning_preferences.bookmarks': bookmark } },
        { new: true, runValidators: true },
      )
      .exec();

    if (!preferences) {
      throw new NotFoundException(`Preferenze per user_id "${userId}" non trovate`);
    }

    return preferences;
  }

  /**
   * Rimuovi un bookmark
   */
  async removeBookmark(userId: string, courseId: string, lessonId: string): Promise<UserPreferences> {
    const preferences = await this.userPreferencesModel
      .findOneAndUpdate(
        { user_id: userId },
        {
          $pull: {
            'learning_preferences.bookmarks': {
              course_id: courseId,
              lesson_id: lessonId,
            },
          },
        },
        { new: true },
      )
      .exec();

    if (!preferences) {
      throw new NotFoundException(`Preferenze per user_id "${userId}" non trovate`);
    }

    return preferences;
  }

  /**
   * Aggiungi un topic preferito
   */
  async addFavoriteTopic(userId: string, topicDto: AddFavoriteTopicDto): Promise<UserPreferences> {
    const preferences = await this.userPreferencesModel
      .findOneAndUpdate(
        { user_id: userId },
        { $addToSet: { 'learning_preferences.favorite_topics': topicDto.topic } },
        { new: true, runValidators: true },
      )
      .exec();

    if (!preferences) {
      throw new NotFoundException(`Preferenze per user_id "${userId}" non trovate`);
    }

    return preferences;
  }

  /**
   * Rimuovi un topic preferito
   */
  async removeFavoriteTopic(userId: string, topic: string): Promise<UserPreferences> {
    const preferences = await this.userPreferencesModel
      .findOneAndUpdate(
        { user_id: userId },
        { $pull: { 'learning_preferences.favorite_topics': topic } },
        { new: true },
      )
      .exec();

    if (!preferences) {
      throw new NotFoundException(`Preferenze per user_id "${userId}" non trovate`);
    }

    return preferences;
  }

  /**
   * Marca un corso come completato
   */
  async markCourseCompleted(userId: string, courseDto: MarkCourseCompletedDto): Promise<UserPreferences> {
    const preferences = await this.userPreferencesModel
      .findOneAndUpdate(
        { user_id: userId },
        { $addToSet: { 'learning_preferences.completed_courses': courseDto.course_id } },
        { new: true, runValidators: true },
      )
      .exec();

    if (!preferences) {
      throw new NotFoundException(`Preferenze per user_id "${userId}" non trovate`);
    }

    return preferences;
  }

  /**
   * Rimuovi un corso dai completati
   */
  async unmarkCourseCompleted(userId: string, courseId: string): Promise<UserPreferences> {
    const preferences = await this.userPreferencesModel
      .findOneAndUpdate(
        { user_id: userId },
        { $pull: { 'learning_preferences.completed_courses': courseId } },
        { new: true },
      )
      .exec();

    if (!preferences) {
      throw new NotFoundException(`Preferenze per user_id "${userId}" non trovate`);
    }

    return preferences;
  }

  /**
   * Aggiorna solo UI settings
   */
  async updateUiSettings(userId: string, uiSettings: any): Promise<UserPreferences> {
    const preferences = await this.userPreferencesModel
      .findOneAndUpdate(
        { user_id: userId },
        { $set: { ui_settings: uiSettings } },
        { new: true, runValidators: true },
      )
      .exec();

    if (!preferences) {
      throw new NotFoundException(`Preferenze per user_id "${userId}" non trovate`);
    }

    return preferences;
  }

  /**
   * Aggiorna solo accessibility settings
   */
  async updateAccessibilitySettings(userId: string, accessibility: any): Promise<UserPreferences> {
    const preferences = await this.userPreferencesModel
      .findOneAndUpdate(
        { user_id: userId },
        { $set: { accessibility } },
        { new: true, runValidators: true },
      )
      .exec();

    if (!preferences) {
      throw new NotFoundException(`Preferenze per user_id "${userId}" non trovate`);
    }

    return preferences;
  }
}
