import jsPDF from 'jspdf';

// Couleurs du logo Centre Diagnostic
export const LOGO_COLORS = {
  blue: [90, 194, 236] as [number, number, number], // #5ac2ec
  green: [65, 184, 172] as [number, number, number], // #41b8ac
};

// Fonction pour charger le logo PNG directement depuis Cloudinary
export const loadLogoImage = async (): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      try {
        // Créer un canvas pour optimiser la qualité
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('Impossible de créer le contexte canvas'));
          return;
        }
        
        // Définir la taille du canvas (plus grande pour une meilleure qualité)
        const maxWidth = 70;
        const maxHeight = 50;
        const scale = 2; // Facteur d'échelle pour l'anti-aliasing
        
        canvas.width = maxWidth * scale;
        canvas.height = maxHeight * scale;
        
        // Configurer le contexte pour une qualité maximale
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.scale(scale, scale);
        
        // Dessiner l'image sur le canvas
        ctx.drawImage(img, 0, 0, maxWidth, maxHeight);
        
        // Convertir en PNG avec qualité maximale
        const dataUrl = canvas.toDataURL('image/png', 1.0);
        resolve(dataUrl);
      } catch (error) {
        console.error('Erreur lors du traitement du logo:', error);
        reject(error);
      }
    };
    
    img.onerror = () => {
      reject(new Error('Impossible de charger le logo PNG'));
    };
    
    // Utiliser directement le logo PNG fourni
    img.src = "https://res.cloudinary.com/dd64mwkl2/image/upload/v1758286702/Centre_Diagnostic-Logo_xhxxpv.png";
  });
};

// Fonction pour créer l'en-tête du PDF
export const createPDFHeader = async (doc: jsPDF, title: string, subtitle: string): Promise<void> => {
  const todayStr = new Date().toLocaleDateString('fr-FR');
  
  try {
    // Charger le logo
    const logoDataUrl = await loadLogoImage();
    
    // En-tête avec fond blanc (plus haut pour centrer le logo)
    doc.setFillColor(255, 255, 255); // Fond blanc
    doc.rect(0, 0, 210, 50, 'F');
    
    // Ajouter le vrai logo centré en haut (taille encore plus réduite)
    const logoWidth = 25; // Taille encore plus réduite
    const logoHeight = 18;
    const pageWidth = 210;
    const logoX = (pageWidth - logoWidth) / 2; // Centrer horizontalement
    doc.addImage(logoDataUrl, 'PNG', logoX, 5, logoWidth, logoHeight);
    
    // Titre du rapport centré sous le logo
    doc.setFontSize(14);
    doc.setTextColor(LOGO_COLORS.green[0], LOGO_COLORS.green[1], LOGO_COLORS.green[2]); // Texte vert
    doc.setFont('helvetica', 'bold');
    const titleWidth = doc.getTextWidth(title);
    const titleX = (pageWidth - titleWidth) / 2; // Centrer le titre
    doc.text(title, titleX, 35); // Position descendue pour plus d'espace
    
    // Date et informations (position ajustée pour éviter les coupures)
    doc.setFontSize(9);
    doc.setTextColor(0, 0, 0); // Texte noir
    doc.text(`Date: ${todayStr}`, 150, 15);
    doc.text(`Généré le: ${new Date().toLocaleString('fr-FR')}`, 150, 25);
    
    // Ligne de séparation décorative (ajustée)
    doc.setDrawColor(LOGO_COLORS.blue[0], LOGO_COLORS.blue[1], LOGO_COLORS.blue[2]);
    doc.setLineWidth(1);
    doc.line(20, 40, 190, 40);
    
  } catch (error) {
    console.error('Erreur lors du chargement du logo:', error);
    
    // Fallback: utiliser le logo stylisé si le chargement échoue
    doc.setFillColor(255, 255, 255); // Fond blanc
    doc.rect(0, 0, 210, 50, 'F');
    
    const pageWidth = 210; // Définir pageWidth pour le fallback
    
    // Logo stylisé avec cercle (fallback) - centré
    const logoX = (pageWidth - 20) / 2; // Centrer le cercle
    doc.setFillColor(LOGO_COLORS.green[0], LOGO_COLORS.green[1], LOGO_COLORS.green[2]); // Cercle vert
    doc.circle(logoX, 17, 10, 'F');
    doc.setFillColor(255, 255, 255); // Cercle blanc au centre
    doc.circle(logoX, 17, 6, 'F');
    doc.setFillColor(LOGO_COLORS.blue[0], LOGO_COLORS.blue[1], LOGO_COLORS.blue[2]); // Point bleu au centre
    doc.circle(logoX, 17, 4, 'F');
    
    // Titre du rapport centré sous le logo
    doc.setFontSize(14);
    doc.setTextColor(LOGO_COLORS.green[0], LOGO_COLORS.green[1], LOGO_COLORS.green[2]); // Texte vert
    doc.setFont('helvetica', 'bold');
    const titleWidth = doc.getTextWidth(title);
    const titleX = (pageWidth - titleWidth) / 2; // Centrer le titre
    doc.text(title, titleX, 35); // Position descendue pour plus d'espace
    
    // Date et informations (position ajustée pour éviter les coupures)
    doc.setFontSize(9);
    doc.setTextColor(0, 0, 0); // Texte noir
    doc.text(`Date: ${todayStr}`, 150, 15);
    doc.text(`Généré le: ${new Date().toLocaleString('fr-FR')}`, 150, 25);
    
    // Ligne de séparation décorative (ajustée)
    doc.setDrawColor(LOGO_COLORS.blue[0], LOGO_COLORS.blue[1], LOGO_COLORS.blue[2]);
    doc.setLineWidth(1);
    doc.line(20, 40, 190, 40);
  }
};

// Fonction pour créer le pied de page du PDF
export const createPDFFooter = (doc: jsPDF): void => {
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    
    // Ligne de pied de page
    doc.setDrawColor(LOGO_COLORS.blue[0], LOGO_COLORS.blue[1], LOGO_COLORS.blue[2]);
    doc.setLineWidth(0.5);
    doc.line(20, 280, 190, 280);
    
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text(`Page ${i} sur ${pageCount}`, 20, 285);
    doc.text('Centre Diagnostic - Système de Gestion des Repas', 150, 285);
  }
};

// Fonction pour créer une section de résumé
export const createSummarySection = (
  doc: jsPDF, 
  yPosition: number, 
  title: string, 
  summaryData: Array<{label: string, value: string | number}>
): number => {
  // Titre de section
  doc.setFontSize(18);
  doc.setTextColor(LOGO_COLORS.blue[0], LOGO_COLORS.blue[1], LOGO_COLORS.blue[2]);
  doc.setFont('helvetica', 'bold');
  doc.text(title, 20, yPosition);
  yPosition += 15;
  
  // Boîte de résumé avec design amélioré
  doc.setFillColor(240, 253, 244); // Fond vert très clair
  doc.rect(20, yPosition - 5, 170, summaryData.length * 12 + 10, 'F');
  doc.setDrawColor(LOGO_COLORS.green[0], LOGO_COLORS.green[1], LOGO_COLORS.green[2]); // Bordure verte
  doc.setLineWidth(1);
  doc.rect(20, yPosition - 5, 170, summaryData.length * 12 + 10, 'S');
  
  doc.setFontSize(12);
  doc.setTextColor(LOGO_COLORS.green[0], LOGO_COLORS.green[1], LOGO_COLORS.green[2]); // Texte vert
  doc.setFont('helvetica', 'bold');
  
  summaryData.forEach((item, index) => {
    doc.text(`${item.label}: ${item.value}`, 25, yPosition + 8 + (index * 12));
  });
  
  return yPosition + summaryData.length * 12 + 20;
};

// Fonction pour créer un tableau
export const createTable = (
  doc: jsPDF,
  yPosition: number,
  title: string,
  headers: string[],
  data: string[][],
  headerColor: [number, number, number] = LOGO_COLORS.blue
): number => {
  // Titre du tableau
  doc.setFontSize(16);
  doc.setTextColor(LOGO_COLORS.blue[0], LOGO_COLORS.blue[1], LOGO_COLORS.blue[2]);
  doc.setFont('helvetica', 'bold');
  doc.text(title, 20, yPosition);
  yPosition += 15;
  
  if (data.length > 0) {
    // En-tête du tableau (largeur ajustée)
    doc.setFillColor(headerColor[0], headerColor[1], headerColor[2]);
    doc.rect(20, yPosition - 5, 160, 10, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    
    // Calculer la largeur optimale pour chaque colonne
    const columnWidth = 160 / headers.length; // Réduire légèrement la largeur totale
    headers.forEach((header, index) => {
      const xPosition = 25 + (index * columnWidth);
      doc.text(header, xPosition, yPosition + 2);
    });
    yPosition += 10;
    
    // Données du tableau
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');
    let rowCount = 0;
    
    data.forEach((row) => {
      if (rowCount % 2 === 0) {
        doc.setFillColor(248, 250, 252);
        doc.rect(20, yPosition, 160, 10, 'F');
      }
      
      row.forEach((cell, index) => {
        const xPosition = 25 + (index * columnWidth);
        // Tronquer le texte si trop long pour éviter les débordements
        const maxLength = Math.floor(columnWidth / 2); // Ajuster selon la largeur de colonne
        const truncatedCell = cell.length > maxLength ? cell.substring(0, maxLength - 3) + '...' : cell;
        doc.text(truncatedCell, xPosition, yPosition + 7);
      });
      
      yPosition += 10;
      rowCount++;
      
      if (yPosition > 240) {
        doc.addPage();
        yPosition = 20;
      }
    });
  } else {
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(12);
    doc.text('Aucune donnée disponible', 25, yPosition);
    yPosition += 15;
  }
  
  return yPosition + 15;
};

// Fonction pour créer un rapport amélioré avec plus de détails
export const createEnhancedReport = async (
  doc: jsPDF,
  title: string,
  summaryData: Array<{label: string, value: string | number}>,
  sections: Array<{
    title: string;
    headers: string[];
    data: string[][];
    color?: [number, number, number];
  }>
): Promise<void> => {
  // Créer l'en-tête amélioré
  await createPDFHeader(doc, title, '');
  
  let yPosition = 60; // Plus bas pour laisser de l'espace au logo centré
  
  // Section résumé améliorée
  yPosition = createSummarySection(doc, yPosition, 'RÉSUMÉ DU JOUR', summaryData);
  
  // Ajouter un espacement
  yPosition += 10;
  
  // Créer chaque section
  sections.forEach((section, index) => {
    yPosition = createTable(doc, yPosition, section.title, section.headers, section.data, section.color);
    
    // Ajouter un espacement entre les sections
    if (index < sections.length - 1) {
      yPosition += 10;
    }
  });
  
  // Pied de page amélioré
  createPDFFooter(doc);
};
