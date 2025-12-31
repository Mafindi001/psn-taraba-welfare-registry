// logout.js - Global logout functionality
class AuthManager {
  static logout() {
    // Clear all authentication data
    localStorage.removeItem('psnUser');
    localStorage.removeItem('psnToken');
    localStorage.removeItem('psnUserRole');
    localStorage.removeItem('psnRememberedEmail');
    
    // Notify server (optional)
    fetch('/api/auth/logout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    }).catch(error => {
      console.log('Server logout failed (may be offline):', error);
    });
    
    // Redirect to login page
    window.location.href = '/login';
  }
  
  static isLoggedIn() {
    return !!localStorage.getItem('psnToken');
  }
  
  static getUser() {
    try {
      return JSON.parse(localStorage.getItem('psnUser'));
    } catch {
      return null;
    }
  }
  
  static getToken() {
    return localStorage.getItem('psnToken');
  }
}

// Make it globally available
window.AuthManager = AuthManager;

// Auto-redirect if not logged in on protected pages
if (window.location.pathname.includes('/dashboard') || 
    window.location.pathname.includes('/admin')) {
  window.addEventListener('DOMContentLoaded', () => {
    if (!AuthManager.isLoggedIn()) {
      window.location.href = '/login';
    }
  });
}