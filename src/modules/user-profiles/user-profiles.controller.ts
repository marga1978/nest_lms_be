import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { UserProfilesService } from './user-profiles.service';
import { CreateUserProfileDto, UpdateUserProfileDto } from '../../dto/user-profile.dto';

@ApiTags('user-profiles')
@Controller('user-profiles')
export class UserProfilesController {
  constructor(private readonly userProfilesService: UserProfilesService) {}

  @Post()
  @ApiOperation({
    summary: 'Crea un profilo utente (relazione 1:1 con User)',
    description: 'Crea un nuovo profilo collegato a un utente esistente. Ogni utente può avere un solo profilo.'
  })
  @ApiResponse({ status: 201, description: 'Profilo creato con successo' })
  @ApiResponse({ status: 400, description: 'Dati non validi' })
  @ApiResponse({ status: 404, description: 'Utente non trovato' })
  @ApiResponse({ status: 409, description: 'L\'utente ha già un profilo' })
  create(@Body() createUserProfileDto: CreateUserProfileDto) {
    return this.userProfilesService.create(createUserProfileDto);
  }

  @Get()
  @ApiOperation({ summary: 'Ottieni tutti i profili' })
  @ApiResponse({ status: 200, description: 'Lista di tutti i profili con relativo utente' })
  findAll() {
    return this.userProfilesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Ottieni un profilo per ID profilo' })
  @ApiParam({ name: 'id', description: 'ID del profilo' })
  @ApiResponse({ status: 200, description: 'Profilo trovato' })
  @ApiResponse({ status: 404, description: 'Profilo non trovato' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.userProfilesService.findOne(id);
  }

  @Get('user/:userId')
  @ApiOperation({
    summary: 'Ottieni un profilo per ID utente',
    description: 'Trova il profilo associato a uno specifico utente (relazione 1:1)'
  })
  @ApiParam({ name: 'userId', description: 'ID dell\'utente' })
  @ApiResponse({ status: 200, description: 'Profilo trovato' })
  @ApiResponse({ status: 404, description: 'Profilo non trovato per questo utente' })
  findByUserId(@Param('userId', ParseIntPipe) userId: number) {
    return this.userProfilesService.findByUserId(userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Aggiorna un profilo utente' })
  @ApiParam({ name: 'id', description: 'ID del profilo' })
  @ApiResponse({ status: 200, description: 'Profilo aggiornato con successo' })
  @ApiResponse({ status: 404, description: 'Profilo non trovato' })
  @ApiResponse({ status: 400, description: 'Dati non validi' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserProfileDto: UpdateUserProfileDto,
  ) {
    return this.userProfilesService.update(id, updateUserProfileDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Elimina un profilo utente' })
  @ApiParam({ name: 'id', description: 'ID del profilo' })
  @ApiResponse({ status: 204, description: 'Profilo eliminato con successo' })
  @ApiResponse({ status: 404, description: 'Profilo non trovato' })
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.userProfilesService.remove(id);
  }
}
