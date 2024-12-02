function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
    });
}

function showMessage(message, type = 'info') {
    const container = document.getElementById('message-container');
    if (!container) return;

    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = message;
    
    container.innerHTML = ''; // Clear any existing messages
    container.appendChild(messageDiv);
    
    // Remove the message after 3 seconds
    setTimeout(() => {
        messageDiv.remove();
    }, 3000);
}

function getRandomEmoji() {
    const avatarEmojis = [
        '🦊', '🐱', '🐰', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸',
        '🦄', '🐲', '🦉', '🦋', '🐢', '🐬', '🐙', '🦈', '🦜', '🦡'
    ];
    return avatarEmojis[Math.floor(Math.random() * avatarEmojis.length)];
} 