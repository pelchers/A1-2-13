const avatarEmojis = [
    '🦊', '🐱', '🐰', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸',
    '🦄', '🐲', '🦉', '🦋', '🐢', '🐬', '🐙', '🦈', '🦜', '🦡'
];

document.addEventListener('DOMContentLoaded', () => {
    checkAuthAndRedirect();
    // Handle signup form
    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = {
                username: document.getElementById('username').value,
                email: document.getElementById('email').value,
                password: document.getElementById('password').value,
                profile_type: document.getElementById('profile_type').value
            };

            try {
                const response = await fetch('/api/auth/signup', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(formData)
                });

                const data = await response.json();
                
                if (response.ok) {
                    localStorage.setItem('token', data.token);
                    localStorage.setItem('profile_type', formData.profile_type);
                    window.location.href = '/profile.html';
                } else {
                    alert(data.message || 'Signup failed');
                }
            } catch (error) {
                console.error('Error:', error);
                alert('An error occurred during signup');
            }
        });
    }

    // Handle login form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = {
                email: document.getElementById('email').value,
                password: document.getElementById('password').value
            };

            try {
                const response = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(formData)
                });

                const data = await response.json();
                
                if (response.ok) {
                    localStorage.setItem('token', data.token);
                    window.location.href = '/profile.html';
                } else {
                    alert(data.message || 'Login failed');
                }
            } catch (error) {
                console.error('Error:', error);
                alert('An error occurred during login');
            }
        });
    }

    // Handle explore page
    const exploreContainer = document.getElementById('exploreContainer');
    if (exploreContainer) {
        loadUsers();
    }

    // Handle leaderboard page
    const leaderboardContainer = document.getElementById('leaderboardContainer');
    if (leaderboardContainer) {
        loadLeaderboard();
    }

    // Handle navbar functionality
    const token = localStorage.getItem('token');
    const profilePic = document.querySelector('.profile-pic');
    const settingsMenu = document.querySelector('.settings-menu');

    if (profilePic) {
        if (token) {
            // Get logged-in user's profile data
            fetch('/api/profile', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            .then(response => response.json())
            .then(userData => {
                if (userData.profile_image) {
                    // User has a profile image
                    profilePic.innerHTML = `<img src="${userData.profile_image}" alt="Profile">`;
                } else {
                    // No profile image, use random emoji
                    let userEmoji = localStorage.getItem('userEmoji');
                    if (!userEmoji) {
                        userEmoji = avatarEmojis[Math.floor(Math.random() * avatarEmojis.length)];
                        localStorage.setItem('userEmoji', userEmoji);
                    }
                    profilePic.innerHTML = userEmoji;
                }

                // Add click handler to go to logged-in user's profile
                profilePic.addEventListener('click', () => {
                    const tokenData = JSON.parse(atob(token.split('.')[1]));
                    window.location.href = `/public-profile.html?id=${tokenData.id}`;
                });
            })
            .catch(error => {
                console.error('Error fetching profile:', error);
                // Use random emoji as fallback
                profilePic.innerHTML = avatarEmojis[Math.floor(Math.random() * avatarEmojis.length)];
            });
        } else {
            // User is logged out, use random emoji
            profilePic.innerHTML = avatarEmojis[Math.floor(Math.random() * avatarEmojis.length)];
            profilePic.addEventListener('click', () => {
                window.location.href = '/login.html';
            });
        }
    }

    // Always show settings icon with appropriate options
    if (settingsMenu) {
        const settingsIcon = settingsMenu.querySelector('.settings-icon');
        const dropdown = settingsMenu.querySelector('.settings-dropdown');
        
        // Add click handler to settings icon
        settingsIcon.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent event from bubbling up
            dropdown.classList.toggle('show');
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!settingsMenu.contains(e.target)) {
                dropdown.classList.remove('show');
            }
        });

        // Update dropdown content based on auth status
        if (token) {
            dropdown.innerHTML = `
                <a href="/profile.html">Update Profile</a>
                <a href="#" id="logoutBtn">Logout</a>
            `;
            // Add logout handler
            const logoutBtn = dropdown.querySelector('#logoutBtn');
            if (logoutBtn) {
                logoutBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    localStorage.removeItem('token');
                    localStorage.removeItem('userEmoji');
                    window.location.href = '/login.html';
                });
            }
        } else {
            dropdown.innerHTML = `
                <a href="/login.html">Login</a>
                <a href="/signup.html">Sign Up</a>
            `;
        }
    }

    // Handle profile form submission
    const profileUpdateForm = document.getElementById('profileUpdateForm');
    if (profileUpdateForm) {
        profileUpdateForm.addEventListener('submit', handleProfileUpdate);
        // Load existing profile data
        loadUserProfile();
    }

    // Handle profile type toggle with enhanced feedback
    const profileTypeToggle = document.getElementById('profileTypeToggle');
    if (profileTypeToggle) {
        // Set initial state based on stored profile type
        const storedType = localStorage.getItem('profile_type');
        if (storedType) {
            profileTypeToggle.checked = storedType === 'brand';
            toggleProfileFields(storedType === 'brand');
        } else {
            // Default to creator if no stored preference
            toggleProfileFields(false);
        }

        profileTypeToggle.addEventListener('change', (e) => {
            const isBrand = e.target.checked;
            toggleProfileFields(isBrand);
            localStorage.setItem('profile_type', isBrand ? 'brand' : 'creator');
            
            // Show message about profile type change
            showMessage(`Profile type changed to ${isBrand ? 'Brand' : 'Creator'}`, 'info');
        });
    }

    if (document.getElementById('profileImage')) {
        setupProfileImageUpload();
    }

    // Add click handlers for deal options
    document.querySelectorAll('.deal-option').forEach(option => {
        option.addEventListener('click', (e) => {
            if (e.target.tagName !== 'INPUT') {
                const checkbox = option.querySelector('input[type="checkbox"]');
                checkbox.checked = !checkbox.checked;
            }
            option.classList.toggle('selected', option.querySelector('input[type="checkbox"]').checked);
        });
    });

    // Initialize filters in collapsed state
    const filterContainer = document.querySelector('.search-filter-container');
    if (filterContainer) {
        filterContainer.classList.add('collapsed');
    }

    const settingsIcon = document.querySelector('.settings-icon');
    const settingsDropdown = document.querySelector('.settings-dropdown');
    
    if (settingsIcon && settingsDropdown) {
        // Toggle dropdown on settings icon click
        settingsIcon.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent event from bubbling
            settingsDropdown.classList.toggle('show');
        });
        
        // Close dropdown when clicking anywhere else
        document.addEventListener('click', (e) => {
            if (!settingsDropdown.contains(e.target) && !settingsIcon.contains(e.target)) {
                settingsDropdown.classList.remove('show');
            }
        });
        
        // Prevent dropdown from closing when clicking inside it
        settingsDropdown.addEventListener('click', (e) => {
            e.stopPropagation();
        });

        // Add logout functionality
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                localStorage.removeItem('token');
                window.location.href = '/login.html';
            });
        }
    }

    // Settings Menu - Fresh Start
    document.addEventListener('DOMContentLoaded', function() {
        const settingsDropdown = document.querySelector('.settings-dropdown');
        
        if (settingsDropdown) {
            settingsDropdown.onclick = function(e) {
                this.classList.toggle('active');
                e.stopPropagation();
            };

            document.onclick = function() {
                settingsDropdown.classList.remove('active');
            };
        }
    });

    // Add carousel-specific functions
    async function loadCarouselItems() {
        try {
            const token = localStorage.getItem('token');
            const headers = { 'Authorization': `Bearer ${token}` };

            const [creators, brands, projects] = await Promise.all([
                fetch('/api/popular/creators', { headers }).then(r => r.json()),
                fetch('/api/popular/brands', { headers }).then(r => r.json()),
                fetch('/api/projects/recent', { headers }).then(r => r.json())
            ]);

            if (Array.isArray(creators)) renderCarouselItems('creators', creators);
            if (Array.isArray(brands)) renderCarouselItems('brands', brands);
            if (Array.isArray(projects)) renderCarouselItems('projects', projects);
        } catch (error) {
            console.error('Carousel loading error:', error);
        }
    }

    // Separate render function for carousel items
    function renderCarouselItems(type, items) {
        const carousel = document.getElementById(`${type}Carousel`);
        if (!carousel || !Array.isArray(items)) {
            console.log(`No carousel found for ${type} or invalid items`);
            return;
        }

        carousel.innerHTML = items.map(item => {
            if (type === 'projects') {
                return `
                    <div class="carousel-item" onclick="window.location.href='/project.html?id=${item.id}'">
                        <div class="carousel-item-header">
                            <div class="carousel-item-image">
                                ${item.owner_image ? 
                                    `<img src="${item.owner_image}" alt="${item.owner_name}">` :
                                    `<div class="profile-placeholder">${item.owner_name.charAt(0)}</div>`
                                }
                            </div>
                            <div class="carousel-item-info">
                                <h3>${item.name}</h3>
                                <p>by ${item.owner_name}</p>
                            </div>
                        </div>
                        <p class="carousel-item-description">${item.description || 'No description available'}</p>
                        <div class="carousel-item-stats">
                            <div class="carousel-item-stat">
                                <div class="stat-number">${item.collaborator_count || 0}</div>
                                <div class="stat-label">Collaborators</div>
                            </div>
                            <div class="carousel-item-stat">
                                <div class="stat-number">${formatDate(item.created_at)}</div>
                                <div class="stat-label">Created</div>
                            </div>
                        </div>
                    </div>
                `;
            } else {
                return `
                    <div class="carousel-item" onclick="window.location.href='/public-profile.html?id=${item.id}'">
                        <div class="carousel-item-header">
                            <div class="carousel-item-image">
                                ${item.profile_image ? 
                                    `<img src="${item.profile_image}" alt="${item.display_name || item.username}">` :
                                    `<div class="profile-placeholder">${(item.display_name || item.username).charAt(0)}</div>`
                                }
                            </div>
                            <div class="carousel-item-info">
                                <h3>${item.display_name || item.username}</h3>
                                <p>${type === 'creators' ? 'Creator' : 'Brand'}</p>
                            </div>
                        </div>
                        <p class="carousel-item-description">
                            ${type === 'creators' ? 
                                (item.bio || 'No bio available') : 
                                (item.brand_description || 'No description available')}
                        </p>
                        <div class="carousel-item-stats">
                            <div class="carousel-item-stat">
                                <div class="stat-number">${item.follower_count || 0}</div>
                                <div class="stat-label">Followers</div>
                            </div>
                            <div class="carousel-item-stat">
                                <div class="stat-number">${item.project_count || 0}</div>
                                <div class="stat-label">Projects</div>
                            </div>
                        </div>
                    </div>
                `;
            }
        }).join('');
    }

    // Initialize carousels on home page load
    document.addEventListener('DOMContentLoaded', () => {
        if (window.location.pathname.includes('home-logged-in')) {
            loadCarouselItems();
        }
    });

    const viewProfileBtn = document.getElementById('viewProfileBtn');
    if (viewProfileBtn) {
        viewProfileBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const token = localStorage.getItem('token');
            if (token) {
                const tokenData = JSON.parse(atob(token.split('.')[1]));
                window.location.href = `/public-profile.html?id=${tokenData.id}`;
            }
        });
    }

    // Update state management to handle all filters
    let currentFilters = {
        searchText: '',
        userType: 'creator',  // For creators/brands toggle
        contentType: 'profiles'  // For profiles/projects toggle
    };

    // Update applyFilters function to handle multiple filters correctly
    function applyFilters() {
        const searchText = currentFilters.searchText.toLowerCase();
        const userType = currentFilters.userType;
        const contentType = currentFilters.contentType;

        // Handle profile cards
        if (contentType === 'profiles') {
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
        } else {
            // Handle project cards
            const projectCards = document.querySelectorAll('.project-card');
            projectCards.forEach(card => {
                const projectCreatorType = card.dataset.creatorType;
                const searchableContent = card.dataset.searchable.toLowerCase();
                
                // Apply both filters
                const matchesType = projectCreatorType === userType;
                const matchesSearch = !searchText || searchableContent.includes(searchText);
                
                // Only display if both conditions are met
                card.style.display = matchesType && matchesSearch ? 'block' : 'none';
            });
        }
    }

    // Update event listeners to use compound filtering
    document.addEventListener('DOMContentLoaded', () => {
        const searchInput = document.getElementById('searchInput');
        const searchButton = document.getElementById('searchButton');
        const userTypeToggle = document.getElementById('userTypeToggle');
        const contentTypeToggle = document.getElementById('contentTypeToggle');
        const exploreContainer = document.getElementById('exploreContainer');
        const exploreContainerProjects = document.getElementById('exploreContainerProjects');

        // Load both profiles and projects on page load
        if (exploreContainer) {
            loadUsers();
        }
        if (exploreContainerProjects) {
            loadProjectCards();
        }

        // Initialize search
        if (searchButton) {
            searchButton.addEventListener('click', () => {
                currentFilters.searchText = searchInput.value.toLowerCase();
                applyFilters();
            });
        }

        // Initialize user type toggle
        if (userTypeToggle) {
            userTypeToggle.addEventListener('change', (e) => {
                currentFilters.userType = e.target.checked ? 'brand' : 'creator';
                applyFilters();
            });
        }

        // Initialize content type toggle
        if (contentTypeToggle) {
            contentTypeToggle.addEventListener('change', (e) => {
                currentFilters.contentType = e.target.checked ? 'projects' : 'profiles';
                
                // Toggle visibility
                if (exploreContainer) {
                    exploreContainer.style.display = currentFilters.contentType === 'profiles' ? 'grid' : 'none';
                }
                if (exploreContainerProjects) {
                    exploreContainerProjects.style.display = currentFilters.contentType === 'projects' ? 'grid' : 'none';
                }
                
                applyFilters();
            });
        }
    });

    // Add CSS styles for toggle buttons
    const style = document.createElement('style');
    style.textContent = `
        .toggle-buttons-container {
            display: flex;
            gap: 10px;
            margin: 20px;
            justify-content: flex-end;
        }

        .filter-toggle-btn {
            padding: 8px 16px;
            border: 1px solid #ddd;
            border-radius: 4px;
            background: #f8f9fa;
            cursor: pointer;
            transition: all 0.3s ease;
        }

        .filter-toggle-btn.active {
            background: #F6662E;
            color: white;
            border-color: #F6662E;
        }
    `;
    document.head.appendChild(style);

    // Initialize user type toggle
    function initializeUserTypeFilter() {
        const userTypeToggle = document.getElementById('userTypeToggle');
        
        if (userTypeToggle) {
            userTypeToggle.addEventListener('change', (e) => {
                // Toggle between 'brand' and 'creator'
                const userType = e.target.checked ? 'brand' : 'creator';
                filterUsersByType(userType);
            });
            
            // Set initial state
            filterUsersByType('creator');
        }
    }

    // Add this function to load projects
    async function loadProjects() {
        try {
            const response = await fetch('/api/projects/random', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            const projects = await response.json();
            renderProjectCards(projects);
        } catch (error) {
            console.error('Error loading projects:', error);
        }
    }

    // Add this function to render project cards - dashboard page
    function renderProjectCards(projects) {
        const container = document.getElementById('projectsContainer');
        if (!container) return;

        container.innerHTML = projects.map(project => `
            <div class="project-card" data-searchable="${project.name} ${project.description || ''}">
                <div class="card-inner">
                    <div class="card-front">
                        <div class="project-info">
                            <h3 class="project-name">${project.name}</h3>
                            <p class="project-description">${project.description || 'No description available'}</p>
                            <div class="project-meta">
                                <span class="project-type-badge ${project.project_type}">
                                    ${project.project_type === 'brand_deal' ? '🤝 Brand Deal' : '🎨 Creative Work'}
                                </span>
                                <span class="project-status">${project.status}</span>
                            </div>
                        </div>
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
                        </div>
                    </div>
                    <div class="card-back">
                        <div class="project-details">
                            <h3>${project.name}</h3>
                            <p>${project.description || 'No description available'}</p>
                            <div class="project-actions">
                                <button onclick="viewProject(${project.id})" class="view-project-btn">View Details</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');

        // Add flip functionality to project cards
        const cards = document.querySelectorAll('.project-card');
        cards.forEach(card => {
            card.addEventListener('click', function(e) {
                if (!e.target.closest('.project-actions')) {
                    this.querySelector('.card-inner').classList.toggle('flipped');
                }
            });
        });
    }

    // Update the content type toggle functionality
    function initializeContentTypeToggle() {
        const contentTypeToggle = document.getElementById('contentTypeToggle');
        const exploreContainer = document.querySelector('.explore-container');
        const projectsContainer = document.querySelector('.projects-container');
        
        if (contentTypeToggle && exploreContainer && projectsContainer) {
            // Set initial states
            exploreContainer.style.display = 'grid';
            projectsContainer.style.display = 'none';
            
            contentTypeToggle.addEventListener('change', (e) => {
                const showProjects = e.target.checked;
                
                // Toggle visibility based on checkbox state
                exploreContainer.style.display = showProjects ? 'none' : 'grid';
                projectsContainer.style.display = showProjects ? 'grid' : 'none';
                
                // Load projects if they haven't been loaded yet
                if (showProjects && !projectsContainer.children.length) {
                    loadAllProjects();
                }
            });
        }
    }

    // Add function to load all projects
    async function loadAllProjects() {
        try {
            const response = await fetch('/api/projects/all', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            const projects = await response.json();
            renderProjectCards(projects);
        } catch (error) {
            console.error('Error loading projects:', error);
        }
    }

    // Add function to render project cards -dashboard page
    function renderProjectCards(projects) {
        const container = document.getElementById('projectsContainer');
        if (!container) return;

        container.innerHTML = projects.map(project => `
            <div class="user-card project-card" data-type="project">
                <div class="card-inner">
                    <div class="card-front">
                        <div class="project-info">
                            <h3>${project.name}</h3>
                            <p>${project.description || 'No description available'}</p>
                            <div class="project-meta">
                                <span class="project-type">${project.project_type}</span>
                                <span class="project-status">${project.status}</span>
                            </div>
                        </div>
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
                        </div>
                    </div>
                    <div class="card-back">
                        <div class="project-details">
                            <h3>${project.name}</h3>
                            <p>${project.description || 'No description available'}</p>
                            <div class="project-actions">
                                <button onclick="viewProject(${project.id})" class="view-project-btn">View Details</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');

        // Add flip functionality to project cards
        const cards = document.querySelectorAll('.project-card');
        cards.forEach(card => {
            card.addEventListener('click', function(e) {
                if (!e.target.closest('.project-actions')) {
                    this.querySelector('.card-inner').classList.toggle('flipped');
                }
            });
        });
    }

    // Initialize content type toggle when DOM loads
    document.addEventListener('DOMContentLoaded', () => {
        initializeContentTypeToggle();
    });
});

// Function to create single default card
function createDefaultCard() {
    const container = document.getElementById('exploreContainer');
    if (!container) return;

    // Create single default card
    const card = document.createElement('div');
    card.className = 'user-card';
    
    card.innerHTML = `
        <div>
            <h3>Loading Profile...</h3>
            <p>Type: ...</p>
            <div class="placeholder-content">
                <p>Loading user data...</p>
            </div>
        </div>
    `;
    
    container.appendChild(card);
}

// Update loadUsers function to only add randomization
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

async function loadLeaderboard(category = 'rating') {
    try {
        const response = await fetch(`/api/leaderboard?category=${category}`);
        const leaders = await response.json();
        displayLeaderboard(leaders);
    } catch (error) {
        console.error('Error loading leaderboard:', error);
    }
}

function displayLeaderboard(leaders) {
    const container = document.getElementById('leaderboardContainer');
    container.innerHTML = leaders.map((user, index) => `
        <div class="leader-card">
            <span class="rank">#${index + 1}</span>
            <h3>${user.username}</h3>
            <p>Rating: ${user.rating}</p>
        </div>
    `).join('');
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

// Update loadUserProfile to include debug logging
async function loadUserProfile() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/login.html';
        return;
    }

    try {
        console.log('Fetching profile data...'); // Debug log
        const response = await fetch('/api/profile', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        console.log('Profile response status:', response.status); // Debug log
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const userData = await response.json();
        console.log('Received user data:', userData); // Debug log
        
        if (userData) {
            // Set profile type and toggle correct fields
            const profileType = userData.profile_type || 'creator';
            console.log('Setting profile type:', profileType); // Debug log
            
            localStorage.setItem('profile_type', profileType);
            
            const profileTypeToggle = document.getElementById('profileTypeToggle');
            if (profileTypeToggle) {
                profileTypeToggle.checked = profileType === 'brand';
                toggleProfileFields(profileType === 'brand');
            }

            // Update all form fields
            updateFormFields(userData);
            console.log('Form fields updated successfully'); // Debug log
        }
    } catch (error) {
        console.error('Error loading profile:', error);
        showMessage('Error loading profile data', 'error');
    }
}

// Add helper function to safely set input values
function setInputValue(id, value) {
    const element = document.getElementById(id);
    if (element) {
        element.value = value || '';
    }
}

// Update the toggleProfileFields function
function toggleProfileFields(isBrand) {
    const creatorFields = document.getElementById('creatorFields');
    const brandFields = document.getElementById('brandFields');
    const profileTypeSelector = document.querySelector('.profile-type-selector');
    
    // Remove existing indicator if present
    const existingIndicator = profileTypeSelector.querySelector('.active-profile-type');
    if (existingIndicator) {
        existingIndicator.remove();
    }
    
    // Create and add new profile type indicator
    const indicator = document.createElement('div');
    indicator.className = `active-profile-type ${isBrand ? 'brand' : 'creator'}`;
    indicator.textContent = `Active Profile Type: ${isBrand ? 'Brand' : 'Creator'}`;
    profileTypeSelector.appendChild(indicator);
    
    // Toggle fields with animation
    if (isBrand) {
        creatorFields.style.display = 'none';
        brandFields.style.display = 'block';
        brandFields.style.opacity = '0';
        setTimeout(() => {
            brandFields.style.opacity = '1';
        }, 50);
    } else {
        brandFields.style.display = 'none';
        creatorFields.style.display = 'block';
        creatorFields.style.opacity = '0';
        setTimeout(() => {
            creatorFields.style.opacity = '1';
        }, 50);
    }
}

// Update setupProfileImageUpload function
function setupProfileImageUpload() {
    const imageInput = document.getElementById('profileImage');
    const imagePreview = document.getElementById('profileImagePreview');

    // Set initial preview if profile image exists
    if (imagePreview) {
        fetch('/api/profile', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.profile_image) {
                imagePreview.innerHTML = '';
                imagePreview.style.backgroundImage = `url(${data.profile_image})`;
                imagePreview.style.backgroundSize = 'cover';
                imagePreview.style.backgroundPosition = 'center';
            }
        })
        .catch(error => console.error('Error loading profile image:', error));
    }

    imageInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (file) {
            // Show preview immediately
            const reader = new FileReader();
            reader.onload = (e) => {
                imagePreview.innerHTML = '';
                imagePreview.style.backgroundImage = `url(${e.target.result})`;
                imagePreview.style.backgroundSize = 'cover';
                imagePreview.style.backgroundPosition = 'center';
            };
            reader.readAsDataURL(file);

            // Upload image
            try {
                const formData = new FormData();
                formData.append('profile_image', file);

                const response = await fetch('/api/profile/upload-image', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: formData
                });

                if (!response.ok) {
                    throw new Error('Failed to upload image');
                }

                const data = await response.json();
                console.log('Image upload response:', data); // Debug log

                // Update preview with the saved image URL
                imagePreview.style.backgroundImage = `url(${data.imageUrl})`;
                showMessage('Profile photo updated successfully!', 'success');
            } catch (error) {
                console.error('Error uploading image:', error);
                showMessage('Failed to upload profile photo', 'error');
            }
        }
    });
}

// Update handleProfileUpdate function
async function handleProfileUpdate(event) {
    event.preventDefault();
    
    const token = localStorage.getItem('token');
    if (!token) {
        showMessage('Please log in first', 'error');
        window.location.href = '/login.html';
        return;
    }

    const formData = new FormData(event.target);
    const profileType = localStorage.getItem('profile_type') || 'creator';
    
    // Collect current form state
    const data = {
        profile_type: profileType,
        display_name: formData.get('name') || '',
        bio: formData.get('bio') || '',
        skills: (formData.get('skills') || '').split(',').map(skill => skill.trim()).filter(Boolean)
    };

    // Add type-specific fields based on current profile type
    if (profileType === 'creator') {
        Object.assign(data, {
            creator_specialties: (formData.get('creator_specialties') || '').split(',').map(s => s.trim()).filter(Boolean),
            creator_platforms: (formData.get('creator_platforms') || '').split(',').map(s => s.trim()).filter(Boolean),
            audience_size: parseInt(formData.get('audience_size')) || 0,
            content_categories: (formData.get('content_categories') || '').split(',').map(s => s.trim()).filter(Boolean),
            portfolio_links: Array.from(document.getElementsByClassName('portfolio-link'))
                .map(input => input.value.trim())
                .filter(link => link !== ''),
            creator_rate_min: parseInt(formData.get('creator_rate_min')) || 0,
            creator_rate_max: parseInt(formData.get('creator_rate_max')) || 0,
            preferred_deal_types: getSelectedOptions('preferred_deal_types'),
            collaboration_preferences: formData.get('collaboration_preferences') || ''
        });
    } else {
        Object.assign(data, {
            brand_description: formData.get('brand_description') || '',
            industry_sectors: (formData.get('industry_sectors') || '').split(',').map(s => s.trim()).filter(Boolean),
            target_audience: formData.get('target_audience') || '',
            campaign_preferences: (formData.get('campaign_preferences') || '').split(',').map(s => s.trim()).filter(Boolean),
            budget_range: formData.get('budget_range') || '',
            preferred_creator_types: getSelectedOptions('preferred_creator_types'),
            campaign_goals: getSelectedOptions('campaign_goals'),
            collaboration_requirements: formData.get('collaboration_requirements') || ''
        });
    }

    console.log('Sending update data:', data); // Debug log

    try {
        const response = await fetch('/api/profile/update', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });

        const responseData = await response.json();
        
        if (response.ok) {
            showMessage('Profile updated successfully!', 'success');
            // Update form with the returned data
            updateFormFields(responseData);
            console.log('Profile updated with:', responseData); // Debug log
        } else {
            showMessage(responseData.message || 'Profile update failed', 'error');
        }
    } catch (error) {
        console.error('Error updating profile:', error);
        showMessage('An error occurred while updating profile', 'error');
    }
}

// Update updateFormFields function to include debug logging
function updateFormFields(data) {
    console.log('Updating form fields with:', data); // Debug log

    // Basic Info
    setInputValue('name', data.display_name);
    setInputValue('bio', data.bio);
    setInputValue('skills', Array.isArray(data.skills) ? data.skills.join(', ') : data.skills);

    if (data.profile_type === 'creator') {
        // Creator Fields
        setInputValue('creator_specialties', Array.isArray(data.creator_specialties) ? data.creator_specialties.join(', ') : data.creator_specialties);
        setInputValue('creator_platforms', Array.isArray(data.creator_platforms) ? data.creator_platforms.join(', ') : data.creator_platforms);
        setInputValue('audience_size', data.audience_size);
        setInputValue('content_categories', Array.isArray(data.content_categories) ? data.content_categories.join(', ') : data.content_categories);
        setInputValue('creator_rate_min', data.creator_rate_min);
        setInputValue('creator_rate_max', data.creator_rate_max);
        setInputValue('collaboration_preferences', data.collaboration_preferences);
        
        // Set creator checkboxes
        if (data.preferred_deal_types) {
            setSelectedOptions('preferred_deal_types', data.preferred_deal_types);
        }
    } else {
        // Brand Fields
        setInputValue('brand_description', data.brand_description);
        setInputValue('industry_sectors', Array.isArray(data.industry_sectors) ? data.industry_sectors.join(', ') : data.industry_sectors);
        setInputValue('target_audience', data.target_audience);
        setInputValue('campaign_preferences', Array.isArray(data.campaign_preferences) ? data.campaign_preferences.join(', ') : data.campaign_preferences);
        setInputValue('budget_range', data.budget_range);
        setInputValue('collaboration_requirements', data.collaboration_requirements);
        
        // Set brand checkboxes
        if (data.preferred_creator_types) {
            setSelectedOptions('preferred_creator_types', data.preferred_creator_types);
        }
        if (data.campaign_goals) {
            setSelectedOptions('campaign_goals', data.campaign_goals);
        }
    }

    // Handle portfolio links
    if (data.portfolio_links && data.portfolio_links.length > 0) {
        const container = document.getElementById('portfolioLinksContainer');
        if (container) {
            container.innerHTML = '';
            data.portfolio_links.forEach(link => {
                const linkItem = document.createElement('div');
                linkItem.className = 'portfolio-link-item';
                linkItem.innerHTML = `
                    <input type="url" class="portfolio-link" value="${link}" placeholder="Enter portfolio link">
                    <button type="button" class="remove-link-button" onclick="removePortfolioLink(this)">×</button>
                `;
                container.appendChild(linkItem);
            });
        }
    } else {
        addPortfolioLink();
    }

    console.log('Form fields update completed'); // Debug log
}

// Update the showMessage function
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

// Update the portfolio link handling functions
function addPortfolioLink() {
    const container = document.getElementById('portfolioLinksContainer');
    const linkItem = document.createElement('div');
    linkItem.className = 'portfolio-link-item';
    
    // Create input element
    const input = document.createElement('input');
    input.type = 'url';
    input.className = 'portfolio-link';
    input.placeholder = 'Enter portfolio link (e.g., https://example.com)';
    
    // Create remove button
    const removeButton = document.createElement('button');
    removeButton.type = 'button';
    removeButton.className = 'remove-link-button';
    removeButton.textContent = '×';
    removeButton.onclick = function() { removePortfolioLink(this); };
    
    // Append elements
    linkItem.appendChild(input);
    linkItem.appendChild(removeButton);
    container.appendChild(linkItem);
    
    // Focus the new input
    input.focus();
}

function removePortfolioLink(button) {
    const linkItem = button.parentElement;
    const container = document.getElementById('portfolioLinksContainer');
    
    if (container.children.length > 1) {
        linkItem.remove();
    } else {
        // If it's the last link, just clear the input
        const input = linkItem.querySelector('input');
        input.value = '';
        input.focus();
    }
}

// Add these as helper functions
function getSelectedOptions(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return [];
    return Array.from(container.querySelectorAll('input[type="checkbox"]:checked'))
        .map(checkbox => checkbox.value);
}

function setSelectedOptions(containerId, selectedValues) {
    const container = document.getElementById(containerId);
    if (container && selectedValues) {
        const values = Array.isArray(selectedValues) ? selectedValues : [];
        container.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
            checkbox.checked = values.includes(checkbox.value);
            checkbox.parentElement.classList.toggle('selected', checkbox.checked);
        });
    }
}

// Update toggleWatch function to handle watch state
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

// Add this function for filter toggle
function toggleFilters() {
    const container = document.querySelector('.search-filter-container');
    container.classList.toggle('collapsed');
    
    // Update toggle icon
    const toggleIcon = document.querySelector('.toggle-icon');
    if (container.classList.contains('collapsed')) {
        toggleIcon.textContent = '▼';
    } else {
        toggleIcon.textContent = '▲';
    }
}

function getRandomEmoji() {
    return avatarEmojis[Math.floor(Math.random() * avatarEmojis.length)];
}

function toggleSettings() {
    document.getElementById("settingsDropdown").classList.toggle("show");
}

// Close the dropdown if the user clicks outside of it
window.onclick = function(event) {
    if (!event.target.matches('.settings-btn')) {
        var dropdowns = document.getElementsByClassName("dropdown-content");
        for (var i = 0; i < dropdowns.length; i++) {
            var openDropdown = dropdowns[i];
            if (openDropdown.classList.contains('show')) {
                openDropdown.classList.remove('show');
            }
        }
    }
}

function checkAuthAndRedirect() {
    const token = localStorage.getItem('token');
    const currentPath = window.location.pathname;

    if (token) {
        // User is logged in
        if (currentPath === '/' || currentPath === '/index.html') {
            window.location.href = '/home-logged-in.html';
        }
    } else {
        // User is logged out
        if (currentPath === '/home-logged-in.html' || currentPath === '/dashboard.html') {
            window.location.href = '/';
        }
    }
}

// Helper function for date formatting
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
    });
}

// Add carousel movement functionality
let carouselPositions = {
    creators: 0,
    brands: 0,
    projects: 0
};

function moveCarousel(type, direction) {
    const carousel = document.getElementById(`${type}Carousel`);
    if (!carousel) return;

    const itemWidth = 320; // width + gap
    const visibleItems = Math.floor(carousel.offsetWidth / itemWidth);
    const maxScroll = carousel.scrollWidth - carousel.offsetWidth;

    if (direction === 'next') {
        carouselPositions[type] = Math.min(carouselPositions[type] + itemWidth * visibleItems, maxScroll);
    } else {
        carouselPositions[type] = Math.max(carouselPositions[type] - itemWidth * visibleItems, 0);
    }

    carousel.scrollTo({
        left: carouselPositions[type],
        behavior: 'smooth'
    });
}

// Update the viewUserProjects function - i removed the code from this section as it was causing conflics


// Add these new functions
function initializeSearch() {
    const searchButton = document.getElementById('searchButton');
    const searchInput = document.getElementById('searchInput');

    if (searchButton && searchInput) {
        searchButton.addEventListener('click', () => handleSearch(searchInput.value));
        // Optional: Add search on enter key
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                handleSearch(searchInput.value);
            }
        });
    }
}

function handleSearch(query) {
    currentFilters.searchText = query.toLowerCase();
    
    // Handle profile cards
    const userCards = document.querySelectorAll('.user-card');
    userCards.forEach(card => {
        const cardType = card.querySelector('.user-type-badge').classList.contains('brand') ? 'brand' : 'creator';
        const searchableContent = card.dataset.searchable.toLowerCase();
        
        const matchesType = cardType === currentFilters.userType;
        const matchesSearch = !currentFilters.searchText || searchableContent.includes(currentFilters.searchText);
        
        card.style.display = matchesType && matchesSearch ? 'block' : 'none';
    });

    // Handle project cards
    const projectCards = document.querySelectorAll('.project-card');
    projectCards.forEach(card => {
        const projectCreatorType = card.dataset.creatorType;
        const searchableContent = card.dataset.searchable.toLowerCase();
        
        const matchesType = projectCreatorType === currentFilters.userType;
        const matchesSearch = !currentFilters.searchText || searchableContent.includes(currentFilters.searchText);
        
        card.style.display = matchesType && matchesSearch ? 'block' : 'none';
    });
}

// Add state management for filters
let currentFilters = {
    searchText: '',
    userType: 'creator', // Default to creator view
    showProfiles: true,  // Default to showing profiles
    showProjects: false,  // Default to not showing projects
    contentType: 'profiles' // Default to showing profiles
};


// Update filterUsersByType to maintain search filter
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

// New function to apply both filters together
function applyFilters() {
    const userCards = document.querySelectorAll('.user-card');
    const projectCards = document.querySelectorAll('.project-card');
    
    userCards.forEach(card => {
        const cardType = card.querySelector('.user-type-badge').classList.contains('brand') ? 'brand' : 'creator';
        const searchableContent = card.dataset.searchable.toLowerCase();
        
        const matchesType = cardType === currentFilters.userType;
        const matchesSearch = !currentFilters.searchText || searchableContent.includes(currentFilters.searchText);
        const shouldShow = currentFilters.showProfiles && matchesType && matchesSearch;
        
        card.style.display = shouldShow ? 'block' : 'none';
    });

    projectCards.forEach(card => {
        const searchableContent = card.dataset.searchable.toLowerCase();
        const matchesSearch = !currentFilters.searchText || searchableContent.includes(currentFilters.searchText);
        const shouldShow = currentFilters.showProjects && matchesSearch;
        
        card.style.display = shouldShow ? 'block' : 'none';
    });
}

// Initialize user type toggle
function initializeUserTypeFilter() {
    const userTypeToggle = document.getElementById('userTypeToggle');
    
    if (userTypeToggle) {
        userTypeToggle.addEventListener('change', (e) => {
            // Toggle between 'brand' and 'creator'
            const userType = e.target.checked ? 'brand' : 'creator';
            filterUsersByType(userType);
        });
        
        // Set initial state
        filterUsersByType('creator');
    }
}
// Add this at line 953 - explore page projects cards container and rendering/loading 
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
        console.log('Projects data:', data);
        
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
                 data-creator-type="${project.creator_type}">
                <div class="card-inner">
                    <div class="card-front">
                        <div class="project-info">
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
                    
                    <div class="card-back">
                        <div class="project-details">
                            <h3>${project.name}</h3>
                            <p>${project.description || 'No description available'}</p>
                            
                            <!-- Project Type Specific Details -->
                            ${project.project_type === 'brand_deal' ? `
                                <div class="deal-details">
                                    <h4>Deal Information</h4>
                                    <p><strong>Budget Range:</strong> ${project.budget_range || 'Not specified'}</p>
                                    <p><strong>Timeline:</strong> ${project.timeline || 'Not specified'}</p>
                                    <p><strong>Payment Format:</strong> ${project.payment_format || 'Not specified'}</p>
                                </div>
                                <div class="campaign-details">
                                    <h4>Campaign Details</h4>
                                    <p><strong>Target Audience:</strong> ${project.target_audience || 'Not specified'}</p>
                                    <p><strong>Campaign Goals:</strong> ${project.campaign_goals || 'Not specified'}</p>
                                </div>
                            ` : `
                                <div class="content-details">
                                    <h4>Content Information</h4>
                                    <p><strong>Content Type:</strong> ${project.content_category || 'Not specified'}</p>
                                    <p><strong>Content Length:</strong> ${project.content_length || 'Not specified'}</p>
                                    <p><strong>Technical Requirements:</strong> ${project.technical_requirements || 'Not specified'}</p>
                                </div>
                            `}
                            
                            <div class="project-actions">
                                <button onclick="viewProject(${project.id})" class="view-project-btn">View Details</button>
                            </div>
                        </div>
                        <div class="card-flip-hint">Click to return</div>
                    </div>
                </div>
            </div>
        `).join('');

        // Add flip functionality to project cards
        const cards = document.querySelectorAll('.project-card');
        cards.forEach(card => {
            card.addEventListener('click', function(e) {
                if (!e.target.closest('.project-actions')) {
                    this.querySelector('.card-inner')?.classList.toggle('flipped');
                }
            });
        });

        console.log('Project cards rendered');
    } catch (error) {
        console.error('Error loading projects:', error);
        const projectsContainer = document.getElementById('exploreContainerProjects');
        if (projectsContainer) {
            projectsContainer.innerHTML = '<p>Error loading projects</p>';
        }
    }
}
console.log('Project cards load function defined');

// Update the content type toggle event listener
document.getElementById('contentTypeToggle').addEventListener('change', (e) => {
    const showProjects = e.target.checked;
    document.getElementById('exploreContainer').style.display = showProjects ? 'none' : 'grid';
    document.getElementById('exploreContainerProjects').style.display = showProjects ? 'grid' : 'none';
    
    if (showProjects) {
        loadProjectCards();
    }
});

// Update profile fetch with better error handling
async function initializeProfilePic() {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            console.log('No token found');
            return;
        }

        const response = await fetch('/api/profile', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const userData = await response.json();
        const profilePic = document.querySelector('.profile-pic');
        
        if (profilePic) {
            if (userData.profile_image) {
                profilePic.innerHTML = `<img src="${userData.profile_image}" alt="Profile">`;
            } else {
                profilePic.innerHTML = userData.display_name?.charAt(0).toUpperCase() || '👤';
            }
        }
    } catch (error) {
        console.error('Error loading profile:', error);
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
}
console.log('View projects function defined');

// Add renderProjectCards function for profile/dashboard pages
function renderProjectCards(projects, containerId = 'projectsList') {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`Container ${containerId} not found`);
        return;
    }

    if (!projects || !projects.length) {
        container.innerHTML = '<div class="no-projects">No projects available</div>';
        return;
    }

    container.innerHTML = projects.map(project => `
        <div class="project-card" data-project-id="${project.id}">
            <div class="card-inner">
                <div class="card-front">
                    <div class="project-info">
                        <h3>${project.name}</h3>
                        <div class="project-meta">
                            <span class="project-type-badge ${project.project_type}">
                                ${project.project_type === 'brand_deal' ? '🤝 Brand Deal' : '🎨 Creative Work'}
                            </span>
                            <span class="project-status">${project.status}</span>
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
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `).join('');

    // Add flip functionality
    const cards = document.querySelectorAll('.project-card');
    cards.forEach(card => {
        card.addEventListener('click', function(e) {
            if (!e.target.closest('.project-actions')) {
                this.querySelector('.card-inner')?.classList.toggle('flipped');
            }
        });
    });
}
console.log('Project cards render function defined');







// Globally available functions 








// Make renderProjectCards available globally
window.renderProjectCards = function(projects, containerId = 'projectsList') {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`Container ${containerId} not found`);
        return;
    }

    if (!projects || !projects.length) {
        container.innerHTML = '<div class="no-projects">No projects available</div>';
        return;
    }

    container.innerHTML = projects.map(project => `
        <div class="project-card" data-project-id="${project.id}">
            <div class="card-inner">
                <div class="card-front">
                    <div class="project-info">
                        <h3>${project.name}</h3>
                        <div class="project-meta">
                            <span class="project-type-badge ${project.project_type}">
                                ${project.project_type === 'brand_deal' ? '🤝 Brand Deal' : '🎨 Creative Work'}
                            </span>
                            <span class="project-status">${project.status}</span>
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
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `).join('');

    // Add flip functionality
    const cards = document.querySelectorAll('.project-card');
    cards.forEach(card => {
        card.addEventListener('click', function(e) {
            if (!e.target.closest('.project-actions')) {
                this.querySelector('.card-inner')?.classList.toggle('flipped');
            }
        });
    });
}

