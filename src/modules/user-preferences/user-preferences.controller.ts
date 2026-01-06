import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { UserPreferencesService } from './user-preferences.service';
import {
  CreateUserPreferencesDto,
  UpdateUserPreferencesDto,
  AddBookmarkDto,
  AddFavoriteTopicDto,
  MarkCourseCompletedDto,
} from './dto/user-preferences.dto';

@Controller('user-preferences')
export class UserPreferencesController {
  constructor(private readonly userPreferencesService: UserPreferencesService) {}

  /**
   * POST /user-preferences
   * Crea nuove preferenze per un utente
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createDto: CreateUserPreferencesDto) {
    return this.userPreferencesService.create(createDto);
  }

  /**
   * GET /user-preferences
   * Ottieni tutte le preferenze (admin)
   */
  @Get()
  findAll() {
    return this.userPreferencesService.findAll();
  }

  /**
   * GET /user-preferences/:userId
   * Ottieni preferenze per user_id
   */
  @Get(':userId')
  findByUserId(@Param('userId') userId: string) {
    return this.userPreferencesService.findByUserId(userId);
  }

  /**
   * PUT /user-preferences/:userId
   * Aggiorna preferenze complete per user_id
   */
  @Put(':userId')
  updateByUserId(@Param('userId') userId: string, @Body() updateDto: UpdateUserPreferencesDto) {
    return this.userPreferencesService.updateByUserId(userId, updateDto);
  }

  /**
   * DELETE /user-preferences/:userId
   * Elimina preferenze per user_id
   */
  @Delete(':userId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteByUserId(@Param('userId') userId: string) {
    await this.userPreferencesService.deleteByUserId(userId);
  }

  /**
   * POST /user-preferences/:userId/bookmarks
   * Aggiungi un bookmark
   */
  @Post(':userId/bookmarks')
  addBookmark(@Param('userId') userId: string, @Body() bookmarkDto: AddBookmarkDto) {
    return this.userPreferencesService.addBookmark(userId, bookmarkDto);
  }

  /**
   * DELETE /user-preferences/:userId/bookmarks/:courseId/:lessonId
   * Rimuovi un bookmark
   */
  @Delete(':userId/bookmarks/:courseId/:lessonId')
  removeBookmark(
    @Param('userId') userId: string,
    @Param('courseId') courseId: string,
    @Param('lessonId') lessonId: string,
  ) {
    return this.userPreferencesService.removeBookmark(userId, courseId, lessonId);
  }

  /**
   * POST /user-preferences/:userId/favorite-topics
   * Aggiungi un topic preferito
   */
  @Post(':userId/favorite-topics')
  addFavoriteTopic(@Param('userId') userId: string, @Body() topicDto: AddFavoriteTopicDto) {
    return this.userPreferencesService.addFavoriteTopic(userId, topicDto);
  }

  /**
   * DELETE /user-preferences/:userId/favorite-topics/:topic
   * Rimuovi un topic preferito
   */
  @Delete(':userId/favorite-topics/:topic')
  removeFavoriteTopic(@Param('userId') userId: string, @Param('topic') topic: string) {
    return this.userPreferencesService.removeFavoriteTopic(userId, topic);
  }

  /**
   * POST /user-preferences/:userId/completed-courses
   * Marca un corso come completato
   */
  @Post(':userId/completed-courses')
  markCourseCompleted(@Param('userId') userId: string, @Body() courseDto: MarkCourseCompletedDto) {
    return this.userPreferencesService.markCourseCompleted(userId, courseDto);
  }

  /**
   * DELETE /user-preferences/:userId/completed-courses/:courseId
   * Rimuovi un corso dai completati
   */
  @Delete(':userId/completed-courses/:courseId')
  unmarkCourseCompleted(@Param('userId') userId: string, @Param('courseId') courseId: string) {
    return this.userPreferencesService.unmarkCourseCompleted(userId, courseId);
  }

  /**
   * PATCH /user-preferences/:userId/ui-settings
   * Aggiorna solo UI settings
   */
  @Patch(':userId/ui-settings')
  updateUiSettings(@Param('userId') userId: string, @Body() uiSettings: any) {
    return this.userPreferencesService.updateUiSettings(userId, uiSettings);
  }

  /**
   * PATCH /user-preferences/:userId/accessibility
   * Aggiorna solo accessibility settings
   */
  @Patch(':userId/accessibility')
  updateAccessibilitySettings(@Param('userId') userId: string, @Body() accessibility: any) {
    return this.userPreferencesService.updateAccessibilitySettings(userId, accessibility);
  }
}
