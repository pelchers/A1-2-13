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
            <div class="profile-pic" onclick="window.location.href='/public-profile.html'"></div>
        </div>
        <div class="nav-group-right">
            <a href="/leaderboard.html" id="leaderboardBtn" class="nav-button">Leaderboard</a>
        </div>
        <div class="settings-dropdown">
            <button onclick="toggleSettings()" class="settings-btn">⚙️</button>
            <div id="settingsDropdown" class="dropdown-content">
                <a href="/dashboard.html">Projects</a>
                <a href="/profile.html">Update Profile</a>
                <a href="#" id="logoutBtn">Logout</a>
            </div>
        </div>
    </nav>
    `;
}

// Insert navbar and initialize functionality
document.addEventListener('DOMContentLoaded', () => {
    // Insert navbar
    document.body.insertAdjacentHTML('afterbegin', createNavbar());

    // Initialize profile picture
    initializeProfilePic();

    // Initialize settings dropdown
    initializeSettings();
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
            } else {
                profilePic.innerHTML = userData.display_name?.charAt(0).toUpperCase() || '👤';
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