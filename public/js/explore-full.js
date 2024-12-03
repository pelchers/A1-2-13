document.addEventListener('DOMContentLoaded', () => {
    // Initialize with filter content hidden
    const filterContent = document.querySelector('.filter-content');
    if (filterContent) {
        filterContent.style.display = 'none';
    }

    // Initialize settings dropdown
    const settingsDropdown = document.getElementById('settingsDropdown');
    const settingsButton = document.querySelector('.settings-btn');

    if (settingsButton && settingsDropdown) {
        settingsButton.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent event from bubbling
            settingsDropdown.classList.toggle('show');
        });

        // Close dropdown when clicking anywhere else
        document.addEventListener('click', (e) => {
            if (!settingsDropdown.contains(e.target) && !settingsButton.contains(e.target)) {
                settingsDropdown.classList.remove('show');
            }
        });

        // Prevent dropdown from closing when clicking inside it
        settingsDropdown.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    }

    // Initialize filters dropdown
    const filtersDropdown = document.getElementById('filtersDropdown');
    const filtersButton = document.querySelector('.filters-btn');

    if (filtersButton && filtersDropdown) {
        filtersButton.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent event from bubbling
            filtersDropdown.classList.toggle('show');
        });

        // Close dropdown when clicking anywhere else
        document.addEventListener('click', (e) => {
            if (!filtersDropdown.contains(e.target) && !filtersButton.contains(e.target)) {
                filtersDropdown.classList.remove('show');
            }
        });

        // Prevent dropdown from closing when clicking inside it
        filtersDropdown.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    }

    const exploreContainer = document.getElementById('exploreContainer');
    const exploreContainerProjects = document.getElementById('exploreContainerProjects');

    // Set initial states
    if (exploreContainer && exploreContainerProjects) {
        // Initially show profiles, hide projects
        exploreContainer.style.display = 'grid';
        exploreContainerProjects.style.display = 'none';
    }

    // Load both profiles and projects on page load
    if (exploreContainer) {
        loadUsers();
    }
    if (exploreContainerProjects) {
        loadProjectCards();
    }

    // Initialize search for both profiles and projects
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');
    if (searchButton) {
        searchButton.addEventListener('click', () => {
            currentFilters.searchText = searchInput.value.toLowerCase();
            applyFilters();
        });
    }

    // Initialize user/project type toggle for both profiles and projects
    const userTypeToggle = document.getElementById('userTypeToggle');
    if (userTypeToggle) {
        userTypeToggle.addEventListener('change', (e) => {
            currentFilters.userType = e.target.checked ? 'brand' : 'creator';
            applyFilters();
        });
    }

    // Initialize content type toggle
    const contentTypeToggle = document.getElementById('contentTypeToggle');
    if (contentTypeToggle) {
        contentTypeToggle.addEventListener('change', (e) => {
            if (e.target.checked) {
                // Show projects, hide profiles
                if (exploreContainer) exploreContainer.style.display = 'none';
                if (exploreContainerProjects) {
                    exploreContainerProjects.style.display = 'grid';
                    loadProjectCards(); // Load project cards when switching to projects view
                }
            } else {
                // Show profiles, hide projects
                if (exploreContainer) exploreContainer.style.display = 'grid';
                if (exploreContainerProjects) exploreContainerProjects.style.display = 'none';
                loadUsers(); // Reload users when switching back to profiles view
            }
        });
    }
});

// State management for filters
let currentFilters = {
    searchText: '',
    userType: 'creator',  // For creators/brands toggle
    contentType: 'profiles'  // For profiles/projects toggle
};

// Function to apply filters
function applyFilters() {
    const searchText = currentFilters.searchText.toLowerCase();
    const userType = currentFilters.userType;

    // Handle profile cards
    const userCards = document.querySelectorAll('.user-card');
    userCards.forEach(card => {
        const cardType = card.querySelector('.user-type-badge').classList.contains('brand') ? 'brand' : 'creator';
        const searchableContent = card.dataset.searchable.toLowerCase();
        
        // Apply both filters
        const matchesType = cardType === userType;
        const matchesSearch = !searchText || searchableContent.includes(searchText);
        
        // Only display if both conditions are met
        card.style.display = matchesType && matchesSearch ? 'block' : 'none';
    });

    // Handle project cards
    const projectCards = document.querySelectorAll('.project-card');
    projectCards.forEach(card => {
        const projectType = card.querySelector('.project-type-badge').classList.contains('brand_deal') ? 'brand' : 'creator';
        const searchableContent = card.dataset.searchable.toLowerCase();
        
        // Apply both filters
        const matchesType = projectType === userType; // 'brand' matches 'brand_deal', 'creator' matches 'creative_work'
        const matchesSearch = !searchText || searchableContent.includes(searchText);
        
        // Only display if both conditions are met
        card.style.display = matchesType && matchesSearch ? 'block' : 'none';
    });
}

// Load users function
async function loadUsers() {
    try {
        const response = await fetch('/api/users', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        let users = await response.json();
        
        // Randomize the order
        users = [...users].sort(() => Math.random() - 0.5);

        const container = document.getElementById('exploreContainer');
        if (!container) return;

        container.innerHTML = users.map(user => `
            <div class="user-card" data-searchable="${user.display_name || user.username} ${user.bio || ''} ${user.skills || ''}">
                <div class="card-inner">
                    <!-- Front of card -->
                    <div class="card-front">
                        <!-- Watch Button - Update onclick handler -->
                        <button 
                            class="watch-button ${user.is_watched ? 'watching' : ''}" 
                            onclick="handleUserWatch(${user.id}, event)"
                            title="Watch this profile"
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
                                    ${user.profile_type === 'brand' ? '' : '🎨'}
                                </span>
                            </h3>

                            ${user.profile_type === 'creator' ? `
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
                                    ${Array.isArray(user.creator_platforms) && user.creator_platforms.length > 0 ? `
                                        <div class="platforms">
                                            ${user.creator_platforms.map(platform => 
                                                `<span class="platform-tag">${platform}</span>`
                                            ).join('')}
                                        </div>
                                    ` : ''}
                                    ${Array.isArray(user.content_types) && user.content_types.length > 0 ? `
                                        <div class="content-types">
                                            ${user.content_types.map(type => 
                                                `<span class="content-type-tag">${type}</span>`
                                            ).join('')}
                                        </div>
                                    ` : ''}
                                    ${Array.isArray(user.content_formats) && user.content_formats.length > 0 ? `
                                        <div class="content-formats">
                                            ${user.content_formats.map(format => 
                                                `<span class="format-tag">${format}</span>`
                                            ).join('')}
                                        </div>
                                    ` : ''}
                                </div>
                            ` : `
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
                                    ${Array.isArray(user.target_market_tags) && user.target_market_tags.length > 0 ? `
                                        <div class="target-markets">
                                            ${user.target_market_tags.map(tag => 
                                                `<span class="market-tag">${tag}</span>`
                                            ).join('')}
                                        </div>
                                    ` : ''}
                                    ${Array.isArray(user.target_demographics) && user.target_demographics.length > 0 ? `
                                        <div class="demographics">
                                            ${user.target_demographics.map(demo => 
                                                `<span class="demographic-tag">${demo}</span>`
                                            ).join('')}
                                        </div>
                                    ` : ''}
                                </div>
                            `}
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
                            
                            ${user.profile_type === 'creator' ? `
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
                            ` : `
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
                            `}
                            
                            <div class="card-actions">
                                <button class="connect-button" onclick="followUser(${user.id}); event.stopPropagation();">
                                    Connect
                                </button>
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
        `).join('');
        
        // Add click handlers
        const cards = document.querySelectorAll('.user-card');
        cards.forEach(card => {
            card.addEventListener('click', function(e) {
                if (e.target.classList.contains('connect-button') || 
                    e.target.classList.contains('watch-button') ||
                    e.target.tagName === 'A' || 
                    e.target.tagName === 'BUTTON') {
                    return;
                }
                this.classList.toggle('flipped');
            });
        });
    } catch (error) {
        console.error('Error loading users:', error);
        container.innerHTML = '<p>Error loading users</p>';
    }
}

// Load project cards function
async function loadProjectCards() {
    try {
        const response = await fetch('/api/explore/projects', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        const projectsContainer = document.getElementById('exploreContainerProjects');
        if (!projectsContainer) {
            console.error('Projects container not found');
            return;
        }

        if (!Array.isArray(data) || data.length === 0) {
            projectsContainer.innerHTML = '<p>No projects available</p>';
            return;
        }

        projectsContainer.innerHTML = data.map(project => `
            <div class="project-card" 
                 data-searchable="${project.name} ${project.description || ''} ${project.project_type || ''} ${project.creator_name || ''}"
                 data-creator-type="${project.creator_type}"
                 onclick="window.location.href='/project-view.html?id=${project.id}'">
                <div class="card-inner">
                    <div class="card-front">
                        <div class="project-info">
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
        `).join('');
    } catch (error) {
        console.error('Error loading projects:', error);
        const projectsContainer = document.getElementById('exploreContainerProjects');
        if (projectsContainer) {
            projectsContainer.innerHTML = '<p>Error loading projects</p>';
        }
    }
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

// Utility function to get a random emoji
function getRandomEmoji() {
    const avatarEmojis = [
        '🦊', '🐱', '🐰', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸',
        '🦄', '🐲', '🦉', '🦋', '🐢', '🐬', '🐙', '🦈', '🦜', '🦡'
    ];
    return avatarEmojis[Math.floor(Math.random() * avatarEmojis.length)];
}

// Function to toggle watch state
async function toggleWatch(userId, event) {
    event.preventDefault();
    event.stopPropagation();
    
    if (!localStorage.getItem('token')) {
        window.location.href = '/login.html';
        return;
    }

    try {
        const watchButton = event.target.closest('.watch-button');
        if (!watchButton) {
            console.error('Watch button not found in DOM');
            return;
        }

        const response = await fetch(`/api/users/${userId}/watch`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Watch toggle response:', data);

        // Update watch count
        const watchCount = watchButton.querySelector('.watch-count');
        if (watchCount) {
            watchCount.textContent = data.watchCount;
        }

        // Toggle watching class based on server response
        if (data.isWatching !== undefined) {
            watchButton.classList.toggle('watching', data.isWatching);
        }
        
        // Show success message
        showMessage(data.message || 'Watch status updated', 'success');

        console.log('Watch toggle successful:', {
            userId,
            isWatching: data.isWatching,
            newCount: data.watchCount
        });

    } catch (error) {
        console.error('Error toggling watch:', error);
        showMessage('Error updating watch status', 'error');
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

// Make toggleFilters globally available
window.toggleFilters = function() {
    const filterContent = document.querySelector('.filter-content');
    if (!filterContent) return;
    
    // Toggle visibility
    if (filterContent.style.display === 'none' || !filterContent.style.display) {
        filterContent.style.display = 'block';
        document.querySelector('.toggle-icon').textContent = '▲';
    } else {
        filterContent.style.display = 'none';
        document.querySelector('.toggle-icon').textContent = '▼';
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

        showMessage(data.message, 'success');
    } catch (error) {
        console.error('Error:', error);
        showMessage(error.message || 'Failed to update watch status', 'error');
    }
}

// Add the handleUserWatch function
window.handleUserWatch = async function(userId, event) {
    event.preventDefault();
    event.stopPropagation();
    
    if (!localStorage.getItem('token')) {
        window.location.href = '/login.html';
        return;
    }

    try {
        const response = await fetch(`/api/users/${userId}/watch`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to update watch status');
        }

        // Update button state and count
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

// Ensure this function is defined and working
function toggleSettings() {
    const settingsDropdown = document.getElementById('settingsDropdown');
    settingsDropdown.classList.toggle('show');
}

// Add event listener for the settings button
document.addEventListener('DOMContentLoaded', () => {
    const settingsBtn = document.querySelector('.settings-btn');
    if (settingsBtn) {
        settingsBtn.addEventListener('click', toggleSettings);
    }
});

function openMessageModal(userId) {
    window.location.href = `/messages.html?userId=${userId}`;
}