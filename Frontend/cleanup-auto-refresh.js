// Simple script to clean up auto-refresh localStorage setting
// Run this in browser console if needed

console.log('🧹 Cleaning up auto-refresh localStorage...');

// Remove the auto-refresh setting from localStorage
localStorage.removeItem('restaurant-auto-refresh');

console.log('✅ Auto-refresh localStorage setting removed');
console.log('Current localStorage keys:', Object.keys(localStorage));
