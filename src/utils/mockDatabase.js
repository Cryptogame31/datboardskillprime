/**
 * Mock Database Service using LocalStorage
 * Restructured to support a 3-level VOD hierarchy:
 * 1. Course / Series (e.g. ZDT Completo, Velocity, Electromagnetismo)
 *    2. Module / Season / Sub-course (e.g. Cripto Monedas, Finanzas, Horus, Master, OpcionesYBolsa)
 *       3. Chapter / Video / Class (e.g. Clase 1: Introducción, Clase 2...)
 */

const STORAGE_KEYS = {
  USERS: 'skillprime_users',
  COURSES: 'skillprime_courses',
  CURRENT_USER: 'skillprime_current_user',
};

// Default Users (Subscribers)
const DEFAULT_USERS = [
  {
    id: 'user-1',
    name: 'Juan Pérez',
    email: 'juan.perez@email.com',
    status: 'active', // active, expiring, inactive
    startDate: '2026-07-01',
    endDate: '2026-08-30',
    accessHistory: [
      { timestamp: '2026-07-23T10:15:30Z', videoTitle: '1. Introducción al ecosistema Blockchain', courseName: 'ZDT Completo - Cripto Monedas' },
      { timestamp: '2026-07-23T11:45:00Z', videoTitle: '1. Estrategia Horus: Zonas de Liquidez', courseName: 'ZDT Completo - Horus' }
    ]
  },
  {
    id: 'user-2',
    name: 'María López',
    email: 'maria.lopez@email.com',
    status: 'expiring',
    startDate: '2026-06-25',
    endDate: '2026-07-26', // Expiring in 3 days
    accessHistory: [
      { timestamp: '2026-07-22T15:20:10Z', videoTitle: '1. Fundamentos de Finanzas e Interés Compuesto', courseName: 'ZDT Completo - Finanzas' }
    ]
  },
  {
    id: 'user-3',
    name: 'Carlos Ruiz',
    email: 'carlos.ruiz@email.com',
    status: 'inactive',
    startDate: '2026-05-01',
    endDate: '2026-06-01', // Already expired
    accessHistory: [
      { timestamp: '2026-05-15T09:00:00Z', videoTitle: '1. Ley de Faraday y Campo Magnético', courseName: 'Simulaciones y Electromagnetismo - Electromagnetismo Básico' }
    ]
  }
];

// Default 3-level VOD structure
const DEFAULT_COURSES = [
  {
    id: 'course-zdt',
    title: 'ZDT Completo',
    description: 'Programa de formación integral en Trading, Finanzas Personales, Criptomonedas y Acción del Precio.',
    category: 'VOD Series',
    posterUrl: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=800&q=80',
    modules: [
      {
        id: 'mod-zdt-crypto',
        title: 'Cripto Monedas',
        description: 'Aprende los fundamentos de blockchain, criptomonedas, DeFi y trading de activos digitales.',
        driveUrl: 'https://drive.google.com/drive/folders/19UiA-GJFW56WI4f3ID2GVoez1IgwLJ4B',
        videos: [
          {
            id: 'vid-zdt-c1',
            title: '1. Introducción al ecosistema Blockchain',
            description: 'En esta clase introductoria analizamos qué es blockchain, cómo funciona el consenso y el origen de Bitcoin.',
            url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
            driveUrl: 'https://drive.google.com/file/d/19UiA-GJFW56WI4f3ID2GVoez1IgwLJ4B/view',
            duration: '10:15',
            order: 1
          },
          {
            id: 'vid-zdt-c2',
            title: '2. Smart Contracts y Redes Ethereum',
            description: 'Explicación técnica de contratos inteligentes, Solidity, gas fees y cómo interactuar con DApps.',
            url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
            driveUrl: 'https://drive.google.com/file/d/19UiA-GJFW56WI4f3ID2GVoez1IgwLJ4B/view',
            duration: '14:22',
            order: 2
          }
        ]
      },
      {
        id: 'mod-zdt-finance',
        title: 'Finanzas',
        description: 'Gestión de finanzas personales, presupuestos, portafolios de inversión a largo plazo y psicología del dinero.',
        driveUrl: 'https://drive.google.com/drive/folders/13r310iOfdqvJuGgId6F_CHE77vwsKiG3',
        videos: [
          {
            id: 'vid-zdt-f1',
            title: '1. Fundamentos de Finanzas e Interés Compuesto',
            description: 'Comprende el poder del interés compuesto, la inflación y cómo estructurar un plan de ahorro e inversión estable.',
            url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
            driveUrl: 'https://drive.google.com/file/d/13r310iOfdqvJuGgId6F_CHE77vwsKiG3/view',
            duration: '15:02',
            order: 1
          },
          {
            id: 'vid-zdt-f2',
            title: '2. Creación de un Portafolio Diversificado',
            description: 'Modelos de asignación de activos, renta fija vs variable y rebalanceo trimestral.',
            url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
            driveUrl: 'https://drive.google.com/file/d/13r310iOfdqvJuGgId6F_CHE77vwsKiG3/view',
            duration: '08:48',
            order: 2
          }
        ]
      },
      {
        id: 'mod-zdt-horus',
        title: 'Horus',
        description: 'Estrategias avanzadas de Trading cuantitativo basadas en la metodología Horus. Análisis técnico y liquidez.',
        driveUrl: 'https://drive.google.com/drive/folders/1IYh0M7ROw7dxjDTSIhBfFA6-2_LQzuGZ',
        videos: [
          {
            id: 'vid-zdt-h1',
            title: '1. Estrategia Horus: Zonas de Liquidez',
            description: 'Cómo identificar order blocks, vacíos de liquidez (FVG) y configurar entradas de alta precisión.',
            url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
            driveUrl: 'https://drive.google.com/file/d/1IYh0M7ROw7dxjDTSIhBfFA6-2_LQzuGZ/view',
            duration: '12:05',
            order: 1
          }
        ]
      },
      {
        id: 'mod-zdt-master',
        title: 'Master',
        description: 'El programa definitivo para convertirse en trader profesional. Gestión de riesgo extrema y setups de alta probabilidad.',
        driveUrl: 'https://drive.google.com/drive/folders/1cTds_scIVL48v70PTNHwd2Y4WqGiUXZ8',
        videos: [
          {
            id: 'vid-zdt-m1',
            title: '1. Masterclass: Psicotrading y Gestión Emocional',
            description: 'La clave del trading no es el sistema, es la mente. Cómo superar rachas de pérdidas y evitar la sobreoperación.',
            url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
            driveUrl: 'https://drive.google.com/file/d/1cTds_scIVL48v70PTNHwd2Y4WqGiUXZ8/view',
            duration: '18:30',
            order: 1
          }
        ]
      },
      {
        id: 'mod-zdt-options',
        title: 'Opciones y Bolsa',
        description: 'Estrategias de opciones financieras (Calls, Puts, Spreads) y análisis de bolsa americana.',
        driveUrl: 'https://drive.google.com/drive/folders/1_AGgy-ayq8ZcEthLd-hrtnRpqrOJPf0Q',
        videos: [
          {
            id: 'vid-zdt-o1',
            title: '1. Introducción a las Opciones Financieras',
            description: 'Qué es una opción, derechos vs obligaciones, strike price y primas de compra.',
            url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
            driveUrl: 'https://drive.google.com/file/d/1_AGgy-ayq8ZcEthLd-hrtnRpqrOJPf0Q/view',
            duration: '14:50',
            order: 1
          }
        ]
      }
    ]
  },
  {
    id: 'course-velocity',
    title: 'Velocity',
    description: 'Metodologías de organización y flujo de trabajo acelerado (Velocity) para estructurar el aprendizaje online.',
    category: 'VOD Series',
    posterUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=800&q=80',
    modules: [
      {
        id: 'mod-vel-organized',
        title: 'cursos_organizados',
        description: 'Módulo de organización metodológica y clasificación de cursos en la nube.',
        driveUrl: 'https://drive.google.com/drive/folders/1el2Tn_7quz_dhY6soI3v3ybZ1ykeJ2eK',
        videos: [
          {
            id: 'vid-vel-1',
            title: '1. Estructura y Planificación de Cursos',
            description: 'Cómo organizar carpetas de recursos, archivos de video y material complementario en la nube.',
            url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
            driveUrl: 'https://drive.google.com/file/d/1el2Tn_7quz_dhY6soI3v3ybZ1ykeJ2eK/view',
            duration: '09:12',
            order: 1
          }
        ]
      }
    ]
  },
  {
    id: 'course-electromagnetismo',
    title: 'Simulaciones y Electromagnetismo',
    description: 'Curso de física avanzada que cubre campos eléctricos, magnéticos y simulaciones interactivas.',
    category: 'VOD Series',
    posterUrl: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=800&q=80',
    modules: [
      {
        id: 'mod-em-basic',
        title: 'Electromagnetismo Básico',
        description: 'Introducción al magnetismo, campo eléctrico y simulaciones en laboratorio.',
        driveUrl: 'https://drive.google.com/drive/folders/1JLZCnhh9-DDgHxNrp9HXJCEAtsLQ1UNI',
        videos: [
          {
            id: 'vid-em-1',
            title: '1. Ley de Faraday y Campo Magnético',
            description: 'Simulación interactiva de inducción electromagnética, flujo magnético y la Ley de Lenz.',
            url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
            driveUrl: 'https://drive.google.com/file/d/1JLZCnhh9-DDgHxNrp9HXJCEAtsLQ1UNI/view',
            duration: '11:45',
            order: 1
          }
        ]
      }
    ]
  }
];

export const mockDatabase = {
  init() {
    // Check if the stored courses data is in the old schema format
    const storedCourses = localStorage.getItem(STORAGE_KEYS.COURSES);
    if (storedCourses) {
      try {
        const parsed = JSON.parse(storedCourses);
        if (parsed.length > 0 && !parsed[0].modules) {
          console.warn("Old schema detected in localstorage. Re-initializing databases...");
          localStorage.removeItem(STORAGE_KEYS.COURSES);
          localStorage.removeItem(STORAGE_KEYS.USERS);
          localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
        }
      } catch (e) {
        localStorage.removeItem(STORAGE_KEYS.COURSES);
      }
    }

    if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(DEFAULT_USERS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.COURSES)) {
      localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(DEFAULT_COURSES));
    }
    if (!localStorage.getItem(STORAGE_KEYS.CURRENT_USER)) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(DEFAULT_USERS[0]));
    }
  },

  // USERS API
  getUsers() {
    this.init();
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS));
  },

  saveUsers(users) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  },

  addUser(user) {
    const users = this.getUsers();
    const newUser = {
      id: `user-${Date.now()}`,
      accessHistory: [],
      ...user
    };
    users.push(newUser);
    this.saveUsers(users);
    return newUser;
  },

  updateUser(id, updatedFields) {
    const users = this.getUsers();
    const index = users.findIndex(u => u.id === id);
    if (index !== -1) {
      users[index] = { ...users[index], ...updatedFields };
      this.saveUsers(users);
      
      const currentUser = this.getCurrentUser();
      if (currentUser && currentUser.id === id) {
        this.setCurrentUser(users[index]);
      }
      return users[index];
    }
    return null;
  },

  deleteUser(id) {
    const users = this.getUsers();
    const filtered = users.filter(u => u.id !== id);
    this.saveUsers(filtered);
  },

  getCurrentUser() {
    this.init();
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.CURRENT_USER));
  },

  setCurrentUser(user) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
  },

  addAccessHistory(userId, videoTitle, courseName) {
    const users = this.getUsers();
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex !== -1) {
      const historyItem = {
        timestamp: new Date().toISOString(),
        videoTitle,
        courseName
      };
      if (!users[userIndex].accessHistory) {
        users[userIndex].accessHistory = [];
      }
      users[userIndex].accessHistory.unshift(historyItem);
      this.saveUsers(users);
      
      const currentUser = this.getCurrentUser();
      if (currentUser && currentUser.id === userId) {
        this.setCurrentUser(users[userIndex]);
      }
    }
  },

  // COURSES / SERIES VOD API (Level 1)
  getCourses() {
    this.init();
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.COURSES));
  },

  saveCourses(courses) {
    localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(courses));
  },

  addCourse(course) {
    const courses = this.getCourses();
    const newCourse = {
      id: `course-${Date.now()}`,
      modules: [],
      ...course
    };
    courses.push(newCourse);
    this.saveCourses(courses);
    return newCourse;
  },

  updateCourse(id, updatedFields) {
    const courses = this.getCourses();
    const index = courses.findIndex(c => c.id === id);
    if (index !== -1) {
      courses[index] = { ...courses[index], ...updatedFields };
      this.saveCourses(courses);
      return courses[index];
    }
    return null;
  },

  deleteCourse(id) {
    const courses = this.getCourses();
    const filtered = courses.filter(c => c.id !== id);
    this.saveCourses(filtered);
  },

  // MODULES / SEASONS VOD API (Level 2)
  addModule(courseId, module) {
    const courses = this.getCourses();
    const cIndex = courses.findIndex(c => c.id === courseId);
    if (cIndex !== -1) {
      const newModule = {
        id: `mod-${Date.now()}`,
        videos: [],
        ...module
      };
      courses[cIndex].modules.push(newModule);
      this.saveCourses(courses);
      return newModule;
    }
    return null;
  },

  updateModule(courseId, moduleId, updatedFields) {
    const courses = this.getCourses();
    const cIndex = courses.findIndex(c => c.id === courseId);
    if (cIndex !== -1) {
      const mIndex = courses[cIndex].modules.findIndex(m => m.id === moduleId);
      if (mIndex !== -1) {
        courses[cIndex].modules[mIndex] = { ...courses[cIndex].modules[mIndex], ...updatedFields };
        this.saveCourses(courses);
        return courses[cIndex].modules[mIndex];
      }
    }
    return null;
  },

  deleteModule(courseId, moduleId) {
    const courses = this.getCourses();
    const cIndex = courses.findIndex(c => c.id === courseId);
    if (cIndex !== -1) {
      courses[cIndex].modules = courses[cIndex].modules.filter(m => m.id !== moduleId);
      this.saveCourses(courses);
    }
  },

  // VIDEOS / CHAPTERS VOD API (Level 3)
  addVideo(courseId, moduleId, video) {
    const courses = this.getCourses();
    const cIndex = courses.findIndex(c => c.id === courseId);
    if (cIndex !== -1) {
      const mIndex = courses[cIndex].modules.findIndex(m => m.id === moduleId);
      if (mIndex !== -1) {
        const newVideo = {
          id: `vid-${Date.now()}`,
          order: courses[cIndex].modules[mIndex].videos.length + 1,
          ...video
        };
        courses[cIndex].modules[mIndex].videos.push(newVideo);
        this.saveCourses(courses);
        return newVideo;
      }
    }
    return null;
  },

  updateVideo(courseId, moduleId, videoId, updatedFields) {
    const courses = this.getCourses();
    const cIndex = courses.findIndex(c => c.id === courseId);
    if (cIndex !== -1) {
      const mIndex = courses[cIndex].modules.findIndex(m => m.id === moduleId);
      if (mIndex !== -1) {
        const vIndex = courses[cIndex].modules[mIndex].videos.findIndex(v => v.id === videoId);
        if (vIndex !== -1) {
          courses[cIndex].modules[mIndex].videos[vIndex] = { 
            ...courses[cIndex].modules[mIndex].videos[vIndex], 
            ...updatedFields 
          };
          this.saveCourses(courses);
          return courses[cIndex].modules[mIndex].videos[vIndex];
        }
      }
    }
    return null;
  },

  deleteVideo(courseId, moduleId, videoId) {
    const courses = this.getCourses();
    const cIndex = courses.findIndex(c => c.id === courseId);
    if (cIndex !== -1) {
      const mIndex = courses[cIndex].modules.findIndex(m => m.id === moduleId);
      if (mIndex !== -1) {
        courses[cIndex].modules[mIndex].videos = courses[cIndex].modules[mIndex].videos.filter(v => v.id !== videoId);
        // Re-order remaining videos inside module
        courses[cIndex].modules[mIndex].videos.forEach((v, i) => {
          v.order = i + 1;
        });
        this.saveCourses(courses);
      }
    }
  },

  resetDatabase() {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(DEFAULT_USERS));
    localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(DEFAULT_COURSES));
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(DEFAULT_USERS[0]));
    return { users: DEFAULT_USERS, courses: DEFAULT_COURSES, currentUser: DEFAULT_USERS[0] };
  }
};
