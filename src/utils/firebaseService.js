import { auth, db } from './firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  sendPasswordResetEmail
} from 'firebase/auth';
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  arrayUnion, 
  query 
} from 'firebase/firestore';

// Default Courses with Videos mapping to user's Drive folder structure
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
          },
          {
            id: 'vid-zdt-c3',
            title: '3. Guía PDF: Conceptos Clave de Criptomonedas',
            description: 'Material complementario en formato PDF para repasar los conceptos fundamentales de criptoactivos.',
            url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
            driveUrl: '',
            duration: 'PDF Doc',
            order: 3
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

// Preset Accounts for dynamic simulation registration on-the-fly
const PRESET_ACCOUNTS = {
  'admin@skillprime.com': {
    name: 'Super Admin',
    role: 'admin',
    status: 'active',
    startDate: '2026-07-01',
    endDate: '2027-07-01'
  },
  'juan.perez@email.com': {
    name: 'Juan Pérez',
    role: 'user',
    status: 'active',
    startDate: '2026-07-01',
    endDate: '2026-08-30'
  },
  'maria.lopez@email.com': {
    name: 'María López',
    role: 'user',
    status: 'expiring',
    startDate: '2026-06-25',
    endDate: '2026-07-26'
  },
  'carlos.ruiz@email.com': {
    name: 'Carlos Ruiz',
    role: 'user',
    status: 'inactive',
    startDate: '2026-05-01',
    endDate: '2026-06-01'
  }
};

export const firebaseService = {
  // SEEDER
  async seedDatabaseIfEmpty() {
    try {
      // 1. Seed courses
      const coursesSnap = await getDocs(collection(db, 'courses'));
      if (coursesSnap.empty) {
        console.log('Firestore courses collection is empty. Seeding defaults...');
        for (const course of DEFAULT_COURSES) {
          await setDoc(doc(db, 'courses', course.id), course);
        }
      }
      
      // 2. Seed settings
      const settingsRef = doc(db, 'settings', 'global');
      const settingsSnap = await getDoc(settingsRef);
      if (!settingsSnap.exists()) {
        console.log('Firestore settings document is empty. Seeding defaults...');
        await setDoc(settingsRef, {
          trialDays: 5,
          paymentLinkMonthly: 'https://buy.stripe.com/mock_monthly_skill_prime',
          paymentLinkYearly: 'https://buy.stripe.com/mock_yearly_skill_prime'
        });
      }
    } catch (e) {
      console.error('Error seeding Firestore:', e);
    }
  },

  // AUTHENTICATION
  async signIn(email, password) {
    const cleanEmail = email.trim().toLowerCase();
    try {
      // A. Check Firestore for custom simulation password overrides first
      const usersSnap = await getDocs(collection(db, 'users'));
      let matchedProfile = null;
      let matchedDocId = null;
      usersSnap.forEach((doc) => {
        const uData = doc.data();
        if (uData.email === cleanEmail) {
          matchedProfile = uData;
          matchedDocId = doc.id;
        }
      });

      if (matchedProfile && matchedProfile.simulatedPassword && password === matchedProfile.simulatedPassword) {
        console.warn(`Sign-in simulation override matched for: ${cleanEmail}`);
        return { uid: matchedDocId, ...matchedProfile };
      }

      // B. Standard Firebase Authentication flow
      const userCredential = await signInWithEmailAndPassword(auth, cleanEmail, password);
      const uid = userCredential.user.uid;
      
      // Fetch Firestore profile
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        return { uid, ...userDoc.data() };
      } else {
        // Create basic profile if Auth exists but Firestore document doesn't
        const basicData = {
          name: cleanEmail.split('@')[0],
          email: cleanEmail,
          role: 'user',
          status: 'active',
          startDate: new Date().toISOString().split('T')[0],
          endDate: new Date(Date.now() + 30*24*60*60*1000).toISOString().split('T')[0],
          accessHistory: []
        };
        await setDoc(doc(db, 'users', uid), basicData);
        return { uid, ...basicData };
      }
    } catch (error) {
      // 2. Dynamic simulation signup: If user doesn't exist, check if it's a preset account
      if (
        (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') &&
        PRESET_ACCOUNTS[cleanEmail]
      ) {
        console.log(`Preset account ${cleanEmail} not registered in Auth. Creating now...`);
        try {
          // Use password provided or default
          const signupCredential = await createUserWithEmailAndPassword(auth, cleanEmail, password);
          const uid = signupCredential.user.uid;
          
          const profile = {
            ...PRESET_ACCOUNTS[cleanEmail],
            email: cleanEmail,
            accessHistory: []
          };
          
          // Write to Firestore
          await setDoc(doc(db, 'users', uid), profile);
          return { uid, ...profile };
        } catch (signupError) {
          throw signupError;
        }
      }
      throw error;
    }
  },

  async signOut() {
    await signOut(auth);
  },

  async sendPasswordReset(email) {
    await sendPasswordResetEmail(auth, email.trim().toLowerCase());
  },

  onAuthChanged(callback) {
    return onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Fetch Firestore profile
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        if (userDoc.exists()) {
          callback({ uid: firebaseUser.uid, ...userDoc.data() });
        } else {
          callback(null);
        }
      } else {
        callback(null);
      }
    });
  },

  // REALTIME LISTENERS
  subscribeToCourses(callback) {
    this.seedDatabaseIfEmpty(); // trigger seed check
    const q = collection(db, 'courses');
    return onSnapshot(q, (snapshot) => {
      const coursesList = [];
      snapshot.forEach((doc) => {
        coursesList.push({ id: doc.id, ...doc.data() });
      });
      callback(coursesList);
    }, (error) => {
      console.error("Courses snapshot error:", error);
    });
  },

  subscribeToUsers(callback) {
    const q = collection(db, 'users');
    return onSnapshot(q, (snapshot) => {
      const usersList = [];
      snapshot.forEach((doc) => {
        usersList.push({ id: doc.id, ...doc.data() });
      });
      callback(usersList);
    }, (error) => {
      console.error("Users snapshot error:", error);
    });
  },

  subscribeToSettings(callback) {
    this.seedDatabaseIfEmpty();
    const settingsRef = doc(db, 'settings', 'global');
    return onSnapshot(settingsRef, (docSnap) => {
      if (docSnap.exists()) {
        callback(docSnap.data());
      } else {
        callback({
          trialDays: 5,
          paymentLinkMonthly: 'https://buy.stripe.com/mock_monthly_skill_prime',
          paymentLinkYearly: 'https://buy.stripe.com/mock_yearly_skill_prime'
        });
      }
    }, (error) => {
      console.error("Settings snapshot error:", error);
    });
  },

  async saveSettings(settingsData) {
    const settingsRef = doc(db, 'settings', 'global');
    await setDoc(settingsRef, settingsData, { merge: true });
  },

  // SUBSCRIBERS CRUD
  async saveUser(userId, userData) {
    await setDoc(doc(db, 'users', userId), userData, { merge: true });
  },

  async createUserInFirestore(userData) {
    // Fetch settings to know how many trial days to assign
    let trialDays = 5;
    try {
      const settingsSnap = await getDoc(doc(db, 'settings', 'global'));
      if (settingsSnap.exists()) {
        trialDays = Number(settingsSnap.data().trialDays) || 5;
      }
    } catch (e) {
      console.error('Error fetching settings for new user:', e);
    }

    const start = new Date();
    const end = new Date();
    end.setDate(end.getDate() + trialDays);

    const calculatedStartDate = userData.startDate || start.toISOString().split('T')[0];
    const calculatedEndDate = userData.endDate || end.toISOString().split('T')[0];

    const tempId = `temp-user-${Date.now()}`;
    await setDoc(doc(db, 'users', tempId), {
      id: tempId,
      accessHistory: [],
      startDate: calculatedStartDate,
      endDate: calculatedEndDate,
      ...userData
    });
    return tempId;
  },

  async deleteUser(userId) {
    await deleteDoc(doc(db, 'users', userId));
  },

  async addAccessLog(userId, logItem) {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    if (userDoc.exists()) {
      const history = userDoc.data().accessHistory || [];
      history.unshift({
        timestamp: new Date().toISOString(),
        ...logItem
      });
      await updateDoc(userRef, { accessHistory: history });
    }
  },

  // COURSES / SERIES CRUD
  async saveCourse(courseId, courseData) {
    await setDoc(doc(db, 'courses', courseId), courseData, { merge: true });
  },

  async deleteCourse(courseId) {
    await deleteDoc(doc(db, 'courses', courseId));
  },

  // MODULES CRUD
  async addModule(courseId, moduleData) {
    const courseRef = doc(db, 'courses', courseId);
    const courseSnap = await getDoc(courseRef);
    if (courseSnap.exists()) {
      const course = courseSnap.data();
      const modules = course.modules || [];
      const newModule = {
        id: `mod-${Date.now()}`,
        videos: [],
        ...moduleData
      };
      modules.push(newModule);
      await updateDoc(courseRef, { modules });
      return newModule;
    }
    return null;
  },

  async updateModule(courseId, moduleId, updatedFields) {
    const courseRef = doc(db, 'courses', courseId);
    const courseSnap = await getDoc(courseRef);
    if (courseSnap.exists()) {
      const course = courseSnap.data();
      const modules = course.modules || [];
      const idx = modules.findIndex(m => m.id === moduleId);
      if (idx !== -1) {
        modules[idx] = { ...modules[idx], ...updatedFields };
        await updateDoc(courseRef, { modules });
        return modules[idx];
      }
    }
    return null;
  },

  async deleteModule(courseId, moduleId) {
    const courseRef = doc(db, 'courses', courseId);
    const courseSnap = await getDoc(courseRef);
    if (courseSnap.exists()) {
      const course = courseSnap.data();
      const modules = (course.modules || []).filter(m => m.id !== moduleId);
      await updateDoc(courseRef, { modules });
    }
  },

  // VIDEOS / CLASSES CRUD
  async addVideo(courseId, moduleId, videoData) {
    const courseRef = doc(db, 'courses', courseId);
    const courseSnap = await getDoc(courseRef);
    if (courseSnap.exists()) {
      const course = courseSnap.data();
      const modules = course.modules || [];
      const mIdx = modules.findIndex(m => m.id === moduleId);
      if (mIdx !== -1) {
        const videos = modules[mIdx].videos || [];
        const newVideo = {
          id: `vid-${Date.now()}`,
          order: videos.length + 1,
          ...videoData
        };
        videos.push(newVideo);
        modules[mIdx].videos = videos;
        await updateDoc(courseRef, { modules });
        return newVideo;
      }
    }
    return null;
  },

  async updateVideo(courseId, moduleId, videoId, updatedFields) {
    const courseRef = doc(db, 'courses', courseId);
    const courseSnap = await getDoc(courseRef);
    if (courseSnap.exists()) {
      const course = courseSnap.data();
      const modules = course.modules || [];
      const mIdx = modules.findIndex(m => m.id === moduleId);
      if (mIdx !== -1) {
        const videos = modules[mIdx].videos || [];
        const vIdx = videos.findIndex(v => v.id === videoId);
        if (vIdx !== -1) {
          videos[vIdx] = { ...videos[vIdx], ...updatedFields };
          modules[mIdx].videos = videos;
          await updateDoc(courseRef, { modules });
          return videos[vIdx];
        }
      }
    }
    return null;
  },

  async deleteVideo(courseId, moduleId, videoId) {
    const courseRef = doc(db, 'courses', courseId);
    const courseSnap = await getDoc(courseRef);
    if (courseSnap.exists()) {
      const course = courseSnap.data();
      const modules = course.modules || [];
      const mIdx = modules.findIndex(m => m.id === moduleId);
      if (mIdx !== -1) {
        let videos = modules[mIdx].videos || [];
        videos = videos.filter(v => v.id !== videoId);
        // Re-order
        videos.forEach((v, i) => v.order = i + 1);
        modules[mIdx].videos = videos;
        await updateDoc(courseRef, { modules });
      }
    }
  }
};
