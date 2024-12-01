document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const pageUserId = urlParams.get('id');
    const currentUserId = await getCurrentUserId();
    
    // Check if we're viewing our own dashboard
    const isOwnDashboard = !pageUserId || pageUserId === currentUserId.toString();
    
    // Update button visibility based on ownership
    updateButtonVisibility(isOwnDashboard);
    
    // Load projects
    await loadUserProjects(pageUserId || currentUserId);
});

function updateButtonVisibility(isOwnDashboard) {
    const newProjectButton = document.querySelector('.new-project-btn');
    const editProfileButton = document.querySelector('.edit-profile-btn');

    if (newProjectButton) {
        newProjectButton.style.display = isOwnDashboard ? 'block' : 'none';
    }

    if (editProfileButton) {
        editProfileButton.style.display = isOwnDashboard ? 'block' : 'none';
    }
}

async function getCurrentUserId() {
    try {
        const response = await fetch('/api/profile', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        const userData = await response.json();
        return userData.id;
    } catch (error) {
        console.error('Error getting current user:', error);
        return null;
    }
}

async function loadUserProjects(userId) {
    try {
        const response = await fetch(`/api/users/${userId}/projects`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        const projects = await response.json();
        console.log('Projects loaded:', projects);
        
        // Use the renderProjectCards function from scripts.js
        if (window.renderProjectCards) {
            window.renderProjectCards(projects, 'projectsList');
        } else {
            console.error('renderProjectCards function not found');
        }
    } catch (error) {
        console.error('Error loading projects:', error);
    }
} 