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