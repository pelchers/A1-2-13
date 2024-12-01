document.addEventListener('DOMContentLoaded', () => {
    // Initialize search and toggle functionality
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');
    const contentTypeToggle = document.getElementById('contentTypeToggle');
    const exploreContainer = document.getElementById('exploreContainer');
    const projectsContainer = document.getElementById('projectsContainer');

    // Set initial states
    exploreContainer.style.display = 'grid';
    projectsContainer.style.display = 'none';

    // Add event listeners
    if (searchButton) {
        searchButton.addEventListener('click', () => handleSearch(searchInput.value));
    }

    if (contentTypeToggle) {
        contentTypeToggle.addEventListener('change', (e) => {
            const showProjects = e.target.checked;
            exploreContainer.style.display = showProjects ? 'none' : 'grid';
            projectsContainer.style.display = showProjects ? 'grid' : 'none';
        });
    }

    // Load initial data
    loadUsers();
    loadProjects();
});

// Load and render users
async function loadUsers() {
    try {
        const response = await fetch('/api/users', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        const users = await response.json();
        renderUsers(users);
    } catch (error) {
        console.error('Error loading users:', error);
    }
}

// Load and render projects
async function loadProjects() {
    try {
        const response = await fetch('/api/projects', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        const projects = await response.json();
        renderProjects(projects);
    } catch (error) {
        console.error('Error loading projects:', error);
    }
}

// Handle search functionality
function handleSearch(query) {
    const searchText = query.toLowerCase();
    const showingProjects = document.getElementById('contentTypeToggle').checked;

    if (showingProjects) {
        filterProjects(searchText);
    } else {
        filterUsers(searchText);
    }
}

// Filter users based on search
function filterUsers(searchText) {
    const users = document.querySelectorAll('#exploreContainer .user-card');
    users.forEach(user => {
        const searchableContent = user.textContent.toLowerCase();
        user.style.display = searchableContent.includes(searchText) ? 'block' : 'none';
    });
}

// Filter projects based on search
function filterProjects(searchText) {
    const projects = document.querySelectorAll('#projectsContainer .project-card');
    projects.forEach(project => {
        const searchableContent = project.textContent.toLowerCase();
        project.style.display = searchableContent.includes(searchText) ? 'block' : 'none';
    });
}

function renderUsers(users) {
    const container = document.getElementById('exploreContainer');
    container.innerHTML = users.map(user => `
        <div class="user-card">
            <div class="user-info">
                <h3 class="user-name">${user.display_name || user.username}</h3>
                <p class="user-bio">${user.bio || ''}</p>
            </div>
        </div>
    `).join('');
} 