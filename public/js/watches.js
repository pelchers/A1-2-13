document.addEventListener('DOMContentLoaded', () => {
    loadWatches();
});

async function loadWatches() {
    try {
        const [watchersRes, watchingRes, projectsRes] = await Promise.all([
            fetch('/api/watches/watchers', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            }),
            fetch('/api/watches/watching', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            }),
            fetch('/api/watches/projects', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            })
        ]);

        const [watchers, watching, projects] = await Promise.all([
            watchersRes.json(),
            watchingRes.json(),
            projectsRes.json()
        ]);

        renderWatchers(watchers);
        renderWatching(watching);
        renderWatchedProjects(projects);
    } catch (error) {
        console.error('Error loading watches:', error);
    }
}

function renderWatchers(watchers) {
    const container = document.getElementById('watchersGrid');
    container.innerHTML = watchers.map(user => createUserCard(user)).join('');
}

function renderWatching(watching) {
    const container = document.getElementById('watchingGrid');
    container.innerHTML = watching.map(user => createUserCard(user)).join('');
}

function renderWatchedProjects(projects) {
    const container = document.getElementById('watchedProjectsGrid');
    container.innerHTML = projects.map(project => createProjectCard(project)).join('');
}

function createUserCard(user) {
    return `
        <div class="user-card">
            <div class="card-inner">
                <div class="card-front">
                    ${createCardFront(user)}
                </div>
                <div class="card-back">
                    ${createCardBack(user)}
                </div>
            </div>
        </div>
    `;
}

function createProjectCard(project) {
    return `
        <div class="project-card">
            ${createProjectCardContent(project)}
        </div>
    `;
}

async function toggleWatch(userId) {
    try {
        const response = await fetch(`/api/watches/user/${userId}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        if (!response.ok) throw new Error('Failed to toggle watch');
        
        // Reload watches to update UI
        loadWatches();
    } catch (error) {
        console.error('Error toggling watch:', error);
    }
}

async function toggleProjectWatch(projectId) {
    try {
        const response = await fetch(`/api/watches/project/${projectId}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        if (!response.ok) throw new Error('Failed to toggle project watch');
        
        // Reload watches to update UI
        loadWatches();
    } catch (error) {
        console.error('Error toggling project watch:', error);
    }
}

// Add card creation functions from explore page
function createCardFront(user) {
    return `
        <div class="profile-image">
            ${user.profile_image ? 
                `<img src="${user.profile_image}" alt="${user.username}">` :
                user.profile_emoji || '👤'}
        </div>
        <div class="user-info">
            <h3>${user.display_name || user.username}</h3>
            <p class="user-type">${user.profile_type}</p>
            <div class="creator-metrics">
                <div class="metric-row">
                    <span class="metric"><i class="metric-icon">👥</i>${user.account_watchers || 0} watchers</span>
                    <span class="metric"><i class="metric-icon">👁️</i>${user.view_count || 0} views</span>
                </div>
            </div>
        </div>
        <div class="card-flip-hint">Click to see more details</div>
    `;
}

function createCardBack(user) {
    return `
        <div class="back-content">
            <h4>About</h4>
            <p class="bio">${user.bio || 'No bio available'}</p>
            
            ${user.profile_type === 'creator' ? createCreatorDetails(user) : createBrandDetails(user)}
            
            <div class="card-actions">
                <button onclick="toggleWatch(${user.id})" class="watch-button">
                    Unwatch
                </button>
                <a href="/profile.html?id=${user.id}" class="show-profile-button">View Profile</a>
            </div>
        </div>
    `;
}

function createCreatorDetails(user) {
    return `
        <div class="creator-details">
            <h4>Specialties</h4>
            <div class="specialties">
                ${(user.creator_specialties || []).map(specialty => 
                    `<span class="specialty-tag">${specialty}</span>`
                ).join('')}
            </div>
            
            <h4>Platforms</h4>
            <div class="platforms">
                ${(user.creator_platforms || []).map(platform => 
                    `<span class="platform-tag">${platform}</span>`
                ).join('')}
            </div>
        </div>
    `;
}

function createBrandDetails(user) {
    return `
        <div class="brand-details">
            <h4>Industry Sectors</h4>
            <div class="industries">
                ${(user.industry_sectors || []).map(industry => 
                    `<span class="industry-tag">${industry}</span>`
                ).join('')}
            </div>
            
            <h4>Target Demographics</h4>
            <div class="demographics">
                ${(user.target_demographics || []).map(demographic => 
                    `<span class="demographic-tag">${demographic}</span>`
                ).join('')}
            </div>
        </div>
    `;
}

function createProjectCardContent(project) {
    return `
        <div class="project-header">
            <h3>${project.name}</h3>
            <span class="project-type-badge ${project.project_type}">
                ${project.project_type === 'brand_deal' ? '🤝 Brand Deal' : '🎨 Creative Work'}
            </span>
        </div>
        <p class="project-description">${project.description}</p>
        <div class="project-meta">
            <span class="status-badge ${project.status}">${project.status}</span>
        </div>
        <button onclick="toggleProjectWatch(${project.id})" class="watch-button">
            Unwatch
        </button>
    `;
}
