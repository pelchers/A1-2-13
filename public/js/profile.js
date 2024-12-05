document.addEventListener('DOMContentLoaded', () => {
    initializeForm();
    loadProfileData();
    setupProfileTypeToggle();
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
        target_audience: [
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
        
        // Populate form fields with existing data
        Object.entries(profile).forEach(([key, value]) => {
            const element = document.getElementById(key);
            if (element) {
                if (element.type === 'select-multiple' && Array.isArray(value)) {
                    // Handle multiple select
                    Array.from(element.options).forEach(option => {
                        option.selected = value.includes(option.value);
                    });
                } else {
                    element.value = value;
                }
            }
        });

        // Show/hide appropriate fields based on profile type
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
            // Get array values from multiple selects
            creator_specialties: Array.from(document.getElementById('creator_specialties').selectedOptions).map(opt => opt.value),
            creator_platforms: Array.from(document.getElementById('creator_platforms').selectedOptions).map(opt => opt.value),
            audience_size: parseInt(formData.get('audience_size')),
            content_categories: Array.from(document.getElementById('content_categories').selectedOptions).map(opt => opt.value),
            creator_rate_min: parseFloat(formData.get('creator_rate_min')),
            creator_rate_max: parseFloat(formData.get('creator_rate_max')),
            preferred_deal_types: Array.from(document.getElementById('preferred_deal_types').selectedOptions).map(opt => opt.value),
            brand_description: formData.get('brand_description'),
            industry_sectors: Array.from(document.getElementById('industry_sectors').selectedOptions).map(opt => opt.value),
            campaign_goals: Array.from(document.getElementById('campaign_goals').selectedOptions).map(opt => opt.value),
            target_audience: Array.from(document.getElementById('target_audience').selectedOptions).map(opt => opt.value)
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