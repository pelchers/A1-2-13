document.addEventListener('DOMContentLoaded', () => {
    loadWatches();
   initializeCardFlip();
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
        <div class="user-card"data-searchable="${user.display_name || user.username} ${user.bio || ''} ${user.skills || ''}">
            <div class="card-inner">
                <!-- Front of card -->
                <div class="card-front">
                    <!-- Watch Button -->
                    <button 
                        class="watch-button ${user.is_watched ? 'watching' : ''}" 
                        onclick="handleUserWatch(${user.id}, event)"
                        title="${user.is_watched ? 'Unwatch this profile' : 'Watch this profile'}"
                        type="button"
                    >
                        <span class="watch-icon">⭐</span>
                        <span class="watch-count">${user.profile_type === 'creator' ? 
                            (user.account_watchers || 0) : 
                            (user.brand_watch_count || 0)}</span>
                    </button>

                    <div class="user-image">
                        ${user.profile_image ? 
                            `<img src="${user.profile_image}" alt="${user.display_name || user.username}">` :
                            getRandomEmoji()
                        }
                    </div>
                    <div class="user-info">
                        <h3 class="${user.profile_type === 'brand' ? 'brand-name' : ''}">
                            ${user.display_name || user.username}
                            <span class="user-type-badge ${user.profile_type}">
                                ${user.profile_type === 'brand' ? '🏢' : '🎨'}
                            </span>
                        </h3>

                        ${user.profile_type === 'creator' ? createCreatorMetrics(user) : createBrandMetrics(user)}
                    </div>
                    <div class="card-flip-hint">
                        Click to see more details
                    </div>
                </div>
                
                <!-- Back of card -->
                <div class="card-back">
                    <div class="back-content">
                        <h3 class="${user.profile_type === 'brand' ? 'brand-name' : ''}">
                            ${user.display_name || user.username}
                            <span class="user-type-badge ${user.profile_type}">
                                ${user.profile_type === 'brand' ? '🏢' : '🎨'}
                            </span>
                        </h3>
                        <p class="bio">${user.bio || 'No bio available'}</p>
                        
                        ${user.profile_type === 'creator' ? createCreatorDetails(user) : createBrandDetails(user)}
                        
                        <div class="card-actions">
                            <a href="/messages.html?userId=${user.id}" 
                               class="show-profile-button" 
                               onclick="event.stopPropagation();">
                                Send Message
                            </a>
                            <a href="/public-profile.html?id=${user.id}" 
                               class="show-profile-button" 
                               onclick="event.stopPropagation();">
                                Show Full Profile
                            </a>
                        </div>
                    </div>
                    <div class="card-flip-hint-back">
                        Click to return
                    </div>
                </div>
            </div>
        </div>
    `;
}

function createCreatorMetrics(user) {
    return `
        <div class="creator-metrics">
            <div class="metric-row">
                <span class="metric">
                    <i class="metric-icon">👥</i>
                    ${user.follower_count?.toLocaleString() || 0} followers
                </span>
                <span class="metric">
                    <i class="metric-icon">👁️</i>
                    ${user.view_count?.toLocaleString() || 0} views
                </span>
            </div>
            <div class="metric-row">
                <span class="metric">
                    <i class="metric-icon">⭐</i>
                    ${user.account_watchers?.toLocaleString() || 0} watchers
                </span>
            </div>
            ${createPlatformsTags(user)}
            ${createContentTypesTags(user)}
            ${createContentFormatsTags(user)}
        </div>
    `;
}

function createProjectCard(project) {
    return `
        <div class="project-card" 
             data-searchable="${project.name} ${project.description || ''} ${project.project_type || ''} ${project.creator_name || ''}"
             data-creator-type="${project.creator_type}"
             onclick="window.location.href='/project-view.html?id=${project.id}'">
            <div class="card-inner">
                <div class="card-front">
                    <div class="project-info">
                        <button 
                            class="watch-button watching" 
                            onclick="handleProjectWatch(${project.id}, event)"
                            title="Unwatch this project"
                            type="button"
                        >
                            <span class="watch-icon">⭐</span>
                            <span class="watch-count">${project.watch_count || 0}</span>
                        </button>

                        <h3>${project.name}</h3>
                        <div class="project-meta">
                            <span class="project-type-badge ${project.project_type}">
                                ${project.project_type === 'brand_deal' ? '🤝 Brand Deal' : '🎨 Creative Work'}
                            </span>
                            <span class="creator-type-badge ${project.creator_type}">
                                ${project.creator_type === 'brand' ? '🏢' : '🎨'}
                            </span>
                        </div>
                        <p class="project-description">${project.description || 'No description available'}</p>
                        <div class="project-stats">
                            <div class="stat">
                                <span class="stat-icon">👥</span>
                                <span class="stat-value">${project.collaborator_count || 0}</span>
                                <span class="stat-label">Collaborators</span>
                            </div>
                            <div class="stat">
                                <span class="stat-icon">📅</span>
                                <span class="stat-value">${formatDate(project.created_at)}</span>
                                <span class="stat-label">Created</span>
                            </div>
                            <div class="stat">
                                <span class="stat-icon">📊</span>
                                <span class="stat-value">${project.status}</span>
                                <span class="stat-label">Status</span>
                            </div>
                        </div>
                    </div>
                    <div class="card-flip-hint">Click to see more details</div>
                </div>
            </div>
        </div>
    `;
}

// Add date formatting helper
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
    });
}

// Update project watch handler
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

        showMessage(data.message, 'success');
    } catch (error) {
        console.error('Error:', error);
        showMessage(error.message || 'Failed to update watch status', 'error');
    }
}

async function toggleWatch(userId, event) {
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }
    
    if (!localStorage.getItem('token')) {
        window.location.href = '/login.html';
        return;
    }

    try {
        const watchButton = event?.target.closest('.watch-button');
        
        const response = await fetch(`/api/users/${userId}/watch`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to toggle watch status');
        }

        const data = await response.json();

        // Update button state if we have a button reference
        if (watchButton) {
            // Toggle watching class
            watchButton.classList.toggle('watching', data.isWatching);
            
            // Update watch count
            const watchCount = watchButton.querySelector('.watch-count');
            if (watchCount) {
                watchCount.textContent = data.watchCount || 0;
            }

            // Update button text
            watchButton.title = data.isWatching ? 'Unwatch this profile' : 'Watch this profile';
        }

        // Show success message
        if (typeof showMessage === 'function') {
            showMessage(data.message || 'Watch status updated', 'success');
        }

        // Reload watches to ensure all UI elements are in sync
        await loadWatches();

    } catch (error) {
        console.error('Error toggling watch:', error);
        if (typeof showMessage === 'function') {
            showMessage('Error updating watch status', 'error');
        }
    }
}

// Add message display function if not already present
function showMessage(message, type = 'info') {
    const messageContainer = document.getElementById('message-container') || 
        (() => {
            const container = document.createElement('div');
            container.id = 'message-container';
            document.body.appendChild(container);
            return container;
        })();

    const messageElement = document.createElement('div');
    messageElement.className = `message ${type}`;
    messageElement.textContent = message;

    messageContainer.appendChild(messageElement);

    setTimeout(() => {
        messageElement.remove();
    }, 3000);
}

// Make sure handleUserWatch is available globally
window.handleUserWatch = toggleWatch;

function getRandomEmoji() {
    const emojis =['👤', '🎨', '🎯', '🎬', '📱', '💡'];
    return emojis[Math.floor(Math.random() * emojis.length)];
}

// Add card flip initialization
function initializeCardFlip() {
    document.addEventListener('click', (e) => {
        const card = e.target.closest('.user-card');
        if (card && !e.target.closest('.watch-button') && !e.target.closest('.show-profile-button')) {
            card.classList.toggle('flipped');
        }
    });
}

// Add missing metrics functions
function createBrandMetrics(user) {
    return `
        <div class="brand-metrics">
            <div class="metric-row">
                <span class="metric">
                    <i class="metric-icon">📊</i>
                    ${user.market_size || 'Market size not specified'}
                </span>
            </div>
            <div class="metric-row">
                <span class="metric">
                    <i class="metric-icon">💼</i>
                    ${user.company_size_range || 'Company size not specified'}
                </span>
            </div>
            ${createTargetMarketTags(user)}
            ${createDemographicTags(user)}
        </div>
    `;
}

// Add tag creation functions
function createPlatformsTags(user) {
    if (!Array.isArray(user.creator_platforms) || user.creator_platforms.length === 0) return '';
    return `
        <div class="platforms">
            ${user.creator_platforms.map(platform => 
                `<span class="platform-tag">${platform}</span>`
            ).join('')}
        </div>
    `;
}

function createContentTypesTags(user) {
    if (!Array.isArray(user.content_types) || user.content_types.length === 0) return '';
    return `
        <div class="content-types">
            ${user.content_types.map(type => 
                `<span class="content-type-tag">${type}</span>`
            ).join('')}
        </div>
    `;
}

function createContentFormatsTags(user) {
    if (!Array.isArray(user.content_formats) || user.content_formats.length === 0) return '';
    return `
        <div class="content-formats">
            ${user.content_formats.map(format => 
                `<span class="format-tag">${format}</span>`
            ).join('')}
        </div>
    `;
}

function createTargetMarketTags(user) {
    if (!Array.isArray(user.target_market_tags) || user.target_market_tags.length === 0) return '';
    return `
        <div class="target-markets">
            ${user.target_market_tags.map(tag => 
                `<span class="market-tag">${tag}</span>`
            ).join('')}
        </div>
    `;
}

function createDemographicTags(user) {
    if (!Array.isArray(user.target_demographics) || user.target_demographics.length === 0) return '';
    return `
        <div class="demographics">
            ${user.target_demographics.map(demo => 
                `<span class="demographic-tag">${demo}</span>`
            ).join('')}
        </div>
    `;
}

// Add creator/brand details functions
function createCreatorDetails(user) {
    return `
        <div class="creator-details">
            <div class="specialties-section">
                <h4>💫 Specialties</h4>
                <div class="specialties">
                    ${Array.isArray(user.creator_specialties) ? 
                        user.creator_specialties.map(specialty => 
                            `<span class="specialty-tag">${specialty}</span>`
                        ).join('') : 'No specialties listed'
                    }
                </div>
            </div>
            
            <div class="deal-section">
                <h4>🤝 Deal Types</h4>
                <div class="deal-types">
                    ${Array.isArray(user.preferred_deal_types) ? 
                        user.preferred_deal_types.map(type => 
                            `<span class="deal-type-tag">${type}</span>`
                        ).join('') : 'No preferred deal types listed'
                    }
                </div>
            </div>
            
            <div class="rate-section">
                ${user.creator_rate_min || user.creator_rate_max ? `
                    <h4>💰 Rate Range</h4>
                    <p class="rate-range">$${user.creator_rate_min || 0} - $${user.creator_rate_max || '∞'}</p>
                ` : ''}
            </div>
        </div>
    `;
}

function createBrandDetails(user) {
    return `
        <div class="brand-details">
            <div class="brand-description-section">
                <h4>🎯 Brand Focus</h4>
                <p>${user.brand_description || 'No description available'}</p>
            </div>
            
            <div class="campaign-section">
                <h4>🎯 Campaign Goals</h4>
                <div class="campaign-goals">
                    ${Array.isArray(user.campaign_goals) ? 
                        user.campaign_goals.map(goal => 
                            `<span class="goal-tag">${goal}</span>`
                        ).join('') : 'No campaign goals listed'
                    }
                </div>
            </div>
            
            <div class="budget-section">
                ${user.budget_range ? `
                    <h4>💰 Budget Range</h4>
                    <p class="budget-range">${user.budget_range}</p>
                ` : ''}
            </div>
        </div>
    `;
}
