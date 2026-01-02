import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto } from '../../dto/user.dto';
import { SwaggerExamples } from '../../swagger-examples';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({ summary: 'Crea un nuovo utente' })
  @ApiResponse({ status: 201, description: 'Utente creato con successo', schema: { example: SwaggerExamples.users.create } })
  @ApiResponse({ status: 400, description: 'Dati non validi o email/username già esistenti' })
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @ApiOperation({ summary: 'Ottieni tutti gli utenti' })
  @ApiResponse({ status: 200, description: 'Lista di tutti gli utenti con profilo e iscrizioni', schema: { example: SwaggerExamples.users.findAll } })
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Ottieni un utente specifico' })
  @ApiParam({ name: 'id', description: 'ID dell\'utente' })
  @ApiResponse({ status: 200, description: 'Utente trovato', schema: { example: SwaggerExamples.users.findOne } })
  @ApiResponse({ status: 404, description: 'Utente non trovato' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Aggiorna un utente' })
  @ApiParam({ name: 'id', description: 'ID dell\'utente' })
  @ApiResponse({ status: 200, description: 'Utente aggiornato con successo', schema: { example: SwaggerExamples.users.update } })
  @ApiResponse({ status: 404, description: 'Utente non trovato' })
  @ApiResponse({ status: 400, description: 'Dati non validi' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Elimina un utente' })
  @ApiParam({ name: 'id', description: 'ID dell\'utente' })
  @ApiResponse({ status: 204, description: 'Utente eliminato con successo' })
  @ApiResponse({ status: 404, description: 'Utente non trovato' })
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.remove(id);
  }
}
