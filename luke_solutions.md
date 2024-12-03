# Luke's Solutions

## Problem: Incorrect Username Display in Chat

### Issue
The chat list was displaying the current user's username instead of the chat partner's username. This was due to incorrect logic in determining which username to display.

### Solution
- **Logic Correction**: The logic was adjusted to ensure that the username displayed is that of the chat partner, not the current user.
- **Code Update**:  ```javascript
  const chatWith = chat.user1_id === userId ? chat.user2_username : chat.user1_username;  ```
  - **Explanation**: 
    - The code checks if the current user (`userId`) is `user1_id` in the chat.
    - If true, it sets `chatWith` to `user2_username`, meaning the chat partner is `user2`.
    - If false, it sets `chatWith` to `user1_username`, meaning the chat partner is `user1`.

### Outcome
The chat list now correctly displays the chat partner's username, resolving the issue of displaying "Chat with null" or the current user's own username.

---

Feel free to add more solutions as we continue to work on the project! 