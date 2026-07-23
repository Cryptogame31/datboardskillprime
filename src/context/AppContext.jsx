import React, { createContext, useContext, useState, useEffect } from 'react';
import { firebaseService } from '../utils/firebaseService';

const AppContext = createContext();

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null); // Authenticated Firebase user document
  const [userRole, setUserRole] = useState('user'); // admin or user
  const [authLoading, setAuthLoading] = useState(true);
  
  const [users, setUsers] = useState([]); // All subscribers from Firestore
  const [courses, setCourses] = useState([]); // All courses from Firestore
  const [settings, setSettings] = useState({ trialDays: 5, paymentLinkMonthly: '', paymentLinkYearly: '' });
  
  const [activeVideo, setActiveVideo] = useState(null);
  const [activeCourse, setActiveCourse] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // 1. Auth Listener
  useEffect(() => {
    const unsubscribeAuth = firebaseService.onAuthChanged((userProfile) => {
      if (userProfile) {
        setUser(userProfile);
        setUserRole(userProfile.role || 'user');
      } else {
        setUser(null);
        setUserRole('user');
      }
      setAuthLoading(false);
    });

    return () => unsubscribeAuth();
  }, []);

  // 2. Real-time Firestore Listeners (only when authenticated)
  useEffect(() => {
    const currentUid = user?.uid;
    if (!currentUid) {
      setUsers([]);
      setCourses([]);
      return;
    }

    const unsubscribeCourses = firebaseService.subscribeToCourses((coursesList) => {
      setCourses(coursesList);
    });

    const unsubscribeUsers = firebaseService.subscribeToUsers((usersList) => {
      setUsers(usersList);
      
      // Keep active user object updated if details change
      const currentLatest = usersList.find(u => u.id === currentUid || u.uid === currentUid);
      if (currentLatest) {
        setUser(prev => {
          // Safely compare fields to avoid infinite cycles
          if (prev && 
              prev.status === currentLatest.status && 
              prev.endDate === currentLatest.endDate && 
              (prev.accessHistory || []).length === (currentLatest.accessHistory || []).length) {
            return prev;
          }
          return { ...prev, ...currentLatest };
        });
      }
    });

    const unsubscribeSettings = firebaseService.subscribeToSettings((settingsData) => {
      setSettings(settingsData);
    });

    return () => {
      unsubscribeCourses();
      unsubscribeUsers();
      unsubscribeSettings();
    };
  }, [user?.uid]);

  // LOGIN SUCCESS HANDLER
  const handleLoginSuccess = (authenticatedUser) => {
    setUser(authenticatedUser);
    setUserRole(authenticatedUser.role || 'user');
  };

  const handleLogout = async () => {
    setActiveVideo(null);
    setActiveCourse(null);
    await firebaseService.signOut();
  };

  const handleSwitchRole = (role) => {
    // Simulator switcher override
    setUserRole(role);
  };

  // SUBSCRIBER MANAGEMENT (Firestore writes)
  const addSubscriber = async (newUserData) => {
    // Generates a mock registration in Firestore. 
    // They will be registered in Auth dynamically upon first login attempt.
    await firebaseService.createUserInFirestore(newUserData);
  };

  const updateSubscriber = async (id, fields) => {
    // Find doc key (ID or UID)
    const userDoc = users.find(u => u.id === id || u.uid === id);
    if (userDoc) {
      await firebaseService.saveUser(userDoc.id || id, fields);
    }
  };

  const deleteSubscriber = async (id) => {
    await firebaseService.deleteUser(id);
  };

  // Session simulator for development switcher dropdown
  const changeCurrentUserSession = (userId) => {
    const selected = users.find(u => u.id === userId || u.uid === userId);
    if (selected) {
      // In simulator, we swap the active profile details to test locks
      setUser(prev => ({ ...prev, ...selected }));
    }
  };

  // COURSE / SERIES MANAGEMENT (Firestore writes)
  const handleAddCourse = async (courseData) => {
    const newId = `course-${Date.now()}`;
    await firebaseService.saveCourse(newId, {
      id: newId,
      modules: [],
      ...courseData
    });
  };

  const handleUpdateCourse = async (id, fields) => {
    await firebaseService.saveCourse(id, fields);
  };

  const handleDeleteCourse = async (id) => {
    await firebaseService.deleteCourse(id);
  };

  // MODULE MANAGEMENT (Firestore writes)
  const handleAddModule = async (courseId, moduleData) => {
    await firebaseService.addModule(courseId, moduleData);
  };

  const handleUpdateModule = async (courseId, moduleId, fields) => {
    await firebaseService.updateModule(courseId, moduleId, fields);
  };

  const handleDeleteModule = async (courseId, moduleId) => {
    await firebaseService.deleteModule(courseId, moduleId);
  };

  // VIDEO / CHAPTER MANAGEMENT (Firestore writes)
  const handleAddVideo = async (courseId, moduleId, videoData) => {
    await firebaseService.addVideo(courseId, moduleId, videoData);
  };

  const handleUpdateVideo = async (courseId, moduleId, videoId, fields) => {
    await firebaseService.updateVideo(courseId, moduleId, videoId, fields);
  };

  const handleDeleteVideo = async (courseId, moduleId, videoId) => {
    await firebaseService.deleteVideo(courseId, moduleId, videoId);
  };

  // VIDEO PLAYBACK LOGGING
  const handlePlayVideo = async (video, course) => {
    setActiveVideo(video);
    setActiveCourse(course);
    
    // Save access log to Firestore
    if (user && user.uid) {
      await firebaseService.addAccessLog(user.uid, {
        videoTitle: video.title,
        courseName: `${course.title} - ${video.moduleTitle || ''}`
      });
    }
  };

  const handleCloseVideo = () => {
    setActiveVideo(null);
    setActiveCourse(null);
  };

  const handleUpdateSettings = async (newSettings) => {
    await firebaseService.saveSettings(newSettings);
  };

  const value = {
    user,
    userRole,
    setUserRole: handleSwitchRole,
    authLoading,
    users,
    courses,
    settings,
    updateSettings: handleUpdateSettings,
    currentUser: user, // Alias user profile as currentUser to prevent refactoring catalog files
    setCurrentUser: changeCurrentUserSession,
    activeVideo,
    activeCourse,
    playVideo: handlePlayVideo,
    closeVideo: handleCloseVideo,
    searchQuery,
    setSearchQuery,
    addSubscriber,
    updateSubscriber,
    deleteSubscriber,
    addCourse: handleAddCourse,
    updateCourse: handleUpdateCourse,
    deleteCourse: handleDeleteCourse,
    addModule: handleAddModule,
    updateModule: handleUpdateModule,
    deleteModule: handleDeleteModule,
    addVideo: handleAddVideo,
    updateVideo: handleUpdateVideo,
    deleteVideo: handleDeleteVideo,
    loginSuccess: handleLoginSuccess,
    logout: handleLogout,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};
