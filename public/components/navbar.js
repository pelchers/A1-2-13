// Create navbar HTML
function createNavbar() {
    return `
    <nav class="navbar">
        <div class="nav-icon-container">
            <a href="/" class="site-logo">🏠</a>
        </div>
        <div class="nav-group-left">
            <a href="/explore.html" id="exploreBtn" class="nav-button">Explore</a>
        </div>
        <div class="profile-container">
            <div class="profile-pic" onclick="window.location.href='/profile.html'"></div>
        </div>
        <div class="nav-group-right">
            <a href="/leaderboard.html" id="leaderboardBtn" class="nav-button">Leaderboard</a>
        </div>
        <div class="settings-dropdown">
            <button onclick="toggleSettings()" class="settings-btn">⚙️</button>
            <div id="settingsDropdown" class="dropdown-content">
                <a href="/dashboard.html">Projects</a>
                <a href="/messages.html">Messages</a>
                <a href="/watches.html">Watches</a>
                <a href="/profile.html">Update Profile</a>
                <a href="/plans.html">Plans</a>
                <a href="/manage-plan.html">Manage Plan</a>
                <a href="#" id="logoutBtn">Logout</a>
            </div>
        </div>
    </nav>
    `;
}

// Add the logged-out navbar (keeping existing navbar code untouched)
function createLoggedOutNavbar() {
    const loggedOutNav = document.createElement('nav');
    loggedOutNav.className = 'navbar logged-out-navbar';
    loggedOutNav.id = 'loggedOutNav';
    loggedOutNav.style.zIndex = '1001';
    loggedOutNav.innerHTML = `
        <div class="nav-left">
            <a href="/" class="nav-logo">Profile Builder</a>
        </div>
        <div class="nav-right">
            <a href="/login.html" class="nav-button">Login</a>
            <a href="/signup.html" class="nav-button">Sign Up</a>
        </div>
    `;
    return loggedOutNav;
}

// Add styles for logged-out navbar
const loggedOutStyles = document.createElement('style');
loggedOutStyles.textContent = `
    .logged-out-navbar {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        height: ${90}px;
        background: white;
        border-bottom: 1px solid #eee;
        display: none; /* Hidden by default */
        justify-content: space-between;
        align-items: center;
        padding: 0 2rem;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .logged-out-navbar .nav-left,
    .logged-out-navbar .nav-right {
        display: flex;
        align-items: center;
        height: 100%;
        gap: 1rem;
    }

    .logged-out-navbar .nav-logo {
        font-size: 1.2rem;
        font-weight: bold;
        color: #333;
        text-decoration: none;
        line-height: ${90}px;
    }

    .logged-out-navbar .nav-button {
        padding: 8px 24px;
        background-color: #07543D;
        color: white;
        border-radius: 25px;
        text-decoration: none;
        transition: all 0.3s ease;
        font-size: 0.9rem;
        border: none;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        height: 40px;
        line-height: 40px;
        min-width: 100px;
        text-align: center;
    }

    .logged-out-navbar .nav-button:hover {
        background-color: #053d2c;
        transform: translateY(-1px);
        box-shadow: 0 4px 8px rgba(0,0,0,0.1);
    }
`;
document.head.appendChild(loggedOutStyles);

// Insert navbar and initialize functionality
document.addEventListener('DOMContentLoaded', () => {
    // Insert navbar
    document.body.insertAdjacentHTML('afterbegin', createNavbar());

    // Initialize profile picture
    initializeProfilePic();

    // Initialize settings dropdown
    initializeSettings();

    // Insert logged-out navbar
    document.body.insertAdjacentElement('afterbegin', createLoggedOutNavbar());

    // Check auth status and show/hide logged-out navbar
    checkAuthStatus();
});

// Initialize profile picture
async function initializeProfilePic() {
    try {
        const response = await fetch('/api/profile', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        const userData = await response.json();
        
        const profilePic = document.querySelector('.profile-pic');
        if (profilePic) {
            if (userData.profile_image) {
                profilePic.innerHTML = `<img src="${userData.profile_image}" alt="Profile">`;
                profilePic.onclick = () => window.location.href = `/public-profile.html?id=${userData.id}`;
            } else {
                profilePic.innerHTML = userData.display_name?.charAt(0).toUpperCase() || '👤';
                profilePic.onclick = () => window.location.href = `/public-profile.html?id=${userData.id}`;
            }
        }
    } catch (error) {
        console.error('Error loading profile:', error);
    }
}

// Initialize settings dropdown
function initializeSettings() {
    const settingsBtn = document.querySelector('.settings-btn');
    const settingsDropdown = document.getElementById('settingsDropdown');
    const logoutBtn = document.getElementById('logoutBtn');

    // Toggle dropdown
    window.toggleSettings = function(event) {
        if (event) event.stopPropagation();
        settingsDropdown.classList.toggle('show');
    };

    // Close dropdown when clicking outside
    document.addEventListener('click', function(event) {
        if (!settingsBtn.contains(event.target) && !settingsDropdown.contains(event.target)) {
            settingsDropdown.classList.remove('show');
        }
    });

    // Handle logout
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(event) {
            event.preventDefault();
            localStorage.removeItem('token');
            window.location.href = '/login.html';
        });
    }
}

// Check auth status and show/hide logged-out navbar
async function checkAuthStatus() {
    try {
        const response = await fetch('/api/profile', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        const loggedOutNav = document.getElementById('loggedOutNav');
        
        if (!response.ok) {
            // User is not logged in - show logged-out navbar
            loggedOutNav.style.display = 'flex';
        } else {
            // User is logged in - hide logged-out navbar
            loggedOutNav.style.display = 'none';
        }
    } catch (error) {
        // If there's an error, assume user is not logged in
        document.getElementById('loggedOutNav').style.display = 'flex';
    }
} 