import { handleSignup, handleLogin } from './auth.js';
import { loadUserProfile, handleProfileUpdate, setupProfileImageUpload } from './profile.js';
import { loadProjects, renderProjectCards, loadProjectCards } from './project.js';
import { loadUsers, filterUsersByType, followUser } from './user.js';
import { formatDate, showMessage, getRandomEmoji } from './utils.js';

document.addEventListener('DOMContentLoaded', () => {
    // Authentication
    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
        signupForm.addEventListener('submit', handleSignup);
    }

    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    // Profile Management
    const profileUpdateForm = document.getElementById('profileUpdateForm');
    if (profileUpdateForm) {
        profileUpdateForm.addEventListener('submit', handleProfileUpdate);
        loadUserProfile();
    }

    if (document.getElementById('profileImage')) {
        setupProfileImageUpload();
    }

    // Project Management
    const exploreContainerProjects = document.getElementById('exploreContainerProjects');
    if (exploreContainerProjects) {
        loadProjectCards();
    }

    // User Management
    const exploreContainer = document.getElementById('exploreContainer');
    if (exploreContainer) {
        loadUsers();
    }

    // Initialize filters and other UI elements
    initializeSearch();
    initializeUserTypeFilter();
});