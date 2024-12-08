document.addEventListener('DOMContentLoaded', () => {
    // Check authentication first
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/login.html';
        return;
    }

    // Initialize plan buttons only if authenticated
    const planButtons = document.querySelectorAll('.select-plan-btn');
    planButtons.forEach(button => {
        button.addEventListener('click', async () => {
            const planType = button.textContent.toLowerCase();
            
            if (planType.includes('enterprise')) {
                // Open contact form or redirect to contact page
                window.location.href = '/contact.html';
            } else {
                try {
                    // Verify token is still valid
                    const response = await fetch('/api/profile', {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });
                    
                    if (!response.ok) {
                        localStorage.removeItem('token');
                        window.location.href = '/login.html';
                        return;
                    }

                    // Handle plan selection
                    alert('Plan selection will be implemented with payment processing');
                } catch (error) {
                    console.error('Error:', error);
                    alert('Error processing request');
                }
            }
        });
    });
}); 