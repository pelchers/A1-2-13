document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const projectId = urlParams.get('id');
    
    if (!projectId) {
        console.error('No project ID found in URL');
        return;
    }

    await loadProjectDetails(projectId);
});

async function loadProjectDetails(projectId) {
    try {
        const response = await fetch(`/api/projects/${projectId}`);

        if (!response.ok) {
            if (response.status === 404) {
                document.getElementById('projectDetails').innerHTML = `
                    <div class="error-message">Project not found</div>
                `;
                return;
            }
            throw new Error('Failed to fetch project details');
        }

        const project = await response.json();
        console.log('Project data:', project);

        renderProjectDetails(project);

        // Check if user is logged in and is the creator to show edit button
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const userResponse = await fetch('/api/profile', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (userResponse.ok) {
                    const userData = await userResponse.json();
                    if (project.user_id === userData.id) {
                        const editButton = document.getElementById('editProjectButton');
                        editButton.style.display = 'block';
                        editButton.onclick = () => window.location.href = `/projects.html?edit=${project.id}`;
                    }
                }
            } catch (error) {
                console.error('Error checking user auth:', error);
            }
        }
    } catch (error) {
        console.error('Error loading project details:', error);
        document.getElementById('projectDetails').innerHTML = `
            <div class="error-message">
                ${error.message || 'Error loading project details'}
            </div>
        `;
    }
}

function renderProjectDetails(project) {
    const container = document.getElementById('projectDetails');
    if (!container) return;

    container.innerHTML = `
        <div class="project-view-container">
            <div class="project-header">
                <h1>${project.name}</h1>
                <div class="project-meta">
                    <div class="meta-item">
                        <span class="meta-label">Type:</span>
                        <span class="project-type-badge ${project.project_type}">
                            ${project.project_type === 'brand_deal' ? '🤝 Brand Deal' : '🎨 Creative Work'}
                        </span>
                    </div>
                    <div class="meta-item">
                        <span class="meta-label">Status:</span>
                        <span class="status-badge ${project.status}">${project.status}</span>
                    </div>
                    <div class="meta-item">
                        <span class="meta-label">Visibility:</span>
                        <span class="visibility-badge">${project.visibility}</span>
                    </div>
                    <div class="meta-item">
                        <span class="meta-label">Created:</span>
                        <span class="date-badge">${formatDate(project.created_at)}</span>
                    </div>
                </div>
            </div>

            <div class="project-content">
                <section class="project-description">
                    <h3>Description</h3>
                    <p>${project.description || 'No description available'}</p>
                </section>

                <section class="project-timeline">
                    <h3>Timeline</h3>
                    <div class="timeline-details">
                        <p><strong>Timeline:</strong> ${project.timeline || 'Not specified'}</p>
                        <p><strong>Start Date:</strong> ${project.start_date ? new Date(project.start_date).toLocaleDateString() : 'Not set'}</p>
                        <p><strong>End Date:</strong> ${project.end_date ? new Date(project.end_date).toLocaleDateString() : 'Not set'}</p>
                    </div>
                </section>

                ${project.project_type === 'brand_deal' ? renderBrandDealDetails(project) : renderCreativeWorkDetails(project)}
            </div>
        </div>
    `;
}

function renderBrandDealDetails(project) {
    return `
        <section class="brand-deal-details">
            <h3>Brand Deal Information</h3>
            
            <div class="deal-financials">
                <h4>Financial Details</h4>
                <p><strong>Budget Range:</strong> ${project.budget_range || 'Not specified'}</p>
                <p><strong>Payment Format:</strong> ${project.payment_format || 'Not specified'}</p>
                <p><strong>Payment Terms:</strong> ${project.payment_terms || 'Not specified'}</p>
            </div>

            <div class="campaign-details">
                <h4>Campaign Information</h4>
                <div class="target-audience">
                    <strong>Target Audience:</strong>
                    ${renderArrayAsTags(project.target_audience)}
                </div>
                <div class="campaign-goals">
                    <strong>Campaign Goals:</strong>
                    ${renderArrayAsTags(project.campaign_goals)}
                </div>
            </div>
        </section>
    `;
}

function renderCreativeWorkDetails(project) {
    return `
        <section class="creative-work-details">
            <h3>Content Information</h3>
            
            <div class="content-specs">
                <p><strong>Content Category:</strong> ${project.content_category || 'Not specified'}</p>
                <p><strong>Content Length:</strong> ${project.content_length || 'Not specified'}</p>
            </div>

            <div class="technical-details">
                <h4>Technical Requirements</h4>
                <p>${project.technical_requirements || 'No technical requirements specified'}</p>
            </div>

            <div class="equipment">
                <h4>Required Equipment</h4>
                ${renderArrayAsTags(project.equipment_needed)}
            </div>
        </section>
    `;
}

function renderArrayAsTags(array) {
    if (!array || array.length === 0) {
        return '<div class="tag-container"><span class="empty-tag">None specified</span></div>';
    }
    return `<div class="tag-container">
        ${array.map(item => `<span class="tag">${item}</span>`).join('')}
    </div>`;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
    });
} 