import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Play, Info, Film, Eye, X, BookOpen, Clock, AlertTriangle, Layers, Folder, ChevronRight, ChevronDown } from 'lucide-react';

export default function Catalog() {
  const { courses, playVideo, searchQuery, currentUser } = useApp();
  const [selectedCourse, setSelectedCourse] = useState(null);
  
  // Track which module is expanded in the details modal accordion
  const [expandedModuleId, setExpandedModuleId] = useState(null);

  // Featured Course for Hero
  const featuredCourse = courses.find(c => c.id === 'course-zdt') || courses[0];

  // Group by category (e.g. VOD Series)
  const categories = [...new Set(courses.map(c => c.category))];

  const isSearching = searchQuery.trim().length > 0;
  
  // Search filtering across Courses, Modules, and Videos
  const filteredCourses = courses.filter(c => 
    c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.modules.some(m => 
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.videos.some(v => v.title.toLowerCase().includes(searchQuery.toLowerCase()))
    )
  );

  const handlePlayFeatured = () => {
    if (featuredCourse && featuredCourse.modules.length > 0 && featuredCourse.modules[0].videos.length > 0) {
      playVideo(featuredCourse.modules[0].videos[0], featuredCourse);
    } else if (featuredCourse && featuredCourse.modules.length > 0 && featuredCourse.modules[0].driveUrl) {
      // If module has no videos but has folder drive link, play the folder embed!
      playVideo({
        id: featuredCourse.modules[0].id,
        title: `Carpeta: ${featuredCourse.modules[0].title}`,
        description: featuredCourse.modules[0].description,
        driveUrl: featuredCourse.modules[0].driveUrl,
        url: ''
      }, featuredCourse);
    } else {
      alert('Este curso no tiene contenidos cargados.');
    }
  };

  const handlePlayVideo = (video, course, moduleTitle) => {
    playVideo({ ...video, moduleTitle }, course);
    setSelectedCourse(null);
  };

  const handlePlayFolder = (mod, course) => {
    // Treat the entire folder as a video item to play in embeddedfolderview
    playVideo({
      id: mod.id,
      title: `Carpeta: ${mod.title}`,
      description: mod.description || 'Vista previa de carpeta de Google Drive.',
      driveUrl: mod.driveUrl,
      url: '',
      moduleTitle: mod.title
    }, course);
    setSelectedCourse(null);
  };

  const toggleModuleExpand = (modId) => {
    setExpandedModuleId(expandedModuleId === modId ? null : modId);
  };

  const handleCourseClick = (course) => {
    setSelectedCourse(course);
    // Expand the first module by default
    if (course.modules && course.modules.length > 0) {
      setExpandedModuleId(course.modules[0].id);
    } else {
      setExpandedModuleId(null);
    }
  };

  return (
    <div className="pb-24 animate-fade-in">
      {/* Access alert if subscription is expiring soon */}
      {currentUser?.status === 'expiring' && (
        <div className="mx-6 md:mx-12 mt-6 p-4 bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 rounded-2xl flex items-center gap-3 text-xs md:text-sm">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <div>
            Tu suscripción vence el <span className="font-bold">{currentUser.endDate}</span>. Renueva pronto en el panel de simulación (esquina inferior derecha) para no perder acceso.
          </div>
        </div>
      )}

      {isSearching ? (
        /* Search Results Grid */
        <div className="px-6 md:px-12 pt-8 space-y-6">
          <div>
            <span className="text-[10px] uppercase font-bold text-brand-cyan tracking-widest">Búsqueda</span>
            <h2 className="text-xl md:text-2xl font-black text-white uppercase mt-0.5">
              Resultados para "{searchQuery}"
            </h2>
            <p className="text-xs text-gray-500 font-medium">
              Encontrados {filteredCourses.length} cursos que coinciden
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredCourses.map(course => (
              <div
                key={course.id}
                onClick={() => handleCourseClick(course)}
                className="bg-brand-surface border border-white/5 rounded-2xl overflow-hidden shadow-xl cursor-pointer scale-on-hover animate-fade-in"
              >
                <div className="h-40 w-full relative">
                  <img src={course.posterUrl} alt={course.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-surface to-transparent"></div>
                </div>
                <div className="p-4 space-y-1">
                  <span className="text-[9px] uppercase font-bold tracking-widest text-brand-cyan">
                    {course.category}
                  </span>
                  <h3 className="font-bold text-white truncate text-sm">{course.title}</h3>
                  <p className="text-xs text-gray-400 line-clamp-2">{course.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Normal Cinematic Catalog Home */
        <div className="space-y-12">
          {/* Hero Featured Banner */}
          {featuredCourse && (
            <div className="relative w-full h-[55vh] md:h-[70vh] flex items-end">
              <div className="absolute inset-0 z-0">
                <img
                  src={featuredCourse.posterUrl}
                  alt={featuredCourse.title}
                  className="w-full h-full object-cover opacity-60"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-brand-dark/45 to-transparent"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-brand-dark via-brand-dark/30 to-transparent"></div>
              </div>

              <div className="relative z-10 px-6 md:px-12 pb-10 md:pb-16 max-w-2xl space-y-4">
                <span className="px-3 py-1 bg-brand-cyan/20 border border-brand-cyan/30 text-brand-cyan rounded-full text-[10px] font-black uppercase tracking-widest inline-block">
                  SERIE DESTACADA: {featuredCourse.title}
                </span>
                
                <h1 className="text-3xl md:text-5xl font-black text-white tracking-tighter leading-none uppercase">
                  {featuredCourse.title}
                </h1>
                
                <p className="text-sm md:text-base text-gray-300 leading-relaxed line-clamp-3">
                  {featuredCourse.description}
                </p>

                <div className="flex flex-wrap gap-4 pt-2">
                  <button
                    onClick={handlePlayFeatured}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-white hover:bg-brand-red hover:text-white text-brand-dark font-black rounded-xl text-xs md:text-sm uppercase tracking-wider transition-all shadow-lg hover:shadow-brand-red/35 cursor-pointer"
                  >
                    <Play className="w-4.5 h-4.5 fill-current" />
                    Reproducir Módulo 1
                  </button>
                  
                  <button
                    onClick={() => handleCourseClick(featuredCourse)}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/10 text-white font-bold rounded-xl text-xs md:text-sm uppercase tracking-wider transition-all cursor-pointer backdrop-blur-sm"
                  >
                    <Info className="w-4.5 h-4.5" />
                    Ver Módulos
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Horizontal Category Carousels */}
          <div className="space-y-10 px-6 md:px-12">
            {categories.map((category) => {
              const categoryCourses = courses.filter(c => c.category === category);
              if (categoryCourses.length === 0) return null;

              return (
                <div key={category} className="space-y-4">
                  <h2 className="text-base md:text-lg font-black text-white uppercase tracking-wider border-l-3 border-brand-red pl-3">
                    {category}
                  </h2>

                  <div className="flex gap-6 overflow-x-auto pb-4 pt-1 no-scrollbar custom-scrollbar scroll-smooth">
                    {categoryCourses.map((course) => {
                      const totalChapters = course.modules ? course.modules.reduce((sum, m) => sum + (m.videos ? m.videos.length : 0), 0) : 0;
                      return (
                        <div
                          key={course.id}
                          onClick={() => handleCourseClick(course)}
                          className="w-64 md:w-72 shrink-0 bg-brand-surface border border-white/5 rounded-2xl overflow-hidden shadow-lg cursor-pointer scale-on-hover relative group/card"
                        >
                          <div className="h-36 md:h-40 relative bg-black/30">
                            <img
                              src={course.posterUrl}
                              alt={course.title}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-brand-surface via-transparent to-transparent"></div>
                            
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-opacity duration-300">
                              <div className="p-3 bg-brand-red text-white rounded-full shadow-lg transform scale-90 group-hover/card:scale-100 transition-all duration-300">
                                <Play className="w-6 h-6 fill-white ml-0.5" />
                              </div>
                            </div>
                          </div>

                          <div className="p-4 space-y-1">
                            <h3 className="font-bold text-white text-xs truncate tracking-wide">
                              {course.title}
                            </h3>
                            <p className="text-[10px] text-gray-400 line-clamp-2 leading-relaxed font-medium">
                              {course.description}
                            </p>
                            <div className="pt-2 flex items-center justify-between text-[9px] text-gray-500 font-bold">
                              <span className="flex items-center gap-1">
                                <Layers className="w-3.5 h-3.5" />
                                {course.modules.length} Módulos
                              </span>
                              <span className="flex items-center gap-1">
                                <Film className="w-3.5 h-3.5" />
                                {totalChapters} Clases
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Course Detail Drawer / Modal (with Accordion Modules) */}
      {selectedCourse && (
        <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-2xl bg-brand-surface border border-white/10 rounded-3xl overflow-hidden shadow-2xl relative max-h-[85vh] flex flex-col">
            
            <button 
              onClick={() => setSelectedCourse(null)}
              className="absolute top-4 right-4 z-20 p-2 bg-black/60 hover:bg-black text-gray-400 hover:text-white rounded-full transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header Poster */}
            <div className="h-48 md:h-52 w-full relative shrink-0">
              <img 
                src={selectedCourse.posterUrl} 
                alt={selectedCourse.title} 
                className="w-full h-full object-cover" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-surface via-brand-surface/40 to-transparent"></div>
              
              <div className="absolute bottom-4 left-6 right-6">
                <span className="text-[9px] uppercase font-bold bg-brand-cyan/20 border border-brand-cyan/30 text-brand-cyan px-2.5 py-0.5 rounded-full inline-block mb-1">
                  {selectedCourse.category}
                </span>
                <h2 className="text-xl md:text-2xl font-black text-white uppercase truncate">
                  {selectedCourse.title}
                </h2>
              </div>
            </div>

            {/* Scrollable Accordion Content */}
            <div className="p-6 overflow-y-auto custom-scrollbar flex-grow space-y-6">
              {/* Description */}
              <div className="space-y-1">
                <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Sinopsis de la Serie</h4>
                <p className="text-xs md:text-sm text-gray-300 leading-relaxed">
                  {selectedCourse.description}
                </p>
              </div>

              {/* Modules Accordion */}
              <div className="space-y-3">
                <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-brand-cyan" />
                  Módulos y Sub-cursos Disponibles
                </h4>

                {selectedCourse.modules.length === 0 ? (
                  <div className="text-center p-6 bg-black/25 border border-white/5 rounded-2xl text-xs text-gray-500">
                    No hay módulos estructurados para esta serie todavía.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {selectedCourse.modules.map((mod) => {
                      const isExpanded = expandedModuleId === mod.id;
                      return (
                        <div 
                          key={mod.id} 
                          className="border border-white/5 bg-black/20 rounded-2xl overflow-hidden transition-all duration-300"
                        >
                          {/* Accordion Trigger Header */}
                          <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-white/2 select-none" onClick={() => toggleModuleExpand(mod.id)}>
                            <div className="flex items-center gap-2">
                              {isExpanded ? (
                                <ChevronDown className="w-4.5 h-4.5 text-brand-red shrink-0" />
                              ) : (
                                <ChevronRight className="w-4.5 h-4.5 text-gray-400 shrink-0" />
                              )}
                              <div>
                                <h5 className="font-black text-white text-xs md:text-sm uppercase tracking-wide">
                                  {mod.title}
                                </h5>
                                <span className="text-[9px] text-gray-500 font-mono">
                                  {(mod.videos || []).length} Clases
                                </span>
                              </div>
                            </div>

                            {/* Direct Drive Folder View Shortcut */}
                            {mod.driveUrl && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation(); // Avoid expanding
                                  handlePlayFolder(mod, selectedCourse);
                                }}
                                className="flex items-center gap-1.5 px-3 py-1 bg-brand-cyan/10 hover:bg-brand-cyan/20 border border-brand-cyan/20 text-brand-cyan rounded-lg text-[9px] font-bold transition-all cursor-pointer"
                                title="Abrir explorador de archivos de Drive"
                              >
                                <Folder className="w-3.5 h-3.5" />
                                Explorar Carpeta
                              </button>
                            )}
                          </div>

                          {/* Accordion Expanded Panel */}
                          {isExpanded && (
                            <div className="p-4 border-t border-white/5 bg-black/10 animate-fade-in space-y-4">
                              {mod.description && (
                                <p className="text-xs text-gray-400 leading-relaxed italic border-l-2 border-brand-cyan/40 pl-2">
                                  {mod.description}
                                </p>
                              )}

                              {/* Classes checklist */}
                              {(mod.videos || []).length === 0 ? (
                                <div className="text-center py-4 text-xs text-gray-500">
                                  {mod.driveUrl ? (
                                    <div className="space-y-2">
                                      <p>No hay clases individuales listadas en el CMS para este módulo.</p>
                                      <button
                                        onClick={() => handlePlayFolder(mod, selectedCourse)}
                                        className="py-1.5 px-4 bg-brand-cyan text-brand-dark font-black rounded-lg text-[10px] uppercase cursor-pointer"
                                      >
                                        Explorar archivos de Google Drive
                                      </button>
                                    </div>
                                  ) : (
                                    'No hay videos disponibles.'
                                  )}
                                </div>
                              ) : (
                                <div className="space-y-2">
                                  {(mod.videos || []).map((vid) => (
                                    <button
                                      key={vid.id}
                                      onClick={() => handlePlayVideo(vid, selectedCourse, mod.title)}
                                      className="w-full text-left p-3 bg-black/40 hover:bg-white/5 border border-white/5 hover:border-brand-red/30 rounded-xl transition-all flex items-center justify-between gap-4 cursor-pointer group/item"
                                    >
                                      <div className="flex items-center gap-3">
                                        <div className="p-2 bg-white/5 group-hover/item:bg-brand-red text-gray-400 group-hover/item:text-white rounded-full transition-colors">
                                          <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                                        </div>
                                        <div>
                                          <div className="font-bold text-white text-xs group-hover/item:text-brand-cyan transition-colors">
                                            {vid.title}
                                          </div>
                                          <div className="text-[10px] text-gray-500 line-clamp-1 mt-0.5 pr-6">
                                            {vid.description}
                                          </div>
                                        </div>
                                      </div>

                                      <span className="shrink-0 flex items-center gap-1 text-[9px] text-gray-400 font-mono font-bold bg-white/5 px-2 py-0.5 rounded">
                                        <Clock className="w-3.5 h-3.5 text-gray-500" />
                                        {vid.duration}
                                      </span>
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
