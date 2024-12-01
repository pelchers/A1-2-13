# Project Explainer Log

## Project Overview
This is a profile builder website for content creators built using HTML, CSS, JavaScript, Node.js, and PostgreSQL. It allows users to create and manage their professional profiles and portfolios.

## Basic User Flow
1. User visits the website
2. User can either sign up (new user) or log in (existing user)
3. After authentication, user can:
   - Edit their profile details
   - Add new projects to their portfolio
   - Edit existing projects
   - Delete projects from their profile

## Technical Architecture

### Frontend
- Pure HTML, CSS, and JavaScript
- Serves static files from the `public` directory
- Client-side form validation and API interactions
- Pages:
  - index.html: Landing page
  - login.html: User authentication
  - signup.html: New user registration
  - profile.html: User's profile and projects

### Backend (Node.js + Express)
- RESTful API architecture
- Express.js for routing and middleware
- JWT (JSON Web Tokens) for authentication
- Bcrypt for password hashing
- API Endpoints:
  - POST /api/auth/signup: Create new user
  - POST /api/auth/login: Authenticate user

### Database (PostgreSQL)
- Two main tables:
  1. `users`: Stores user account information
     - id: SERIAL PRIMARY KEY
     - username: VARCHAR(100) UNIQUE
     - password: VARCHAR(100) (hashed)
     - email: VARCHAR(100) UNIQUE
  2. `projects`: Stores project details
     - id: SERIAL PRIMARY KEY
     - user_id: INTEGER (foreign key)
     - title: VARCHAR(255)
     - description: TEXT
     - created_at: TIMESTAMP

### Authentication Flow
1. User Registration:
   - Client sends username, email, password
   - Server hashes password
   - Creates user record
   - Returns JWT token

2. User Login:
   - Client sends email, password
   - Server verifies credentials
   - Returns JWT token

3. Token Management:
   - Tokens stored in localStorage
   - Used for authenticated requests
   - Required for profile access

## Development Environment
### Process Management
1. Development Mode (Nodemon)
   - Auto-restart on file changes
   - Watch for specific directories
   - Ignore unnecessary files
   - Development-specific configurations

2. Production Mode (PM2)
   - Process monitoring
   - Auto-restart on crashes
   - Load balancing capabilities
   - Log management
   - Startup scripts

## Windows-Specific Setup Notes
- Project located at: C:\Users\pelyc\a1-2-profile-simpleh,c,j,n,s
- Use PowerShell for running Node.js commands
- Use psql command prompt or pgAdmin 4 for database management
- Ensure PostgreSQL bin directory is in system PATH
- Use backslashes (\) for file paths in Windows commands
- Use forward slashes (/) or double backslashes (\\) in JavaScript code

## Project Structure and File Descriptions
```
profile-builder/
│
├── public/                  # Static files served directly to client
│   ├── css/
│   │   └── styles.css      # Global styles for all pages
│   │                       # - Form styling
│   │                       # - Layout components
│   │                       # - Button and input styles
│   │
│   ├── js/
│   │   └── scripts.js      # Client-side JavaScript
│   │                       # - Form submission handlers
│   │                       # - Authentication logic
│   │                       # - Token management
│   │                       # - Profile page functionality
│   │
│   ├── index.html          # Landing page
│   │                       # - Welcome message
│   │                       # - Navigation to login/signup
│   │
│   ├── login.html          # Login page
│   │                       # - Email input
│   │                       # - Password input
│   │                       # - Form submission
│   │
│   ├── signup.html         # Registration page
│   │                       # - Username input
│   │                       # - Email input
│   │                       # - Password input
│   │                       # - Form submission
│   │
│   └── profile.html        # User profile page
│                           # - Display user info
│                           # - Project management
│                           # - Logout functionality
│
├── src/                    # Server-side source code
│   └── app.js              # Main server file
│                           # - Express configuration
│                           # - Database connection
│                           # - Authentication routes
│                           # - JWT implementation
│                           # - Error handling
│
├── package.json            # Project metadata and dependencies
│                           # - Express
│                           # - pg (PostgreSQL client)
│                           # - bcryptjs
│                           # - jsonwebtoken
│
└── .gitignore              # Git ignore rules
                            # - node_modules
                            # - environment files
                            # - system files

## Environment Configuration
### Environment Variables
- PORT: Server port (default: 3000)
- DB_USER: PostgreSQL username
- DB_HOST: Database host
- DB_NAME: Database name
- DB_PASSWORD: Database password
- DB_PORT: Database port (default: 5432)
- JWT_SECRET: Secret key for JWT tokens

### Configuration Files
1. .env
   - Contains sensitive configuration
   - Not tracked in git
   - Different per environment

2. .gitignore
   - Excludes .env file
   - Prevents committing sensitive data

### Environment-Specific Settings
- Development: Uses local .env
- Production: Uses server environment variables
- Testing: Can use separate test.env

## Recent Feature Updates

### Search and Filter System
- Collapsible search interface
- Advanced filtering options
- User type toggle
- Range-based filters
- Category-based filters

### Card Display System
- Flip animation for detailed view
- Watch functionality with star button
- Profile metrics display
- User type indicators (🎨 for creators, 🏢 for brands)
- Responsive grid layout (4/3/2/1 cards based on screen size)

### GitHub Actions Understanding
When you see these in your console:
1. "Node.js CI/CD / build (push)"
   - ✅ Success: Code builds properly
   - ❌ Failure: Build issues found

2. "npm ci"
   - ✅ Success: All packages installed
   - ❌ Failure: Package.json issues

3. Common Error Messages:
   - "All checks have failed": Multiple issues detected
   - "Process completed with exit code 1": General failure
   - "npm ERR! code EJSONPARSE": Package.json format issue

### Database Structure Updates
- Added watch count fields
- Added profile metrics fields
- Added filter-related fields

### File Updates
- explore.html: Added search and filter interface
- styles.css: Added new styles for search, filters, and cards
- scripts.js: Added new functionality for search, filters, and watch system
- app.js: Added new endpoints for watch functionality

## Recent Updates

### Card Display System Improvements
1. Fixed card layout and spacing:
   - Proper vertical alignment of content
   - Fixed emoji sizing and positioning
   - Improved metric display
   - Added proper spacing between elements

2. Enhanced Watch Functionality:
   - Added star button (⭐) at top right
   - Fixed watch count display
   - Improved button interaction
   - Added hover effects

3. Profile Navigation:
   - Profile icon in navbar now links to public profile view
   - Settings gear icon links to profile edit page
   - Added "Show Full Profile" button to cards

4. Public Profile View:
   - Added new public-profile.html page
   - Created public profile endpoint
   - Added profile metrics display
   - Responsive layout (75% width on desktop, full width on mobile)

### Layout Updates
1. Search and Filter:
   - Expanded search bar width
   - Improved filter button styling
   - Added collapsible filter section

2. Card Grid Layout:
   - 4 cards per row on large screens (1400px+)
   - 3 cards per row on medium-large screens (1024px-1399px)
   - 2 cards per row on medium screens (768px-1023px)
   - 1 card on mobile screens (<768px)

3. Profile Edit Form:
   - Increased form width to 75%
   - Improved input field spacing
   - Enhanced visual hierarchy
   - Better mobile responsiveness

### Database Updates
Added new fields for user metrics:
- view_count
- follower_count
- account_watchers
- brand_watch_count
- content_types
- content_formats
- market_size
- target_market_tags

### File Structure Updates
1. New Files:
   - public/public-profile.html: Public profile view
   - Added watch functionality to app.js
   - Updated CSS for new layouts

2. Modified Files:
   - styles.css: Added new card and layout styles
   - scripts.js: Added watch and profile navigation
   - explore.html: Updated card layout

## Step 12: Frontend Implementation and Testing

### Recent Updates:
1. Added collapsible search and filter interface
   - Search bar with expanded width
   - Filter toggle button
   - Collapsible filter sections

2. Added card display system
   - Flip animation for card details
   - Watch functionality with star button (⭐)
   - Profile metrics display
   - User type indicators (🎨 for creators, 🏢 for brands)
   - Responsive grid layout (4/3/2/1 cards based on screen size)

3. Added profile image upload
   - Image preview
   - File upload functionality
   - Database storage

4. Added portfolio links management
   - Dynamic add/remove functionality
   - URL validation
   - Persistent storage

5. Added user type specific fields
   - Creator metrics and preferences
   - Brand details and requirements
   - Deal preferences for both types

### Database Verification
[PostgreSQL Terminal (psql)]