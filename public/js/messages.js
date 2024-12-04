document.addEventListener('DOMContentLoaded', () => {
    loadChats();

    const searchInput = document.querySelector('.search-bar input');
    searchInput.addEventListener('input', filterChats);
    searchInput.addEventListener('focus', () => {
        const dropdown = document.querySelector('.search-dropdown');
        dropdown.style.display = 'block';
    });
});

async function loadChats() {
    try {
        const response = await fetch('/api/chats', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        const chats = await response.json();
        if (!Array.isArray(chats)) throw new Error('Invalid response format');
        
        const chatList = document.querySelector('.chat-list');
        chatList.innerHTML = '<h3>Messages Log</h3>';

        const userId = parseInt(localStorage.getItem('userId'));

        chats.forEach(chat => {
            if (chat.messages && chat.messages.length > 0) {
                const chatWith = chat.user1_id === userId ? chat.user1_username : chat.user2_username;
                chatList.innerHTML += `
                    <div class="chat-card" onclick="openChat(${chat.id})" data-chat-id="${chat.id}" data-chat-with="${chatWith}">
                        <p>Chat with ${chatWith}</p>
                        <span>Last message preview...</span>
                    </div>
                `;
            }
        });
    } catch (error) {
        console.error('Error loading chats:', error);
    }
}

async function filterChats() {
    const searchText = document.querySelector('.search-bar input').value.toLowerCase();
    const dropdown = document.querySelector('.search-dropdown');
    dropdown.innerHTML = '';

    if (searchText.length > 0) {
        try {
            const response = await fetch(`/api/users/search?query=${searchText}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            const users = await response.json();
            if (!Array.isArray(users)) throw new Error('Invalid response format');

            users.forEach(user => {
                const userItem = document.createElement('div');
                userItem.className = 'user-item';
                userItem.textContent = user.username;
                userItem.onclick = () => {
                    openChatWithUser(user.id);
                    dropdown.style.display = 'none'; // Close dropdown
                };
                dropdown.appendChild(userItem);
            });
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    }
}

async function openChatWithUser(userId) {
    try {
        const response = await fetch('/api/chats', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ user2Id: userId })
        });
        const data = await response.json();
        if (!data.chatId) throw new Error('Chat creation failed');

        const chatList = document.querySelector('.chat-list');
        const existingCard = document.querySelector(`.chat-card[data-chat-id="${data.chatId}"]`);

        if (!existingCard) {
            const userResponse = await fetch(`/api/users/${userId}/public`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!userResponse.ok) {
                throw new Error('User not found');
            }

            const userData = await userResponse.json();
            const chatWith = userData.username;

            chatList.innerHTML += `
                <div class="chat-card" onclick="openChat(${data.chatId})" data-chat-id="${data.chatId}" data-chat-with="${chatWith}">
                    <p>Chat with ${chatWith}</p>
                    <span>Last message preview...</span>
                </div>
            `;
        }

        openChat(data.chatId);
    } catch (error) {
        console.error('Error opening chat with user:', error);
    }
}

async function openChat(chatId) {
    try {
        const response = await fetch(`/api/chats/${chatId}/messages`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        const messages = await response.json();
        const chatWindow = document.querySelector('.chat-window');
        const chatCard = document.querySelector(`.chat-card[data-chat-id="${chatId}"]`);

        if (!chatCard) {
            console.error('Chat card not found');
            return;
        }

        const chatWith = chatCard.dataset.chatWith;

        // Highlight the active chat card
        document.querySelectorAll('.chat-card').forEach(card => card.classList.remove('active'));
        chatCard.classList.add('active');

        chatWindow.innerHTML = `
            <div class="chat-header">${chatWith}</div>
            <div class="messages">
                ${messages.length > 0 ? messages.map(message => `
                    <div class="message">
                        <span class="message-content">${message.content}</span>
                        <span class="message-time">${new Date(message.timestamp).toLocaleTimeString()}</span>
                    </div>
                `).join('') : '<p>No messages yet. Start the conversation!</p>'}
            </div>
            <div class="message-input">
                <input type="text" id="messageText" placeholder="Type a message...">
                <button onclick="sendMessage(${chatId})">Send</button>
            </div>
        `;
    } catch (error) {
        console.error('Error opening chat:', error);
    }
}

async function sendMessage(chatId) {
    const messageText = document.getElementById('messageText').value;
    if (!messageText.trim()) return;

    try {
        await fetch(`/api/chats/${chatId}/messages`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ content: messageText })
        });
        openChat(chatId); // Refresh chat after sending
    } catch (error) {
        console.error('Error sending message:', error);
    }
} 