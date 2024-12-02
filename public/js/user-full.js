async function loadUsers() {
    try {
        const response = await fetch('/api/users', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        let users = await response.json();
        
        // Only add this line to randomize the order
        users = [...users].sort(() => Math.random() - 0.5);

        const container = document.getElementById('exploreContainer');
        if (!container) return;

        // Keep existing rendering code exactly as is
        container.innerHTML = users.map(user => `
            <div class="user-card" data-searchable="${user.display_name || user.username} ${user.bio || ''} ${user.skills || ''}">
                <div class="card-inner">
                    <!-- Front of card -->
                    <div class="card-front">
                        <!-- Watch Button - Update onclick handler -->
                        <button 
                            class="watch-button ${user.is_watched ? 'watching' : ''}" 
                            onclick="toggleWatch(${user.id}, event)"
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
        
        // Initialize search functionality
        initializeSearch();
        initializeUserTypeFilter();
    } catch (error) {
        console.error('Error loading users:', error);
        container.innerHTML = '<p>Error loading users</p>';
    }
}

function filterUsersByType(userType) {
    const userCards = document.querySelectorAll('.user-card');
    const projectCards = document.querySelectorAll('.project-card');
    
    // Filter user cards
    userCards.forEach(card => {
        const cardType = card.querySelector('.user-type-badge').classList.contains('brand') ? 'brand' : 'creator';
        card.style.display = cardType === userType ? 'block' : 'none';
    });

    // Filter project cards based on creator_type
    projectCards.forEach(card => {
        const projectCreatorType = card.dataset.creatorType; // This will be set when rendering project cards
        card.style.display = projectCreatorType === userType ? 'block' : 'none';
    });
}

async function followUser(userId) {
    if (!localStorage.getItem('token')) {
        window.location.href = '/login.html';
        return;
    }

    try {
        const response = await fetch(`/api/users/${userId}/follow`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (response.ok) {
            const button = event.target;
            button.textContent = button.textContent === 'Follow' ? 'Following' : 'Follow';
            button.classList.toggle('following');
        }
    } catch (error) {
        console.error('Error following user:', error);
    }
} 