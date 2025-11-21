// Variables globales pour le scan QR Code
let html5QrcodeScanner = null;
let cameraScanning = false;

// Valider un code de retrait (utilisé par tous les modes de scan)
function validateCode(code) {
    const cleanCode = code.trim().toUpperCase();
    
    if (!cleanCode) {
        showError('Code vide. Veuillez entrer ou scanner un code de retrait.');
        return false;
    }

    const orderData = Storage.getOrderByCode(cleanCode);
    
    if (!orderData) {
        showError('Code invalide. Veuillez vérifier le code.');
        return false;
    }

    if (orderData.used) {
        showError('Ce code a déjà été utilisé. Date d\'utilisation : ' + new Date(orderData.usedAt).toLocaleString('fr-FR'));
        return false;
    }

    displayOrderDetails(orderData);
    return true;
}

// Scanner et valider un code de retrait (mode manuel)
function scanCode() {
    const codeInput = document.getElementById('code-input');
    const code = codeInput.value.trim().toUpperCase();
    
    if (!code) {
        alert('Veuillez entrer un code de retrait');
        return;
    }

    validateCode(code);
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

    // Informations client
    document.getElementById('client-name').textContent = `${orderData.customer.firstName} ${orderData.customer.lastName}`;
    document.getElementById('client-phone').textContent = orderData.customer.phone;
    document.getElementById('client-email').textContent = orderData.customer.email;
    document.getElementById('order-date').textContent = new Date(orderData.date).toLocaleString('fr-FR');

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

    // Réinitialiser les checkboxes
    document.getElementById('identity-verified').checked = false;
    document.getElementById('product-delivered').checked = false;
    document.getElementById('validate-btn').disabled = true;

    // Afficher la boîte de détails
    detailsBox.style.display = 'block';
    detailsBox.scrollIntoView({ behavior: 'smooth', block: 'start' });

    // Stocker le code actuel pour validation
    detailsBox.dataset.code = orderData.code;
}

// Vérifier si la validation peut être activée
function checkValidationReady() {
    const identityChecked = document.getElementById('identity-verified').checked;
    const productChecked = document.getElementById('product-delivered').checked;
    const validateBtn = document.getElementById('validate-btn');
    
    if (validateBtn) {
        validateBtn.disabled = !(identityChecked && productChecked);
    }
}

// Valider le retrait
function validatePickup() {
    const detailsBox = document.getElementById('order-details');
    const code = detailsBox.dataset.code;

    if (!code) {
        alert('Erreur : code non trouvé');
        return;
    }

    const identityChecked = document.getElementById('identity-verified').checked;
    const productChecked = document.getElementById('product-delivered').checked;

    if (!identityChecked || !productChecked) {
        alert('Veuillez cocher toutes les cases de validation');
        return;
    }

    if (!confirm('Confirmer la validation du retrait ? Cette action est irréversible.')) {
        return;
    }

    // Marquer le code comme utilisé
    Storage.markCodeAsUsed(code);

    // Mettre à jour le statut de la commande
    const orders = Storage.getOrders();
    const orderIndex = orders.findIndex(o => o.code === code);
    if (orderIndex !== -1) {
        orders[orderIndex].status = 'completed';
        orders[orderIndex].used = true;
        orders[orderIndex].usedAt = new Date().toISOString();
        localStorage.setItem('orders', JSON.stringify(orders));
    }

    // Afficher le message de succès
    const successMsg = document.getElementById('success-message');
    if (successMsg) {
        successMsg.style.display = 'block';
    }

    // Désactiver le bouton de validation
    const validateBtn = document.getElementById('validate-btn');
    if (validateBtn) {
        validateBtn.disabled = true;
        validateBtn.textContent = 'Retrait validé';
    }

    // Réinitialiser le formulaire après 3 secondes
    setTimeout(() => {
        resetScanForm();
        loadRecentOrders();
    }, 3000);
}

// Réinitialiser le formulaire de scan
function resetScanForm() {
    document.getElementById('code-input').value = '';
    document.getElementById('order-details').style.display = 'none';
    document.getElementById('success-message').style.display = 'none';
    document.getElementById('error-message').style.display = 'none';
    
    // Arrêter la caméra si elle est active
    stopCameraScan();
    
    // Réinitialiser l'upload
    const fileInput = document.getElementById('qr-file-input');
    const preview = document.getElementById('upload-preview');
    if (fileInput) fileInput.value = '';
    if (preview) preview.style.display = 'none';
    
    // Revenir à l'onglet manuel
    switchScanTab('manual');
    
    document.getElementById('code-input').focus();
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
        { facingMode: "environment" }, // Utiliser la caméra arrière
        {
            fps: 10,
            qrbox: { width: 250, height: 250 }
        },
        (decodedText, decodedResult) => {
            // Code scanné avec succès
            stopCameraScan();
            if (validateCode(decodedText)) {
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
            validateCode(decodedText);
        })
        .catch(err => {
            console.error('Erreur scan image:', err);
            showError('Impossible de scanner le QR Code dans cette image. Vérifiez que l\'image contient un QR Code valide.');
        });
}

// Annuler
function cancelScan() {
    resetScanForm();
}

// Imprimer
function printOrder() {
    window.print();
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

// Charger les commandes récentes
function loadRecentOrders() {
    const orders = Storage.getOrders();
    const recentOrdersList = document.getElementById('recent-orders-list');
    
    if (!recentOrdersList) return;

    // Trier par date (plus récentes en premier)
    const sortedOrders = orders.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 10);

    recentOrdersList.innerHTML = '';

    if (sortedOrders.length === 0) {
        recentOrdersList.innerHTML = '<p style="text-align: center; color: #666; padding: 20px;">Aucune commande récente</p>';
        return;
    }

    sortedOrders.forEach(order => {
        const card = document.createElement('div');
        card.className = 'order-card';
        card.onclick = () => {
            document.getElementById('code-input').value = order.code;
            scanCode();
        };
        
        const statusClass = order.used ? 'completed' : 'pending';
        const statusText = order.used ? 'Récupéré' : 'En attente';
        
        card.innerHTML = `
            <div class="order-card-header">
                <span class="order-code">${order.code}</span>
                <span class="order-status ${statusClass}">${statusText}</span>
            </div>
            <p><strong>Client:</strong> ${order.customer.firstName} ${order.customer.lastName}</p>
            <p><strong>Date:</strong> ${new Date(order.date).toLocaleString('fr-FR')}</p>
            <p><strong>Total:</strong> ${formatPrice(order.total)}</p>
        `;
        
        recentOrdersList.appendChild(card);
    });
}

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    // Bouton scan manuel
    const scanBtn = document.getElementById('scan-btn');
    if (scanBtn) {
        scanBtn.addEventListener('click', scanCode);
    }

    // Input manuel
    const codeInput = document.getElementById('code-input');
    if (codeInput) {
        codeInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                scanCode();
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

    // Validation
    const validateBtn = document.getElementById('validate-btn');
    if (validateBtn) {
        validateBtn.addEventListener('click', validatePickup);
    }

    const cancelBtn = document.getElementById('cancel-btn');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', cancelScan);
    }

    const printBtn = document.getElementById('print-btn');
    if (printBtn) {
        printBtn.addEventListener('click', printOrder);
    }

    const identityCheck = document.getElementById('identity-verified');
    const productCheck = document.getElementById('product-delivered');
    
    if (identityCheck) {
        identityCheck.addEventListener('change', checkValidationReady);
    }
    if (productCheck) {
        productCheck.addEventListener('change', checkValidationReady);
    }

    loadRecentOrders();
});

