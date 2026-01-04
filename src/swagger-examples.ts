/**
 * Esempi di risposta per la documentazione Swagger
 * Questi esempi vengono utilizzati nei decoratori @ApiResponse dei controller
 */

export const SwaggerExamples = {
  // ==================== USERS ====================
  users: {
    create: {
      id: 1,
      email: 'mario.rossi@example.com',
      username: 'mariorossi',
      isActive: true,
      createdAt: '2026-01-02T10:00:00.000Z',
      updatedAt: '2026-01-02T10:00:00.000Z'
    },
    findAll: [
      {
        id: 1,
        email: 'mario.rossi@example.com',
        username: 'mariorossi',
        isActive: true,
        createdAt: '2026-01-02T10:00:00.000Z',
        profile: {
          id: 1,
          firstName: 'Mario',
          lastName: 'Rossi'
        },
        enrollments: [
          {
            id: 1,
            courseId: 1,
            status: 'active'
          }
        ]
      }
    ],
    findOne: {
      id: 1,
      email: 'mario.rossi@example.com',
      username: 'mariorossi',
      isActive: true,
      createdAt: '2026-01-02T10:00:00.000Z',
      updatedAt: '2026-01-02T10:00:00.000Z',
      profile: {
        id: 1,
        userId: 1,
        firstName: 'Mario',
        lastName: 'Rossi',
        dateOfBirth: '1990-05-15',
        phoneNumber: '+39 333 1234567',
        bio: 'Sviluppatore Full Stack',
        avatarUrl: 'https://example.com/avatar.jpg'
      },
      enrollments: [
        {
          id: 1,
          courseId: 1,
          course: {
            id: 1,
            name: 'JavaScript Avanzato',
            code: 'JS301'
          },
          enrollmentDate: '2026-01-02T10:00:00.000Z',
          status: 'active',
          grade: null
        }
      ]
    },
    update: {
      id: 1,
      email: 'mario.rossi.new@example.com',
      username: 'mariorossi',
      isActive: true,
      createdAt: '2026-01-02T10:00:00.000Z',
      updatedAt: '2026-01-02T11:30:00.000Z'
    }
  },

  // ==================== USER PROFILES ====================
  userProfiles: {
    create: {
      id: 1,
      userId: 1,
      firstName: 'Mario',
      lastName: 'Rossi',
      dateOfBirth: '1990-05-15',
      phoneNumber: '+39 333 1234567',
      bio: 'Sviluppatore Full Stack appassionato di tecnologia',
      avatarUrl: 'https://example.com/avatar/mario-rossi.jpg',
      createdAt: '2026-01-02T10:00:00.000Z',
      updatedAt: '2026-01-02T10:00:00.000Z'
    },
    findAll: [
      {
        id: 1,
        userId: 1,
        firstName: 'Mario',
        lastName: 'Rossi',
        user: {
          id: 1,
          email: 'mario.rossi@example.com',
          username: 'mariorossi'
        }
      }
    ],
    findOne: {
      id: 1,
      userId: 1,
      firstName: 'Mario',
      lastName: 'Rossi',
      dateOfBirth: '1990-05-15',
      phoneNumber: '+39 333 1234567',
      bio: 'Sviluppatore Full Stack',
      avatarUrl: 'https://example.com/avatar.jpg',
      createdAt: '2026-01-02T10:00:00.000Z',
      updatedAt: '2026-01-02T10:00:00.000Z',
      user: {
        id: 1,
        email: 'mario.rossi@example.com',
        username: 'mariorossi',
        isActive: true
      }
    },
    update: {
      id: 1,
      userId: 1,
      firstName: 'Giovanni',
      lastName: 'Bianchi',
      dateOfBirth: '1985-12-20',
      phoneNumber: '+39 333 9876543',
      bio: 'Sviluppatore con 10 anni di esperienza',
      avatarUrl: 'https://example.com/avatar/new.jpg',
      createdAt: '2026-01-02T10:00:00.000Z',
      updatedAt: '2026-01-02T11:30:00.000Z'
    }
  },

  // ==================== COURSE LESSONS ====================
  courseLessons: {
    create: {
      id: 1,
      courseId: 1,
      title: 'Introduzione a TypeScript',
      description: 'Panoramica su TypeScript e setup dell\'ambiente',
      type: 'video',
      content: null,
      videoUrl: 'https://example.com/videos/typescript-intro.mp4',
      orderIndex: 1,
      durationMinutes: 45,
      isActive: true,
      createdAt: '2026-01-02T10:00:00.000Z',
      updatedAt: '2026-01-02T10:00:00.000Z'
    },
    findAll: [
      {
        id: 1,
        courseId: 1,
        title: 'Introduzione a TypeScript',
        type: 'video',
        orderIndex: 1,
        durationMinutes: 45,
        isActive: true,
        course: {
          id: 1,
          name: 'JavaScript Avanzato',
          code: 'JS301'
        }
      },
      {
        id: 2,
        courseId: 1,
        title: 'TypeScript Avanzato',
        type: 'video',
        orderIndex: 2,
        durationMinutes: 60,
        isActive: true
      }
    ],
    findOne: {
      id: 1,
      courseId: 1,
      title: 'Introduzione a TypeScript',
      description: 'Panoramica su TypeScript e setup dell\'ambiente',
      type: 'video',
      content: null,
      videoUrl: 'https://example.com/videos/typescript-intro.mp4',
      orderIndex: 1,
      durationMinutes: 45,
      isActive: true,
      createdAt: '2026-01-02T10:00:00.000Z',
      updatedAt: '2026-01-02T10:00:00.000Z',
      course: {
        id: 1,
        name: 'JavaScript Avanzato',
        code: 'JS301',
        credits: 6
      }
    },
    findByCourse: [
      {
        id: 1,
        courseId: 1,
        title: 'Introduzione a TypeScript',
        type: 'video',
        orderIndex: 1,
        durationMinutes: 45
      },
      {
        id: 2,
        courseId: 1,
        title: 'TypeScript Avanzato',
        type: 'video',
        orderIndex: 2,
        durationMinutes: 60
      }
    ],
    update: {
      id: 1,
      courseId: 1,
      title: 'TypeScript Avanzato - Aggiornato',
      description: 'Concetti avanzati aggiornati',
      type: 'video',
      videoUrl: 'https://example.com/videos/typescript-advanced.mp4',
      orderIndex: 1,
      durationMinutes: 60,
      isActive: true,
      createdAt: '2026-01-02T10:00:00.000Z',
      updatedAt: '2026-01-02T11:30:00.000Z'
    }
  },

  // ==================== ENROLLMENTS ====================
  enrollments: {
    create: {
      id: 1,
      userId: 1,
      courseId: 1,
      enrollmentDate: '2026-01-02T10:00:00.000Z',
      status: 'pending',
      grade: null,
      createdAt: '2026-01-02T10:00:00.000Z',
      updatedAt: '2026-01-02T10:00:00.000Z'
    },
    bulk: [
      {
        id: 1,
        userId: 1,
        courseId: 1,
        status: 'pending'
      },
      {
        id: 2,
        userId: 1,
        courseId: 2,
        status: 'pending'
      },
      {
        id: 3,
        userId: 1,
        courseId: 3,
        status: 'pending'
      }
    ],
    findAll: [
      {
        id: 1,
        userId: 1,
        courseId: 1,
        enrollmentDate: '2026-01-02T10:00:00.000Z',
        status: 'active',
        grade: null,
        user: {
          id: 1,
          email: 'mario.rossi@example.com',
          username: 'mariorossi'
        },
        course: {
          id: 1,
          name: 'JavaScript Avanzato',
          code: 'JS301'
        }
      }
    ],
    findOne: {
      id: 1,
      userId: 1,
      courseId: 1,
      enrollmentDate: '2026-01-02T10:00:00.000Z',
      status: 'active',
      grade: null,
      createdAt: '2026-01-02T10:00:00.000Z',
      updatedAt: '2026-01-02T10:00:00.000Z',
      user: {
        id: 1,
        email: 'mario.rossi@example.com',
        username: 'mariorossi',
        profile: {
          firstName: 'Mario',
          lastName: 'Rossi'
        }
      },
      course: {
        id: 1,
        name: 'JavaScript Avanzato',
        code: 'JS301',
        credits: 6,
        maxStudents: 30
      }
    },
    update: {
      id: 1,
      userId: 1,
      courseId: 1,
      enrollmentDate: '2026-01-02T10:00:00.000Z',
      status: 'completed',
      grade: 95.5,
      createdAt: '2026-01-02T10:00:00.000Z',
      updatedAt: '2026-01-02T12:00:00.000Z'
    },
    findByUsers: [
      {
        users_id: 1,
        users_username: 'mariorossi',
        users_email: 'mario.rossi@example.com',
        corsi: [
          {
            name: 'JavaScript Avanzato',
            description: 'Corso completo di JavaScript ES6+',
            code: 'JS301',
            maxStudents: 30,
            isActive: true
          },
          {
            name: 'TypeScript Fundamentals',
            description: 'Introduzione a TypeScript',
            code: 'TS101',
            maxStudents: 25,
            isActive: true
          }
        ]
      },
      {
        users_id: 2,
        users_username: 'annabianchi',
        users_email: 'anna.bianchi@example.com',
        corsi: [
          {
            name: 'React Advanced',
            description: 'Concetti avanzati di React',
            code: 'REACT301',
            maxStudents: 20,
            isActive: true
          }
        ]
      }
    ]
  }
};
