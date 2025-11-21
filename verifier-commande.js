// Variables globales pour le scan QR Code
let html5QrcodeScanner = null;
let cameraScanning = false;

// Vérifier un code de retrait
function verifyCode() {
    const codeInput = document.getElementById('code-input');
    const code = codeInput.value.trim().toUpperCase();
    
    if (!code) {
        showError('Veuillez entrer un code de retrait');
        return;
    }

    validateAndDisplayCode(code);
}

// Valider et afficher les informations de la commande
function validateAndDisplayCode(code) {
    const cleanCode = code.trim().toUpperCase();
    
    if (!cleanCode) {
        showError('Code vide. Veuillez entrer ou scanner un code de retrait.');
        return false;
    }

    const orderData = Storage.getOrderByCode(cleanCode);
    
    if (!orderData) {
        showError('Code invalide ou commande introuvable. Veuillez vérifier votre code de retrait.');
        return false;
    }

    displayOrderDetails(orderData);
    return true;
}

// Afficher les détails de la commande
function displayOrderDetails(orderData) {
    // Masquer les messages d'erreur
    const errorMsg = document.getElementById('error-message');
    if (errorMsg) errorMsg.style.display = 'none';

    // Afficher les détails
    const detailsBox = document.getElementById('order-details');
    if (!detailsBox) return;

    // Code de retrait
    document.getElementById('display-code').textContent = orderData.code;

    // Statut
    const statusEl = document.getElementById('order-status');
    if (orderData.used) {
        statusEl.innerHTML = '<span class="order-status completed">✅ Récupéré</span>';
        if (orderData.usedAt) {
            statusEl.innerHTML += `<p style="font-size: 12px; color: #666; margin-top: 5px;">Récupéré le: ${new Date(orderData.usedAt).toLocaleString('fr-FR')}</p>`;
        }
    } else {
        statusEl.innerHTML = '<span class="order-status pending">⏳ En attente de retrait</span>';
    }

    // Informations de commande
    document.getElementById('order-id').textContent = `#${orderData.id}`;
    document.getElementById('order-date').textContent = new Date(orderData.date).toLocaleString('fr-FR');
    document.getElementById('client-name').textContent = `${orderData.customer.firstName} ${orderData.customer.lastName}`;
    document.getElementById('client-email').textContent = orderData.customer.email;
    document.getElementById('client-phone').textContent = orderData.customer.phone;

    // Articles
    const itemsList = document.getElementById('order-items-list');
    itemsList.innerHTML = '';
    
    let total = 0;
    orderData.items.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.name}</td>
            <td>${item.quantity}</td>
            <td>${formatPrice(item.total)}</td>
        `;
        itemsList.appendChild(row);
        total += item.total;
    });

    document.getElementById('order-total-display').textContent = formatPrice(total);

    // Afficher la boîte de détails
    detailsBox.style.display = 'block';
    detailsBox.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Gérer les onglets de scan
function switchScanTab(tabName) {
    // Masquer tous les modes
    document.querySelectorAll('.scan-mode').forEach(mode => {
        mode.style.display = 'none';
    });
    
    // Retirer la classe active de tous les onglets
    document.querySelectorAll('.scan-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Afficher le mode sélectionné
    const activeMode = document.getElementById(`${tabName}-scan`);
    const activeTab = document.querySelector(`[data-tab="${tabName}"]`);
    
    if (activeMode) activeMode.style.display = 'block';
    if (activeTab) activeTab.classList.add('active');
    
    // Arrêter la caméra si on change d'onglet
    if (tabName !== 'camera') {
        stopCameraScan();
    }
    
    // Réinitialiser l'upload si on change d'onglet
    if (tabName !== 'upload') {
        const fileInput = document.getElementById('qr-file-input');
        const preview = document.getElementById('upload-preview');
        if (fileInput) fileInput.value = '';
        if (preview) preview.style.display = 'none';
    }
}

// Démarrer le scan avec la caméra
function startCameraScan() {
    if (cameraScanning) return;
    
    const qrReader = document.getElementById('qr-reader');
    if (!qrReader || typeof Html5Qrcode === 'undefined') {
        showError('Bibliothèque de scan QR Code non disponible');
        return;
    }
    
    html5QrcodeScanner = new Html5Qrcode("qr-reader");
    const stopBtn = document.getElementById('stop-camera-btn');
    
    html5QrcodeScanner.start(
        { facingMode: "environment" },
        {
            fps: 10,
            qrbox: { width: 250, height: 250 }
        },
        (decodedText, decodedResult) => {
            stopCameraScan();
            if (validateAndDisplayCode(decodedText)) {
                // Le code a été validé, les détails sont affichés
            }
        },
        (errorMessage) => {
            // Erreur ignorée (scan en cours)
        }
    ).then(() => {
        cameraScanning = true;
        if (stopBtn) stopBtn.style.display = 'block';
    }).catch((err) => {
        console.error('Erreur démarrage caméra:', err);
        showError('Impossible d\'accéder à la caméra. Vérifiez les permissions.');
    });
}

// Arrêter le scan avec la caméra
function stopCameraScan() {
    if (html5QrcodeScanner && cameraScanning) {
        html5QrcodeScanner.stop().then(() => {
            html5QrcodeScanner.clear();
            cameraScanning = false;
            const stopBtn = document.getElementById('stop-camera-btn');
            if (stopBtn) stopBtn.style.display = 'none';
        }).catch((err) => {
            console.error('Erreur arrêt caméra:', err);
        });
    }
}

// Scanner depuis une image uploadée
function scanUploadedImage(file) {
    if (!file || typeof Html5Qrcode === 'undefined') {
        showError('Fichier invalide ou bibliothèque non disponible');
        return;
    }
    
    const qrCodeInstance = new Html5Qrcode();
    
    qrCodeInstance.scanFile(file, true)
        .then(decodedText => {
            // Afficher l'image
            const preview = document.getElementById('upload-preview');
            const img = document.getElementById('uploaded-image');
            if (preview && img) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    img.src = e.target.result;
                    preview.style.display = 'block';
                };
                reader.readAsDataURL(file);
            }
            
            // Valider le code
            validateAndDisplayCode(decodedText);
        })
        .catch(err => {
            console.error('Erreur scan image:', err);
            showError('Impossible de scanner le QR Code dans cette image. Vérifiez que l\'image contient un QR Code valide.');
        });
}

// Réinitialiser le formulaire
function resetVerifyForm() {
    document.getElementById('code-input').value = '';
    document.getElementById('order-details').style.display = 'none';
    document.getElementById('error-message').style.display = 'none';
    stopCameraScan();
    
    const fileInput = document.getElementById('qr-file-input');
    const preview = document.getElementById('upload-preview');
    if (fileInput) fileInput.value = '';
    if (preview) preview.style.display = 'none';
    
    switchScanTab('manual');
    document.getElementById('code-input').focus();
}

// Afficher une erreur
function showError(message) {
    const errorMsg = document.getElementById('error-message');
    if (errorMsg) {
        errorMsg.querySelector('p').textContent = '❌ ' + message;
        errorMsg.style.display = 'block';
    }
    
    const detailsBox = document.getElementById('order-details');
    if (detailsBox) detailsBox.style.display = 'none';
}

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    updateCartCount();
    
    // Bouton vérifier
    const verifyBtn = document.getElementById('verify-btn');
    if (verifyBtn) {
        verifyBtn.addEventListener('click', verifyCode);
    }

    // Input manuel
    const codeInput = document.getElementById('code-input');
    if (codeInput) {
        codeInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                verifyCode();
            }
        });
    }

    // Gestion des onglets
    document.querySelectorAll('.scan-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            const tabName = tab.dataset.tab;
            switchScanTab(tabName);
            
            // Démarrer automatiquement la caméra si on clique sur l'onglet caméra
            if (tabName === 'camera') {
                setTimeout(() => startCameraScan(), 100);
            }
        });
    });

    // Bouton arrêter caméra
    const stopCameraBtn = document.getElementById('stop-camera-btn');
    if (stopCameraBtn) {
        stopCameraBtn.addEventListener('click', stopCameraScan);
    }

    // Upload d'image
    const fileInput = document.getElementById('qr-file-input');
    if (fileInput) {
        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                scanUploadedImage(file);
            }
        });
        
        // Drag and drop
        const uploadLabel = document.querySelector('.upload-label');
        if (uploadLabel) {
            uploadLabel.addEventListener('dragover', (e) => {
                e.preventDefault();
                uploadLabel.style.backgroundColor = '#e8f4f8';
            });
            
            uploadLabel.addEventListener('dragleave', () => {
                uploadLabel.style.backgroundColor = '';
            });
            
            uploadLabel.addEventListener('drop', (e) => {
                e.preventDefault();
                uploadLabel.style.backgroundColor = '';
                const file = e.dataTransfer.files[0];
                if (file && file.type.startsWith('image/')) {
                    fileInput.files = e.dataTransfer.files;
                    scanUploadedImage(file);
                } else {
                    showError('Veuillez déposer une image valide');
                }
            });
        }
    }

    // Bouton scan image uploadée
    const scanUploadedBtn = document.getElementById('scan-uploaded-btn');
    if (scanUploadedBtn) {
        scanUploadedBtn.addEventListener('click', () => {
            const fileInput = document.getElementById('qr-file-input');
            if (fileInput && fileInput.files[0]) {
                scanUploadedImage(fileInput.files[0]);
            }
        });
    }

    // Bouton nouvelle vérification
    const newVerifyBtn = document.getElementById('new-verify-btn');
    if (newVerifyBtn) {
        newVerifyBtn.addEventListener('click', resetVerifyForm);
    }
});

