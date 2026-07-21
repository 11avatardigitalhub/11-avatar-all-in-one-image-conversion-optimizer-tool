// ============================================================
// THEME SYSTEM - White, Gold & Black Theme Manager
// ============================================================

class ThemeManager {
  constructor() {
    this.currentTheme = this.getStoredTheme() || 'white';
    this.availableThemes = {
      white: { 
        name: 'White', 
        icon: 'fa-sun', 
        color: '#f5f7fa',
        label: 'Light' 
      },
      gold: { 
        name: 'Gold', 
        icon: 'fa-crown', 
        color: '#d4a017',
        label: 'Gold' 
      },
      dark: { 
        name: 'Dark', 
        icon: 'fa-moon', 
        color: '#0a0a0a',
        label: 'Dark' 
      }
    };
  }

  getStoredTheme() {
    try {
      return localStorage.getItem('image-converter-theme') || 'white';
    } catch {
      return 'white';
    }
  }

  setTheme(themeName) {
    if (!this.availableThemes[themeName]) return;
    
    this.currentTheme = themeName;
    document.documentElement.setAttribute('data-theme', themeName);
    
    try {
      localStorage.setItem('image-converter-theme', themeName);
    } catch {}
    
    this.updateUI(themeName);
    this.showToast(`Theme switched to ${this.availableThemes[themeName].label}`, 'info');
  }

  updateUI(themeName) {
    // Update toggle buttons
    document.querySelectorAll('.theme-toggle-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.theme === themeName);
    });
    
    // Update meta theme color
    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) {
      const colors = {
        white: '#f5f7fa',
        gold: '#fefcf5',
        dark: '#0a0a0a'
      };
      metaTheme.content = colors[themeName] || colors.white;
    }
  }

  toggleTheme() {
    const themes = ['white', 'gold', 'dark'];
    const currentIndex = themes.indexOf(this.currentTheme);
    const nextIndex = (currentIndex + 1) % themes.length;
    this.setTheme(themes[nextIndex]);
  }

  renderThemeToggle() {
    const container = document.createElement('div');
    container.className = 'theme-toggle-container';
    container.innerHTML = `
      <button class="theme-toggle-btn white-theme ${this.currentTheme === 'white' ? 'active' : ''}" 
              data-theme="white" 
              onclick="themeManager.setTheme('white')" 
              title="White Theme">
        <i class="fas fa-sun"></i>
      </button>
      <button class="theme-toggle-btn gold-theme ${this.currentTheme === 'gold' ? 'active' : ''}" 
              data-theme="gold" 
              onclick="themeManager.setTheme('gold')" 
              title="Gold Theme">
        <i class="fas fa-crown"></i>
      </button>
      <button class="theme-toggle-btn dark-theme ${this.currentTheme === 'dark' ? 'active' : ''}" 
              data-theme="dark" 
              onclick="themeManager.setTheme('dark')" 
              title="Dark Theme">
        <i class="fas fa-moon"></i>
      </button>
    `;
    return container;
  }

  showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    if (!toast || !toastMessage) return;
    
    toast.className = `toast ${type}`;
    toastMessage.textContent = message;
    toast.classList.add('visible');
    
    clearTimeout(this._toastTimeout);
    this._toastTimeout = setTimeout(() => {
      toast.classList.remove('visible');
    }, 3000);
  }
}

// Initialize Theme Manager
const themeManager = new ThemeManager();

// ============================================================
// IMAGE CONVERTER - MAIN APPLICATION
// ============================================================

document.addEventListener('DOMContentLoaded', function() {
  // Apply stored theme
  themeManager.setTheme(themeManager.getStoredTheme());
  
  // Insert theme toggle
  const header = document.querySelector('.header');
  if (header) {
    const toggle = themeManager.renderThemeToggle();
    header.prepend(toggle);
  }
  
  // Initialize the converter
  ImageConverter.init();
});

// ============================================================
// IMAGE CONVERTER CLASS
// ============================================================

const ImageConverter = {
  files: [],
  processedFiles: [],
  isProcessing: false,

  init() {
    this.cacheElements();
    this.bindEvents();
    this.updateUI();
    this.initPrivacyNotice();
  },

  cacheElements() {
    this.elements = {
      dropArea: document.getElementById('dropArea'),
      fileInput: document.getElementById('fileInput'),
      selectBtn: document.getElementById('selectFilesBtn'),
      processBtn: document.getElementById('processBtn'),
      tableBody: document.getElementById('tableBody'),
      imagesTable: document.getElementById('imagesTable'),
      batchActions: document.getElementById('batchActions'),
      searchInput: document.getElementById('searchInput'),
      searchContainer: document.getElementById('searchContainer'),
      clearAllBtn: document.getElementById('clearAllBtn'),
      downloadAllBtn: document.getElementById('downloadAllBtn'),
      shareAllBtn: document.getElementById('shareAllBtn'),
      previewContainer: document.getElementById('previewContainer'),
      originalPreview: document.getElementById('originalPreview'),
      enhancedPreview: document.getElementById('enhancedPreview'),
      fileCounter: document.getElementById('fileCounter'),
      totalFilesStat: document.getElementById('totalFilesStat'),
      totalSizeStat: document.getElementById('totalSizeStat'),
      estimatedTimeStat: document.getElementById('estimatedTimeStat'),
      quality: document.getElementById('quality'),
      qualityValue: document.getElementById('qualityValue'),
      resizeMode: document.getElementById('resizeMode'),
      resizeValue: document.getElementById('resizeValue'),
      resizeWidth: document.getElementById('resizeWidth'),
      resizeHeight: document.getElementById('resizeHeight'),
      dimensionsContainer: document.getElementById('dimensionsContainer'),
      outputFormat: document.getElementById('outputFormat'),
      rotation: document.getElementById('rotation'),
      batchRename: document.getElementById('batchRename'),
      imageFilter: document.getElementById('imageFilter'),
      advancedOptions: document.getElementById('advancedOptions'),
      toggleAdvanced: document.getElementById('toggleAdvanced'),
      watermark: document.getElementById('watermark'),
      watermarkOptions: document.getElementById('watermarkOptions'),
      watermarkText: document.getElementById('watermarkText'),
      watermarkPosition: document.getElementById('watermarkPosition'),
      watermarkColor: document.getElementById('watermarkColor'),
      watermarkBgColor: document.getElementById('watermarkBgColor'),
      watermarkSize: document.getElementById('watermarkSize'),
      watermarkPreviewCanvas: document.getElementById('watermarkPreviewCanvas'),
      watermarkPreview: document.getElementById('watermarkPreview'),
      toast: document.getElementById('toast'),
      toastMessage: document.getElementById('toastMessage'),
      privacyNotice: document.getElementById('privacyNotice'),
      closePrivacyNotice: document.getElementById('closePrivacyNotice'),
      acceptPrivacyBtn: document.getElementById('acceptPrivacyBtn'),
      learnMoreBtn: document.getElementById('learnMoreBtn')
    };
  },

  bindEvents() {
    const { dropArea, fileInput, selectBtn, processBtn, clearAllBtn, downloadAllBtn } = this.elements;

    // File selection
    selectBtn?.addEventListener('click', () => fileInput?.click());
    fileInput?.addEventListener('change', (e) => this.handleFiles(e.target.files));

    // Drag and drop
    dropArea?.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropArea.classList.add('active');
    });

    dropArea?.addEventListener('dragleave', () => {
      dropArea.classList.remove('active');
    });

    dropArea?.addEventListener('drop', (e) => {
      e.preventDefault();
      dropArea.classList.remove('active');
      this.handleFiles(e.dataTransfer.files);
    });

    // Quality slider
    const quality = document.getElementById('quality');
    if (quality) {
      quality.addEventListener('input', () => {
        document.getElementById('qualityValue').textContent = quality.value + '%';
      });
    }

    // Resize mode
    const resizeMode = document.getElementById('resizeMode');
    if (resizeMode) {
      resizeMode.addEventListener('change', () => this.toggleResizeOptions());
    }

    // Resize value
    const resizeValue = document.getElementById('resizeValue');
    if (resizeValue) {
      resizeValue.addEventListener('input', () => this.toggleResizeOptions());
    }

    // Watermark toggle
    const watermark = document.getElementById('watermark');
    if (watermark) {
      watermark.addEventListener('change', () => {
        const options = document.getElementById('watermarkOptions');
        if (options) {
          options.style.display = watermark.checked ? 'block' : 'none';
        }
        if (watermark.checked) {
          this.updateWatermarkPreview();
        }
      });
    }

    // Watermark settings
    ['watermarkText', 'watermarkPosition', 'watermarkColor', 'watermarkBgColor', 'watermarkSize'].forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('change', () => this.updateWatermarkPreview());
        el.addEventListener('input', () => this.updateWatermarkPreview());
      }
    });

    // Advanced toggle
    const toggleAdvanced = document.getElementById('toggleAdvanced');
    if (toggleAdvanced) {
      toggleAdvanced.addEventListener('click', () => {
        const options = document.getElementById('advancedOptions');
        if (options) {
          options.classList.toggle('visible');
        }
      });
    }

    // Search
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
      searchInput.addEventListener('input', () => this.filterTable());
    }

    // Process button
    processBtn?.addEventListener('click', () => this.processImages());

    // Clear all
    clearAllBtn?.addEventListener('click', () => this.clearAll());

    // Download all
    downloadAllBtn?.addEventListener('click', () => this.downloadAll());

    // Share all
    const shareAllBtn = document.getElementById('shareAllBtn');
    if (shareAllBtn) {
      shareAllBtn.addEventListener('click', () => this.shareAll());
    }

    // Privacy notice
    this.bindPrivacyEvents();
  },

  handleFiles(fileList) {
    const files = Array.from(fileList).filter(f => f.type.startsWith('image/'));
    
    if (files.length === 0) {
      this.showToast('No valid images found!', 'error');
      return;
    }

    // Limit check (10 files max in free version)
    if (this.files.length + files.length > 10) {
      this.showToast('Limit reached! Max 10 images at a time.', 'error');
      document.getElementById('limitNotice').classList.add('visible');
      return;
    }

    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.files.push({
          file: file,
          name: file.name,
          size: file.size,
          dataUrl: e.target.result,
          status: 'ready',
          progress: 0,
          processedDataUrl: null,
          processedSize: 0
        });
        this.updateUI();
      };
      reader.readAsDataURL(file);
    });
  },

  updateUI() {
    const { tableBody, fileCounter, imagesTable, batchActions, searchContainer, totalFilesStat, totalSizeStat, processBtn } = this.elements;

    // Update counter
    if (fileCounter) {
      fileCounter.textContent = this.files.length;
      fileCounter.style.display = this.files.length > 0 ? 'flex' : 'none';
    }

    // Update stats
    if (totalFilesStat) {
      totalFilesStat.textContent = this.files.length;
    }

    if (totalSizeStat) {
      const totalSize = this.files.reduce((acc, f) => acc + f.size, 0);
      totalSizeStat.textContent = totalSize > 0 ? (totalSize / (1024 * 1024)).toFixed(2) + ' MB' : '0 MB';
    }

    // Show/hide elements
    if (imagesTable) {
      imagesTable.classList.toggle('visible', this.files.length > 0);
    }

    if (batchActions) {
      batchActions.classList.toggle('visible', this.files.length > 0);
    }

    if (searchContainer) {
      searchContainer.classList.toggle('visible', this.files.length > 0);
    }

    // Enable/disable process button
    if (processBtn) {
      processBtn.disabled = this.files.length === 0 || this.isProcessing;
      processBtn.innerHTML = this.isProcessing 
        ? '<i class="fas fa-spinner spinner"></i> Processing...' 
        : '<i class="fas fa-magic"></i> Process Images';
    }

    // Render table
    this.renderTable();
  },

  renderTable() {
    const { tableBody, searchInput } = this.elements;
    if (!tableBody) return;

    const searchTerm = searchInput?.value?.toLowerCase() || '';

    let html = '';
    let filteredFiles = this.files;

    if (searchTerm) {
      filteredFiles = this.files.filter(f => f.name.toLowerCase().includes(searchTerm));
    }

    if (filteredFiles.length === 0) {
      html = `<tr class="no-files"><td colspan="5">${this.files.length === 0 ? 'No images selected yet' : 'No matching images found'}</td></tr>`;
    } else {
      filteredFiles.forEach((file, index) => {
        const originalIndex = this.files.indexOf(file);
        const statusText = file.status === 'completed' ? '✅ Completed' : 
                          file.status === 'processing' ? '⏳ Processing' : 
                          file.status === 'error' ? '❌ Error' : '⏸️ Ready';
        
        const statusClass = file.status === 'completed' ? 'completed' : 
                           file.status === 'processing' ? 'processing' : 
                           file.status === 'error' ? 'error' : '';
        
        html += `
          <tr>
            <td data-label="Preview">
              <img src="${file.dataUrl}" alt="${file.name}" class="thumbnail ${file.status === 'processing' ? 'processing' : ''}">
            </td>
            <td data-label="File Name">
              <div class="file-info">
                <span class="file-name">${file.name}</span>
              </div>
            </td>
            <td data-label="Original">
              <span class="file-size">${(file.size / 1024).toFixed(1)} KB</span>
              ${file.processedSize ? `<br><small style="color:var(--success-color);">→ ${(file.processedSize / 1024).toFixed(1)} KB</small>` : ''}
            </td>
            <td data-label="Status">
              <div class="status ${statusClass}">${statusText}</div>
              ${file.status === 'processing' ? `<div class="progress-container"><div class="progress-bar" style="width:${file.progress || 0}%;"></div></div>` : ''}
            </td>
            <td data-label="Actions">
              ${file.status === 'completed' ? `<button class="action-btn download-btn" onclick="ImageConverter.downloadSingle(${originalIndex})"><i class="fas fa-download"></i></button>` : ''}
              <button class="action-btn delete-btn" onclick="ImageConverter.removeFile(${originalIndex})"><i class="fas fa-trash"></i></button>
            </td>
          </tr>
        `;
      });
    }

    tableBody.innerHTML = html;

    // Update estimated time
    const estimatedTime = this.files.length > 0 ? Math.ceil(this.files.length * 0.5) : 0;
    if (this.elements.estimatedTimeStat) {
      this.elements.estimatedTimeStat.textContent = estimatedTime + 's';
    }
  },

  toggleResizeOptions() {
    const mode = document.getElementById('resizeMode')?.value;
    const resizeValue = document.getElementById('resizeValue');
    const dimensions = document.getElementById('dimensionsContainer');
    const width = document.getElementById('resizeWidth');
    const height = document.getElementById('resizeHeight');

    if (resizeValue) {
      resizeValue.disabled = mode === 'none' || mode === 'dimensions';
      resizeValue.placeholder = mode === 'percentage' ? 'Enter %' : mode === 'dimensions' ? 'Auto' : 'Disabled';
    }

    if (dimensions) {
      dimensions.classList.toggle('visible', mode === 'dimensions');
    }

    if (width) width.disabled = mode !== 'dimensions';
    if (height) height.disabled = mode !== 'dimensions';
  },

  updateWatermarkPreview() {
    const canvas = document.getElementById('watermarkPreviewCanvas');
    const preview = document.getElementById('watermarkPreview');
    if (!canvas || !preview) return;

    const text = document.getElementById('watermarkText')?.value || 'SAMPLE';
    const color = document.getElementById('watermarkColor')?.value || '#ffffff';
    const bgColor = document.getElementById('watermarkBgColor')?.value || '#00000080';
    const size = parseInt(document.getElementById('watermarkSize')?.value) || 24;
    const position = document.getElementById('watermarkPosition')?.value || 'bottom-right';

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Background
    ctx.fillStyle = '#2d3436';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Watermark
    ctx.font = `${size}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Background
    ctx.fillStyle = bgColor;
    const metrics = ctx.measureText(text);
    const padding = 20;
    const textWidth = metrics.width + padding * 2;
    const textHeight = size + padding * 2;

    let x = canvas.width / 2;
    let y = canvas.height / 2;

    if (position === 'top-left') { x = textWidth / 2; y = textHeight / 2; }
    else if (position === 'top-right') { x = canvas.width - textWidth / 2; y = textHeight / 2; }
    else if (position === 'bottom-left') { x = textWidth / 2; y = canvas.height - textHeight / 2; }
    else if (position === 'bottom-right') { x = canvas.width - textWidth / 2; y = canvas.height - textHeight / 2; }

    ctx.fillRect(x - textWidth / 2, y - textHeight / 2, textWidth, textHeight);

    // Text
    ctx.fillStyle = color;
    ctx.fillText(text, x, y);

    preview.classList.add('visible');
  },

  async processImages() {
    if (this.isProcessing || this.files.length === 0) return;

    this.isProcessing = true;
    this.updateUI();

    const quality = parseInt(document.getElementById('quality')?.value) || 90;
    const format = document.getElementById('outputFormat')?.value || 'jpg';
    const rotation = parseInt(document.getElementById('rotation')?.value) || 0;
    const filter = document.getElementById('imageFilter')?.value || 'none';
    const batchRename = document.getElementById('batchRename')?.value || '';
    const resizeMode = document.getElementById('resizeMode')?.value || 'none';
    const resizeValue = parseFloat(document.getElementById('resizeValue')?.value) || 100;
    const resizeWidth = parseInt(document.getElementById('resizeWidth')?.value) || 800;
    const resizeHeight = parseInt(document.getElementById('resizeHeight')?.value) || 600;

    for (let i = 0; i < this.files.length; i++) {
      const fileData = this.files[i];
      if (fileData.status === 'completed') continue;

      fileData.status = 'processing';
      fileData.progress = 0;
      this.updateUI();

      try {
        const result = await this.processSingleImage(fileData, {
          quality,
          format,
          rotation,
          filter,
          batchRename,
          resizeMode,
          resizeValue,
          resizeWidth,
          resizeHeight
        });

        fileData.status = 'completed';
        fileData.progress = 100;
        fileData.processedDataUrl = result;
        fileData.processedSize = result.length * 0.75; // Approximate

        this.showToast(`✅ Processed: ${fileData.name}`, 'success');

      } catch (error) {
        console.error('Processing error:', error);
        fileData.status = 'error';
        this.showToast(`❌ Error processing ${fileData.name}`, 'error');
      }

      this.updateUI();
    }

    this.isProcessing = false;
    this.updateUI();

    // Show preview of first processed image
    const firstCompleted = this.files.find(f => f.status === 'completed');
    if (firstCompleted) {
      this.showPreview(firstCompleted);
    }
  },

  processSingleImage(fileData, options) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          // Resize
          if (options.resizeMode === 'percentage') {
            const pct = options.resizeValue / 100;
            width = Math.round(width * pct);
            height = Math.round(height * pct);
          } else if (options.resizeMode === 'dimensions') {
            width = options.resizeWidth || width;
            height = options.resizeHeight || height;
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');

          // Apply rotation
          if (options.rotation !== 0) {
            ctx.translate(width / 2, height / 2);
            ctx.rotate((options.rotation * Math.PI) / 180);
            ctx.translate(-width / 2, -height / 2);
          }

          // Draw image
          ctx.drawImage(img, 0, 0, width, height);

          // Apply filter
          if (options.filter !== 'none') {
            this.applyFilter(ctx, width, height, options.filter);
          }

          // Get output
          const mimeType = options.format === 'jpg' ? 'image/jpeg' : `image/${options.format}`;
          const output = canvas.toDataURL(mimeType, options.quality / 100);

          resolve(output);
        } catch (e) {
          reject(e);
        }
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = fileData.dataUrl;
    });
  },

  applyFilter(ctx, width, height, filter) {
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;

    switch (filter) {
      case 'grayscale':
        for (let i = 0; i < data.length; i += 4) {
          const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
          data[i] = data[i + 1] = data[i + 2] = gray;
        }
        break;
      case 'sepia':
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i], g = data[i + 1], b = data[i + 2];
          data[i] = Math.min(255, r * 0.393 + g * 0.769 + b * 0.189);
          data[i + 1] = Math.min(255, r * 0.349 + g * 0.686 + b * 0.168);
          data[i + 2] = Math.min(255, r * 0.272 + g * 0.534 + b * 0.131);
        }
        break;
      case 'invert':
        for (let i = 0; i < data.length; i += 4) {
          data[i] = 255 - data[i];
          data[i + 1] = 255 - data[i + 1];
          data[i + 2] = 255 - data[i + 2];
        }
        break;
      case 'vintage':
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i], g = data[i + 1], b = data[i + 2];
          data[i] = Math.min(255, r * 1.2 + g * 0.1);
          data[i + 1] = Math.min(255, g * 0.9 + b * 0.1);
          data[i + 2] = Math.min(255, b * 0.8);
        }
        break;
    }

    ctx.putImageData(imageData, 0, 0);
  },

  showPreview(fileData) {
    const { previewContainer, originalPreview, enhancedPreview, sizeReduction, qualityDiff, timeSaved } = this.elements;

    if (!previewContainer || !originalPreview || !enhancedPreview) return;

    originalPreview.src = fileData.dataUrl;
    enhancedPreview.src = fileData.processedDataUrl || fileData.dataUrl;

    // Calculate stats
    const originalSize = fileData.size;
    const processedSize = fileData.processedSize || originalSize;
    const reduction = originalSize > 0 ? ((originalSize - processedSize) / originalSize * 100).toFixed(1) : 0;

    if (sizeReduction) sizeReduction.textContent = reduction + '%';
    if (qualityDiff) qualityDiff.textContent = '+15%';
    if (timeSaved) timeSaved.textContent = '0.5s';

    previewContainer.classList.add('visible');
  },

  filterTable() {
    this.renderTable();
  },

  removeFile(index) {
    this.files.splice(index, 1);
    this.updateUI();
    this.showToast('File removed', 'info');
  },

  clearAll() {
    if (this.files.length === 0) return;
    if (!confirm('Remove all images?')) return;
    this.files = [];
    this.updateUI();
    this.showToast('All files cleared', 'info');
  },

  downloadSingle(index) {
    const file = this.files[index];
    if (!file || !file.processedDataUrl) return;

    const link = document.createElement('a');
    link.download = file.name.replace(/\.[^.]+$/, '') + '_optimized.' + (document.getElementById('outputFormat')?.value || 'jpg');
    link.href = file.processedDataUrl;
    link.click();
  },

  async downloadAll() {
    const completed = this.files.filter(f => f.status === 'completed');
    if (completed.length === 0) {
      this.showToast('No processed images to download', 'error');
      return;
    }

    try {
      if (typeof JSZip === 'undefined') {
        this.showToast('Please wait, loading ZIP library...', 'info');
        await this.loadJSZip();
      }

      const zip = new JSZip();
      const format = document.getElementById('outputFormat')?.value || 'jpg';

      completed.forEach((file, i) => {
        const dataUrl = file.processedDataUrl;
        const base64Data = dataUrl.split(',')[1];
        const fileName = (document.getElementById('batchRename')?.value || file.name.replace(/\.[^.]+$/, '')) 
          .replace(/\{num\}/g, String(i + 1).padStart(2, '0')) + '.' + format;
        zip.file(fileName, base64Data, { base64: true });
      });

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const link = document.createElement('a');
      link.download = `images_${new Date().toISOString().slice(0,10)}.zip`;
      link.href = URL.createObjectURL(zipBlob);
      link.click();
      URL.revokeObjectURL(link.href);

      this.showToast('✅ All images downloaded successfully!', 'success');
    } catch (error) {
      console.error('ZIP error:', error);
      this.showToast('Error creating ZIP file', 'error');
    }
  },

  loadJSZip() {
    return new Promise((resolve, reject) => {
      if (typeof JSZip !== 'undefined') {
        resolve();
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';
      script.onload = () => {
        // Load FileSaver too
        const fsScript = document.createElement('script');
        fsScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/FileSaver.js/2.0.5/FileSaver.min.js';
        fsScript.onload = () => resolve();
        fsScript.onerror = () => reject(new Error('Failed to load FileSaver'));
        document.head.appendChild(fsScript);
      };
      script.onerror = () => reject(new Error('Failed to load JSZip'));
      document.head.appendChild(script);
    });
  },

  shareAll() {
    if (this.files.length === 0) {
      this.showToast('No images to share', 'error');
      return;
    }

    if (navigator.share) {
      const files = this.files.filter(f => f.status === 'completed').map(f => f.file);
      if (files.length === 0) {
        this.showToast('No processed images to share', 'error');
        return;
      }
      navigator.share({
        title: 'My Optimized Images',
        text: 'Check out these images!',
        files: files
      }).catch(() => {});
    } else {
      this.showToast('Share feature is not available on this device', 'info');
    }
  },

  // ============================================================
  // PRIVACY NOTICE
  // ============================================================
  initPrivacyNotice() {
    const hasAccepted = localStorage.getItem('privacy-notice-accepted');
    if (!hasAccepted) {
      setTimeout(() => {
        const notice = document.getElementById('privacyNotice');
        if (notice) notice.classList.add('visible');
      }, 1500);
    }
  },

  bindPrivacyEvents() {
    const { closePrivacyNotice, acceptPrivacyBtn, learnMoreBtn, privacyNotice } = this.elements;

    const closeNotice = () => {
      if (privacyNotice) privacyNotice.classList.remove('visible');
    };

    const acceptNotice = () => {
      localStorage.setItem('privacy-notice-accepted', 'true');
      closeNotice();
    };

    closePrivacyNotice?.addEventListener('click', closeNotice);
    acceptPrivacyBtn?.addEventListener('click', acceptNotice);
    learnMoreBtn?.addEventListener('click', () => {
      window.open('https://en.wikipedia.org/wiki/Privacy_policy', '_blank');
    });
  },

  // ============================================================
  // TOAST SYSTEM
  // ============================================================
  showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    if (!toast || !toastMessage) return;
    
    toast.className = `toast ${type}`;
    toastMessage.textContent = message;
    toast.classList.add('visible');
    
    clearTimeout(this._toastTimeout);
    this._toastTimeout = setTimeout(() => {
      toast.classList.remove('visible');
    }, 4000);
  }
};
