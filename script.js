// DOM Elements
const textInput = document.getElementById('textInput');
const colorDark = document.getElementById('colorDark');
const colorLight = document.getElementById('colorLight');
const errorCorrection = document.getElementById('errorCorrection');
const sizeInput = document.getElementById('sizeInput');
const sizeValue = document.getElementById('sizeValue');
const qrCanvas = document.getElementById('qrCanvas');
const qrContainer = document.getElementById('qrContainer');
const placeholderText = document.getElementById('placeholderText');
const clearBtn = document.getElementById('clearBtn');
const downloadBtn = document.getElementById('downloadBtn');
const exportCanvas = document.createElement('canvas');
const PREVIEW_SIZE_DESKTOP = 350;
const PREVIEW_SIZE_MOBILE = 260;

// Debounce function to limit how often the QR code regenerates while typing
function debounce(func, delay) {
    let timeoutId;
    return function (...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            func.apply(this, args);
        }, delay);
    };
}

function getPreviewSize() {
    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    return isMobile ? PREVIEW_SIZE_MOBILE : PREVIEW_SIZE_DESKTOP;
}

// Core Generation Function
function generateQRCode() {
    const text = textInput.value.trim();
    const size = parseInt(sizeInput.value);
    
    // Update UI size label
    sizeValue.textContent = size;

    if (!text) {
        qrContainer.classList.add('hidden');
        placeholderText.classList.remove('hidden');
        return;
    }

    // Show canvas, hide placeholder
    qrContainer.classList.remove('hidden');
    placeholderText.classList.add('hidden');

    // Full-resolution QR generation options (used for downloading)
    const exportOptions = {
        width: size,
        margin: 1,
        errorCorrectionLevel: errorCorrection.value,
        color: {
            dark: colorDark.value, // Foreground
            light: colorLight.value // Background
        }
    };

    const previewSize = getPreviewSize();

    // Keep CSS display size aligned with preview render size.
    qrContainer.style.setProperty('--preview-size', `${previewSize}px`);
    qrCanvas.style.setProperty('--preview-size', `${previewSize}px`);

    // Generate full-resolution QR in hidden export canvas
    QRCode.toCanvas(exportCanvas, text, exportOptions, function (error) {
        if (error) console.error("Error generating export QR Code:", error);
    });

    // Generate preview QR directly at preview size for crisp on-screen rendering
    const previewOptions = {
        width: previewSize,
        margin: 1,
        errorCorrectionLevel: errorCorrection.value,
        color: {
            dark: colorDark.value,
            light: colorLight.value
        }
    };

    QRCode.toCanvas(qrCanvas, text, previewOptions, function (error) {
        if (error) console.error("Error generating preview QR Code:", error);
    });
}

// Create a debounced version of the generator for text input (300ms delay)
const debouncedGenerate = debounce(generateQRCode, 300);

// Event Listeners
textInput.addEventListener('input', debouncedGenerate);
colorDark.addEventListener('input', generateQRCode); 
colorLight.addEventListener('input', generateQRCode);
errorCorrection.addEventListener('change', generateQRCode);
sizeInput.addEventListener('input', generateQRCode);
window.addEventListener('resize', debounce(generateQRCode, 120));

// Clear functionality
clearBtn.addEventListener('click', () => {
    textInput.value = '';
    generateQRCode(); 
    textInput.focus();
});

// Download functionality
downloadBtn.addEventListener('click', () => {
    const text = textInput.value.trim();

    if (!text) {
        alert("Please enter some text or a URL first to generate a QR code.");
        return;
    }

    const dataUrl = exportCanvas.toDataURL("image/png");

    // Create safe filename (max 20 chars)
    let fileName = text
        .replace(/https?:\/\//, '')
        .replace(/[^a-z0-9]+/gi, '_')
        .substring(0, 20);

    // fallback if empty
    if (!fileName) {
        fileName = "qrcode";
    }

    // Add your branding suffix
    fileName = fileName + "_by_hackack-tech";

    // Create download link
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = fileName + ".png";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
});
