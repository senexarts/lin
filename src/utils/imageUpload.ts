/**
 * Reads a local image file from the user's device and returns a Data URL.
 * Automatically resizes oversized raster images so they persist smoothly in localStorage.
 */
export function readImageFileAsDataUrl(
  file: File,
  maxDimension = 1080,
  quality = 0.85
): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('Please select a valid image file.'));
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read image file.'));

    reader.onload = () => {
      const rawDataUrl = reader.result as string;

      // Preserve animated GIFs or SVGs directly if not huge
      if (file.type === 'image/gif' || file.type === 'image/svg+xml' || file.size < 180 * 1024) {
        resolve(rawDataUrl);
        return;
      }

      const img = new Image();
      img.onerror = () => resolve(rawDataUrl);
      img.onload = () => {
        let { width, height } = img;
        if (width <= maxDimension && height <= maxDimension && file.size < 350 * 1024) {
          resolve(rawDataUrl);
          return;
        }

        if (width > height) {
          if (width > maxDimension) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          }
        } else {
          if (height > maxDimension) {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(rawDataUrl);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        const outputType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
        resolve(canvas.toDataURL(outputType, quality));
      };
      img.src = rawDataUrl;
    };

    reader.readAsDataURL(file);
  });
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function detectImageIsLight(dataUrl: string): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onerror = () => resolve(false);
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = 16;
        canvas.height = 16;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(false);
          return;
        }
        ctx.drawImage(img, 0, 0, 16, 16);
        const data = ctx.getImageData(0, 0, 16, 16).data;
        let lumSum = 0;
        const pixels = data.length / 4;
        for (let i = 0; i < data.length; i += 4) {
          lumSum += 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2];
        }
        const avgLum = lumSum / Math.max(1, pixels);
        resolve(avgLum > 145);
      } catch {
        resolve(false);
      }
    };
    img.src = dataUrl;
  });
}

export function readAudioFileAsDataUrl(file: File, maxBytes = 2.5 * 1024 * 1024): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('audio/')) {
      reject(new Error('Please select a valid audio file (MP3, WAV, M4A, OGG).'));
      return;
    }
    if (file.size <= maxBytes) {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error('Failed to read audio file.'));
      reader.onload = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      // Large audio file: stream via ObjectURL for instant playback without breaking localStorage quota
      resolve(URL.createObjectURL(file));
    }
  });
}

export function formatDurationSeconds(totalSeconds: number): string {
  if (!isFinite(totalSeconds) || totalSeconds < 0) return '0:00';
  const rounded = Math.max(1, Math.round(totalSeconds));
  const mins = Math.floor(rounded / 60);
  const secs = rounded % 60;
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

export function isAudioFile(file: File): boolean {
  if (file.type.startsWith('audio/')) return true;
  return /\.(mp3|wav|m4a|ogg|aac|flac|opus|weba|webm)$/i.test(file.name);
}

export function readAudioFileAsPlayableUrl(
  file: File,
  persistLimitBytes = 3.2 * 1024 * 1024
): Promise<{ url: string; persisted: boolean; durationLabel: string }> {
  return new Promise((resolve, reject) => {
    if (!isAudioFile(file)) {
      reject(new Error('Please select a valid audio file (MP3, WAV, M4A, OGG, AAC).'));
      return;
    }

    const probeDuration = (srcUrl: string): Promise<string> =>
      new Promise((resDur) => {
        const audio = new Audio();
        let settled = false;
        const finish = (label: string) => {
          if (settled) return;
          settled = true;
          audio.src = '';
          resDur(label);
        };
        audio.preload = 'metadata';
        audio.onloadedmetadata = () => {
          finish(
            audio.duration && isFinite(audio.duration)
              ? formatDurationSeconds(audio.duration)
              : '0:15'
          );
        };
        audio.onerror = () => finish('0:15');
        window.setTimeout(() => finish('0:15'), 1800);
        audio.src = srcUrl;
      });

    if (file.size <= persistLimitBytes) {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error('Failed to read audio file.'));
      reader.onload = async () => {
        const dataUrl = reader.result as string;
        const durationLabel = await probeDuration(dataUrl);
        resolve({ url: dataUrl, persisted: true, durationLabel });
      };
      reader.readAsDataURL(file);
    } else {
      const objUrl = URL.createObjectURL(file);
      probeDuration(objUrl).then((durationLabel) => {
        resolve({ url: objUrl, persisted: false, durationLabel });
      });
    }
  });
}

export function readVideoFileAsPlayableUrl(
  file: File,
  persistLimitBytes = 2.2 * 1024 * 1024
): Promise<{ url: string; persisted: boolean }> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('video/')) {
      reject(new Error('Please select a valid video file (MP4, WebM, MOV).'));
      return;
    }
    if (file.size <= persistLimitBytes) {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error('Failed to read video file.'));
      reader.onload = () =>
        resolve({ url: reader.result as string, persisted: true });
      reader.readAsDataURL(file);
    } else {
      resolve({ url: URL.createObjectURL(file), persisted: false });
    }
  });
}

