document.addEventListener('DOMContentLoaded', () => {
    loadUserStats();
});

async function loadUserStats() {
    try {
        // Get current user's profile data
        const response = await fetch('/api/profile', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (!response.ok) throw new Error('Failed to fetch user data');
        const userData = await response.json();
        
        console.log('User Data:', userData); // Debug log
        console.log('Watching IDs:', userData.watching_ids); // Debug log
        console.log('Watched Project IDs:', userData.watched_project_ids); // Debug log

        // Get user's projects count
        const projectsResponse = await fetch('/api/projects', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        const projects = await projectsResponse.json();
        const activeProjects = projects.length;

        // Get counts from array fields
        const activeProjectFollows = Array.isArray(userData.watched_project_ids) ? 
            userData.watched_project_ids.length : 0;
        const activeUserFollows = Array.isArray(userData.watching_ids) ? 
            userData.watching_ids.length : 0;

        console.log('Stats:', { // Debug log
            activeProjects,
            activeProjectFollows,
            activeUserFollows
        });

        // Update the stats display
        updateStatsDisplay({
            activeProjects,
            activeProjectFollows,
            activeUserFollows
        });

    } catch (error) {
        console.error('Error loading user stats:', error);
    }
}
function updateStatsDisplay(stats) {
    const statsContainer = document.querySelector('.quick-stats');
    statsContainer.innerHTML = `
        <div class="stat-card">
            <span class="stat-value" id="projectCount">${stats.activeProjects}</span>
            <span class="stat-label">Active Projects</span>
        </div>
        <div class="stat-card">
            <span class="stat-value" id="projectFollowCount">${stats.activeProjectFollows}</span>
            <span class="stat-label">Project Follows</span>
        </div>
        <div class="stat-card">
            <span class="stat-value" id="userFollowCount">${stats.activeUserFollows}</span>
            <span class="stat-label">User Follows</span>
        </div>
    `;
}
