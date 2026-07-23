/**
 * Utility to extract Google Drive / Vimeo / YouTube IDs and map them to embeddable preview or direct playback links.
 */

// GOOGLE DRIVE UTILITIES
export function extractDriveFileId(url) {
  if (!url || typeof url !== 'string') return null;
  if (url.includes('/folders/')) return null;

  const viewRegex = /\/file\/d\/([a-zA-Z0-9_-]{25,50})/;
  const viewMatch = url.match(viewRegex);
  if (viewMatch) return viewMatch[1];
  
  const idRegex = /[?&]id=([a-zA-Z0-9_-]{25,50})/;
  const idMatch = url.match(idRegex);
  if (idMatch) return idMatch[1];
  
  return null;
}

export function extractDriveFolderId(url) {
  if (!url || typeof url !== 'string') return null;
  
  const folderRegex = /\/folders\/([a-zA-Z0-9_-]{25,50})/;
  const match = url.match(folderRegex);
  if (match) return match[1];
  
  return null;
}

// VIMEO UTILITIES
export function extractVimeoVideoId(url) {
  if (!url || typeof url !== 'string') return null;
  
  const vimeoRegex = /(?:vimeo\.com\/|player\.vimeo\.com\/video\/)(\d+)/;
  const match = url.match(vimeoRegex);
  return match ? match[1] : null;
}

export function isVimeoUrl(url) {
  if (!url || typeof url !== 'string') return false;
  return url.includes('vimeo.com') || extractVimeoVideoId(url) !== null;
}

// YOUTUBE UTILITIES
export function extractYoutubeVideoId(url) {
  if (!url || typeof url !== 'string') return null;
  
  // Regex supporting standard watch, youtu.be shortlinks, embed links, and shorts
  const youtubeRegex = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/;
  const match = url.match(youtubeRegex);
  return match ? match[1] : null;
}

export function isYoutubeUrl(url) {
  if (!url || typeof url !== 'string') return false;
  return url.includes('youtube.com') || url.includes('youtu.be') || extractYoutubeVideoId(url) !== null;
}

export function isGoogleDriveUrl(url) {
  if (!url || typeof url !== 'string') return false;
  return url.includes('drive.google.com') || 
         extractDriveFileId(url) !== null || 
         extractDriveFolderId(url) !== null;
}

// MAIN RESOLVER
export function getDriveEmbedUrl(url) {
  // If it's a YouTube URL
  const youtubeId = extractYoutubeVideoId(url);
  if (youtubeId) {
    return `https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0&modestbranding=1`;
  }

  // If it's a Vimeo URL
  const vimeoId = extractVimeoVideoId(url);
  if (vimeoId) {
    return `https://player.vimeo.com/video/${vimeoId}?autoplay=1&color=e50914`;
  }

  // If it's a Google Drive folder
  const folderId = extractDriveFolderId(url);
  if (folderId) {
    return `https://drive.google.com/embeddedfolderview?id=${folderId}#grid`;
  }

  // If it's a Google Drive file
  const fileId = extractDriveFileId(url);
  if (fileId) {
    return `https://drive.google.com/file/d/${fileId}/preview`;
  }
  
  return url; // Return original if not recognized
}

export function getDriveDownloadUrl(url) {
  const fileId = extractDriveFileId(url);
  if (!fileId) return url;
  return `https://drive.google.com/uc?export=download&id=${fileId}`;
}
