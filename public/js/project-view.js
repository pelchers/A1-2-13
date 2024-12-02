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
        const response = await fetch(`/api/projects/${projectId}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch project details');
        }

        const project = await response.json();
        renderProjectDetails(project);
    } catch (error) {
        console.error('Error loading project details:', error);
    }
}

function renderProjectDetails(project) {
    const container = document.getElementById('projectDetails');
    if (!container) return;

    container.innerHTML = `
        <h1>${project.name}</h1>
        <p>${project.description || 'No description available'}</p>
        <div class="project-meta">
            <span class="project-type-badge ${project.project_type}">
                ${project.project_type === 'brand_deal' ? '🤝 Brand Deal' : '🎨 Creative Work'}
            </span>
            <span class="project-status">Status: ${project.status}</span>
            <span class="project-date">Created: ${formatDate(project.created_at)}</span>
        </div>
        ${project.project_type === 'brand_deal' ? renderBrandDealDetails(project) : renderCreativeWorkDetails(project)}
    `;
}

function renderBrandDealDetails(project) {
    return `
        <div class="deal-details">
            <h3>Deal Information</h3>
            <p><strong>Budget Range:</strong> ${project.budget_range || 'Not specified'}</p>
            <p><strong>Timeline:</strong> ${project.timeline || 'Not specified'}</p>
            <p><strong>Payment Format:</strong> ${project.payment_format || 'Not specified'}</p>
            <p><strong>Target Audience:</strong> ${project.target_audience || 'Not specified'}</p>
            <p><strong>Campaign Goals:</strong> ${project.campaign_goals || 'Not specified'}</p>
        </div>
    `;
}

function renderCreativeWorkDetails(project) {
    return `
        <div class="content-details">
            <h3>Content Information</h3>
            <p><strong>Content Type:</strong> ${project.content_category || 'Not specified'}</p>
            <p><strong>Content Length:</strong> ${project.content_length || 'Not specified'}</p>
            <p><strong>Technical Requirements:</strong> ${project.technical_requirements || 'Not specified'}</p>
        </div>
    `;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
    });
} 