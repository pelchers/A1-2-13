# Setup Instructions Log (Windows)

## Resume Project (Quick Start)
1. Start Required Services:
   ```powershell
   # Start PostgreSQL Service
   services.msc  # Find postgresql-x64-{version} and ensure it's running
   
   # Verify database connection
   psql -h localhost -p 5432 -U postgres -d profile_builder
   ```

2. Start Application:
   ```powershell
   # Navigate to project directory
   cd C:\Users\pelyc\a1-2-profile-simpleh,c,j,n,s
   
   # Start with PM2
   pm2 start src\app.js --name "profile-builder"
   
   # Verify running status
   pm2 list
   ```

3. Access Application:
   - Open browser to http://localhost:3000
   - Check server logs: `pm2 logs profile-builder`
   - Monitor resources: `pm2 monit`

## 1. Environment Setup
1. Install Node.js and npm
   - Via Windows Installer: Download from nodejs.org
   - Or via Chocolatey: `choco install nodejs`
   Verification:
   ```powershell
   node --version  # Should show version number
   npm --version   # Should show version number
   ```

2. Install PostgreSQL
   - Download PostgreSQL installer from postgresql.org
   - Or via Chocolatey: `choco install postgresql`
   - During installation, note down your postgres user password
   - Add PostgreSQL bin directory to PATH
   Verification:
   ```powershell
   psql --version  # Should show PostgreSQL version
   ```

## 2. Database Setup
1. Start PostgreSQL Service
   - Press Windows + R → services.msc
   - Find postgresql-x64-{version}
   - Ensure Status is "Running"
   - Set "Startup type" to "Automatic"
   Verification:
   ```powershell
   psql -h localhost -p 5432 -U postgres  # Should connect
   ```

2. Create Database and Tables
   ```sql
   CREATE DATABASE profile_builder;
   \c profile_builder
   
   -- Create users table first (required for foreign key)
   CREATE TABLE users (
       id SERIAL PRIMARY KEY,
       username VARCHAR(100) UNIQUE NOT NULL,
       password VARCHAR(100) NOT NULL,
       email VARCHAR(100) UNIQUE NOT NULL
   );

   -- Then create projects table
   CREATE TABLE projects (
       id SERIAL PRIMARY KEY,
       user_id INTEGER REFERENCES users(id),
       title VARCHAR(255) NOT NULL,
       description TEXT,
       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );
   ```
   Verification:
   ```sql
   \dt                 # Should list both tables
   \d users           # Should show users structure
   \d projects        # Should show projects structure
   ```

## 3. Project Setup
1. Create and navigate to project directory
   ```powershell
   cd C:\Users\pelyc\a1-2-profile-simpleh,c,j,n,s
   ```
   Verification:
   ```powershell
   pwd  # Should show correct path
   ```

2. Initialize Node.js project
   ```powershell
   npm init -y
   ```
   Verification:
   ```powershell
   Test-Path package.json  # Should return True
   ```

## 4. Package Installation
1. Install project dependencies:
   ```powershell
   # Install all required packages at once
   npm install express pg bcryptjs jsonwebtoken dotenv
   ```
   Verification:
   ```powershell
   npm list  # Should show all installed packages with versions
   ```

2. Install global tools:
   ```powershell
   # Install process managers globally
   npm install -g pm2 nodemon
   ```
   Verification:
   ```powershell
   pm2 -v      # Should show PM2 version
   nodemon -v  # Should show nodemon version
   ```

## 5. Environment Variables Setup
1. Create .env file:
   ```powershell
   New-Item -Path ".env" -ItemType File
   ```

2. Add environment variables to .env:
   ```env
   PORT=3000
   DB_USER=postgres
   DB_HOST=localhost
   DB_NAME=profile_builder
   DB_PASSWORD=2322
   DB_PORT=5432
   JWT_SECRET=your-secret-key
   ```

3. Update app.js to use environment variables:
   ```javascript
   require('dotenv').config();
   
   const port = process.env.PORT || 3000;
   const JWT_SECRET = process.env.JWT_SECRET;
   
   const pool = new Pool({
       user: process.env.DB_USER,
       host: process.env.DB_HOST,
       database: process.env.DB_NAME,
       password: process.env.DB_PASSWORD,
       port: process.env.DB_PORT,
   });
   ```

4. Add .env to .gitignore:
   ```powershell
   Add-Content .gitignore ".env"
   ```
   Verification:
   ```powershell
   # Test environment variables
   node -e "require('dotenv').config(); console.log(process.env.PORT)"
   ```

## 6. Process Management Setup
1. Configure PowerShell Execution Policy
   ```powershell
   # Open PowerShell as Administrator and run:
   Set-ExecutionPolicy RemoteSigned
   ```
   Verification:
   ```powershell
   Get-ExecutionPolicy  # Should show "RemoteSigned"
   ```

2. Install Process Managers
   ```powershell
   # Install both globally
   npm install -g pm2
   npm install -g nodemon
   ```
   Verification:
   ```powershell
   pm2 -v     # Should show PM2 version
   nodemon -v # Should show nodemon version
   ```

3. Development Mode (Nodemon)
   - Automatically restarts server when files change
   - Add to package.json:
     ```json
     {
       "scripts": {
         "dev": "nodemon src/app.js"
       }
     }
     ```
   - Start development server:
     ```powershell
     npm run dev
     # or directly:
     nodemon src\app.js
     ```
   Verification:
   - Terminal should show "watching directory"
   - Make a change to app.js to see auto-reload

4. Production Mode (PM2)
   ```powershell
   # Start application with PM2
   pm2 start src\app.js --name "profile-builder" --watch

   # For Windows Startup (since pm2 startup doesn't work on Windows):
   # Method 1: Create a Windows Task Scheduler task
   # 1. Open Task Scheduler (Windows + R, type taskschd.msc)
   # 2. Create Basic Task
   #    - Name: "PM2 Profile Builder"
   #    - Trigger: At log on
   #    - Action: Start a program
   #    - Program: powershell.exe
   #    - Arguments: -WindowStyle Hidden -Command "pm2 resurrect"
   
   # Method 2: Create a startup batch file
   New-Item -Path "$env:USERPROFILE\AppData\Roaming\Microsoft\Windows\Start Menu\Programs\Startup\start-pm2.bat" -ItemType File -Force -Value @"
   @echo off
   powershell -Command "pm2 resurrect"
   "@

   # Save your current PM2 process list
   pm2 save
   ```
   
   Verification:
   ```powershell
   # Check if PM2 is running
   pm2 list  # Should show "profile-builder" as "online"
   
   # Test auto-restart
   pm2 restart profile-builder
   
   # Check logs
   pm2 logs profile-builder
   ```

5. PM2 Process Management
   ```powershell
   # Monitor processes
   pm2 monit
   
   # View logs
   pm2 logs profile-builder
   
   # Save process list (do this after any PM2 configuration changes)
   pm2 save
   ```

6. Troubleshooting PM2
   ```powershell
   # If PM2 shows error status:
   
   # 1. Stop any running Node processes
   taskkill /IM node.exe /F
   
   # 2. Delete errored process
   pm2 delete profile-builder
   
   # 3. Start with logging
   pm2 start src\app.js --name "profile-builder" --watch --log "logs.txt"
   
   # 4. Check logs
   pm2 logs profile-builder
   ```
   Verification:
   ```powershell
   pm2 list  # Should show "online" status
   ```

5. Troubleshooting Port Issues
   ```powershell
   # If you get EADDRINUSE error:
   
   # Find process using the port
   netstat -ano | findstr :3000
   
   # Kill the process (replace XXXX with PID)
   taskkill /PID XXXX /F
   ```
   Verification:
   ```powershell
   # Try starting nodemon again
   nodemon src\app.js
   ```

## 7. Project Structure Setup
1. Create directories
   ```powershell
   mkdir src public public\css public\js
   ```

2. Create files
   ```powershell
   New-Item -Path "public\index.html" -ItemType File
   New-Item -Path "public\login.html" -ItemType File
   New-Item -Path "public\signup.html" -ItemType File
   New-Item -Path "public\profile.html" -ItemType File
   New-Item -Path "public\css\styles.css" -ItemType File
   New-Item -Path "public\js\scripts.js" -ItemType File
   New-Item -Path "src\app.js" -ItemType File
   ```
   Verification:
   ```powershell
   Get-ChildItem -Recurse  # Should list all created files
   ```

3. Verify Project Structure:
   ```powershell
   # Check project structure
   tree

   # Expected output:
   C:.
   +---.vscode
   +---node_modules
   +---public
   |   +---css
   |   \---js
   \---src
   ```
   
   Verification:
   - All directories should be present
   - All files should exist
   - Check file permissions

## 8. Server Setup
1. Configure app.js with database connection
2. Add basic Express setup
3. Start server:
   ```powershell
   node src\app.js
   ```
   Verification:
   ```powershell
   curl http://localhost:3000  # Should return HTML
   ```

## 9. Authentication Setup
1. Verify JWT Configuration:
   ```powershell
   # Check if JWT_SECRET is set
   node -e "require('dotenv').config(); console.log(process.env.JWT_SECRET)"
   ```
   Expected output: Should show your JWT secret key

2. Test Authentication Flow:
   a. Through Browser:
      - Open http://localhost:3000/signup.html
      - Create test account:
        ```
        Username: testuser
        Email: test@test.com
        Password: test123
        ```
      - Should redirect to profile.html
      - Open browser DevTools (F12):
        - Check Application → Local Storage for JWT token
        - Check Network tab for successful POST request

   b. Through Database:
      ```sql
      \c profile_builder
      SELECT username, email FROM users;
      ```
      Expected output: Should show newly created user

3. Test Token Validation:
   - Log out (clear localStorage)
   - Try accessing http://localhost:3000/profile.html
   - Should redirect to login page

## 10. Frontend Implementation
1. Update HTML files with forms
2. Add CSS styles
3. Implement JavaScript functionality

Important Note: When making changes to frontend-backend interactions:
1. Any changes to API endpoints or routes require server restart:
   ```powershell
   # Stop current process
   pm2 delete profile-builder

   # Start fresh with new changes
   pm2 start src\app.js --name "profile-builder"

   # Verify server is running with new changes
   pm2 logs profile-builder
   ```

2. Common scenarios requiring restart:
   - Adding new API endpoints
   - Modifying existing routes
   - Updating database queries
   - Changes to middleware

3. Verification after restart:
   - Check browser console (F12) for errors
   - Test affected functionality
   - Verify API endpoints return expected data

Note: While CSS and HTML changes are immediately visible on refresh,
changes to server-side code or API endpoints require a server restart
to take effect.

Verification:
- Open http://localhost:3000 in browser
- Test signup/login forms
- Verify redirects work
- Check API endpoints return expected data

## 11. GitHub Setup
1. Create repository
2. Initialize local Git:
   ```powershell
   git init
   git add .
   git commit -m "Initial commit"
   ```
3. Connect and push:
   ```powershell
   git remote add origin https://github.com/yourusername/profile-builder.git
   git branch -M main
   git push -u origin main
   ```
   Verification:
   - Check GitHub repository for files
   - Verify commit history

## Multi-Project Setup (Update this section)
1. Database Configuration:
   ```sql
   -- Each project gets its own database on port 5432
   CREATE DATABASE project1_name;
   CREATE DATABASE project2_name;
   ```
   Verification:
   ```sql
   \l  # Should list all databases
   ```

2. Port Management:
   - Create separate .env files for each project
   ```env
   # project1/.env
   PORT=3000
   
   # project2/.env
   PORT=3001
   ```
   
   - Update app.js to use environment variables
   ```javascript
   const port = process.env.PORT || 3000;
   ```
   
   - Update frontend to use relative URLs:
   ```javascript
   // Instead of hardcoding URLs in scripts.js
   const response = await fetch('/api/auth/signup', {
       // ... rest remains the same
   });
   ```
   
3. Running Multiple Projects:
   ```powershell
   # Start each project with its own .env file
   pm2 start src\app.js --name "project1" --env production
   pm2 start src\app.js --name "project2" --env production
   ```

## Advanced PM2 Configuration
1. Monitoring Setup
   ```powershell
   # Start with advanced monitoring (Windows - single line)
   pm2 start src\app.js --name "profile-builder" --watch --merge-logs --log-date-format "YYYY-MM-DD HH:mm:ss"
   
   # View monitoring dashboard
   pm2 monit
   ```

2. Log Management
   ```powershell
   # Install log rotation module
   pm2 install pm2-logrotate
   
   # Configure log rotation
   pm2 set pm2-logrotate:max_size 10M
   pm2 set pm2-logrotate:retain 7
   pm2 set pm2-logrotate:compress true
   ```

3. Automatic Restart Configuration
   ```powershell
   # All configurations in a single line for Windows
   pm2 start src\app.js --name "profile-builder" --watch --max-memory-restart 300M --restart-delay 1000 --max-restarts 10 --cron-restart "0 4 * * *"
   ```

4. Monitoring Commands
   ```powershell
   pm2 monit              # Open monitoring dashboard
   pm2 logs              # View logs
   pm2 prettylist        # View detailed process information
   pm2 describe 0        # View specific process details
   ```

## Terminal-Specific Commands
1. PowerShell:
   ```powershell
   pm2 start src\app.js --name "profile-builder"
   ```

2. Git Bash:
   ```bash
   pm2 start src/app.js --name "profile-builder"
   ```

3. Command Prompt (cmd):
   ```cmd
   pm2 start src\app.js --name "profile-builder"
   ```

## Testing New Features (Example using Explore/Leaderboard)
1. Database Setup Testing:
   ```sql
   -- Connect to database
   \c profile_builder

   -- Verify table has required columns
   \d users   # Replace 'users' with relevant table name

   -- Add test data (example for explore/leaderboard)
   INSERT INTO users (username, email, password, bio, project_count, views, rating) 
   VALUES 
   ('testuser1', 'test1@test.com', 'hashedpass', 'Test bio 1', 5, 100, 4.5),
   ('testuser2', 'test2@test.com', 'hashedpass', 'Test bio 2', 3, 50, 4.0);
   ```

2. API Endpoint Testing:
   ```powershell
   # Test GET endpoints (example)
   curl http://localhost:3000/api/users
   curl http://localhost:3000/api/users?sort=rating

   # Test POST endpoints (example)
   curl -X POST http://localhost:3000/api/endpoint -H "Content-Type: application/json" -d "{\"key\":\"value\"}"

   # Test with query parameters (example)
   curl http://localhost:3000/api/endpoint?param=value
   ```

3. Frontend Testing:
   - Open page in browser: http://localhost:3000/pagename.html
   - Verify components display correctly
   - Test interactive features
   - Check responsive design
   - Verify navigation works

4. Error Handling Testing:
   ```powershell
   # Test invalid parameters
   curl http://localhost:3000/api/endpoint?param=invalid

   # Test missing required fields
   curl -X POST http://localhost:3000/api/endpoint -H "Content-Type: application/json" -d "{}"

   # Test unauthorized access
   curl http://localhost:3000/api/protected-endpoint
   ```

## Environment Management
1. Using .env file (Development):
   ```env
   PORT=3000
   DB_USER=postgres
   DB_HOST=localhost
   DB_NAME=profile_builder
   DB_PASSWORD=2322
   DB_PORT=5432
   JWT_SECRET=your-secret-key
   ```

2. Using PM2 Environment Variables (Production):
   ```powershell
   # Start with specific environment
   pm2 start src\app.js --name "profile-builder" --env production

   # Or use ecosystem.config.js
   pm2 ecosystem
   ```

   Example ecosystem.config.js:
   ```javascript
   module.exports = {
     apps: [{
       name: "profile-builder",
       script: "src/app.js",
       env: {
         PORT: 3000,
         NODE_ENV: "development",
       },
       env_production: {
         PORT: 80,
         NODE_ENV: "production",
       }
     }]
   }
   ```

## Naming Conventions
1. Database Name: `profile_builder`
   - Uses underscore (_) as per PostgreSQL conventions
   - Used in .env file: `DB_NAME=profile_builder`
   - Used in psql commands: `\c profile_builder`

2. PM2 Process Name: `profile-builder`
   - Uses hyphen (-) as per common Node.js naming
   - Used in PM2 commands: `pm2 start src\app.js --name "profile-builder"`
   - Used for process management only

## GitHub Repository Setup

### Option 1: Connect to Existing Repository (A1-2)
1. Initialize and Connect:
   ```powershell
   # Initialize Git repository
   git init

   # Add all files
   git add .

   # Make initial commit
   git commit -m "Initial commit: Profile builder with authentication and profile types"

   # Add your repository as remote
   git remote add origin git@github.com:pelchers/A1-2.git

   # Pull first to sync histories (if needed)
   git pull origin main --allow-unrelated-histories

   # Push your changes
   git branch -M main
   git push -u origin main
   ```

2. Verify Connection:
   ```powershell
   # Check remote connection
   git remote -v

   # Should show:
   # origin  git@github.com:pelchers/A1-2.git (fetch)
   # origin  git@github.com:pelchers/A1-2.git (push)
   ```

3. Regular Operations:
   ```powershell
   # Check status
   git status

   # Add changes
   git add .

   # Commit changes
   git commit -m "Description of changes"

   # Push to GitHub
   git push origin main
   ```

4. Handling Merge Conflicts:
   ```powershell
   # If you get conflicts during pull:
   git status  # Check which files have conflicts
   
   # After resolving conflicts:
   git add .
   git commit -m "Resolved merge conflicts"
   git push origin main
   ```

5. Branch Management:
   ```powershell
   # Create feature branch
   git checkout -b feature-name

   # Switch branches
   git checkout main

   # Merge feature branch
   git merge feature-name
   ```

### Option 2: Create New Repository
[Previous new repository setup instructions remain the same...]

## GitHub Actions Setup
1. Create GitHub Actions Configuration:
   ```powershell
   # Create directories and files
   mkdir -p .github/workflows
   New-Item -Path ".github/workflows/main.yml" -ItemType File
   ```

2. Configure Workflow:
   - Automated testing on push/PR to main
   - PostgreSQL service container
   - Node.js environment setup
   - Database initialization
   - Running tests

3. Environment Secrets:
   - Go to repository Settings > Secrets
   - Add the following secrets:
     ```
     DB_PASSWORD
     JWT_SECRET
     ```

4. Branch Protection:
   - Go to Settings > Branches
   - Add rule for 'main' branch
   - Require status checks to pass
   - Require pull request reviews

5. Deployment:
   ```yaml
   # Add to main.yml
   deploy:
     needs: build
     runs-on: ubuntu-latest
     steps:
       - name: Deploy to production
         if: github.ref == 'refs/heads/main'
         run: |
           # Add deployment commands
   ```

6. Monitoring:
   - Check Actions tab for workflow runs
   - View detailed logs
   - Monitor deployment status

## Important Note About Server Changes
When making changes to server-side code (especially in app.js):
1. Changes to API endpoints, routes, or server logic require a server restart
2. Changes won't be visible in the browser until server is restarted
3. Always restart the server after modifying endpoints:
   ```powershell
   # Stop current process
   pm2 delete profile-builder

   # Start fresh with new changes
   pm2 start src\app.js --name "profile-builder"

   # Verify server is running with new changes
   pm2 logs profile-builder
   ```

Verification after restart:
- Check PM2 logs for successful startup
- Test affected endpoints in browser
- Verify new functionality is working

Note: While nodemon automatically restarts the server during development, 
PM2 in production requires manual restart to apply changes to routes and API endpoints.

## Project Updates and Continued Development

### Adding Dependencies and Components
1. Installing New Dependencies:
   ```powershell
   # Add new npm packages
   npm install package-name

   # Update package.json and install all dependencies
   npm install
   ```

2. Adding Component Libraries:
   ```html
   <!-- Add to HTML files -->
   <link href="library-cdn-url" rel="stylesheet">
   <script src="library-cdn-url"></script>

   <!-- Or import in JavaScript -->
   import { Component } from 'library-name';
   ```

### Database Updates
1. Modifying Table Structure:
   ```sql
   -- Add new columns
   ALTER TABLE table_name ADD COLUMN column_name data_type;

   -- Modify existing columns
   ALTER TABLE table_name ALTER COLUMN column_name TYPE new_data_type;

   -- Add relationships
   ALTER TABLE table_name ADD FOREIGN KEY (column_name) REFERENCES other_table(id);
   ```

2. Updating Data:
   ```sql
   -- Insert new records
   INSERT INTO table_name (column1, column2) VALUES (value1, value2);

   -- Update existing records
   UPDATE table_name SET column1 = value1 WHERE condition;
   ```

### Route Updates
1. Adding New Routes:
   ```javascript
   // Add to app.js
   app.get('/api/new-endpoint', async (req, res) => {
       // Route logic
   });
   ```

2. After Route Changes:
   ```powershell
   # Restart server to apply changes
   pm2 delete profile-builder
   pm2 start src\app.js --name "profile-builder"
   ```

### Frontend Updates
1. HTML/CSS Changes:
   - Modify files directly
   - Changes visible on browser refresh
   - Clear browser cache if needed: Ctrl + F5

2. JavaScript Changes:
   - Update scripts.js
   - Clear browser cache
   - Check console for errors

### Backend Updates
1. Server Changes:
   - Modify app.js or add new route files
   - Always restart server after changes:
     ```powershell
     pm2 restart profile-builder
     ```

2. Database Changes:
   - Backup before structural changes:
     ```sql
     pg_dump -U postgres profile_builder > backup.sql
     ```

### Testing and Development
1. Local Testing:
   ```powershell
   # Development mode with auto-reload
   nodemon src\app.js

   # Check server logs
   pm2 logs profile-builder
   ```

2. Database Testing:
   ```sql
   -- Test queries
   BEGIN;
   -- Your changes here
   ROLLBACK; -- or COMMIT;
   ```

### GitHub Best Practices
1. Branch Management:
   ```powershell
   # Create feature branch
   git checkout -b feature/new-feature

   # Regular commits
   git add .
   git commit -m "Descriptive message"

   # Merge to main
   git checkout main
   git merge feature/new-feature
   ```

2. Pull Request Flow:
   - Create PR for each feature
   - Include clear description
   - Request reviews
   - Merge after approval

### Deployment Considerations
1. Server Updates:
   ```powershell
   # Update production server
   git pull origin main
   npm install
   pm2 restart profile-builder
   ```

2. Database Migrations:
   - Create migration scripts
   - Test on staging first
   - Backup production data
   - Apply changes carefully

### Monitoring and Maintenance
1. Server Health:
   ```powershell
   # Monitor resources
   pm2 monit

   # Check logs
   pm2 logs profile-builder
   ```

2. Database Maintenance:
   ```sql
   -- Regular cleanup
   VACUUM ANALYZE table_name;
   ```

Remember:
- Always backup before major changes
- Test in development first
- Follow Git branching strategy
- Document API changes
- Monitor server logs
- Keep dependencies updated

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

## Project Carousel Setup
1. Ensure the `/api/projects/random` endpoint is set up to fetch all projects in random order.
2. Update `carousel.js` to fetch and render projects in the carousel.
3. Verify the carousel section in `home-logged-in.html` is correctly set up.