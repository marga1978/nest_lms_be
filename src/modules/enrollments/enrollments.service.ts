import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Enrollment, EnrollmentStatus } from '../../entities/enrollment.entity';
import { User } from '../../entities/user.entity';
import { Course } from '../../entities/course.entity';
import { CreateEnrollmentDto, UpdateEnrollmentDto } from '../../dto/enrollment.dto';

@Injectable()
export class EnrollmentsService {
  constructor(
    @InjectRepository(Enrollment)
    private enrollmentsRepository: Repository<Enrollment>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Course)
    private coursesRepository: Repository<Course>,
    private dataSource: DataSource,
  ) {}

  /**
   * Crea una nuova iscrizione utilizzando una transazione
   * Verifica che l'utente e il corso esistano
   * Verifica che l'utente non sia già iscritto al corso
   * Verifica che ci sia spazio disponibile nel corso
   */
  async create(createEnrollmentDto: CreateEnrollmentDto): Promise<Enrollment> {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Verifica che l'utente esista
      const user = await queryRunner.manager.findOne(User, {
        where: { id: createEnrollmentDto.userId },
      });

      if (!user) {
        throw new NotFoundException(
          `Utente con ID ${createEnrollmentDto.userId} non trovato`,
        );
      }

      if (!user.isActive) {
        throw new BadRequestException(
          `L'utente con ID ${createEnrollmentDto.userId} non è attivo`,
        );
      }

      // Verifica che il corso esista
      const course = await queryRunner.manager.findOne(Course, {
        where: { id: createEnrollmentDto.courseId },
        relations: ['enrollments'],
      });

      if (!course) {
        throw new NotFoundException(
          `Corso con ID ${createEnrollmentDto.courseId} non trovato`,
        );
      }

      if (!course.isActive) {
        throw new BadRequestException(
          `Il corso con ID ${createEnrollmentDto.courseId} non è attivo`,
        );
      }

      // Verifica che l'utente non sia già iscritto al corso
      const existingEnrollment = await queryRunner.manager.findOne(Enrollment, {
        where: {
          userId: createEnrollmentDto.userId,
          courseId: createEnrollmentDto.courseId,
        },
      });

      if (existingEnrollment) {
        throw new ConflictException(
          `L'utente è già iscritto al corso ${course.name}`,
        );
      }

      // Conta le iscrizioni attive per il corso
      const activeEnrollments = course.enrollments.filter(
        (e) => e.status === EnrollmentStatus.ACTIVE || e.status === EnrollmentStatus.PENDING,
      ).length;

      if (activeEnrollments >= course.maxStudents) {
        throw new BadRequestException(
          `Il corso ${course.name} ha raggiunto il numero massimo di studenti (${course.maxStudents})`,
        );
      }

      // Crea l'iscrizione
      const enrollment = queryRunner.manager.create(Enrollment, {
        ...createEnrollmentDto,
        enrollmentDate: createEnrollmentDto.enrollmentDate || new Date().toISOString().split('T')[0],
        status: createEnrollmentDto.status || EnrollmentStatus.PENDING,
      });

      const savedEnrollment = await queryRunner.manager.save(enrollment);

      // Commit della transazione
      await queryRunner.commitTransaction();

      // Recupera l'iscrizione completa con le relazioni
      return await this.findOne(savedEnrollment.id);
    } catch (error) {
      // Rollback in caso di errore
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      // Rilascia la connessione
      await queryRunner.release();
    }
  }

  async findAll(): Promise<Enrollment[]> {
    return await this.enrollmentsRepository.find({
      relations: ['user', 'course'],
    });
  }

  async findOne(id: number): Promise<Enrollment> {
    const enrollment = await this.enrollmentsRepository.findOne({
      where: { id },
      relations: ['user', 'course'],
    });

    if (!enrollment) {
      throw new NotFoundException(`Iscrizione con ID ${id} non trovata`);
    }

    return enrollment;
  }

  async findByUser(userId: number): Promise<Enrollment[]> {
    return await this.enrollmentsRepository.find({
      where: { userId },
      relations: ['course'],
    });
  }

  async findByCourse(courseId: number): Promise<Enrollment[]> {
    return await this.enrollmentsRepository.find({
      where: { courseId },
      relations: ['user'],
    });
  }

  /**
   * Aggiorna un'iscrizione utilizzando una transazione
   */
  async update(id: number, updateEnrollmentDto: UpdateEnrollmentDto): Promise<Enrollment> {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const enrollment = await queryRunner.manager.findOne(Enrollment, {
        where: { id },
      });

      if (!enrollment) {
        throw new NotFoundException(`Iscrizione con ID ${id} non trovata`);
      }

      Object.assign(enrollment, updateEnrollmentDto);
      
      await queryRunner.manager.save(enrollment);
      await queryRunner.commitTransaction();

      return await this.findOne(id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Cancella un'iscrizione utilizzando una transazione
   */
  async remove(id: number): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const enrollment = await queryRunner.manager.findOne(Enrollment, {
        where: { id },
      });

      if (!enrollment) {
        throw new NotFoundException(`Iscrizione con ID ${id} non trovata`);
      }

      await queryRunner.manager.remove(enrollment);
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Iscrivi un utente a più corsi in una singola transazione
   */
  async enrollUserInMultipleCourses(
    userId: number,
    courseIds: number[],
  ): Promise<Enrollment[]> {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const user = await queryRunner.manager.findOne(User, {
        where: { id: userId },
      });

      if (!user) {
        throw new NotFoundException(`Utente con ID ${userId} non trovato`);
      }

      if (!user.isActive) {
        throw new BadRequestException(`L'utente non è attivo`);
      }

      const enrollments: Enrollment[] = [];

      for (const courseId of courseIds) {
        const course = await queryRunner.manager.findOne(Course, {
          where: { id: courseId },
          relations: ['enrollments'],
        });

        if (!course) {
          throw new NotFoundException(`Corso con ID ${courseId} non trovato`);
        }

        if (!course.isActive) {
          throw new BadRequestException(`Il corso ${course.name} non è attivo`);
        }

        const existingEnrollment = await queryRunner.manager.findOne(Enrollment, {
          where: { userId, courseId },
        });

        if (existingEnrollment) {
          throw new ConflictException(`L'utente è già iscritto al corso ${course.name}`);
        }

        const activeEnrollments = course.enrollments.filter(
          (e) => e.status === EnrollmentStatus.ACTIVE || e.status === EnrollmentStatus.PENDING,
        ).length;

        if (activeEnrollments >= course.maxStudents) {
          throw new BadRequestException(
            `Il corso ${course.name} ha raggiunto il numero massimo di utenti`,
          );
        }

        const enrollment = queryRunner.manager.create(Enrollment, {
          userId,
          courseId,
          enrollmentDate: new Date().toISOString().split('T')[0],
          status: EnrollmentStatus.PENDING,
        });

        enrollments.push(await queryRunner.manager.save(enrollment));
      }

      await queryRunner.commitTransaction();

      // Recupera le iscrizioni con le relazioni
      const enrollmentIds = enrollments.map((e) => e.id);
      const results: Enrollment[] = [];
      for (const id of enrollmentIds) {
        const enrollment = await this.findOne(id);
        results.push(enrollment);
      }
      return results;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
