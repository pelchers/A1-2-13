async function loadUserProfile() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/login.html';
        return;
    }

    try {
        console.log('Fetching profile data...'); // Debug log
        const response = await fetch('/api/profile', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        console.log('Profile response status:', response.status); // Debug log
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const userData = await response.json();
        console.log('Received user data:', userData); // Debug log
        
        if (userData) {
            // Set profile type and toggle correct fields
            const profileType = userData.profile_type || 'creator';
            console.log('Setting profile type:', profileType); // Debug log
            
            localStorage.setItem('profile_type', profileType);
            
            const profileTypeToggle = document.getElementById('profileTypeToggle');
            if (profileTypeToggle) {
                profileTypeToggle.checked = profileType === 'brand';
                toggleProfileFields(profileType === 'brand');
            }

            // Update all form fields
            updateFormFields(userData);
            console.log('Form fields updated successfully'); // Debug log
        }
    } catch (error) {
        console.error('Error loading profile:', error);
        showMessage('Error loading profile data', 'error');
    }
}

async function handleProfileUpdate(event) {
    event.preventDefault();
    
    const token = localStorage.getItem('token');
    if (!token) {
        showMessage('Please log in first', 'error');
        window.location.href = '/login.html';
        return;
    }

    const formData = new FormData(event.target);
    const profileType = localStorage.getItem('profile_type') || 'creator';
    
    // Collect current form state
    const data = {
        profile_type: profileType,
        display_name: formData.get('name') || '',
        bio: formData.get('bio') || '',
        skills: (formData.get('skills') || '').split(',').map(skill => skill.trim()).filter(Boolean)
    };

    // Add type-specific fields based on current profile type
    if (profileType === 'creator') {
        Object.assign(data, {
            creator_specialties: (formData.get('creator_specialties') || '').split(',').map(s => s.trim()).filter(Boolean),
            creator_platforms: (formData.get('creator_platforms') || '').split(',').map(s => s.trim()).filter(Boolean),
            audience_size: parseInt(formData.get('audience_size')) || 0,
            content_categories: (formData.get('content_categories') || '').split(',').map(s => s.trim()).filter(Boolean),
            portfolio_links: Array.from(document.getElementsByClassName('portfolio-link'))
                .map(input => input.value.trim())
                .filter(link => link !== ''),
            creator_rate_min: parseInt(formData.get('creator_rate_min')) || 0,
            creator_rate_max: parseInt(formData.get('creator_rate_max')) || 0,
            preferred_deal_types: getSelectedOptions('preferred_deal_types'),
            collaboration_preferences: formData.get('collaboration_preferences') || ''
        });
    } else {
        Object.assign(data, {
            brand_description: formData.get('brand_description') || '',
            industry_sectors: (formData.get('industry_sectors') || '').split(',').map(s => s.trim()).filter(Boolean),
            target_audience: formData.get('target_audience') || '',
            campaign_preferences: (formData.get('campaign_preferences') || '').split(',').map(s => s.trim()).filter(Boolean),
            budget_range: formData.get('budget_range') || '',
            preferred_creator_types: getSelectedOptions('preferred_creator_types'),
            campaign_goals: getSelectedOptions('campaign_goals'),
            collaboration_requirements: formData.get('collaboration_requirements') || ''
        });
    }

    console.log('Sending update data:', data); // Debug log

    try {
        const response = await fetch('/api/profile/update', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });

        const responseData = await response.json();
        
        if (response.ok) {
            showMessage('Profile updated successfully!', 'success');
            // Update form with the returned data
            updateFormFields(responseData);
            console.log('Profile updated with:', responseData); // Debug log
        } else {
            showMessage(responseData.message || 'Profile update failed', 'error');
        }
    } catch (error) {
        console.error('Error updating profile:', error);
        showMessage('An error occurred while updating profile', 'error');
    }
}

function setupProfileImageUpload() {
    const imageInput = document.getElementById('profileImage');
    const imagePreview = document.getElementById('profileImagePreview');

    // Set initial preview if profile image exists
    if (imagePreview) {
        fetch('/api/profile', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.profile_image) {
                imagePreview.innerHTML = '';
                imagePreview.style.backgroundImage = `url(${data.profile_image})`;
                imagePreview.style.backgroundSize = 'cover';
                imagePreview.style.backgroundPosition = 'center';
            }
        })
        .catch(error => console.error('Error loading profile image:', error));
    }

    imageInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (file) {
            // Show preview immediately
            const reader = new FileReader();
            reader.onload = (e) => {
                imagePreview.innerHTML = '';
                imagePreview.style.backgroundImage = `url(${e.target.result})`;
                imagePreview.style.backgroundSize = 'cover';
                imagePreview.style.backgroundPosition = 'center';
            };
            reader.readAsDataURL(file);

            // Upload image
            try {
                const formData = new FormData();
                formData.append('profile_image', file);

                const response = await fetch('/api/profile/upload-image', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: formData
                });

                if (!response.ok) {
                    throw new Error('Failed to upload image');
                }

                const data = await response.json();
                console.log('Image upload response:', data); // Debug log

                // Update preview with the saved image URL
                imagePreview.style.backgroundImage = `url(${data.imageUrl})`;
                showMessage('Profile photo updated successfully!', 'success');
            } catch (error) {
                console.error('Error uploading image:', error);
                showMessage('Failed to upload profile photo', 'error');
            }
        }
    });
} 