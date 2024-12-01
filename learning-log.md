# Learning Log

## JavaScript Concepts

Q: How does JavaScript file loading work in HTML?
A: JavaScript files are loaded and executed in the order they appear in HTML. Later scripts can override functions/variables from earlier scripts, with the last definition "winning".

Q: What is the hierarchy of JavaScript code execution?
A: The hierarchy from highest to lowest precedence is:
1. Inline JavaScript (in HTML attributes)
2. Internal JavaScript .............
3. External JavaScript (in separate .js files)

Q: How is JavaScript hierarchy different from CSS?
A: Unlike CSS which merges styles:
- JavaScript uses execution order rather than cascading
- Functions can be completely redefined
- Event listeners stack instead of overriding
- Page-specific scripts can override global scripts

## DOM Manipulation

Q: What are the most efficient ways to select DOM elements?
A: Best selectors in order of performance:
```javascript
// Most efficient
document.getElementById('specific-id')
document.querySelector('.specific-class')

// Less efficient
document.getElementsByClassName('general-class')
document.querySelectorAll('div')
```

Q: How can you improve DOM manipulation performance?
A: Key strategies:
- Cache DOM selections
- Batch DOM updates
- Use document fragments for multiple additions
- Minimize reflows and repaints

## Event Handling

Q: What is event bubbling?
A: Events "bubble up" through parent elements. You can stop this with:
```javascript
element.addEventListener('click', (e) => {
    e.stopPropagation();
});
```

Q: How do you prevent default browser behavior?
A: Use preventDefault():
```javascript
form.addEventListener('submit', (e) => {
    e.preventDefault();
});
```

## GitHub Actions

Q: What do common GitHub Action messages mean?
A: Common messages and their meanings:
1. "Node.js CI/CD / build (push)"
   - ✅ Success: Code builds properly
   - ❌ Failure: Build issues found

2. "npm ci"
   - ✅ Success: All packages installed
   - ❌ Failure: Package.json issues

3. Error messages:
   - "All checks have failed": Multiple issues detected
   - "Process completed with exit code 1": General failure
   - "npm ERR! code EJSONPARSE": Package.json format issue

Q: When should you care about GitHub Action checks?
A: Priority levels:
- Development: Can ignore during initial build
- Testing: Important for deployment prep
- Production: Critical before merging

## Security Best Practices

Q: How do you prevent XSS attacks?
A: Key prevention methods:
- Sanitize user input
- Use textContent instead of innerHTML
- Validate data on both server and client
- Escape special characters

Q: What are best practices for authentication?
A: Important considerations:
- Use secure tokens (JWT)
- Implement proper session management
- Validate user permissions
- Use HTTPS
- Store passwords securely (hashed)

## Code Organization

Q: What's the best way to organize JavaScript code?
A: Use patterns like:
```javascript
const UserModule = {
    init() { },
    handleEvents() { },
    updateUI() { }
};
```

Q: How should you separate concerns in web development?
A: Follow these principles:
- HTML for structure
- CSS for presentation
- JavaScript for behavior
- Keep files modular and focused

## Project-Specific Concepts

Q: How do GitHub Actions checks work in our project?
A: GitHub Actions run automated checks when code is pushed:
- Not essential during development
- Can be safely ignored while building features
- More important before production deployment
- Checks build process and package installation

Q: What's the difference between page-specific and global JavaScript?
A: In our project:
- scripts.js handles shared functionality (auth, navigation)
- Page-specific scripts (like in public-profile.html) handle unique features
- Page-specific scripts can override global ones
- Both can coexist on the same page

## Navbar Functionality

Q: How should the navbar profile image work?
A: Important behaviors:
- Always shows logged-in user's profile picture/emoji
- Stays consistent across all pages
- Clicking it takes you to your own public profile
- Doesn't change when viewing other users' profiles

Q: How does the settings dropdown work?
A: Key points:
- Uses click-based toggle (not hover)
- Maintains proper z-index to stay above other elements
- Shows different options based on auth status
- Includes hover animations for better UX

## Search and Filter Layout

Q: How should the search layout be structured?
A: Proper organization:
- Search input on left (45% width)
- Search button centered
- Filters button on right (45% width)
- Equal spacing between elements
- Maintains symmetry in layout

## Card Display System

Q: How should profile cards handle content overflow?
A: Best practices:
- Fixed height with scrollable content
- Maintains consistent card size
- Shows "Click to see more" hint
- Proper spacing between elements
- Responsive to different screen sizes

## Conditional Display Based on User ID

### Methodology
- **Objective**: Display elements or entire pages conditionally based on whether the logged-in user's ID matches the page's user ID.
- **Approach**:
  - Fetch the current user's ID from the server.
  - Compare the current user's ID with the page's user ID from the URL.
  - Use JavaScript to conditionally display elements or redirect based on the comparison.

### Code Reference
```javascript
document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const pageUserId = urlParams.get('id');
    const currentUserId = await getCurrentUserId();

    const isOwnDashboard = !pageUserId || pageUserId === currentUserId.toString();

    updateButtonVisibility(isOwnDashboard);
    loadUserProjects(pageUserId || currentUserId);
});

function updateButtonVisibility(isOwnDashboard) {
    const newProjectButton = document.querySelector('.new-project-btn');
    const editProfileButton = document.querySelector('.edit-profile-btn');

    if (newProjectButton) {
        newProjectButton.style.display = isOwnDashboard ? 'block' : 'none';
    }

    if (editProfileButton) {
        editProfileButton.style.display = isOwnDashboard ? 'block' : 'none';
    }
}
```

## Project Carousel
- **Objective**: Display projects in a random order in the carousel on the home-logged-in page.
- **Approach**:
  - Use the `/api/projects/random` endpoint to fetch projects.
  - Render projects in the carousel using `carousel.js`.

## Search Functionality Implementation

### Question: How do you add search functionality to an existing page without modifying its structure?
Answer: You can add search functionality by integrating it into the existing JavaScript code that handles the page's content. Here's how:

1. **Add Search Logic to Existing Functions**:
```javascript
// Add search functionality to existing loadUsers function
async function loadUsers() {
    try {
        const response = await fetch('/api/users', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        let users = await response.json();
        
        // Add searchable data attribute to user cards
        container.innerHTML = users.map(user => `
            <div class="user-card" data-searchable="${user.display_name || user.username} ${user.bio || ''} ${user.skills || ''}">
                <!-- Existing card HTML -->
            </div>
        `).join('');

        // Initialize search functionality
        initializeSearch();
    } catch (error) {
        console.error('Error loading users:', error);
    }
}
```

2. **Create Search Handler Function**:
```javascript
function handleSearch(query) {
    const userCards = document.querySelectorAll('.user-card');
    const searchText = query.toLowerCase();

    userCards.forEach(card => {
        const searchableContent = card.dataset.searchable.toLowerCase();
        card.style.display = searchableContent.includes(searchText) ? 'block' : 'none';
    });

    // Show all cards if search is empty
    if (!searchText) {
        userCards.forEach(card => card.style.display = 'block');
    }
}
```

### Key Points:
1. Add searchable content as a data attribute
2. Use existing HTML structure
3. Toggle visibility instead of filtering array
4. Reset display when search is empty
5. Keep existing card functionality intact

### Best Practices:
- Don't modify existing HTML structure
- Use data attributes for search content
- Handle empty search gracefully
- Maintain existing event listeners
- Keep search logic separate from display logic

### Common Pitfalls:
1. Overwriting existing event listeners
2. Modifying card structure
3. Not handling empty searches
4. Not preserving existing functionality
5. Rebuilding DOM elements unnecessarily

## Filter Toggle Implementation

### Question: How do you implement a user type filter toggle?
Answer: You can implement a filter toggle using a checkbox input and event listeners. Here's how:

1. **HTML Structure**:
```html
<div class="filter-group user-type-filter">
    <label>Show:</label>
    <div class="toggle-switch">
        <input type="checkbox" id="userTypeToggle">
        <label for="userTypeToggle" class="slider">
            <span class="creator">Creators</span>
            <span class="brand">Brands</span>
        </label>
    </div>
</div>
```

2. **JavaScript Implementation**:
```javascript
function filterUsersByType(userType) {
    const userCards = document.querySelectorAll('.user-card');
    userCards.forEach(card => {
        const cardType = card.querySelector('.user-type-badge')
            .classList.contains('brand') ? 'brand' : 'creator';
        card.style.display = userType === 'both' || 
            cardType === userType ? 'block' : 'none';
    });
}
```

### Key Points:
1. Use checkbox for toggle state
2. Add event listeners for changes
3. Filter based on user type
4. Keep existing card structure
5. Maintain proper styling

### Best Practices:
- Store filter state
- Use semantic HTML
- Handle edge cases
- Maintain accessibility
- Keep consistent styling

## JavaScript Organization

### Question: What's the best way to organize JavaScript functionality across pages?
Answer: Consolidate related functionality into a single main script file rather than using multiple separate files. Here's why:

1. **Centralized Management**:
   - Keep all related functionality in one place
   - Easier to maintain and debug
   - Avoid duplicate code
   - Better dependency management

2. **Implementation Example**:
```javascript
// In scripts.js
document.addEventListener('DOMContentLoaded', () => {
    // Check which page we're on and initialize accordingly
    const exploreContainer = document.getElementById('exploreContainer');
    if (exploreContainer) {
        initializeExplore();
    }
    
    // Other page-specific initializations...
});

// Group related functions together
function initializeExplore() {
    // Explore page specific initialization
}
```

3. **Best Practices**:
   - Use clear function naming
   - Group related functionality
   - Check for element existence before initializing
   - Keep state management centralized
   - Use consistent patterns across features

## Function Conflicts and State Management

Q: Why can removing conflicting functions improve filter functionality?
A: When multiple functions try to handle the same state or functionality:
1. State conflicts occur when different functions modify the same state
2. Event listeners can override each other
3. Filter logic can become inconsistent
4. DOM updates can conflict

Example of conflict resolution:
```javascript
// OLD: Multiple functions handling same state
function viewUserProjects() { ... }  // Removed
function handleSearch() { ... }      // Kept
function filterUsersByType() { ... } // Kept

// BETTER: Single source of truth
function applyFilters() {
    // Handles all filter states in one place
    const searchText = currentFilters.searchText;
    const userType = currentFilters.userType;
    // Apply filters together
}
```

Key lessons:
1. Keep state management centralized
2. Avoid duplicate functionality
3. Use compound filtering in one place
4. Remove redundant state updates
5. Maintain clear data flow

## JavaScript Global Scope

Q: What does `window.functionName = function()` do?
A: This syntax makes a function globally available by attaching it to the window object. When a function is attached to window:
- It can be accessed from any JavaScript file in your project
- Other files can call it using either `window.functionName()` or just `functionName()`
- This is useful when you need to share functionality between different JavaScript files
- Example: If file1.js needs to use a function from file2.js, making it global with window allows this cross-file access

Note: While global functions are sometimes necessary, it's generally better to use modules or more structured approaches for sharing code between files when possible.