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

    // Initialize metrics
    await loadUserMetrics(pageUserId || currentUserId);
});

// Function to load user metrics
async function loadUserMetrics(userId) {
    try {
        const response = await fetch(`/api/users/${userId}/metrics`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        const metrics = await response.json();
        
        // Update metrics display
        document.getElementById('followerCount').textContent = metrics.follower_count || 0;
        document.getElementById('viewCount').textContent = metrics.view_count || 0;
        document.getElementById('watchCount').textContent = metrics.watch_count || 0;
    } catch (error) {
        console.error('Error loading metrics:', error);
    }
}

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
        renderProjectsList(projects);
    } catch (error) {
        console.error('Error loading projects:', error);
    }
}

// Function to render project list with watch functionality
function renderProjectsList(projects) {
    const listContainer = document.getElementById('projectsList');
    if (!projects || !projects.length) {
        listContainer.innerHTML = '<div class="no-projects">No projects yet</div>';
        return;
    }

    listContainer.innerHTML = projects.map(project => `
        <div class="project-item" onclick="editProject(${project.id})">
            <!-- Add watch button -->
            <button 
                class="watch-button ${project.is_watched ? 'watching' : ''}" 
                onclick="handleProjectWatch(${project.id}, event)"
                title="Watch this project"
                type="button"
            >
                <span class="watch-icon">⭐</span>
                <span class="watch-count">${project.watch_count || 0}</span>
            </button>

            <h3>${project.name}</h3>
            <span class="project-type-badge ${project.project_type}">
                ${project.project_type === 'brand_deal' ? 'Brand Deal' : 'Creative Work'}
            </span>
            <div class="project-meta">
                <span class="project-status">${project.status}</span>
                <span class="project-date">${formatDate(project.created_at)}</span>
            </div>
        </div>
    `).join('');
}

// Utility function for date formatting
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
    });
}

// Add viewProjects function from scripts.js
function viewProjects() {
    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get('id');
    
    if (userId) {
        window.location.href = `/dashboard.html?id=${userId}#projects`;
    } else {
        console.error('No user ID found in URL');
    }
}

// Make handleProjectWatch globally available
window.handleProjectWatch = async function(projectId, event) {
    event.preventDefault();
    event.stopPropagation();
    
    if (!localStorage.getItem('token')) {
        window.location.href = '/login.html';
        return;
    }

    try {
        const response = await fetch(`/api/projects/${projectId}/watch`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to update watch status');
        }

        // Update button state and icon
        const watchButton = event.target.closest('.watch-button');
        if (watchButton) {
            watchButton.classList.toggle('watching', data.isWatching);
            const watchCount = watchButton.querySelector('.watch-count');
            if (watchCount) {
                watchCount.textContent = data.watchCount || 0;
            }
        }

        // Update metrics if on own dashboard
        const urlParams = new URLSearchParams(window.location.search);
        const pageUserId = urlParams.get('id');
        const currentUserId = await getCurrentUserId();
        if (!pageUserId || pageUserId === currentUserId.toString()) {
            loadUserMetrics(currentUserId);
        }

        showMessage(data.message, 'success');
    } catch (error) {
        console.error('Error:', error);
        showMessage(error.message || 'Failed to update watch status', 'error');
    }
}

// Function to show messages
function showMessage(message, type = 'info') {
    const container = document.getElementById('message-container');
    if (!container) return;

    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = message;
    
    container.innerHTML = ''; // Clear any existing messages
    container.appendChild(messageDiv);
    
    // Remove the message after 3 seconds
    setTimeout(() => {
        messageDiv.remove();
    }, 3000);
}