document.addEventListener('DOMContentLoaded', () => {
    initializeForm();
    loadProfileData();
    setupProfileTypeToggle();
    initializeButtonSelects();
});

// Form initialization
function initializeForm() {
    // Populate dropdown options
    const options = {
        creator_specialties: [
            'Video Production', 'Photography', 'Writing', 'Music', 
            'Animation', 'Graphic Design', 'Social Media', 'Podcasting'
        ],
        creator_platforms: [
            'YouTube', 'Instagram', 'TikTok', 'Twitter', 
            'LinkedIn', 'Facebook', 'Twitch', 'Blog'
        ],
        content_categories: [
            'Entertainment', 'Education', 'Lifestyle', 'Gaming',
            'Tech', 'Fashion', 'Food', 'Travel', 'Sports'
        ],
        preferred_deal_types: [
            'Sponsored Posts', 'Brand Ambassadorship', 'Product Reviews',
            'Content Creation', 'Affiliate Marketing', 'Event Coverage'
        ],
        industry_sectors: [
            'Technology', 'Fashion', 'Food & Beverage', 'Travel',
            'Health & Wellness', 'Beauty', 'Gaming', 'Education'
        ],
        campaign_goals: [
            'Brand Awareness', 'Product Launch', 'Lead Generation',
            'Sales Conversion', 'Community Building', 'Event Promotion'
        ],
        target_demographics: [
            'Gen Z', 'Millennials', 'Parents', 'Professionals',
            'Students', 'Tech Enthusiasts', 'Fashion Enthusiasts'
        ]
    };

    // Populate all select elements
    Object.entries(options).forEach(([id, values]) => {
        const select = document.getElementById(id);
        if (select) {
            values.forEach(value => {
                const option = new Option(value, value);
                select.add(option);
            });
        }
    });

    // Handle form submission
    document.getElementById('profileForm').addEventListener('submit', handleSubmit);
}

// Load existing profile data
async function loadProfileData() {
    try {
        const response = await fetch('/api/profile', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        const profile = await response.json();
        
        // Set regular form fields
        Object.entries(profile).forEach(([key, value]) => {
            const element = document.getElementById(key);
            if (element && !element.classList.contains('button-select')) {
                element.value = value;
            }
        });

        // Set button selections
        setSelectedButtons('creator_specialties_container', profile.creator_specialties);
        setSelectedButtons('creator_platforms_container', profile.creator_platforms);
        setSelectedButtons('content_categories_container', profile.content_categories);
        setSelectedButtons('preferred_deal_types_container', profile.preferred_deal_types);
        setSelectedButtons('industry_sectors_container', profile.industry_sectors);
        setSelectedButtons('campaign_goals_container', profile.campaign_goals);
        setSelectedButtons('target_demographics_container', profile.target_demographics);

        toggleProfileFields(profile.profile_type);
    } catch (error) {
        console.error('Error loading profile:', error);
        showMessage('Error loading profile data', 'error');
    }
}

// Handle form submission
async function handleSubmit(event) {
    event.preventDefault();
    
    try {
        const formData = new FormData(event.target);
        const profileData = {
            display_name: formData.get('display_name'),
            bio: formData.get('bio'),
            profile_type: formData.get('profile_type'),
            creator_specialties: getSelectedValues('creator_specialties_container'),
            creator_platforms: getSelectedValues('creator_platforms_container'),
            audience_size: parseInt(formData.get('audience_size')),
            content_categories: getSelectedValues('content_categories_container'),
            creator_rate_min: parseFloat(formData.get('creator_rate_min')),
            creator_rate_max: parseFloat(formData.get('creator_rate_max')),
            preferred_deal_types: getSelectedValues('preferred_deal_types_container'),
            brand_description: formData.get('brand_description'),
            industry_sectors: getSelectedValues('industry_sectors_container'),
            campaign_goals: getSelectedValues('campaign_goals_container'),
            target_demographics: getSelectedValues('target_demographics_container')
        };

        const response = await fetch('/api/profile', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(profileData)
        });

        if (!response.ok) throw new Error('Failed to update profile');
        
        showMessage('Profile updated successfully', 'success');
    } catch (error) {
        console.error('Error updating profile:', error);
        showMessage('Error updating profile', 'error');
    }
}

// Toggle profile type fields
function setupProfileTypeToggle() {
    const profileTypeSelect = document.getElementById('profile_type');
    profileTypeSelect.addEventListener('change', (e) => {
        toggleProfileFields(e.target.value);
    });
}

function toggleProfileFields(profileType) {
    const creatorFields = document.getElementById('creatorFields');
    const brandFields = document.getElementById('brandFields');
    
    if (profileType === 'creator') {
        creatorFields.style.display = 'block';
        brandFields.style.display = 'none';
    } else {
        creatorFields.style.display = 'none';
        brandFields.style.display = 'block';
    }
}

// Utility function to show messages
function showMessage(message, type = 'info') {
    const container = document.getElementById('message-container');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = message;
    container.innerHTML = '';
    container.appendChild(messageDiv);
    setTimeout(() => messageDiv.remove(), 3000);
}

// Add this after your existing initialization code
function initializeButtonSelects() {
    document.querySelectorAll('.button-select').forEach(container => {
        container.querySelectorAll('.select-button').forEach(button => {
            button.addEventListener('click', () => {
                button.classList.toggle('selected');
            });
        });
    });
}

// Update the form submission to collect selected buttons
function getSelectedValues(containerId) {
    const container = document.getElementById(containerId);
    return Array.from(container.querySelectorAll('.select-button.selected'))
                .map(button => button.dataset.value);
}

// Update handleSubmit function
async function handleSubmit(event) {
    event.preventDefault();
    
    try {
        const formData = new FormData(event.target);
        const profileData = {
            display_name: formData.get('display_name'),
            bio: formData.get('bio'),
            profile_type: formData.get('profile_type'),
            creator_specialties: getSelectedValues('creator_specialties_container'),
            creator_platforms: getSelectedValues('creator_platforms_container'),
            audience_size: parseInt(formData.get('audience_size')),
            content_categories: getSelectedValues('content_categories_container'),
            creator_rate_min: parseFloat(formData.get('creator_rate_min')),
            creator_rate_max: parseFloat(formData.get('creator_rate_max')),
            preferred_deal_types: getSelectedValues('preferred_deal_types_container'),
            brand_description: formData.get('brand_description'),
            industry_sectors: getSelectedValues('industry_sectors_container'),
            campaign_goals: getSelectedValues('campaign_goals_container'),
            target_demographics: getSelectedValues('target_demographics_container')
        };

        const response = await fetch('/api/profile', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(profileData)
        });

        if (!response.ok) throw new Error('Failed to update profile');
        
        showMessage('Profile updated successfully', 'success');
    } catch (error) {
        console.error('Error updating profile:', error);
        showMessage('Error updating profile', 'error');
    }
}

// Update loadProfileData to set selected buttons
function setSelectedButtons(containerId, values) {
    if (!values) return;
    const container = document.getElementById(containerId);
    container.querySelectorAll('.select-button').forEach(button => {
        if (values.includes(button.dataset.value)) {
            button.classList.add('selected');
        }
    });
} 