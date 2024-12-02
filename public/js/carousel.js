// Carousel Debug and Functionality
console.log('carousel.js loaded');

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM Content Loaded in carousel.js');
    console.log('Current path:', window.location.pathname);
    
    if (window.location.pathname.includes('home-logged-in')) {
        console.log('On home page, initializing carousels');
        initializeCarousels();
    }
});

async function initializeCarousels() {
    console.log('Initializing carousels');
    // Show loading state
    ['creators', 'brands', 'projects'].forEach(type => {
        const carousel = document.getElementById(`${type}Carousel`);
        if (carousel) {
            console.log(`Found ${type} carousel`);
            carousel.innerHTML = '<div class="loading">Loading...</div>';
        } else {
            console.log(`${type} carousel not found`);
        }
    });

    await loadCarouselItems();
}

async function loadCarouselItems() {
    console.log('Loading carousel items');
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            console.error('No token found');
            return;
        }

        const headers = { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };

        // Load creators
        const creatorsResponse = await fetch('/api/popular/creators', { headers });
        console.log('Creators response:', creatorsResponse);
        const creators = await creatorsResponse.json();
        console.log('Creators data:', creators);
        renderCarouselItems('creators', creators);

        // Load brands
        const brandsResponse = await fetch('/api/popular/brands', { headers });
        console.log('Brands response:', brandsResponse);
        const brands = await brandsResponse.json();
        console.log('Brands data:', brands);
        renderCarouselItems('brands', brands);

        // Load projects
        const projectsResponse = await fetch('/api/projects/random', { headers });
        console.log('Projects response:', projectsResponse);
        const projects = await projectsResponse.json();
        console.log('Projects data:', projects);
        renderCarouselItems('projects', projects);

    } catch (error) {
        console.error('Error loading carousel items:', error);
    }
}

// Update renderCarouselItems function to handle randomized data
function renderCarouselItems(type, items) {
    const carousel = document.getElementById(`${type}Carousel`);
    if (!carousel) return;

    if (!Array.isArray(items) || items.length === 0) {
        carousel.innerHTML = `<div class="empty-state">No ${type} available</div>`;
        return;
    }

    carousel.innerHTML = items.map(item => {
        if (type === 'projects') {
            return `
                <div class="carousel-item">
                    <div class="carousel-item-header">
                        <h3>${item.name}</h3>
                        <p>${item.description || 'No description available'}</p>
                    </div>
                    <div class="carousel-item-stats">
                        <span>Status: ${item.status}</span>
                        <span>Created: ${formatDate(item.created_at)}</span>
                        <span>Collaborators: ${item.collaborator_count || 0}</span>
                    </div>
                </div>
            `;
        } else {
            return `
                <div class="carousel-item">
                    <div class="carousel-item-header">
                        <h3>${item.display_name || item.username}</h3>
                        <p>${type === 'creators' ? 'Creator' : 'Brand'}</p>
                    </div>
                    <div class="carousel-item-stats">
                        <span>Followers: ${item.follower_count || 0}</span>
                        <span>Projects: ${item.project_count || 0}</span>
                    </div>
                </div>
            `;
        }
    }).join('');
}

// Add formatDate helper function
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
    });
}

// Load carousel data
/*
async function loadCarouselData() {
    try {
        const token = localStorage.getItem('token');
        const headers = { 'Authorization': `Bearer ${token}` };

        // Fetch random projects
        const projectsResponse = await fetch('/api/projects/random', { headers });
        if (!projectsResponse.ok) {
            const errorData = await projectsResponse.json().catch(() => ({ message: "Error parsing response" }));
            console.error('Projects API Error:', projectsResponse.status, projectsResponse.statusText, errorData);
            throw new Error(`Projects API request failed with status ${projectsResponse.status}: ${errorData.message || projectsResponse.statusText}`);
        }
        const projects = await projectsResponse.json();
        console.log('Projects data:', projects);
        renderCarouselItems('projects', projects);
    } catch (error) {
        console.error("Error fetching or rendering projects:", error);
    }
}*/
