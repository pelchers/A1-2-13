// Add getCurrentUserId function
async function getCurrentUserId() {
    try {
        const response = await fetch('/api/profile', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        const userData = await response.json();
        return userData.id;
    } catch (error) {
        console.error('Error getting current user:', error);
        return null;
    }
}

// Update loadProjects function to use current user
async function loadProjects() {
    try {
        const userId = await getCurrentUserId();
        if (!userId) {
            console.error('No user ID found');
            return;
        }

        const response = await fetch(`/api/users/${userId}/projects`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        const projects = await response.json();
        console.log('Loaded projects:', projects);
        renderProjectsList(projects);
    } catch (error) {
        console.error('Error loading projects:', error);
    }
}

// Initialize page
document.addEventListener('DOMContentLoaded', async () => {
    if (window.location.pathname.includes('projects')) {
        await loadProjects();
        // Check if we're in "new project" mode
        if (window.location.hash === '#new') {
            showProjectForm();
        }
    }
});

// Make sure functions are in global scope
window.updateFormFields = function() {
    const projectType = document.getElementById('projectType').value;
    const dynamicFields = document.getElementById('dynamicFields');
    
    if (!projectType) {
        dynamicFields.innerHTML = '';
        return;
    }

    // Generate fields based on project type
    dynamicFields.innerHTML = projectType === 'brand_deal' ? 
        generateBrandDealFields() : 
        generateCreativeWorkFields();
}

window.createNewProject = function() {
    // If we're not on the projects page, redirect
    if (!window.location.pathname.includes('projects')) {
        window.location.href = '/projects.html#new';
        return;
    }
    showProjectForm();
}

// Show project form
function showProjectForm(projectData = null) {
    const formSection = document.querySelector('.project-form-section');
    const projectForm = document.getElementById('projectForm');
    
    // Check if we're on the projects page
    if (!formSection || !projectForm) {
        window.location.href = '/projects.html#new';
        return;
    }

    projectForm.innerHTML = `
        <form id="projectDetailsForm" onsubmit="handleProjectSubmit(event)">
            <div class="form-header">
                <h2>${projectData ? 'Edit Project' : 'Create New Project'}</h2>
            </div>
            
            <div class="form-section">
                <div class="form-group">
                    <label for="projectType">Project Type*</label>
                    <select id="projectType" name="project_type" required onchange="updateFormFields()" 
                            ${projectData ? 'disabled' : ''}>
                        <option value="">Select Type</option>
                        <option value="brand_deal" ${projectData?.project_type === 'brand_deal' ? 'selected' : ''}>
                            Brand Deal
                        </option>
                        <option value="creative_work" ${projectData?.project_type === 'creative_work' ? 'selected' : ''}>
                            Creative Work
                        </option>
                    </select>
                </div>
            </div>

            <div class="form-section">
                <h3>Basic Information</h3>
                <div class="form-group">
                    <label for="projectName">Project Name*</label>
                    <input type="text" id="projectName" name="name" required 
                           value="${projectData?.name || ''}">
                </div>
                <div class="form-group">
                    <label for="projectDescription">Description*</label>
                    <textarea id="projectDescription" name="description" required>${projectData?.description || ''}</textarea>
                </div>
            </div>

            <div id="dynamicFields"></div>

            <div class="form-actions">
                ${projectData ? `
                    <button type="button" class="delete-btn" onclick="deleteProject(${projectData.id})">
                        Delete Project
                    </button>
                ` : ''}
                <button type="submit" class="submit-btn">
                    ${projectData ? 'Save Changes' : 'Create Project'}
                </button>
            </div>
        </form>
    `;

    formSection.classList.add('active');
    
    // If we have project data or a type is selected, update dynamic fields
    if (projectData?.project_type || document.getElementById('projectType').value) {
        updateFormFields();
    }
}

// Load projects list
async function loadProjects() {
    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get('user') || await getCurrentUserId();

    try {
        const response = await fetch(`/api/users/${userId}/projects`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        const projects = await response.json();
        renderProjectsList(projects);
    } catch (error) {
        console.error('Error loading projects:', error);
    }
}

// Render projects list
function renderProjectsList(projects) {
    console.log('Rendering projects list:', projects);
    const listContainer = document.getElementById('projectsList');
    if (!projects || !projects.length) {
        console.log('No projects to display');
        listContainer.innerHTML = '<div class="no-projects">No projects yet</div>';
        return;
    }

    listContainer.innerHTML = projects.map(project => `
        <div class="project-item" onclick="editProject(${project.id})">
            <h3>${project.name}</h3>
            <span class="project-type-badge ${project.project_type}">
                ${project.project_type === 'brand_deal' ? 'Brand Deal' : 'Creative Work'}
            </span>
            <div class="project-meta">
                <span class="project-status">${project.status}</span>
                <span class="project-date">${formatDate(project.created_at)}</span>
            </div>
        </div>
    `).join('');
}

// Helper function for date formatting
function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

// Update handleProjectSubmit function to handle both create and edit
async function handleProjectSubmit(event) {
    event.preventDefault();
    
    try {
        const form = event.target;
        const formData = new FormData(form);
        
        // Get project type
        const projectType = document.getElementById('projectType').value;
        if (!projectType) {
            throw new Error('Please select a project type');
        }

        // Build project data
        const projectData = {
            project_type: projectType
        };

        formData.forEach((value, key) => {
            if (key.endsWith('[]')) {
                const cleanKey = key.slice(0, -2);
                if (!projectData[cleanKey]) {
                    projectData[cleanKey] = [];
                }
                projectData[cleanKey].push(value);
            } else {
                projectData[key] = value;
            }
        });

        // Validate required fields
        if (!projectData.name || !projectData.description) {
            throw new Error('Please fill in all required fields');
        }

        // Check if we're editing an existing project
        const urlParams = new URLSearchParams(window.location.search);
        const editId = urlParams.get('edit');

        const url = editId ? 
            `/api/projects/${editId}` : 
            '/api/projects';
            
        const method = editId ? 'PUT' : 'POST';

        console.log(`${editId ? 'Updating' : 'Creating'} project:`, projectData);

        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(projectData)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `Failed to ${editId ? 'update' : 'create'} project`);
        }

        const result = await response.json();
        console.log(`Project ${editId ? 'updated' : 'created'}:`, result);
        
        // Refresh projects list
        await loadProjects();
        
        // Show success message
        alert(`Project ${editId ? 'updated' : 'created'} successfully!`);
        
        // Redirect to edit mode if new project
        if (!editId && result.id) {
            window.location.href = `/projects.html?edit=${result.id}`;
        }
    } catch (error) {
        console.error('Error handling project:', error);
        alert(error.message);
    }
}

// Make sure it's available globally
window.handleProjectSubmit = handleProjectSubmit;

function generateBrandDealFields() {
    return `
        <!-- Deal Details -->
        <div class="form-section">
            <h3>Deal Details</h3>
            <div class="form-group">
                <label>Content Type (Select all that apply)</label>
                <div class="checkbox-group">
                    <label><input type="checkbox" name="deal_type[]" value="tiktok_posts"> TikTok Posts</label>
                    <label><input type="checkbox" name="deal_type[]" value="instagram_posts"> Instagram Posts</label>
                    <label><input type="checkbox" name="deal_type[]" value="instagram_stories"> Instagram Stories</label>
                    <label><input type="checkbox" name="deal_type[]" value="youtube_integration"> YouTube Integration (:45-:60)</label>
                    <label><input type="checkbox" name="deal_type[]" value="youtube_dedicated"> YouTube Dedicated Review</label>
                    <label><input type="checkbox" name="deal_type[]" value="podcast"> Podcast Ad Read</label>
                    <label><input type="checkbox" name="deal_type[]" value="ugc"> User-Generated Content</label>
                    <label><input type="checkbox" name="deal_type[]" value="live"> Live Appearances</label>
                </div>
            </div>

            <div class="form-group">
                <label for="budgetRange">Budget Range*</label>
                <select id="budgetRange" name="budget_range" required>
                    <option value="">Select Budget Range</option>
                    <option value="under_1000">Under $1,000</option>
                    <option value="1000_5000">$1,000 - $5,000</option>
                    <option value="5000_10000">$5,000 - $10,000</option>
                    <option value="10000_plus">$10,000+</option>
                </select>
            </div>

            <div class="form-group">
                <label for="timeline">Timeline*</label>
                <input type="text" id="timeline" name="timeline" required placeholder="e.g., 2 weeks, 1 month">
            </div>
        </div>

        <!-- Payment Details -->
        <div class="form-section">
            <h3>Payment Information</h3>
            <div class="form-group">
                <label for="paymentFormat">Payment Format*</label>
                <select id="paymentFormat" name="payment_format" required>
                    <option value="">Select Payment Format</option>
                    <option value="flat_fee">Flat Fee</option>
                    <option value="split_revenue">Revenue Share</option>
                    <option value="affiliate">Affiliate Commission</option>
                </select>
            </div>

            <div class="form-group">
                <label for="paymentTerms">Payment Terms</label>
                <textarea id="paymentTerms" name="payment_terms" placeholder="Describe payment schedule, milestones, etc."></textarea>
            </div>

            <div class="form-group">
                <label>Negotiable Terms</label>
                <div class="checkbox-group">
                    <label><input type="checkbox" name="negotiable_terms[]" value="rate"> Rate</label>
                    <label><input type="checkbox" name="negotiable_terms[]" value="timeline"> Timeline</label>
                    <label><input type="checkbox" name="negotiable_terms[]" value="deliverables"> Deliverables</label>
                    <label><input type="checkbox" name="negotiable_terms[]" value="usage_rights"> Usage Rights</label>
                </div>
            </div>
        </div>

        <!-- Campaign Details -->
        <div class="form-section">
            <h3>Campaign Requirements</h3>
            <div class="form-group">
                <label for="targetAudience">Target Audience</label>
                <textarea id="targetAudience" name="target_audience" placeholder="Describe your target audience"></textarea>
            </div>

            <div class="form-group">
                <label for="campaignGoals">Campaign Goals</label>
                <textarea id="campaignGoals" name="campaign_goals" placeholder="What are your campaign objectives?"></textarea>
            </div>

            <div class="form-group">
                <label for="brandRequirements">Brand Requirements</label>
                <textarea id="brandRequirements" name="brand_requirements" placeholder="Any specific brand guidelines or requirements"></textarea>
            </div>

            <div class="form-group">
                <label for="exclusivityTerms">Exclusivity Terms</label>
                <textarea id="exclusivityTerms" name="exclusivity_terms" placeholder="Any exclusivity requirements"></textarea>
            </div>
        </div>
    `;
}

function generateCreativeWorkFields() {
    return `
        <!-- Content Details -->
        <div class="form-section">
            <h3>Content Details</h3>
            <div class="form-group">
                <label for="contentCategory">Content Category*</label>
                <select id="contentCategory" name="content_category" required>
                    <option value="">Select Category</option>
                    <option value="vlog">Vlog</option>
                    <option value="tutorial">Tutorial</option>
                    <option value="review">Review</option>
                    <option value="entertainment">Entertainment</option>
                    <option value="educational">Educational</option>
                    <option value="podcast">Podcast</option>
                    <option value="live_stream">Live Stream</option>
                </select>
            </div>

            <div class="form-group">
                <label>Content Format</label>
                <div class="checkbox-group">
                    <label><input type="checkbox" name="content_format[]" value="video"> Video</label>
                    <label><input type="checkbox" name="content_format[]" value="audio"> Audio</label>
                    <label><input type="checkbox" name="content_format[]" value="written"> Written</label>
                    <label><input type="checkbox" name="content_format[]" value="photo"> Photography</label>
                </div>
            </div>

            <div class="form-group">
                <label for="contentLength">Content Length</label>
                <input type="text" id="contentLength" name="content_length" placeholder="e.g., 10 minutes, 1500 words">
            </div>
        </div>

        <!-- Production Details -->
        <div class="form-section">
            <h3>Production Information</h3>
            <div class="form-group">
                <label for="projectDuration">Project Duration*</label>
                <input type="text" id="projectDuration" name="project_duration" required placeholder="e.g., 1 week, 3 days">
            </div>

            <div class="form-group">
                <label for="equipmentNeeded">Equipment Needed</label>
                <textarea id="equipmentNeeded" name="equipment_needed" placeholder="List required equipment"></textarea>
            </div>

            <div class="form-group">
                <label for="technicalRequirements">Technical Requirements</label>
                <textarea id="technicalRequirements" name="technical_requirements" placeholder="Any specific technical needs"></textarea>
            </div>
        </div>

        <!-- Collaboration Details -->
        <div class="form-section">
            <h3>Collaboration Information</h3>
            <div class="form-group">
                <label for="collaborationType">Collaboration Type</label>
                <select id="collaborationType" name="collaboration_type">
                    <option value="">Select Type</option>
                    <option value="solo">Solo Project</option>
                    <option value="team">Team Project</option>
                    <option value="collab">Creator Collaboration</option>
                </select>
            </div>

            <div class="form-group">
                <label for="resourceRequirements">Resource Requirements</label>
                <textarea id="resourceRequirements" name="resource_requirements" placeholder="Additional resources needed"></textarea>
            </div>
        </div>

        <!-- Distribution Strategy -->
        <div class="form-section">
            <h3>Distribution Strategy</h3>
            <div class="form-group">
                <label for="platforms">Target Platforms</label>
                <div class="checkbox-group">
                    <label><input type="checkbox" name="platforms[]" value="youtube"> YouTube</label>
                    <label><input type="checkbox" name="platforms[]" value="tiktok"> TikTok</label>
                    <label><input type="checkbox" name="platforms[]" value="instagram"> Instagram</label>
                    <label><input type="checkbox" name="platforms[]" value="twitter"> Twitter</label>
                    <label><input type="checkbox" name="platforms[]" value="twitch"> Twitch</label>
                </div>
            </div>

            <div class="form-group">
                <label for="monetizationMethods">Monetization Methods</label>
                <div class="checkbox-group">
                    <label><input type="checkbox" name="monetization_methods[]" value="ads"> Platform Ads</label>
                    <label><input type="checkbox" name="monetization_methods[]" value="sponsorship"> Sponsorships</label>
                    <label><input type="checkbox" name="monetization_methods[]" value="merchandise"> Merchandise</label>
                    <label><input type="checkbox" name="monetization_methods[]" value="subscriptions"> Subscriptions</label>
                </div>
            </div>
        </div>
    `;
}

// Add to your existing projects.js
window.editProject = async function(projectId) {
    try {
        const response = await fetch(`/api/projects/${projectId}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        if (response.ok) {
            const projectData = await response.json();
            showProjectForm(projectData);
            // Update URL without reloading
            history.pushState(null, '', `/projects.html?edit=${projectId}`);
        } else {
            throw new Error('Failed to load project');
        }
    } catch (error) {
        console.error('Error loading project:', error);
        alert('Error loading project. Please try again.');
    }
}
  