import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { extractDriveFolderId, extractDriveFileId, isGoogleDriveUrl } from '../../utils/driveMapper';
import { 
  Plus, Trash, Edit, ArrowLeft, Play, Link, 
  ExternalLink, X, BookOpen, Film, Layers, ChevronRight
} from 'lucide-react';

export default function ContentCMS() {
  const { 
    courses, addCourse, updateCourse, deleteCourse, 
    addModule, updateModule, deleteModule,
    addVideo, updateVideo, deleteVideo 
  } = useApp();
  
  // Navigation State
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedModule, setSelectedModule] = useState(null);
  
  // Modals Visibility
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [showModuleModal, setShowModuleModal] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  
  // Course Form State
  const [courseEditId, setCourseEditId] = useState(null);
  const [courseTitle, setCourseTitle] = useState('');
  const [courseDesc, setCourseDesc] = useState('');
  const [courseCategory, setCourseCategory] = useState('ZDT Completo');
  const [coursePoster, setCoursePoster] = useState('');

  // Module Form State
  const [moduleEditId, setModuleEditId] = useState(null);
  const [moduleTitle, setModuleTitle] = useState('');
  const [moduleDesc, setModuleDesc] = useState('');
  const [moduleDriveUrl, setModuleDriveUrl] = useState('');

  // Video Form State
  const [videoEditId, setVideoEditId] = useState(null);
  const [videoTitle, setVideoTitle] = useState('');
  const [videoDesc, setVideoDesc] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [videoDriveUrl, setVideoDriveUrl] = useState('');
  const [videoDuration, setVideoDuration] = useState('10:00');

  // Submit Course Form (Level 1)
  const handleSubmitCourse = (e) => {
    e.preventDefault();
    if (!courseTitle || !courseDesc) {
      alert('Por favor llene los campos requeridos.');
      return;
    }

    const courseData = {
      title: courseTitle,
      description: courseDesc,
      category: courseCategory,
      posterUrl: coursePoster || 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=600&q=80',
    };

    if (courseEditId) {
      updateCourse(courseEditId, courseData);
    } else {
      addCourse(courseData);
    }

    // Reset Form
    setCourseEditId(null);
    setCourseTitle('');
    setCourseDesc('');
    setCoursePoster('');
    setShowCourseModal(false);
  };

  // Submit Module Form (Level 2)
  const handleSubmitModule = (e) => {
    e.preventDefault();
    if (!moduleTitle) {
      alert('El título es requerido.');
      return;
    }

    const moduleData = {
      title: moduleTitle,
      description: moduleDesc,
      driveUrl: moduleDriveUrl,
    };

    if (moduleEditId) {
      updateModule(selectedCourse.id, moduleEditId, moduleData);
    } else {
      addModule(selectedCourse.id, moduleData);
    }

    // Refresh Navigation Reference
    const latestCourse = courses.find(c => c.id === selectedCourse.id);
    if (latestCourse) setSelectedCourse(latestCourse);

    // Reset Form
    setModuleEditId(null);
    setModuleTitle('');
    setModuleDesc('');
    setModuleDriveUrl('');
    setShowModuleModal(false);
  };

  // Submit Video Form (Level 3)
  const handleSubmitVideo = (e) => {
    e.preventDefault();
    if (!videoTitle) {
      alert('El título es requerido.');
      return;
    }

    // Default direct link if nothing matches
    let finalUrl = videoUrl;
    if (!finalUrl && !videoDriveUrl) {
      finalUrl = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';
    }

    const videoData = {
      title: videoTitle,
      description: videoDesc,
      url: finalUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      driveUrl: videoDriveUrl,
      duration: videoDuration || '10:00',
      moduleTitle: selectedModule.title
    };

    if (videoEditId) {
      updateVideo(selectedCourse.id, selectedModule.id, videoEditId, videoData);
    } else {
      addVideo(selectedCourse.id, selectedModule.id, videoData);
    }

    // Refresh Navigation References
    const latestCourse = courses.find(c => c.id === selectedCourse.id);
    if (latestCourse) {
      setSelectedCourse(latestCourse);
      const latestModule = latestCourse.modules.find(m => m.id === selectedModule.id);
      if (latestModule) setSelectedModule(latestModule);
    }

    // Reset Form
    setVideoEditId(null);
    setVideoTitle('');
    setVideoDesc('');
    setVideoUrl('');
    setVideoDriveUrl('');
    setVideoDuration('10:00');
    setShowVideoModal(false);
  };

  // Edit Triggers
  const handleEditCourseClick = (course) => {
    setCourseEditId(course.id);
    setCourseTitle(course.title);
    setCourseDesc(course.description);
    setCourseCategory(course.category);
    setCoursePoster(course.posterUrl);
    setShowCourseModal(true);
  };

  const handleEditModuleClick = (mod) => {
    setModuleEditId(mod.id);
    setModuleTitle(mod.title);
    setModuleDesc(mod.description || '');
    setModuleDriveUrl(mod.driveUrl || '');
    setShowModuleModal(true);
  };

  const handleEditVideoClick = (video) => {
    setVideoEditId(video.id);
    setVideoTitle(video.title);
    setVideoDesc(video.description || '');
    setVideoUrl(video.url);
    setVideoDriveUrl(video.driveUrl || '');
    setVideoDuration(video.duration);
    setShowVideoModal(true);
  };

  // Breadcrumbs selector
  const handleBreadcrumbClick = (level) => {
    if (level === 'courses') {
      setSelectedCourse(null);
      setSelectedModule(null);
    } else if (level === 'modules') {
      setSelectedModule(null);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* 1. Breadcrumbs Navigation Header */}
      <div className="flex flex-wrap items-center gap-1.5 text-xs text-gray-500 font-bold bg-white/2 p-3 rounded-xl border border-white/5">
        <button 
          onClick={() => handleBreadcrumbClick('courses')}
          className="hover:text-brand-red transition-colors cursor-pointer"
        >
          CURSOS / SERIES VOD
        </button>
        
        {selectedCourse && (
          <>
            <ChevronRight className="w-3 h-3 text-gray-600" />
            <button
              onClick={() => handleBreadcrumbClick('modules')}
              className="text-gray-300 hover:text-brand-red transition-colors cursor-pointer uppercase"
            >
              {selectedCourse.title} (MÓDULOS)
            </button>
          </>
        )}

        {selectedModule && (
          <>
            <ChevronRight className="w-3 h-3 text-gray-600" />
            <span className="text-white uppercase font-black">
              {selectedModule.title} (CLASES)
            </span>
          </>
        )}
      </div>

      {/* 2. Content Views based on active drill-down level */}
      {selectedModule ? (
        /* ================= LEVEL 3: VIDEOS / CLASSES LIST ================= */
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[9px] uppercase font-bold tracking-widest bg-brand-cyan/10 border border-brand-cyan/20 text-brand-cyan px-2 py-0.5 rounded">
                  Módulo: {selectedModule.title}
                </span>
                <span className="text-xs text-gray-500 font-medium">Clases / Capítulos</span>
              </div>
              <h1 className="text-xl md:text-2xl font-black text-white uppercase tracking-wider mt-1">
                Administrar Clases
              </h1>
            </div>

            <button
              onClick={() => {
                setVideoEditId(null);
                setVideoTitle('');
                setVideoDesc('');
                setVideoUrl('');
                setVideoDriveUrl('');
                setVideoDuration('10:00');
                setShowVideoModal(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-brand-red hover:bg-brand-red-hover text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Añadir Video / Clase
            </button>
          </div>

          {/* Videos Checklist Table */}
          <div className="bg-brand-surface border border-white/5 rounded-2xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto custom-scrollbar">
              {selectedModule.videos.length === 0 ? (
                <div className="p-12 text-center text-xs text-gray-500 space-y-2">
                  <Film className="w-8 h-8 mx-auto text-gray-600 animate-pulse" />
                  <p>Este módulo no contiene clases todavía. ¡Añade la primera!</p>
                </div>
              ) : (
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="bg-black/20 text-gray-400 uppercase tracking-widest font-bold border-b border-white/5">
                      <th className="p-4 w-12 text-center">Orden</th>
                      <th className="p-4">Título del Video / Clase</th>
                      <th className="p-4">Duración</th>
                      <th className="p-4">Vínculos de Reproducción</th>
                      <th className="p-4 text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {selectedModule.videos.map((vid) => (
                      <tr key={vid.id} className="hover:bg-white/5 transition-colors">
                        <td className="p-4 text-center font-mono font-bold text-gray-400">
                          {vid.order}
                        </td>
                        <td className="p-4">
                          <div className="font-bold text-white text-xs">{vid.title}</div>
                          <div className="text-[10px] text-gray-500 mt-0.5 line-clamp-1 max-w-sm">
                            {vid.description}
                          </div>
                        </td>
                        <td className="p-4 font-semibold text-gray-300 font-mono">
                          {vid.duration}
                        </td>
                        <td className="p-4 space-y-1">
                          {vid.driveUrl ? (
                            <div className="flex items-center gap-1.5 text-brand-cyan text-[10px] font-semibold">
                              <Link className="w-3.5 h-3.5" />
                              <span className="truncate max-w-[160px]" title={vid.driveUrl}>
                                Drive Video
                              </span>
                              <a href={vid.driveUrl} target="_blank" rel="noreferrer">
                                <ExternalLink className="w-3 h-3 text-gray-500 hover:text-white" />
                              </a>
                            </div>
                          ) : null}
                          {vid.url && (
                            <div className="flex items-center gap-1.5 text-gray-400 text-[10px]">
                              <Play className="w-3.5 h-3.5 text-gray-500" />
                              <span className="truncate max-w-[160px]" title={vid.url}>
                                {vid.url.includes('google') ? 'Drive Directo' : 'Fallback / Muestra'}
                              </span>
                            </div>
                          )}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center justify-center gap-3">
                            <button
                              onClick={() => handleEditVideoClick(vid)}
                              className="p-1 hover:text-brand-cyan transition-colors cursor-pointer"
                              title="Editar video"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                if (window.confirm(`¿Seguro de eliminar la clase "${vid.title}"?`)) {
                                  deleteVideo(selectedCourse.id, selectedModule.id, vid.id);
                                  // Update references
                                  const c = courses.find(item => item.id === selectedCourse.id);
                                  if (c) {
                                    setSelectedCourse(c);
                                    const m = c.modules.find(item => item.id === selectedModule.id);
                                    if (m) setSelectedModule(m);
                                  }
                                }
                              }}
                              className="p-1 hover:text-brand-red transition-colors cursor-pointer"
                              title="Eliminar video"
                            >
                              <Trash className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      ) : selectedCourse ? (
        /* ================= LEVEL 2: MODULES / SEASONS LIST ================= */
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[9px] uppercase font-bold tracking-widest bg-brand-red/10 border border-brand-red/20 text-brand-red px-2 py-0.5 rounded">
                  Curso: {selectedCourse.title}
                </span>
                <span className="text-xs text-gray-500 font-medium">Módulos / Sub-cursos</span>
              </div>
              <h1 className="text-xl md:text-2xl font-black text-white uppercase tracking-wider mt-1">
                Estructura de Módulos
              </h1>
            </div>

            <button
              onClick={() => {
                setModuleEditId(null);
                setModuleTitle('');
                setModuleDesc('');
                setModuleDriveUrl('');
                setShowModuleModal(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-brand-red hover:bg-brand-red-hover text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Añadir Módulo / Temporada
            </button>
          </div>

          {/* Modules Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {selectedCourse.modules.map((mod) => (
              <div
                key={mod.id}
                className="bg-brand-surface border border-white/5 rounded-2xl p-5 flex flex-col justify-between shadow-lg space-y-4"
              >
                <div className="space-y-2">
                  <div className="flex justify-between items-start">
                    <h3 className="font-black text-white text-base truncate pr-4">{mod.title}</h3>
                    <Layers className="w-4 h-4 text-brand-cyan shrink-0" />
                  </div>
                  <p className="text-xs text-gray-400 line-clamp-3 leading-relaxed">
                    {mod.description || 'Sin descripción disponible.'}
                  </p>
                  
                  {mod.driveUrl && (
                    <div className="flex items-center gap-1.5 text-brand-cyan text-[10px] pt-1">
                      <Link className="w-3.5 h-3.5" />
                      <span className="truncate max-w-[200px]" title={mod.driveUrl}>
                        Carpeta Drive asociada
                      </span>
                    </div>
                  )}
                </div>

                <div className="pt-2 flex items-center gap-2">
                  <button
                    onClick={() => setSelectedModule(mod)}
                    className="flex-1 py-2 bg-brand-cyan/10 hover:bg-brand-cyan/20 text-brand-cyan border border-brand-cyan/20 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Film className="w-3.5 h-3.5" />
                    Clases / Videos ({mod.videos.length})
                  </button>

                  <button
                    onClick={() => handleEditModuleClick(mod)}
                    className="p-2 border border-white/10 hover:border-white/20 text-gray-400 hover:text-white rounded-xl transition-all cursor-pointer"
                    title="Editar Módulo"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm(`¿Seguro de eliminar el módulo "${mod.title}"? Se perderán todas sus clases.`)) {
                        deleteModule(selectedCourse.id, mod.id);
                        const latest = courses.find(c => c.id === selectedCourse.id);
                        if (latest) setSelectedCourse(latest);
                      }
                    }}
                    className="p-2 border border-white/10 hover:border-brand-red/30 text-gray-400 hover:text-brand-red rounded-xl transition-all cursor-pointer"
                    title="Eliminar Módulo"
                  >
                    <Trash className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* ================= LEVEL 1: COURSES / SERIES LIST ================= */
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            <div>
              <h1 className="text-xl md:text-2xl font-black text-white uppercase tracking-wider mb-1">
                Catálogo Principal (Series)
              </h1>
              <p className="text-xs text-gray-400">
                Administra los cursos principales o series. Haz clic en "Módulos" para ver sub-cursos o temporadas.
              </p>
            </div>

            <button
              onClick={() => {
                setCourseEditId(null);
                setCourseTitle('');
                setCourseDesc('');
                setCoursePoster('');
                setShowCourseModal(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-brand-red hover:bg-brand-red-hover text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Crear Nuevo Curso / Serie
            </button>
          </div>

          {/* Courses List Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => {
              // Count modules and total videos across all modules
              const modulesCount = course.modules ? course.modules.length : 0;
              const totalVids = course.modules 
                ? course.modules.reduce((acc, m) => acc + (m.videos ? m.videos.length : 0), 0)
                : 0;

              return (
                <div 
                  key={course.id}
                  className="bg-brand-surface border border-white/5 rounded-2xl overflow-hidden shadow-lg flex flex-col justify-between"
                >
                  <div className="h-40 w-full relative bg-black/40">
                    <img
                      src={course.posterUrl}
                      alt={course.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-brand-surface via-transparent to-transparent"></div>
                    <span className="absolute top-3 left-3 text-[9px] font-bold tracking-wider uppercase bg-brand-cyan/20 border border-brand-cyan/30 text-brand-cyan px-2.5 py-0.5 rounded-full">
                      {course.category}
                    </span>
                  </div>

                  <div className="p-5 space-y-2 flex-grow">
                    <h3 className="font-black text-white text-base truncate">{course.title}</h3>
                    <p className="text-xs text-gray-400 line-clamp-3 leading-relaxed">
                      {course.description}
                    </p>
                    <div className="pt-2 flex items-center justify-between text-[10px] text-gray-500 font-semibold">
                      <span className="flex items-center gap-1">
                        <Layers className="w-3.5 h-3.5" />
                        {modulesCount} Módulos
                      </span>
                      <span className="flex items-center gap-1">
                        <Film className="w-3.5 h-3.5" />
                        {totalVids} Clases Totales
                      </span>
                    </div>
                  </div>

                  <div className="px-5 pb-5 pt-2 flex items-center justify-between gap-2 border-t border-white/5 bg-black/10">
                    <button
                      onClick={() => setSelectedCourse(course)}
                      className="flex-grow py-2 bg-brand-cyan/10 hover:bg-brand-cyan/20 text-brand-cyan border border-brand-cyan/20 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      Módulos ({modulesCount})
                    </button>

                    <div className="flex gap-1.5">
                      <button
                        onClick={() => handleEditCourseClick(course)}
                        className="p-2.5 border border-white/10 hover:border-white/20 text-gray-400 hover:text-white rounded-xl transition-all cursor-pointer"
                        title="Editar Curso"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm(`¿Seguro de eliminar la serie "${course.title}"? Se borrarán todos sus módulos y videos.`)) {
                            deleteCourse(course.id);
                          }
                        }}
                        className="p-2.5 border border-white/10 hover:border-brand-red/30 text-gray-400 hover:text-brand-red rounded-xl transition-all cursor-pointer"
                        title="Eliminar Curso"
                      >
                        <Trash className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ================= MODAL FORMS LAYER ================= */}
      
      {/* Course Modal Form (Level 1) */}
      {showCourseModal && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
          <form 
            onSubmit={handleSubmitCourse}
            className="w-full max-w-md bg-brand-surface border border-white/10 rounded-2xl p-6 shadow-2xl space-y-4 relative"
          >
            <button 
              type="button"
              onClick={() => setShowCourseModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-sm uppercase font-bold text-white tracking-widest border-b border-white/5 pb-2">
              {courseEditId ? 'Editar Curso / Serie VOD' : 'Crear Nuevo Curso / Serie VOD'}
            </h3>

            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-gray-400">Título de la Serie</label>
              <input
                type="text"
                value={courseTitle}
                onChange={(e) => setCourseTitle(e.target.value)}
                placeholder="Ej. ZDT Completo o Física General"
                className="w-full p-2.5 bg-black/30 border border-white/5 rounded-xl text-xs text-white focus:border-brand-red/50 outline-none"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-gray-400">Categoría</label>
              <select
                value={courseCategory}
                onChange={(e) => setCourseCategory(e.target.value)}
                className="w-full p-2.5 bg-black/30 border border-white/5 rounded-xl text-xs text-white focus:border-brand-red/50 outline-none"
              >
                <option value="VOD Series">VOD Series</option>
                <option value="Cursos Libres">Cursos Libres</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-gray-400">URL del Poster</label>
              <input
                type="url"
                value={coursePoster}
                onChange={(e) => setCoursePoster(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full p-2.5 bg-black/30 border border-white/5 rounded-xl text-xs text-white focus:border-brand-red/50 outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-gray-400">Descripción General</label>
              <textarea
                value={courseDesc}
                onChange={(e) => setCourseDesc(e.target.value)}
                rows="4"
                className="w-full p-2.5 bg-black/30 border border-white/5 rounded-xl text-xs text-white focus:border-brand-red/50 outline-none resize-none"
                required
              ></textarea>
            </div>

            <div className="pt-4 flex gap-3">
              <button
                type="button"
                onClick={() => setShowCourseModal(false)}
                className="flex-1 py-2.5 border border-white/10 text-gray-300 hover:text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 bg-brand-red hover:bg-brand-red-hover text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Guardar Serie
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Module Modal Form (Level 2) */}
      {showModuleModal && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
          <form 
            onSubmit={handleSubmitModule}
            className="w-full max-w-md bg-brand-surface border border-white/10 rounded-2xl p-6 shadow-2xl space-y-4 relative"
          >
            <button 
              type="button"
              onClick={() => setShowModuleModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-sm uppercase font-bold text-white tracking-widest border-b border-white/5 pb-2">
              {moduleEditId ? 'Editar Módulo' : 'Añadir Módulo / Temporada'}
            </h3>

            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-gray-400">Título del Módulo</label>
              <input
                type="text"
                value={moduleTitle}
                onChange={(e) => setModuleTitle(e.target.value)}
                placeholder="Ej. Cripto Monedas o Finanzas"
                className="w-full p-2.5 bg-black/30 border border-white/5 rounded-xl text-xs text-white focus:border-brand-red/50 outline-none"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-gray-400">Carpeta Google Drive (Asociada)</label>
              <input
                type="text"
                value={moduleDriveUrl}
                onChange={(e) => setModuleDriveUrl(e.target.value)}
                placeholder="https://drive.google.com/drive/folders/ID"
                className="w-full p-2.5 bg-black/30 border border-white/5 rounded-xl text-xs text-brand-cyan focus:border-brand-red/50 outline-none placeholder-gray-600"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-gray-400">Descripción del Módulo</label>
              <textarea
                value={moduleDesc}
                onChange={(e) => setModuleDesc(e.target.value)}
                rows="3"
                className="w-full p-2.5 bg-black/30 border border-white/5 rounded-xl text-xs text-white focus:border-brand-red/50 outline-none resize-none"
              ></textarea>
            </div>

            <div className="pt-4 flex gap-3">
              <button
                type="button"
                onClick={() => setShowModuleModal(false)}
                className="flex-1 py-2.5 border border-white/10 text-gray-300 hover:text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 bg-brand-red hover:bg-brand-red-hover text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Guardar Módulo
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Video Modal Form (Level 3) */}
      {showVideoModal && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
          <form 
            onSubmit={handleSubmitVideo}
            className="w-full max-w-md bg-brand-surface border border-white/10 rounded-2xl p-6 shadow-2xl space-y-4 relative"
          >
            <button 
              type="button"
              onClick={() => setShowVideoModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-sm uppercase font-bold text-white tracking-widest border-b border-white/5 pb-2">
              {videoEditId ? 'Editar Video / Clase' : 'Añadir Video / Clase'}
            </h3>

            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-gray-400">Título de la Clase</label>
              <input
                type="text"
                value={videoTitle}
                onChange={(e) => setVideoTitle(e.target.value)}
                placeholder="Ej. Introducción al Análisis Técnico"
                className="w-full p-2.5 bg-black/30 border border-white/5 rounded-xl text-xs text-white focus:border-brand-red/50 outline-none"
                required
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-2 space-y-1">
                <label className="text-[10px] uppercase font-bold text-gray-400">Google Drive URL (Archivo o Carpeta)</label>
                <input
                  type="text"
                  value={videoDriveUrl}
                  onChange={(e) => setVideoDriveUrl(e.target.value)}
                  placeholder="https://drive.google.com/..."
                  className="w-full p-2.5 bg-black/30 border border-white/5 rounded-xl text-xs text-brand-cyan focus:border-brand-red/50 outline-none placeholder-gray-600"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-gray-400">Duración</label>
                <input
                  type="text"
                  value={videoDuration}
                  onChange={(e) => setVideoDuration(e.target.value)}
                  placeholder="Ej. 12:45"
                  className="w-full p-2.5 bg-black/30 border border-white/5 rounded-xl text-xs text-white focus:border-brand-red/50 outline-none"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-gray-400">URL Fallback Directo (.mp4 opcional)</label>
              <input
                type="url"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://.../bunny.mp4"
                className="w-full p-2.5 bg-black/30 border border-white/5 rounded-xl text-xs text-white focus:border-brand-red/50 outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-gray-400">Resumen / Descripción corta</label>
              <textarea
                value={videoDesc}
                onChange={(e) => setVideoDesc(e.target.value)}
                rows="3"
                className="w-full p-2.5 bg-black/30 border border-white/5 rounded-xl text-xs text-white focus:border-brand-red/50 outline-none resize-none"
              ></textarea>
            </div>

            <div className="pt-4 flex gap-3">
              <button
                type="button"
                onClick={() => setShowVideoModal(false)}
                className="flex-1 py-2.5 border border-white/10 text-gray-300 hover:text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 bg-brand-red hover:bg-brand-red-hover text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Guardar Clase
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
