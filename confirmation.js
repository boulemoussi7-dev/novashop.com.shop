// Charger et afficher la confirmation de commande
function loadConfirmation() {
    // Récupérer le code de commande depuis l'URL
    const urlParams = new URLSearchParams(window.location.search);
    const orderCode = urlParams.get('code');
    
    if (!orderCode) {
        showError('Code de commande manquant');
        return;
    }

    // Récupérer les données de la commande
    const orderData = Storage.getOrderByCode(orderCode);
    
    if (!orderData) {
        showError('Commande introuvable');
        return;
    }

    displayConfirmation(orderData);
}

// Afficher la confirmation avec QR Code et facture
function displayConfirmation(orderData) {
    const content = document.getElementById('confirmation-content');
    if (!content) return;

    content.innerHTML = `
        <div class="confirmation-box">
            <div class="confirmation-header">
                <div class="success-icon">✅</div>
                <h1>Commande Confirmée !</h1>
                <p class="confirmation-subtitle">Votre commande a été enregistrée avec succès</p>
            </div>

            <div class="confirmation-body">
                <!-- Code de retrait et QR Code -->
                <div class="code-section">
                    <h2>Code de Retrait</h2>
                    <div class="code-display-large" id="code-display">${orderData.code}</div>
                    <div id="qrcode-container" class="qrcode-container"></div>
                    <p class="code-hint">Présentez ce QR Code ou le code ci-dessus en boutique</p>
                </div>

                <!-- Informations de commande -->
                <div class="order-info-section">
                    <div class="info-card">
                        <h3>Informations de Commande</h3>
                        <div class="info-grid">
                            <div class="info-item">
                                <span class="info-label">Numéro de commande:</span>
                                <span class="info-value">#${orderData.id}</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">Date:</span>
                                <span class="info-value">${new Date(orderData.date).toLocaleString('fr-FR')}</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">Statut:</span>
                                <span class="info-value status-pending">En attente de retrait</span>
                            </div>
                        </div>
                    </div>

                    <div class="info-card">
                        <h3>Informations Client</h3>
                        <div class="info-grid">
                            <div class="info-item">
                                <span class="info-label">Nom complet:</span>
                                <span class="info-value">${orderData.customer.firstName} ${orderData.customer.lastName}</span>
                            </div>
                            ${orderData.customer.company && orderData.customer.company.trim() !== '' ? `
                            <div class="info-item">
                                <span class="info-label">Entreprise:</span>
                                <span class="info-value">${orderData.customer.company}</span>
                            </div>
                            ` : ''}
                            <div class="info-item">
                                <span class="info-label">Email:</span>
                                <span class="info-value">${orderData.customer.email}</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">Téléphone:</span>
                                <span class="info-value">${orderData.customer.phone}</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">Adresse:</span>
                                <span class="info-value">${orderData.customer.street}${orderData.customer.apartment ? ', ' + orderData.customer.apartment : ''}, ${orderData.customer.city}, ${orderData.customer.region}, ${orderData.customer.postalCode}</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">Pays:</span>
                                <span class="info-value">${orderData.customer.country}</span>
                            </div>
                        </div>
                    </div>

                    <div class="info-card">
                        <h3>Articles Commandés</h3>
                        <table class="order-items-table">
                            <thead>
                                <tr>
                                    <th>Produit</th>
                                    <th>Quantité</th>
                                    <th>Prix unitaire</th>
                                    <th>Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${orderData.items.map(item => `
                                    <tr>
                                        <td>${item.name}</td>
                                        <td>${item.quantity}</td>
                                        <td>${formatPrice(item.price)}</td>
                                        <td>${formatPrice(item.total)}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                            <tfoot>
                                <tr>
                                    <td colspan="3"><strong>Sous-total</strong></td>
                                    <td><strong>${formatPrice(orderData.subtotal)}</strong></td>
                                </tr>
                                <tr>
                                    <td colspan="3"><strong>Expédition</strong></td>
                                    <td><strong>Gratuite</strong></td>
                                </tr>
                                <tr class="total-row">
                                    <td colspan="3"><strong>Total</strong></td>
                                    <td><strong>${formatPrice(orderData.total)}</strong></td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>

                ${orderData.notes && orderData.notes.trim() !== '' ? `
                <div class="info-card">
                    <h3>Notes de Commande</h3>
                    <p style="color: #666; line-height: 1.6;">${orderData.notes}</p>
                </div>
                ` : ''}

                <!-- Instructions -->
                <div class="instructions-section">
                    <h3>📱 Instructions de Retrait</h3>
                    <ul class="instructions-list">
                        <li>Présentez-vous en boutique avec ce <strong>QR Code</strong> ou le <strong>code de retrait</strong></li>
                        <li>Apportez une <strong>pièce d'identité</strong> (carte d'identité, passeport, etc.)</li>
                        <li>Le code sera scanné et vos informations vérifiées</li>
                        <li>Vous pourrez ensuite récupérer votre commande</li>
                    </ul>
                    <p class="tip">💡 Astuce : Prenez une capture d'écran de ce QR Code ou téléchargez la facture pour l'avoir facilement sur votre téléphone !</p>
                </div>

                <!-- Actions -->
                <div class="confirmation-actions">
                    <button id="download-invoice-btn" class="btn btn-primary btn-large">
                        📄 Télécharger la Facture
                    </button>
                    <button onclick="window.print()" class="btn btn-secondary btn-large">
                        🖨️ Imprimer
                    </button>
                    <button onclick="window.location.href='index.html'" class="btn btn-secondary btn-large">
                        🏠 Retour à la boutique
                    </button>
                </div>
            </div>
        </div>
    `;

    // Générer le QR Code
    generateQRCode(orderData.code);

    // Ajouter l'événement pour télécharger la facture
    const downloadBtn = document.getElementById('download-invoice-btn');
    if (downloadBtn) {
        downloadBtn.addEventListener('click', () => downloadInvoice(orderData));
    }
}

// Générer le QR Code avec plusieurs méthodes de fallback
function generateQRCode(code) {
    const container = document.getElementById('qrcode-container');
    if (!container) return;

    // Vider le conteneur
    container.innerHTML = '<p style="color: #666;">Génération du QR Code...</p>';

    // Méthode 1: Essayer avec la bibliothèque QRCode locale
    function tryLibraryMethod() {
        const QRCodeLib = window.QRCode || window.qrcode || (typeof QRCode !== 'undefined' ? QRCode : null);
        
        if (QRCodeLib) {
            const canvas = document.createElement('canvas');
            try {
                QRCodeLib.toCanvas(canvas, code, {
                    width: 300,
                    margin: 3,
                    color: { dark: '#000000', light: '#FFFFFF' },
                    errorCorrectionLevel: 'M'
                }, function (error) {
                    if (!error) {
                        displayQRCodeImage(canvas.toDataURL('image/png'), code, container);
                        return;
                    }
                    // Si erreur, essayer l'API
                    tryAPIMethod(code, container);
                });
                return;
            } catch (e) {
                console.error('Erreur bibliothèque QRCode:', e);
            }
        }
        
        // Si la bibliothèque n'est pas disponible, essayer l'API après un délai
        setTimeout(() => {
            const retryQRCode = window.QRCode || window.qrcode || (typeof QRCode !== 'undefined' ? QRCode : null);
            if (retryQRCode) {
                tryLibraryMethod();
            } else {
                tryAPIMethod(code, container);
            }
        }, 1000);
    }

    // Méthode 2: Utiliser une API en ligne (fallback)
    function tryAPIMethod(code, container) {
        console.log('Utilisation de l\'API en ligne pour générer le QR Code');
        
        // Utiliser l'API QR Server (gratuite, pas besoin d'API key)
        const qrSize = 300;
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${qrSize}x${qrSize}&data=${encodeURIComponent(code)}&bgcolor=FFFFFF&color=000000&margin=1`;
        
        const img = document.createElement('img');
        img.style.cssText = 'max-width: 100%; height: auto; border: 3px solid #0073aa; border-radius: 8px; padding: 10px; background: white; box-shadow: 0 4px 10px rgba(0,0,0,0.1);';
        img.alt = 'QR Code de retrait';
        
        img.onload = function() {
            displayQRCodeImage(qrUrl, code, container, true);
        };
        
        img.onerror = function() {
            // Si l'API échoue aussi, utiliser une autre API
            tryAlternativeAPIMethod(code, container);
        };
        
        img.src = qrUrl;
    }

    // Méthode 3: API alternative
    function tryAlternativeAPIMethod(code, container) {
        console.log('Utilisation de l\'API alternative pour générer le QR Code');
        
        // Utiliser QR Code Generator API alternative
        const qrSize = 300;
        const qrUrl = `https://chart.googleapis.com/chart?chs=${qrSize}x${qrSize}&cht=qr&chl=${encodeURIComponent(code)}&choe=UTF-8`;
        
        const img = document.createElement('img');
        img.style.cssText = 'max-width: 100%; height: auto; border: 3px solid #0073aa; border-radius: 8px; padding: 10px; background: white; box-shadow: 0 4px 10px rgba(0,0,0,0.1);';
        img.alt = 'QR Code de retrait';
        
        img.onload = function() {
            displayQRCodeImage(qrUrl, code, container, true);
        };
        
        img.onerror = function() {
            // Dernière solution : afficher le code textuel avec instructions
            displayTextFallback(code, container);
        };
        
        img.src = qrUrl;
    }

    // Afficher l'image du QR Code
    function displayQRCodeImage(imageSrc, code, container, isExternal = false) {
        container.innerHTML = '';
        
        const img = document.createElement('img');
        img.src = imageSrc;
        img.alt = 'QR Code de retrait';
        img.style.cssText = 'max-width: 100%; height: auto; border: 3px solid #0073aa; border-radius: 8px; padding: 10px; background: white; box-shadow: 0 4px 10px rgba(0,0,0,0.1);';
        container.appendChild(img);
        
        // Bouton pour télécharger
        const downloadQRBtn = document.createElement('button');
        downloadQRBtn.className = 'btn btn-secondary';
        downloadQRBtn.style.cssText = 'margin-top: 15px;';
        downloadQRBtn.innerHTML = '📥 Télécharger le QR Code';
        downloadQRBtn.onclick = function() {
            if (isExternal) {
                // Pour les images externes, créer un lien de téléchargement
                const link = document.createElement('a');
                link.download = `QRCode_${code}.png`;
                link.href = imageSrc;
                link.target = '_blank';
                link.click();
            } else {
                // Pour les images locales (canvas)
                const link = document.createElement('a');
                link.download = `QRCode_${code}.png`;
                link.href = imageSrc;
                link.click();
            }
        };
        container.appendChild(downloadQRBtn);
    }

    // Fallback final : afficher le code textuel
    function displayTextFallback(code, container) {
        container.innerHTML = `
            <div style="text-align: center; padding: 20px; background: #fff3cd; border: 2px solid #ffc107; border-radius: 8px;">
                <p style="color: #856404; margin-bottom: 15px; font-weight: bold;">⚠️ Impossible de générer le QR Code</p>
                <p style="color: #666; margin-bottom: 15px;">Votre code de retrait :</p>
                <p style="font-size: 24px; font-weight: bold; font-family: monospace; color: #0073aa; letter-spacing: 3px; padding: 15px; background: white; border-radius: 4px; display: inline-block;">
                    ${code}
                </p>
                <p style="color: #666; margin-top: 15px; font-size: 14px;">
                    Présentez ce code en boutique avec une pièce d'identité.
                </p>
                <button onclick="location.reload()" class="btn btn-primary" style="margin-top: 15px;">
                    🔄 Réessayer
                </button>
            </div>
        `;
    }

    // Démarrer avec la méthode de la bibliothèque
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(tryLibraryMethod, 500);
        });
    } else {
        setTimeout(tryLibraryMethod, 500);
    }
}

// Télécharger la facture en PDF
function downloadInvoice(orderData) {
    if (typeof window.jspdf === 'undefined') {
        alert('Erreur : Bibliothèque PDF non disponible');
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Couleurs
    const primaryColor = [0, 115, 170];
    const grayColor = [128, 128, 128];

    // En-tête
    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('E-SHOP SÉCURISÉ', 105, 20, { align: 'center' });
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('FACTURE', 105, 30, { align: 'center' });

    // Informations de la commande
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    let y = 50;

    doc.setFont('helvetica', 'bold');
    doc.text('Numéro de commande:', 20, y);
    doc.setFont('helvetica', 'normal');
    doc.text(`#${orderData.id}`, 70, y);
    
    y += 7;
    doc.setFont('helvetica', 'bold');
    doc.text('Code de retrait:', 20, y);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...primaryColor);
    doc.text(orderData.code, 70, y);
    doc.setTextColor(0, 0, 0);
    
    y += 7;
    doc.setFont('helvetica', 'bold');
    doc.text('Date:', 20, y);
    doc.setFont('helvetica', 'normal');
    doc.text(new Date(orderData.date).toLocaleString('fr-FR'), 70, y);

    // Informations client
    y += 15;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('INFORMATIONS CLIENT', 20, y);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    y += 7;
    doc.text(`${orderData.customer.firstName} ${orderData.customer.lastName}`, 20, y);
    y += 5;
    if (orderData.customer.company && orderData.customer.company.trim() !== '') {
        doc.text(`Entreprise: ${orderData.customer.company}`, 20, y);
        y += 5;
    }
    doc.text(orderData.customer.email, 20, y);
    y += 5;
    doc.text(`Tél: ${orderData.customer.phone}`, 20, y);
    y += 5;
    doc.text(`${orderData.customer.street}`, 20, y);
    y += 5;
    if (orderData.customer.apartment && orderData.customer.apartment.trim() !== '') {
        doc.text(`${orderData.customer.apartment}`, 20, y);
        y += 5;
    }
    doc.text(`${orderData.customer.city}, ${orderData.customer.region} ${orderData.customer.postalCode}`, 20, y);
    y += 5;
    doc.text(`Pays: ${orderData.customer.country}`, 20, y);

    // Articles
    y += 15;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('ARTICLES', 20, y);
    
    y += 7;
    // En-tête du tableau
    doc.setFillColor(240, 240, 240);
    doc.rect(20, y - 5, 170, 7, 'F');
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('Produit', 22, y);
    doc.text('Qté', 120, y);
    doc.text('Prix', 140, y);
    doc.text('Total', 170, y);

    y += 7;
    doc.setFont('helvetica', 'normal');
    orderData.items.forEach(item => {
        doc.text(item.name, 22, y, { maxWidth: 95 });
        doc.text(item.quantity.toString(), 120, y);
        doc.text(formatPrice(item.price), 140, y);
        doc.text(formatPrice(item.total), 170, y);
        y += 6;
    });

    // Total
    y += 5;
    doc.setDrawColor(200, 200, 200);
    doc.line(20, y, 190, y);
    y += 7;
    
    doc.setFont('helvetica', 'bold');
    doc.text('Sous-total:', 140, y);
    doc.text(formatPrice(orderData.subtotal), 170, y);
    y += 6;
    doc.text('Expédition:', 140, y);
    doc.text('Gratuite', 170, y);
    y += 6;
    doc.setFontSize(11);
    doc.setFillColor(...primaryColor);
    doc.setTextColor(255, 255, 255);
    doc.rect(130, y - 5, 60, 8, 'F');
    doc.text('TOTAL:', 135, y + 2);
    doc.text(formatPrice(orderData.total), 170, y + 2);

    // Notes de commande si présentes
    if (orderData.notes && orderData.notes.trim() !== '') {
        y += 15;
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text('NOTES DE COMMANDE', 20, y);
        y += 7;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        const notesLines = doc.splitTextToSize(orderData.notes, 170);
        notesLines.forEach(line => {
            doc.text(line, 20, y);
            y += 5;
        });
    }

    // Instructions
    y += 15;
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('INSTRUCTIONS DE RETRAIT', 20, y);
    y += 7;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text('1. Présentez-vous en boutique avec ce code de retrait', 20, y);
    y += 5;
    doc.text('2. Apportez une pièce d\'identité', 20, y);
    y += 5;
    doc.text('3. Le code sera scanné et vos informations vérifiées', 20, y);
    y += 5;
    doc.text('4. Vous pourrez ensuite récupérer votre commande', 20, y);

    // QR Code (si possible, sinon juste le code)
    y += 10;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('CODE DE RETRAIT:', 20, y);
    y += 7;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(...primaryColor);
    doc.text(orderData.code, 20, y);

    // Pied de page
    doc.setTextColor(...grayColor);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text('Merci pour votre achat !', 105, 280, { align: 'center' });
    doc.text('E-Shop Sécurisé - Copyright © 2025', 105, 285, { align: 'center' });

    // Sauvegarder le PDF
    const fileName = `Facture_${orderData.code}_${orderData.id}.pdf`;
    doc.save(fileName);
}

// Afficher une erreur
function showError(message) {
    const content = document.getElementById('confirmation-content');
    if (content) {
        content.innerHTML = `
            <div class="error-box">
                <h2>❌ Erreur</h2>
                <p>${message}</p>
                <button onclick="window.location.href='index.html'" class="btn btn-primary">
                    Retour à la boutique
                </button>
            </div>
        `;
    }
}

// Initialisation - Attendre que tout soit chargé
function initializeConfirmation() {
    // Attendre que la bibliothèque QRCode soit disponible
    let attempts = 0;
    const maxAttempts = 10;
    
    function checkQRCodeLibrary() {
        const QRCodeLib = window.QRCode || window.qrcode || (typeof QRCode !== 'undefined' ? QRCode : null);
        
        if (QRCodeLib || attempts >= maxAttempts) {
            loadConfirmation();
            updateCartCount();
        } else {
            attempts++;
            setTimeout(checkQRCodeLibrary, 200);
        }
    }
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', checkQRCodeLibrary);
    } else {
        checkQRCodeLibrary();
    }
}

// Initialisation
initializeConfirmation();

