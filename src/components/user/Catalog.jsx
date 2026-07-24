import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Play, Info, Film, Eye, X, BookOpen, Clock, AlertTriangle, 
  Layers, Folder, ChevronRight, ChevronDown, Sparkles, ArrowRight, 
  ExternalLink, ShieldAlert 
} from 'lucide-react';

export default function Catalog() {
  const { 
    courses, playVideo, searchQuery, currentUser, 
    settings, showPlansModal, setShowPlansModal, updateSubscriber 
  } = useApp();

  const calculateTrialDaysRemaining = () => {
    if (!currentUser || !currentUser.endDate) return 0;
    const diffTime = new Date(currentUser.endDate) - new Date();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const [selectedCourse, setSelectedCourse] = useState(null);
  const [activeSeasonId, setActiveSeasonId] = useState(null);

  React.useEffect(() => {
    if (selectedCourse && selectedCourse.modules && selectedCourse.modules.length > 0) {
      setActiveSeasonId(selectedCourse.modules[0].id);
    } else {
      setActiveSeasonId(null);
    }
  }, [selectedCourse]);

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
      {/* Trial Promo Gift Banner */}
      {calculateTrialDaysRemaining() > 0 && (
        <div className="bg-gradient-to-r from-brand-cyan/20 via-brand-dark/95 to-brand-red/20 border-b border-white/10 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 animate-fade-in relative z-20">
          <div className="flex items-center gap-3 text-left">
            <div className="p-2 bg-brand-cyan/10 border border-brand-cyan/20 rounded-xl text-brand-cyan animate-pulse">
              <Sparkles className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h4 className="text-xs md:text-sm font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                🎁 ¡Regalo Especial: Periodo de Prueba Activo!
              </h4>
              <p className="text-[10px] md:text-xs text-gray-400 mt-0.5">
                Tu regalo de <strong className="text-brand-cyan">{settings?.trialDays || 5} días gratis</strong> está disponible. Te quedan <strong className="text-brand-red">{calculateTrialDaysRemaining()} días</strong> de cortesía.
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowPlansModal(true)}
            className="px-4 py-2 bg-brand-cyan hover:brightness-110 text-brand-dark text-[11px] font-black rounded-xl uppercase tracking-wider transition-all shadow-md hover:scale-105 cursor-pointer flex items-center gap-1.5 whitespace-nowrap"
          >
            Ver Planes de Pago
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

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

      {/* Course Detail Fullscreen Overlay (HBO Max Style) */}
      {selectedCourse && (
        <div className="fixed inset-0 z-50 bg-[#060709] overflow-y-auto backdrop-blur-md animate-fade-in flex flex-col">
          {/* Header Hero */}
          <div className="h-[50vh] md:h-[60vh] w-full relative flex items-end p-6 md:p-12 shrink-0 overflow-hidden">
            {/* Background Backdrop */}
            <img 
              src={selectedCourse.posterUrl} 
              alt={selectedCourse.title} 
              className="absolute inset-0 w-full h-full object-cover opacity-25 filter blur-[0.5px]" 
            />
            {/* Ambient gradients */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#060709] via-[#060709]/60 to-transparent"></div>
            <div className="absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-[#060709]/80 to-transparent hidden md:block"></div>

            <button 
              onClick={() => setSelectedCourse(null)}
              className="absolute top-6 right-6 z-20 p-2 bg-black/60 hover:bg-black border border-white/10 text-gray-400 hover:text-white rounded-full transition-all cursor-pointer shadow-lg hover:scale-105"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="relative z-10 space-y-4 max-w-3xl">
              <span className="text-[10px] uppercase font-black bg-brand-red/10 border border-brand-red/30 text-brand-red px-3 py-1 rounded-md tracking-widest inline-block">
                {selectedCourse.category}
              </span>
              
              <h2 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tighter leading-none">
                {selectedCourse.title}
              </h2>
              
              <p className="text-xs md:text-sm text-gray-300 leading-relaxed font-medium line-clamp-3">
                {selectedCourse.description}
              </p>

              {/* Action play button */}
              {selectedCourse.modules && selectedCourse.modules.length > 0 && (
                <button
                  onClick={() => {
                    const firstModule = selectedCourse.modules[0];
                    if (firstModule.videos && firstModule.videos.length > 0) {
                      handlePlayVideo(firstModule.videos[0], selectedCourse, firstModule.title);
                    } else if (firstModule.driveUrl) {
                      handlePlayFolder(firstModule, selectedCourse);
                    }
                  }}
                  className="flex items-center gap-2 px-6 py-3 bg-brand-red hover:bg-brand-red-hover text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-lg hover:shadow-brand-red/30 hover:scale-105 cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-white" />
                  Ver Desde el Principio
                </button>
              )}
            </div>
          </div>

          {/* Season Tabs Selector */}
          {selectedCourse.modules && selectedCourse.modules.length > 0 && (
            <div className="bg-[#0c0d12] border-y border-white/5 px-6 md:px-12 py-4 shrink-0 flex items-center gap-3 overflow-x-auto no-scrollbar">
              {selectedCourse.modules.map((mod, idx) => {
                const isActive = activeSeasonId === mod.id;
                return (
                  <button
                    key={mod.id}
                    onClick={() => setActiveSeasonId(mod.id)}
                    className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                      isActive 
                        ? 'bg-brand-red text-white shadow-md' 
                        : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    T{idx + 1}: {mod.title}
                  </button>
                );
              })}
            </div>
          )}

          {/* Episodes List Container */}
          <div className="flex-grow max-w-7xl w-full mx-auto px-6 md:px-12 py-8 space-y-6">
            {(() => {
              const activeSeason = selectedCourse.modules?.find(m => m.id === activeSeasonId);
              if (!activeSeason) {
                return (
                  <div className="text-center py-16 text-xs text-gray-500">
                    No hay lecciones en esta temporada.
                  </div>
                );
              }

              const videosList = activeSeason.videos || [];

              return (
                <div className="space-y-6">
                  <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between border-b border-white/5 pb-3">
                    <div>
                      <h3 className="text-base font-black text-white uppercase tracking-wider">
                        {activeSeason.title}
                      </h3>
                      <p className="text-xs text-gray-400 leading-relaxed mt-0.5">
                        {activeSeason.description || 'Detalles de la temporada.'}
                      </p>
                    </div>

                    {/* Direct drive folder link shortcut */}
                    {activeSeason.driveUrl && (
                      <button
                        onClick={() => handlePlayFolder(activeSeason, selectedCourse)}
                        className="flex items-center gap-1.5 px-4 py-2 bg-brand-cyan/10 hover:bg-brand-cyan/20 border border-brand-cyan/20 text-brand-cyan rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer"
                      >
                        <Folder className="w-4 h-4" />
                        Explorar Carpeta Drive
                      </button>
                    )}
                  </div>

                  {videosList.length === 0 ? (
                    <div className="p-8 text-center bg-white/2 border border-white/5 rounded-2xl text-xs text-gray-500">
                      {activeSeason.driveUrl ? (
                        <div className="space-y-3">
                          <p>No hay clases individuales registradas. Haz clic abajo para abrir la carpeta Drive.</p>
                          <button
                            onClick={() => handlePlayFolder(activeSeason, selectedCourse)}
                            className="py-2 px-5 bg-brand-cyan hover:brightness-110 text-brand-dark font-black rounded-xl text-xs uppercase cursor-pointer"
                          >
                            Explorar Carpeta de Archivos
                          </button>
                        </div>
                      ) : (
                        'No hay capítulos disponibles en esta temporada.'
                      )}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {videosList.map((vid, vIdx) => (
                        <div 
                          key={vid.id}
                          onClick={() => handlePlayVideo(vid, selectedCourse, activeSeason.title)}
                          className="flex gap-4 p-3 bg-white/2 hover:bg-white/5 border border-white/5 hover:border-brand-red/20 rounded-2xl transition-all cursor-pointer group flex-col sm:flex-row"
                        >
                          {/* Episode Thumbnail (16:9 Aspect) */}
                          <div className="w-full sm:w-44 shrink-0 aspect-video rounded-xl overflow-hidden bg-black/40 relative">
                            <img 
                              src={vid.thumbnailUrl || 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=400&q=80'} 
                              alt={vid.title} 
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              loading="lazy"
                            />
                            <div className="absolute inset-0 bg-black/35 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                              <div className="p-2 bg-brand-red text-white rounded-full shadow-lg">
                                <Play className="w-4 h-4 fill-white ml-0.5" />
                              </div>
                            </div>
                            <span className="absolute bottom-1.5 right-1.5 text-[8px] text-white font-mono font-bold bg-black/80 px-1.5 py-0.5 rounded">
                              {vid.duration}
                            </span>
                          </div>

                          {/* Episode Description */}
                          <div className="space-y-1 py-1 flex-grow">
                            <div className="font-bold text-white text-xs md:text-sm group-hover:text-brand-cyan transition-colors leading-tight">
                              Capítulo {vIdx + 1}: {vid.title.replace(/^\d+\.\s*/, '')}
                            </div>
                            <p className="text-[11px] text-gray-500 leading-normal line-clamp-2">
                              {vid.description}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* Plans Modal Overlay */}
      {showPlansModal && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
          <div className="max-w-md w-full bg-brand-surface border border-white/10 rounded-3xl p-8 text-center shadow-2xl relative overflow-hidden glass-panel">
            <button 
              onClick={() => setShowPlansModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="inline-flex p-4 rounded-full bg-brand-cyan/10 border border-brand-cyan/20 text-brand-cyan mb-4 animate-bounce">
              <Sparkles className="w-8 h-8 fill-current" />
            </div>

            <h2 className="text-xl font-black text-white mb-1 uppercase tracking-tight">
              Planes de Suscripción Premium
            </h2>
            <p className="text-[11px] text-gray-400 mb-6">
              Elige el plan que mejor se adapte a tu formación en Skill Prime
            </p>

            <div className="space-y-4 mb-6">
              {/* Plan Mensual */}
              <div className="p-4 bg-black/25 hover:bg-black/35 border border-white/5 hover:border-brand-red/20 rounded-2xl transition-all text-left flex items-center justify-between gap-4">
                <div>
                  <div className="font-bold text-white text-xs">Plan Mensual</div>
                  <p className="text-[9px] text-gray-500 mt-0.5">Renovación automática mes a mes.</p>
                  <div className="text-sm font-black text-white mt-1.5">$4.00 <span className="text-[10px] text-gray-500 font-normal">USD / mes</span></div>
                </div>
                <button
                  onClick={() => {
                    if (settings.paymentLinkMonthly) window.open(settings.paymentLinkMonthly, '_blank');
                    else alert('Enlace de pago no configurado por el administrador.');
                  }}
                  className="px-3.5 py-2 bg-brand-red hover:bg-brand-red-hover text-white text-[10px] font-bold rounded-xl uppercase flex items-center gap-1 transition-all cursor-pointer whitespace-nowrap"
                >
                  Contratar
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>

              {/* Plan Anual */}
              <div className="p-4 bg-brand-cyan/5 hover:bg-brand-cyan/10 border border-brand-cyan/20 rounded-2xl transition-all text-left flex items-center justify-between gap-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-brand-cyan text-brand-dark font-black text-[8px] uppercase tracking-widest px-2.5 py-0.5 rounded-bl-lg">
                  Ahorra 10%
                </div>
                <div>
                  <div className="font-bold text-white text-xs">Plan Anual</div>
                  <p className="text-[9px] text-gray-500 mt-0.5">Acceso por 365 días al catálogo completo.</p>
                  <div className="text-sm font-black text-white mt-1.5">
                    $43.20 <span className="text-[10px] text-gray-500 font-normal">USD / año</span>
                    <span className="text-[9px] text-brand-cyan font-bold block mt-0.5 line-through decoration-brand-red decoration-2">$48.00 USD</span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    if (settings.paymentLinkYearly) window.open(settings.paymentLinkYearly, '_blank');
                    else alert('Enlace de pago no configurado por el administrador.');
                  }}
                  className="px-3.5 py-2 bg-brand-cyan hover:brightness-110 text-brand-dark text-[10px] font-bold rounded-xl uppercase flex items-center gap-1 transition-all cursor-pointer whitespace-nowrap"
                >
                  Contratar
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>

            <div className="text-[9px] text-gray-500 flex items-center justify-center gap-1">
              <ShieldAlert className="w-3 h-3" />
              <span>Transacciones cifradas y protegidas.</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
