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

## Project View Display Issue Fix

### Original Issue
The project details page was failing to load with a 500 error due to two main problems:
1. Authentication requirement blocking public access
2. Order of operations in checking user authentication before project data

### Original Code

### src/app.js
```javascript
// Original endpoint required authentication for viewing projects
app.get('/api/projects/:projectId', authenticateToken, async (req, res) => {
    try {
        const { projectId } = req.params;
        // Complex query with unnecessary joins and auth checks
        const query = `
            SELECT p.*, 
                u.username as creator_name,
                u.profile_type as creator_type,
                COUNT(DISTINCT pc.user_id) as collaborator_count,
                CASE 
                    WHEN $2 = ANY(p.watcher_ids) THEN true 
                    ELSE false 
                END as is_watched
            FROM projects p
            LEFT JOIN users u ON p.user_id = u.id
            LEFT JOIN project_collaborators pc ON p.id = pc.project_id
            WHERE p.id = $1
            GROUP BY p.id, u.username, u.profile_type...
        `;
        const result = await pool.query(query, [projectId, req.user.id]);
        // ...
    }
});
```

### project-view.js
```javascript
// Original code tried to get user auth before project data
document.addEventListener('DOMContentLoaded', async () => {
    const currentUserId = await getCurrentUserId();
    await loadProjectDetails(projectId, currentUserId);
});

async function loadProjectDetails(projectId, currentUserId) {
    const response = await fetch(`/api/projects/${projectId}`, {
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    });
    // ...
}
```

### Solution

### 1. Remove Authentication Requirement
- Made project viewing public by removing `authenticateToken` middleware
- Simplified SQL query to only get necessary project data
- Removed user-specific checks from main query

```javascript
app.get('/api/projects/:id', async (req, res) => {
    const query = `
        SELECT p.*, 
            u.username as creator_name,
            u.profile_type as creator_type
        FROM projects p
        LEFT JOIN users u ON p.user_id = u.id
        WHERE p.id = $1
    `;
});
```

### 2. Fix Order of Operations
- Load project data first without authentication
- Check user authentication only for edit button display
- Separate concerns between viewing and editing

```javascript
async function loadProjectDetails(projectId) {
    // First load project data (no auth required)
    const response = await fetch(`/api/projects/${projectId}`);
    const project = await response.json();
    renderProjectDetails(project);

    // Then check auth only for edit button
    const token = localStorage.getItem('token');
    if (token) {
        try {
            const userResponse = await fetch('/api/profile', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (userResponse.ok) {
                const userData = await userResponse.json();
                if (project.user_id === userData.id) {
                    // Show edit button
                }
            }
        } catch (error) {
            console.error('Error checking user auth:', error);
        }
    }
}
```

### Key Learnings
1. **Public vs. Protected Routes**: Not all routes need authentication. Project viewing should be public, while editing requires auth.
2. **Order of Operations**: Load public data first, then handle authenticated features separately.
3. **Query Optimization**: Only include necessary joins and conditions in database queries.
4. **Separation of Concerns**: Clearly separate public viewing logic from authenticated user actions.

### Data Flow Path
Before:
```
Check Auth → Get User ID → Fetch Project → Display Project → Check Edit Permission
```

After:
```
Fetch Project → Display Project → (If logged in) Check Edit Permission
```

This solution improves both performance and user experience by showing project data immediately while handling authenticated features asynchronously.

---

Feel free to add more solutions as we continue to work on the project! 