// Function to load public profile
async function loadPublicProfile() {
    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get('id');
    
    if (!userId) {
        window.location.href = '/explore.html';
        return;
    }

    try {
        const response = await fetch(`/api/users/${userId}/public`);
        const userData = await response.json();
        
        const profileContainer = document.getElementById('publicProfile');
        profileContainer.innerHTML = `
            <div class="public-profile-header" data-profile-type="${userData.profile_type}">
                <div class="profile-image-large">
                    ${userData.profile_image ? 
                        `<img src="${userData.profile_image}" alt="${userData.display_name || userData.username}">` :
                        userData.display_name?.charAt(0).toUpperCase() || userData.username?.charAt(0).toUpperCase() || '👤'
                    }
                </div>
                <h1 class="${userData.profile_type === 'brand' ? 'brand-name' : ''}">
                    ${userData.display_name || userData.username}
                    <span class="user-type-badge ${userData.profile_type}">
                        ${userData.profile_type === 'brand' ? '🏢' : '🎨'}
                    </span>
                </h1>
                <p class="bio">${userData.bio || 'No bio available'}</p>
            </div>

            <div class="profile-actions">
                <button onclick="viewProjects()" class="profile-action-btn">View Projects</button>
            </div>
            

            <div class="public-profile-content" data-profile-type="${userData.profile_type}">
                ${userData.profile_type === 'creator' ? `
                    <!-- Creator Content -->
                    <section class="profile-section">
                        <h3>Metrics</h3>
                        <div class="metrics-grid">
                            <div class="metric">
                                <span class="metric-icon">👥</span>
                                <span class="metric-value">${userData.follower_count?.toLocaleString() || 0}</span>
                                <span class="metric-label">Followers</span>
                            </div>
                            <div class="metric">
                                <span class="metric-icon">👁️</span>
                                <span class="metric-value">${userData.view_count?.toLocaleString() || 0}</span>
                                <span class="metric-label">Views</span>
                            </div>
                            <div class="metric">
                                <span class="metric-icon">⭐</span>
                                <span class="metric-value">${userData.account_watchers?.toLocaleString() || 0}</span>
                                <span class="metric-label">Watchers</span>
                            </div>
                        </div>
                    </section>

                    <section class="profile-section">
                        <h3>Specialties</h3>
                        <div class="tag-container">
                            ${Array.isArray(userData.creator_specialties) ? 
                                userData.creator_specialties.map(specialty => {
                                    let icon;
                                    switch(specialty.toLowerCase()) {
                                        case 'gaming':
                                            icon = '🎮';
                                            break;
                                        case 'beauty':
                                            icon = '💄';
                                            break;
                                        case 'tech':
                                            icon = '💻';
                                            break;
                                        case 'food':
                                            icon = '🍳';
                                            break;
                                        case 'fitness':
                                            icon = '💪';
                                            break;
                                        case 'travel':
                                            icon = '✈️';
                                            break;
                                        case 'fashion':
                                            icon = '👗';
                                            break;
                                        case 'music':
                                            icon = '🎵';
                                            break;
                                        default:
                                            icon = '✨';
                                    }
                                    return `<span class="tag specialty-tag"><i>${icon}</i>${specialty}</span>`;
                                }).join('') : 'No specialties listed'
                            }
                        </div>
                    </section>

                    <section class="profile-section">
                        <h3>Content & Platforms</h3>
                        <h4>Platforms</h4>
                        <div class="tag-container">
                            ${Array.isArray(userData.creator_platforms) ? 
                                userData.creator_platforms.map(platform => {
                                    let icon, className;
                                    switch(platform.toLowerCase()) {
                                        case 'youtube':
                                            icon = '▶️';
                                            className = 'youtube';
                                            break;
                                        case 'instagram':
                                            icon = '📸';
                                            className = 'instagram';
                                            break;
                                        case 'tiktok':
                                            icon = '🎵';
                                            className = 'tiktok';
                                            break;
                                        case 'twitter':
                                            icon = '🐦';
                                            className = 'twitter';
                                            break;
                                        case 'twitch':
                                            icon = '🎮';
                                            className = 'twitch';
                                            break;
                                        default:
                                            icon = '🌐';
                                            className = '';
                                    }
                                    return `<span class="tag platform-tag ${className}"><i>${icon}</i>${platform}</span>`;
                                }).join('') : 'No platforms listed'
                            }
                        </div>
                        
                        <h4>Content Types</h4>
                        <div class="tag-container">
                            ${Array.isArray(userData.content_categories) ? 
                                userData.content_categories.map(type => 
                                    `<span class="tag">${type}</span>`
                                ).join('') : 'No content types listed'
                            }
                        </div>
                    </section>

                    <section class="profile-section">
                        <h3>Deal Information</h3>
                        <div class="info-grid">
                            <div class="info-card">
                                <div class="info-icon">💰</div>
                                <div class="info-value">$${userData.creator_rate_min || '0'} - $${userData.creator_rate_max || '∞'}</div>
                                <div class="info-label">Rate Range Per Post</div>
                            </div>
                            <div class="info-card">
                                <div class="info-icon">🤝</div>
                                <div class="info-value">
                                    ${Array.isArray(userData.preferred_deal_types) ? 
                                        userData.preferred_deal_types.join(', ') : 'Not specified'}
                                </div>
                                <div class="info-label">Preferred Deal Types</div>
                            </div>
                            <div class="info-card">
                                <div class="info-icon">✨</div>
                                <div class="info-value">${userData.collaboration_preferences || 'Not specified'}</div>
                                <div class="info-label">Collaboration Preferences</div>
                            </div>
                        </div>
                    </section>

                    <section class="profile-section">
                        <h3>Portfolio & Links</h3>
                        <div class="portfolio-links">
                            ${Array.isArray(userData.portfolio_links) ? 
                                userData.portfolio_links.map(link => {
                                    const url = new URL(link);
                                    return `<a href="${link}" target="_blank" class="portfolio-link">${url.hostname}</a>`;
                                }).join('') : 'No portfolio links available'
                            }
                        </div>
                    </section>
                ` : `
                    <!-- Brand Content -->
                    <section class="profile-section">
                        <h3>Brand Information</h3>
                        <p class="brand-description">${userData.brand_description || 'No description available'}</p>
                        
                        <h4>Industry Sectors</h4>
                        <div class="tag-container">
                            ${Array.isArray(userData.industry_sectors) ? 
                                userData.industry_sectors.map(sector => 
                                    `<span class="tag industry-tag">${sector}</span>`
                                ).join('') : 'No sectors listed'
                            }
                        </div>
                    </section>

                    <section class="profile-section">
                        <h3>Target Audience</h3>
                        <div class="tag-container">
                            ${Array.isArray(userData.target_demographics) ? 
                                userData.target_demographics.map(demo => 
                                    `<span class="tag demographic-tag">${demo}</span>`
                                ).join('') : 'No demographics specified'
                            }
                        </div>
                    </section>

                    <section class="profile-section">
                        <h3>Campaign Information</h3>
                        <h4>Goals</h4>
                        <div class="tag-container">
                            ${Array.isArray(userData.campaign_goals) ? 
                                userData.campaign_goals.map(goal => 
                                    `<span class="tag goal-tag">${goal}</span>`
                                ).join('') : 'No campaign goals listed'
                            }
                        </div>
                        
                        <h4>Budget Range</h4>
                        <p class="budget-range">${userData.budget_range || 'Not specified'}</p>
                    </section>

                    <section class="profile-section">
                        <h3>Deal Information</h3>
                        ${userData.profile_type === 'creator' ? `
                            <div class="info-grid">
                                <div class="info-card">
                                    <div class="info-icon">💰</div>
                                    <div class="info-value">$${userData.creator_rate_min || '0'} - $${userData.creator_rate_max || '∞'}</div>
                                    <div class="info-label">Rate Range Per Post</div>
                                </div>
                                <div class="info-card">
                                    <div class="info-icon">🤝</div>
                                    <div class="info-value">
                                        ${Array.isArray(userData.preferred_deal_types) ? 
                                            userData.preferred_deal_types.join(', ') : 'Not specified'}
                                    </div>
                                    <div class="info-label">Preferred Deal Types</div>
                                </div>
                                <div class="info-card">
                                    <div class="info-icon">✨</div>
                                    <div class="info-value">${userData.collaboration_preferences || 'Not specified'}</div>
                                    <div class="info-label">Collaboration Preferences</div>
                                </div>
                            </div>
                        ` : `
                            <div class="info-grid">
                                <div class="info-card">
                                    <div class="info-icon">💰</div>
                                    <div class="info-value">${userData.budget_range || 'Not specified'}</div>
                                    <div class="info-label">Budget Range</div>
                                </div>
                                <div class="info-card">
                                    <div class="info-icon">👥</div>
                                    <div class="info-value">
                                        ${Array.isArray(userData.preferred_creator_types) ? 
                                            userData.preferred_creator_types.join(', ') : 'Not specified'}
                                    </div>
                                    <div class="info-label">Preferred Creator Types</div>
                                </div>
                                <div class="info-card">
                                    <div class="info-icon">📋</div>
                                    <div class="info-value">${userData.collaboration_requirements || 'Not specified'}</div>
                                    <div class="info-label">Collaboration Requirements</div>
                                </div>
                                <div class="info-card">
                                    <div class="info-icon">🎯</div>
                                    <div class="info-value">
                                        ${Array.isArray(userData.campaign_preferences) ? 
                                            userData.campaign_preferences.join(', ') : 'Not specified'}
                                    </div>
                                    <div class="info-label">Campaign Preferences</div>
                                </div>
                            </div>
                        `}
                    </section>
                `}
            </div>
        `;
    } catch (error) {
        console.error('Error loading public profile:', error);
    }
}

// Call both functions on page load
document.addEventListener('DOMContentLoaded', () => {
    // This will handle the navbar profile pic and settings
    initializeNavbar();
    // This will load the public profile content
    loadPublicProfile();
});

// Add this function to initialize navbar
function initializeNavbar() {
    const token = localStorage.getItem('token');
    const profilePic = document.querySelector('.profile-pic');
    const settingsMenu = document.querySelector('.settings-menu');

    if (profilePic && token) {
        // Get logged-in user's profile data
        fetch('/api/profile', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => response.json())
        .then(userData => {
            if (userData.profile_image) {
                profilePic.innerHTML = `<img src="${userData.profile_image}" alt="Profile">`;
            } else {
                let userEmoji = localStorage.getItem('userEmoji');
                if (!userEmoji) {
                    userEmoji = avatarEmojis[Math.floor(Math.random() * avatarEmojis.length)];
                    localStorage.setItem('userEmoji', userEmoji);
                }
                profilePic.innerHTML = userEmoji;
            }

            // Add click handler for profile pic
            const tokenData = JSON.parse(atob(token.split('.')[1]));
            profilePic.addEventListener('click', () => {
                window.location.href = `/public-profile.html?id=${tokenData.id}`;
            });
        })
        .catch(error => {
            console.error('Error fetching profile:', error);
            profilePic.innerHTML = avatarEmojis[Math.floor(Math.random() * avatarEmojis.length)];
        });
    }
}


// Add viewProjects function - dashboard page
function viewProjects() {
    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get('id');

    if (userId) {
        window.location.href = `/dashboard.html?id=${userId}#projects`;
    } else {
        console.error('No user ID found in URL');
    }
}console.log('View projects function defined');

/*
Conditional Rendering Explanation:
--------------------------------

1. Profile Type Detection:
   - The page checks userData.profile_type to determine if the user is a 'brand' or 'creator'
   - This is done using ternary operators: ${userData.profile_type === 'brand' ? brandContent : creatorContent}

2. Content Structure:
   - Brand View:
     * Brand Information (description, industry sectors)
     * Target Audience
     * Campaign Information (goals, budget)
     * Deal Information (budget range, preferred creator types, collaboration requirements, campaign preferences)

   - Creator View:
     * Creator Details (specialties, platforms)
     * Content Types
     * Deal Information (rate range, preferred deal types, collaboration preferences)
     * Portfolio & Links

3. Data Handling:
   - Arrays are handled with .map() for multiple items:
     * ${Array.isArray(userData.someArray) ? userData.someArray.map(item => ...).join(', ') : 'Not specified'}
   - Null/undefined values have fallbacks:
     * ${userData.someField || 'Not specified'}
   - Numeric ranges use template literals:
     * ${userData.min || '0'} - ${userData.max || '∞'}

4. Section Organization:
   - Each major section is wrapped in <section class="profile-section">
   - Subsections use appropriate semantic tags (h3, h4, div)
   - Data is displayed in either:
     * Tag containers for list-type data
     * Info cards for key metrics and preferences
     * Standard paragraphs for descriptions

5. Dynamic Classes:
   - Classes are conditionally added based on content type:
     * ${className}
   - This allows for specific styling per content type

Note: The conditional rendering ensures that users see relevant information based on their profile type,
while maintaining a consistent layout structure across both views.
*/


