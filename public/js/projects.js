let currentProjectId = null;

document.addEventListener('DOMContentLoaded', async () => {
    await loadProjects();
    initializeProjectForm();
    initializeFormSelections();
    initializeButtonSelects();
});

// Initialize form and event listeners
function initializeProjectForm() {
    const form = document.getElementById('projectForm');
    const projectTypeSelect = document.getElementById('project_type');

    projectTypeSelect?.addEventListener('change', toggleProjectTypeFields);
    form?.addEventListener('submit', handleProjectSubmit);
}

// Initialize select options
function initializeFormSelections() {
    // Target Audience Options
    const audienceOptions = [
        'Gen Z', 'Millennials', 'Gen X', 'Baby Boomers', 'Parents',
        'Students', 'Professionals', 'Tech Enthusiasts', 'Gamers'
    ];

    // Campaign Goals Options
    const goalOptions = [
        'Brand Awareness', 'Lead Generation', 'Sales', 'Engagement',
        'Product Launch', 'Community Building', 'Education'
    ];

    // Equipment Options
    const equipmentOptions = [
        'Camera', 'Microphone', 'Lighting', 'Editing Software',
        'Green Screen', 'Audio Interface', 'Studio Space'
    ];

    populateSelectOptions('target_audience', audienceOptions);
    populateSelectOptions('campaign_goals', goalOptions);
    populateSelectOptions('equipment_needed', equipmentOptions);
}

// Load all projects
async function loadProjects() {
    try {
        const response = await fetch('/api/projects', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (!response.ok) throw new Error('Failed to load projects');

        const projects = await response.json();
        renderProjectsList(projects);
    } catch (error) {
        console.error('Error:', error);
        showMessage(error.message, 'error');
    }
}

// Render projects list
function renderProjectsList(projects) {
    const projectsList = document.getElementById('projectsList');
    if (!projectsList) return;

    projectsList.innerHTML = projects.map(project => `
        <div class="project-card" data-id="${project.id}">
            <div class="project-header">
                <h3>${project.name}</h3>
                <span class="project-type-badge ${project.project_type}">
                    ${project.project_type === 'brand_deal' ? '🤝 Brand Deal' : '🎨 Creative Work'}
                </span>
            </div>
            <p class="project-description">${project.description || 'No description'}</p>
            <div class="project-meta">
                <span class="status-badge ${project.status}">${project.status}</span>
                <span class="date-info">Created: ${new Date(project.created_at).toLocaleDateString()}</span>
            </div>
            <div class="project-actions">
                <button onclick="editProject(${project.id})" class="edit-btn">Edit</button>
                <button onclick="deleteProject(${project.id})" class="delete-btn">Delete</button>
            </div>
        </div>
    `).join('');
}

// Show project form
function showProjectForm(projectId = null) {
    currentProjectId = projectId;
    const formSection = document.getElementById('projectFormSection');
    const formTitle = document.getElementById('formTitle');
    
    formSection.style.display = 'block';
    formTitle.textContent = projectId ? 'Edit Project' : 'Create New Project';
    
    if (!projectId) {
        document.getElementById('projectForm').reset();
    }
}

// Handle form submit
async function handleProjectSubmit(e) {
    e.preventDefault();
    
    const formData = {
        name: document.getElementById('name').value,
        description: document.getElementById('description').value,
        project_type: document.getElementById('project_type').value,
        status: document.getElementById('status').value,
        visibility: document.getElementById('visibility').value,
        timeline: document.getElementById('timeline').value,
        start_date: document.getElementById('start_date').value || null,
        end_date: document.getElementById('end_date').value || null,
        budget_range: document.getElementById('budget_range')?.value,
        payment_terms: document.getElementById('payment_terms')?.value,
        payment_format: document.getElementById('payment_format')?.value,
        target_audience: getSelectedValues('target_audience_container'),
        campaign_goals: getSelectedValues('campaign_goals_container'),
        content_category: document.getElementById('content_category')?.value,
        content_length: document.getElementById('content_length')?.value,
        technical_requirements: document.getElementById('technical_requirements')?.value,
        equipment_needed: getMultiSelectValues('equipment_needed'),
        campaign_details: getSelectedValues('campaign_details_container'),
    };

    try {
        const url = currentProjectId ? 
            `/api/projects/${currentProjectId}` : 
            '/api/projects';
        
        const method = currentProjectId ? 'PUT' : 'POST';

        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(formData)
        });

        if (!response.ok) throw new Error('Failed to save project');

        showMessage(`Project ${currentProjectId ? 'updated' : 'created'} successfully!`, 'success');
        await loadProjects();
    } catch (error) {
        console.error('Error:', error);
        showMessage(error.message, 'error');
    }
}

// Edit project
async function editProject(projectId) {
    try {
        const response = await fetch(`/api/projects/${projectId}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (!response.ok) throw new Error('Failed to fetch project');

        const project = await response.json();
        populateForm(project);
        showProjectForm(projectId);
    } catch (error) {
        console.error('Error:', error);
        showMessage(error.message, 'error');
    }
}

// Delete project
async function deleteProject(projectId) {
    if (!confirm('Are you sure you want to delete this project?')) return;

    try {
        const response = await fetch(`/api/projects/${projectId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (!response.ok) throw new Error('Failed to delete project');

        showMessage('Project deleted successfully', 'success');
        await loadProjects();
    } catch (error) {
        console.error('Error:', error);
        showMessage(error.message, 'error');
    }
}

// Helper Functions
function toggleProjectTypeFields(e) {
    const brandDealFields = document.querySelector('.brand-deal-fields');
    const creativeWorkFields = document.querySelector('.creative-work-fields');

    if (e.target.value === 'brand_deal') {
        brandDealFields.style.display = 'block';
        creativeWorkFields.style.display = 'none';
    } else if (e.target.value === 'creative_work') {
        brandDealFields.style.display = 'none';
        creativeWorkFields.style.display = 'block';
    } else {
        brandDealFields.style.display = 'none';
        creativeWorkFields.style.display = 'none';
    }
}

function populateForm(project) {
    // Basic fields
    document.getElementById('name').value = project.name || '';
    document.getElementById('description').value = project.description || '';
    document.getElementById('project_type').value = project.project_type || '';
    document.getElementById('status').value = project.status || '';
    document.getElementById('visibility').value = project.visibility || '';
    document.getElementById('timeline').value = project.timeline || '';
    document.getElementById('start_date').value = project.start_date || '';
    document.getElementById('end_date').value = project.end_date || '';

    // Show/hide type-specific fields
    toggleProjectTypeFields({ target: { value: project.project_type } });

    // Brand deal fields
    if (project.project_type === 'brand_deal') {
        document.getElementById('budget_range').value = project.budget_range || '';
        document.getElementById('payment_terms').value = project.payment_terms || '';
        document.getElementById('payment_format').value = project.payment_format || '';
        setSelectedButtons('campaign_goals_container', project.campaign_goals);
        setMultiSelectValues('target_audience', project.target_audience);
        setSelectedButtons('target_audience_container', project.target_audience);
    }

    // Creative work fields
    if (project.project_type === 'creative_work') {
        document.getElementById('content_category').value = project.content_category || '';
        document.getElementById('content_length').value = project.content_length || '';
        document.getElementById('technical_requirements').value = project.technical_requirements || '';
        setMultiSelectValues('equipment_needed', project.equipment_needed);
    }

    setSelectedButtons('campaign_details_container', project.campaign_details);
    setSelectedButtons('equipment_needed_container', project.equipment_needed);
}

function populateSelectOptions(elementId, options) {
    const select = document.getElementById(elementId);
    if (!select) return;

    select.innerHTML = options.map(option => 
        `<option value="${option}">${option}</option>`
    ).join('');
}

function getMultiSelectValues(elementId) {
    const select = document.getElementById(elementId);
    if (!select) return [];
    return Array.from(select.selectedOptions).map(option => option.value);
}

function setMultiSelectValues(elementId, values) {
    const select = document.getElementById(elementId);
    if (!select || !values) return;
    
    Array.from(select.options).forEach(option => {
        option.selected = values.includes(option.value);
    });
}

function cancelEdit() {
    currentProjectId = null;
    document.getElementById('projectFormSection').style.display = 'none';
    document.getElementById('projectForm').reset();
}

function showMessage(message, type) {
    const container = document.getElementById('message-container');
    if (!container) return;

    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = message;
    
    container.innerHTML = '';
    container.appendChild(messageDiv);
    
    setTimeout(() => messageDiv.remove(), 3000);
}

// Add helper function to get selected values from button groups
function getSelectedValues(containerId) {
    const container = document.getElementById(containerId);
    return Array.from(container.querySelectorAll('.select-button.selected'))
                .map(button => button.dataset.value);
}

// Add function to set selected buttons when editing
function setSelectedButtons(containerId, values) {
    if (!values) return;
    const container = document.getElementById(containerId);
    container.querySelectorAll('.select-button').forEach(button => {
        if (values.includes(button.dataset.value)) {
            button.classList.add('selected');
        }
    });
}

// Initialize button select functionality
function initializeButtonSelects() {
    document.querySelectorAll('.button-select').forEach(container => {
        container.querySelectorAll('.select-button').forEach(button => {
            button.addEventListener('click', () => {
                button.classList.toggle('selected');
            });
        });
    });
}
  