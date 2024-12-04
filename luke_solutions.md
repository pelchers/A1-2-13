# Luke's Solutions

## Problem: Incorrect Username Display in Chat

### Issue
The chat list was displaying the current user's username instead of the chat partner's username. This was due to incorrect logic in determining which username to display.

### Solution
- **Logic Correction**: The logic was adjusted to ensure that the username displayed is that of the chat partner, not the current user.
- **Code Update**: 
  ```javascript
  const chatWith = chat.user1_id === userId ? chat.user2_username : chat.user1_username;
  ```
  - **Explanation**: 
    - The code checks if the current user (`userId`) is `user1_id` in the chat.
    - If true, it sets `chatWith` to `user2_username`, meaning the chat partner is `user2`.
    - If false, it sets `chatWith` to `user1_username`, meaning the chat partner is `user1`.

### Outcome
The chat list now correctly displays the chat partner's username, resolving the issue of displaying "Chat with null" or the current user's own username.

---

## Problem: Chat Card and Search Functionality

### Issue
The chat card was not being created correctly, and the search functionality was breaking the redirect from the "Send Message" button.

### Solution
- **Ensure Chat Card Creation**: Before opening a chat, check if the chat card exists. If not, create it using the correct username.
- **Code Update**:
  ```javascript
  const existingCard = document.querySelector(`.chat-card[data-chat-id="${data.chatId}"]`);
  if (!existingCard) {
      const userResponse = await fetch(`/api/users/${userId}/public`, {
          headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
      });
      const userData = await userResponse.json();
      const chatWith = userData.username;
      chatList.innerHTML += `
          <div class="chat-card" onclick="openChat(${data.chatId})" data-chat-id="${data.chatId}" data-chat-with="${chatWith}">
              <p>Chat with ${chatWith}</p>
              <span>Last message preview...</span>
          </div>
      `;
  }
  ```
  - **Explanation**: 
    - Checks if a chat card already exists to prevent duplicates.
    - Fetches the username to display in the chat card.

### Outcome
Both the search functionality and the "Send Message" button now work seamlessly, allowing users to open or create chats without conflict.

---

Feel free to add more solutions as we continue to work on the project! 