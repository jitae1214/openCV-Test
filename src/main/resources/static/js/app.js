/**
 * Image Filter Studio - Main Application JavaScript
 * 
 * Features:
 * - Real-time image filtering
 * - Drag & Drop filter ordering
 * - Dynamic filter management
 * - Progress tracking
 * - User feedback
 */

// Global variables
let currentFileName = null;
let processedFileName = null;

// Filter definitions with metadata
const filterDefinitions = [
    {
        name: 'grayscale', 
        label: '그레이스케일', 
        icon: '⚫', 
        description: '이미지를 흑백으로 변환하고 강도를 조절합니다', 
        min: 0.1, 
        max: 2.0, 
        value: 1.0, 
        step: 0.1, 
        type: 'double',
        category: 'color'
    },
    {
        name: 'blur', 
        label: '블러', 
        icon: '🌫️', 
        description: '이미지를 부드럽게 블러 처리합니다', 
        min: 1, 
        max: 15, 
        value: 5, 
        step: 2, 
        type: 'int',
        category: 'effect'
    },
    {
        name: 'edges', 
        label: '엣지 검출', 
        icon: '🔍', 
        description: '이미지의 경계선을 검출하여 강조합니다', 
        min: 10, 
        max: 200, 
        value: 100, 
        step: 10, 
        type: 'int',
        category: 'effect'
    },
    {
        name: 'brightness', 
        label: '밝기/대비', 
        icon: '💡', 
        description: '이미지의 밝기와 대비를 조절합니다', 
        special: true,
        category: 'adjust'
    },
    {
        name: 'histogram', 
        label: '히스토그램 평활화', 
        icon: '📊', 
        description: '이미지의 대비를 향상시켜 더 선명하게 만듭니다', 
        min: 0.1, 
        max: 2.0, 
        value: 1.0, 
        step: 0.1, 
        type: 'double',
        category: 'adjust'
    },
    {
        name: 'sepia', 
        label: '세피아', 
        icon: '🟤', 
        description: '빈티지한 갈색 톤의 세피아 효과를 적용합니다', 
        min: 0.1, 
        max: 2.0, 
        value: 1.0, 
        step: 0.1, 
        type: 'double',
        category: 'color'
    },
    {
        name: 'sharpen', 
        label: '선명도', 
        icon: '🔪', 
        description: '이미지의 선명도를 향상시킵니다', 
        min: 0.1, 
        max: 3.0, 
        value: 1.0, 
        step: 0.1, 
        type: 'double',
        category: 'adjust'
    },
    {
        name: 'saturation', 
        label: '채도', 
        icon: '🌈', 
        description: '색상의 채도를 조절합니다', 
        min: 0.0, 
        max: 3.0, 
        value: 1.0, 
        step: 0.1, 
        type: 'double',
        category: 'color'
    },
    {
        name: 'noise', 
        label: '노이즈', 
        icon: '📺', 
        description: '이미지에 노이즈 효과를 추가합니다', 
        min: 0, 
        max: 50, 
        value: 10, 
        step: 5, 
        type: 'int',
        category: 'effect'
    },
    {
        name: 'invert', 
        label: '반전', 
        icon: '🔄', 
        description: '이미지 색상을 반전시킵니다', 
        min: 0.0, 
        max: 1.0, 
        value: 1.0, 
        step: 0.1, 
        type: 'double',
        category: 'color'
    }
];

/**
 * Application Initialization
 */
function initializeApp() {
    console.log('🎨 Image Filter Studio - Initializing...');
    
    initializeFilters();
    setupEventListeners();
    setupDragAndDrop();
    
    console.log('✅ Application initialized successfully');
}

/**
 * Add welcome animation to enhance UX (DISABLED)
 */
function addWelcomeAnimation() {
    // Animation disabled per user request
    // const elements = document.querySelectorAll('.left-panel, .right-panel, .header');
    // elements.forEach((el, index) => {
    //     el.style.opacity = '0';
    //     el.style.transform = 'translateY(20px)';
    //     
    //     setTimeout(() => {
    //         el.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
    //         el.style.opacity = '1';
    //         el.style.transform = 'translateY(0)';
    //     }, index * 200);
    // });
}

/**
 * Initialize filter UI components
 */
function initializeFilters() {
    const filterList = document.getElementById('filterOrderList');
    filterList.innerHTML = ''; // Clear existing content
    
    filterDefinitions.forEach((filter, index) => {
        const filterItem = createFilterItem(filter);
        // Animation disabled per user request
        // filterItem.style.animationDelay = `${index * 0.1}s`;
        filterList.appendChild(filterItem);
    });
    
    console.log(`📱 Created ${filterDefinitions.length} filter items`);
}

/**
 * Create individual filter item with enhanced UX
 */
function createFilterItem(filter) {
    const div = document.createElement('div');
    div.className = 'filter-item';
    div.draggable = true;
    div.dataset.filterName = filter.name;
    div.dataset.category = filter.category;
    
    let sliderHTML = '';
    if (filter.special) {
        // Special handling for brightness/contrast
        sliderHTML = `
            <div style="margin-top: 10px;">
                <label style="font-size: 12px;">대비: <span class="slider-value" id="${filter.name}AlphaValue">1.0</span></label>
                <input type="range" class="slider" id="${filter.name}AlphaSlider" min="0.1" max="3.0" value="1.0" step="0.1" 
                       data-tooltip="대비를 조절합니다">
                <div class="progress-container">
                    <div class="progress-bar" id="${filter.name}AlphaProgress"></div>
                </div>
            </div>
            <div>
                <label style="font-size: 12px;">밝기: <span class="slider-value" id="${filter.name}BetaValue">0</span></label>
                <input type="range" class="slider" id="${filter.name}BetaSlider" min="-100" max="100" value="0" step="10"
                       data-tooltip="밝기를 조절합니다">
                <div class="progress-container">
                    <div class="progress-bar" id="${filter.name}BetaProgress"></div>
                </div>
            </div>
        `;
    } else {
        sliderHTML = `
            <input type="range" class="slider" id="${filter.name}Slider" 
                   min="${filter.min}" max="${filter.max}" value="${filter.value}" step="${filter.step}"
                   data-tooltip="${filter.description}">
            <span class="slider-value" id="${filter.name}Value">${filter.value}</span>
            <div class="progress-container">
                <div class="progress-bar" id="${filter.name}Progress"></div>
            </div>
        `;
    }
    
    div.innerHTML = `
        <div class="drag-handle tooltip" data-tooltip="드래그하여 순서 변경">⋮⋮</div>
        <label class="tooltip" data-tooltip="${filter.description}">
            <input type="checkbox" id="${filter.name}Check" class="filter-checkbox">
            ${filter.icon} ${filter.label}
        </label>
        ${sliderHTML}
        <div class="filter-description">${filter.description}</div>
    `;
    
    return div;
}

/**
 * Enhanced drag and drop functionality with auto-scroll
 */
function setupDragAndDrop() {
    const filterList = document.getElementById('filterOrderList');
    const controlsSection = document.querySelector('.controls-section');
    let draggedElement = null;
    let placeholderElement = null;
    let autoScrollInterval = null;

    filterList.addEventListener('dragstart', (e) => {
        if (e.target.classList.contains('filter-item')) {
            draggedElement = e.target;
            e.target.classList.add('dragging');
            
            // Create placeholder
            placeholderElement = e.target.cloneNode(true);
            placeholderElement.classList.remove('dragging');
            placeholderElement.classList.add('placeholder');
            placeholderElement.style.opacity = '0.3';
            
            // Add drag feedback
            showNotification('필터 순서를 변경하고 있습니다...', 'info', 1000);
        }
    });

    filterList.addEventListener('dragend', (e) => {
        if (e.target.classList.contains('filter-item')) {
            e.target.classList.remove('dragging');
            
            if (placeholderElement) {
                placeholderElement.remove();
                placeholderElement = null;
            }
            
            // Clear auto-scroll
            if (autoScrollInterval) {
                clearInterval(autoScrollInterval);
                autoScrollInterval = null;
            }
            
            draggedElement = null;
            updateFilterOrder();
            
            // Success feedback
            showNotification('필터 순서가 변경되었습니다', 'success', 2000);
        }
    });

    filterList.addEventListener('dragover', (e) => {
        e.preventDefault();
        const afterElement = getDragAfterElement(filterList, e.clientY);
        const dragging = document.querySelector('.dragging');
        
        if (afterElement == null) {
            filterList.appendChild(dragging);
        } else {
            filterList.insertBefore(dragging, afterElement);
        }

        // Auto-scroll functionality
        if (controlsSection && dragging) {
            const rect = controlsSection.getBoundingClientRect();
            const scrollThreshold = 50; // pixels from edge to trigger scroll
            const scrollSpeed = 5; // pixels per scroll step
            
            // Clear existing interval
            if (autoScrollInterval) {
                clearInterval(autoScrollInterval);
                autoScrollInterval = null;
            }
            
            // Check if near top edge
            if (e.clientY < rect.top + scrollThreshold) {
                autoScrollInterval = setInterval(() => {
                    controlsSection.scrollTop = Math.max(0, controlsSection.scrollTop - scrollSpeed);
                }, 16); // ~60fps
            }
            // Check if near bottom edge
            else if (e.clientY > rect.bottom - scrollThreshold) {
                autoScrollInterval = setInterval(() => {
                    controlsSection.scrollTop = Math.min(
                        controlsSection.scrollHeight - controlsSection.clientHeight,
                        controlsSection.scrollTop + scrollSpeed
                    );
                }, 16); // ~60fps
            }
        }
    });

    console.log('🎯 Drag & Drop functionality with auto-scroll initialized');
}

/**
 * Get drag position helper
 */
function getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll('.filter-item:not(.dragging)')];
    
    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        
        if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child };
        } else {
            return closest;
        }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}

/**
 * Update filter order on backend
 */
function updateFilterOrder() {
    if (!currentFileName) return;
    
    const filterItems = document.querySelectorAll('.filter-item');
    const newOrder = Array.from(filterItems).map(item => item.dataset.filterName);
    
    console.log('🔄 Updating filter order:', newOrder);
    
    fetch(`/filter/order?fileName=${currentFileName}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ order: newOrder })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success === 'true') {
            showResult(currentFileName);
            console.log('✅ Filter order updated successfully');
        } else {
            console.error('❌ Failed to update filter order:', data.message);
        }
    })
    .catch(error => {
        console.error('❌ Error updating filter order:', error);
        showNotification('필터 순서 변경 중 오류가 발생했습니다', 'error');
    });
}

/**
 * Setup event listeners with enhanced UX
 */
function setupEventListeners() {
    // File upload
    const imageInput = document.getElementById('imageInput');
    if (imageInput) {
        imageInput.addEventListener('change', function(e) {
            if (e.target.files.length > 0) {
                uploadImage(e.target.files[0]);
            }
        });
    }

    // Dynamic event delegation for sliders and checkboxes
    document.addEventListener('input', (e) => {
        if (e.target.classList.contains('slider')) {
            handleSliderChange(e.target);
        }
        
        if (e.target.classList.contains('filter-checkbox')) {
            handleCheckboxChange(e.target);
        }
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey || e.metaKey) {
            switch(e.key) {
                case 's':
                    e.preventDefault();
                    downloadImage();
                    break;
                case 'r':
                    e.preventDefault();
                    resetFilters();
                    break;
            }
        }
    });

    console.log('🎮 Event listeners initialized');
}

/**
 * Handle slider value changes with progress indication
 */
function handleSliderChange(slider) {
    const filterId = slider.id;
    let valueElementId;
    let progressElementId;
    
    if (filterId.includes('Alpha')) {
        valueElementId = filterId.replace('Slider', 'Value');
        progressElementId = filterId.replace('Slider', 'Progress');
    } else if (filterId.includes('Beta')) {
        valueElementId = filterId.replace('Slider', 'Value');
        progressElementId = filterId.replace('Slider', 'Progress');
    } else {
        valueElementId = filterId.replace('Slider', 'Value');
        progressElementId = filterId.replace('Slider', 'Progress');
    }
    
    const valueElement = document.getElementById(valueElementId);
    const progressElement = document.getElementById(progressElementId);
    
    if (valueElement) {
        const value = parseFloat(slider.value);
        valueElement.textContent = Number.isInteger(value) ? value : value.toFixed(1);
        
        // Update progress bar
        if (progressElement) {
            const percentage = ((value - slider.min) / (slider.max - slider.min)) * 100;
            progressElement.style.width = `${percentage}%`;
        }
    }
    
    // Debounced update to avoid too many requests
    clearTimeout(handleSliderChange.timeout);
    handleSliderChange.timeout = setTimeout(() => {
        updateFilters();
    }, 300);
}

/**
 * Handle checkbox changes with visual feedback
 */
function handleCheckboxChange(checkbox) {
    const filterItem = checkbox.closest('.filter-item');
    
    if (checkbox.checked) {
        filterItem.classList.add('active');
        filterItem.style.borderColor = 'rgba(102, 126, 234, 0.5)';
    } else {
        filterItem.classList.remove('active');
        filterItem.style.borderColor = 'rgba(255, 255, 255, 0.1)';
    }
    
    updateFilters();
}

/**
 * Upload image with progress tracking
 */
function uploadImage(file) {
    if (!file) return;
    
    console.log('📤 Uploading image:', file.name);
    
    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/bmp', 'image/tiff'];
    if (!validTypes.includes(file.type)) {
        showNotification('지원되지 않는 파일 형식입니다. JPG, PNG, BMP, TIFF 파일만 업로드 가능합니다.', 'error');
        return;
    }
    
    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
        showNotification('파일 크기가 너무 큽니다. 10MB 이하의 파일만 업로드 가능합니다.', 'error');
        return;
    }

    const formData = new FormData();
    formData.append('file', file);

    showLoading(true);
    showNotification('이미지를 업로드하고 있습니다...', 'info');

    fetch('/upload', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        showLoading(false);
        if (data.success === 'true') {
            currentFileName = data.fileName;
            processedFileName = null;
            showNotification(data.message, 'success');
            
            // Show original image
            showOriginalImage(data.fileName);
            
            // Reset result area
            resetResultArea();
            
            // Enable controls
            enableFilterButtons(true);
            
            console.log('✅ Image uploaded successfully:', data.fileName);
        } else {
            showNotification(data.message, 'error');
            console.error('❌ Upload failed:', data.message);
        }
    })
    .catch(error => {
        showLoading(false);
        showNotification('업로드 중 오류가 발생했습니다: ' + error.message, 'error');
        console.error('❌ Upload error:', error);
    });
}

/**
 * Show original image with animation
 */
function showOriginalImage(fileName) {
    const originalContainer = document.getElementById('originalImageContainer');
    originalContainer.innerHTML = `<img src="/uploads/${fileName}" alt="원본 이미지" class="result-image fade-in">`;
    originalContainer.classList.add('has-image');
}

/**
 * Reset result area
 */
function resetResultArea() {
    const resultContainer = document.getElementById('resultImageContainer');
    resultContainer.innerHTML = `
        <div class="placeholder-text">필터를 적용해보세요</div>
        <div class="loading" id="loading">
            <div class="spinner"></div>
            <p style="margin-top: 10px;">처리 중...</p>
        </div>
    `;
    resultContainer.classList.remove('has-image');
}

/**
 * Show processed result with caching prevention
 */
function showResult(fileName) {
    const resultContainer = document.getElementById('resultImageContainer');
    const timestamp = new Date().getTime();
    resultContainer.innerHTML = `
        <img src="/image/${fileName}?t=${timestamp}" alt="처리된 이미지" class="result-image fade-in">
        <div class="loading" id="loading">
            <div class="spinner"></div>
            <p style="margin-top: 10px;">처리 중...</p>
        </div>
    `;
    resultContainer.classList.add('has-image');
}

/**
 * Enable/disable filter controls
 */
function enableFilterButtons(enabled) {
    const resetBtn = document.getElementById('resetBtn');
    const downloadBtn = document.getElementById('downloadBtn');
    const downloadBtn2 = document.getElementById('downloadBtn2');
    
    if (resetBtn) resetBtn.disabled = !enabled;
    if (downloadBtn) downloadBtn.disabled = !enabled;
    if (downloadBtn2) downloadBtn2.disabled = !enabled;
    
    // Also enable/disable filter controls
    const checkboxes = document.querySelectorAll('.filter-checkbox');
    const sliders = document.querySelectorAll('.slider');
    
    checkboxes.forEach(cb => cb.disabled = !enabled);
    sliders.forEach(slider => slider.disabled = !enabled);
}

/**
 * Update filters with comprehensive data collection
 */
function updateFilters() {
    if (!currentFileName) return;
    
    const filterData = {};
    const activeFilters = [];
    
    filterDefinitions.forEach(filter => {
        const enabled = document.getElementById(`${filter.name}Check`).checked;
        let value;
        
        if (filter.special) {
            // Special handling for brightness/contrast
            value = {
                alpha: document.getElementById(`${filter.name}AlphaSlider`).value,
                beta: document.getElementById(`${filter.name}BetaSlider`).value
            };
        } else {
            value = document.getElementById(`${filter.name}Slider`).value;
        }
        
        filterData[filter.name] = {
            enabled: enabled,
            value: value
        };
        
        if (enabled) {
            activeFilters.push(filter.label);
        }
    });

    if (activeFilters.length > 0) {
        showNotification(`적용 중: ${activeFilters.join(', ')}`, 'info', 1500);
    }

    console.log('🎛️ Updating filters:', activeFilters);

    fetch('/filter/update?fileName=' + currentFileName, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(filterData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success === 'true') {
            showResult(currentFileName);
            console.log('✅ Filters applied successfully');
        } else {
            showNotification(data.message, 'error');
            console.error('❌ Filter application failed:', data.message);
        }
    })
    .catch(error => {
        showNotification('필터 적용 중 오류가 발생했습니다', 'error');
        console.error('❌ Filter update error:', error);
    });
}

/**
 * Download processed image
 */
function downloadImage() {
    if (!currentFileName) {
        showNotification('먼저 이미지를 업로드해주세요.', 'error');
        return;
    }

    console.log('💾 Downloading image...');
    showNotification('이미지를 다운로드하고 있습니다...', 'info');

    // Create download link
    const downloadUrl = `/download/${currentFileName}`;
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = '';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showNotification('이미지 다운로드가 시작되었습니다.', 'success');
    console.log('✅ Download initiated');
}

/**
 * Reset all filters with animation
 */
function resetFilters() {
    if (!currentFileName) {
        showNotification('먼저 이미지를 업로드해주세요.', 'error');
        return;
    }

    console.log('🔄 Resetting all filters...');

    // Reset UI with animation
    const filterItems = document.querySelectorAll('.filter-item');
    filterItems.forEach((item, index) => {
        setTimeout(() => {
            // Reset checkbox
            const checkbox = item.querySelector('.filter-checkbox');
            if (checkbox) {
                checkbox.checked = false;
                item.classList.remove('active');
                item.style.borderColor = 'rgba(255, 255, 255, 0.1)';
            }
            
            // Reset sliders to default values
            filterDefinitions.forEach(filter => {
                if (filter.special) {
                    const alphaSlider = document.getElementById(`${filter.name}AlphaSlider`);
                    const alphaValue = document.getElementById(`${filter.name}AlphaValue`);
                    const betaSlider = document.getElementById(`${filter.name}BetaSlider`);
                    const betaValue = document.getElementById(`${filter.name}BetaValue`);
                    
                    if (alphaSlider && alphaValue) {
                        alphaSlider.value = 1.0;
                        alphaValue.textContent = '1.0';
                    }
                    if (betaSlider && betaValue) {
                        betaSlider.value = 0;
                        betaValue.textContent = '0';
                    }
                } else {
                    const slider = document.getElementById(`${filter.name}Slider`);
                    const value = document.getElementById(`${filter.name}Value`);
                    if (slider && value) {
                        slider.value = filter.value;
                        value.textContent = filter.value;
                    }
                }
            });
        }, index * 50);
    });

    showLoading(true);

    const formData = new FormData();
    formData.append('fileName', currentFileName);

    fetch('/filter/reset', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        showLoading(false);
        if (data.success === 'true') {
            showResult(currentFileName);
            showNotification(data.message, 'success');
            console.log('✅ Filters reset successfully');
        } else {
            showNotification(data.message, 'error');
            console.error('❌ Reset failed:', data.message);
        }
    })
    .catch(error => {
        showLoading(false);
        showNotification('처리 중 오류가 발생했습니다: ' + error.message, 'error');
        console.error('❌ Reset error:', error);
    });
}

/**
 * Show loading indicator
 */
function showLoading(show) {
    const loading = document.getElementById('loading');
    if (loading) {
        loading.style.display = show ? 'block' : 'none';
    }
}

/**
 * Enhanced notification system
 */
function showNotification(message, type = 'info', duration = 3000) {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());

    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;

    // Add icon based on type
    const icons = {
        success: '✅',
        error: '❌',
        info: 'ℹ️',
        warning: '⚠️'
    };
    
    if (icons[type]) {
        notification.textContent = `${icons[type]} ${message}`;
    }

    document.body.appendChild(notification);

    // Trigger animation
    setTimeout(() => notification.classList.add('show'), 100);

    // Auto remove
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, duration);

    console.log(`📢 Notification [${type}]: ${message}`);
}

/**
 * Initialize tooltips (DISABLED)
 */
function initializeTooltips() {
    // Tooltips disabled per user request
    // const tooltipElements = document.querySelectorAll('[data-tooltip]');
    // tooltipElements.forEach(element => {
    //     element.classList.add('tooltip');
    // });
}

/**
 * Performance monitoring
 */
function startPerformanceMonitoring() {
    if (window.performance) {
        console.log('📊 Performance monitoring enabled');
        
        // Monitor page load time
        window.addEventListener('load', () => {
            const loadTime = window.performance.timing.loadEventEnd - window.performance.timing.navigationStart;
            console.log(`⏱️ Page load time: ${loadTime}ms`);
        });
    }
}

// Initialize application when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    initializeTooltips();
    startPerformanceMonitoring();
});

// Export functions for testing (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        filterDefinitions,
        initializeApp,
        uploadImage,
        downloadImage,
        resetFilters,
        updateFilters
    };
}