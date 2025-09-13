-- Script de nettoyage pour base de données de production
-- Centre Diagnostic - Système de Gestion des Repas
-- Ce script supprime toutes les données de test et prépare la base pour les vraies données

-- 1. SUPPRIMER TOUTES LES DONNÉES DE TEST
DELETE FROM employee_orders;
DELETE FROM orders;
DELETE FROM patients;
DELETE FROM employee_menus;
DELETE FROM patient_menus;

-- 2. RÉINITIALISER LES SÉQUENCES (si nécessaire)
-- Les UUID sont générés automatiquement, pas besoin de réinitialiser

-- 3. VÉRIFIER QUE LES TABLES SONT VIDES
SELECT 'Vérification - Tables vides:' as status;
SELECT 'Patients:' as table_name, COUNT(*) as count FROM patients
UNION ALL
SELECT 'Orders:', COUNT(*) FROM orders
UNION ALL
SELECT 'Employee Menus:', COUNT(*) FROM employee_menus
UNION ALL
SELECT 'Employee Orders:', COUNT(*) FROM employee_orders
UNION ALL
SELECT 'Patient Menus:', COUNT(*) FROM patient_menus;

-- 4. CONFIRMER QUE LA BASE EST PRÊTE POUR LES VRAIES DONNÉES
SELECT 'Base de données nettoyée et prête pour les vraies données' as status;
SELECT 'Toutes les tables sont vides et prêtes à recevoir les données de production' as message;
