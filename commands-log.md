# Commands Log

## PowerShell Navigation
- `cd C:\Users\pelyc\a1-2-profile-simpleh,c,j,n,s` - Navigate to project directory
- `mkdir src public public\css public\js` - Create project directories

## Package Management (npm) - Run in PowerShell
- `npm init -y` - Initialize Node.js project
- `npm install express pg bcryptjs jsonwebtoken` - Install required packages
- `npm list` - Verify installed packages

## Process Management Commands

1. Installation:
   ```powershell
   npm install -g pm2        # Install PM2
   npm install -g nodemon    # Install nodemon
   ```

2. Development (Nodemon):
   ```powershell
   # Basic usage
   nodemon src\app.js

   # With specific watch directories
   nodemon --watch src --watch public src\app.js

   # Ignore specific files
   nodemon --ignore 'public/*.js' src\app.js

   # Using npm script (after adding to package.json)
   npm run dev
   ```

3. Production (PM2):
   ```powershell
   # Start application
   pm2 start src\app.js --name "profile-builder"

   # Process monitoring
   pm2 list                    # List all processes
   pm2 monit                   # Monitor CPU/Memory
   pm2 show profile-builder    # Show detailed process info

   # Log management
   pm2 logs                    # Display logs
   pm2 logs --lines 200        # Show last 200 lines
   pm2 flush                   # Clear all logs

   # Process control
   pm2 stop profile-builder    # Stop application
   pm2 restart profile-builder # Restart application
   pm2 reload profile-builder  # Zero-downtime reload
   pm2 delete profile-builder  # Remove from PM2

   # Startup management
   pm2 startup                 # Generate startup script
   pm2 save                    # Save current process list
   ```

4. Common PM2 Configurations:
   ```powershell
   # Start with specific Node.js version
   pm2 start src\app.js --name "profile-builder" --interpreter="node@14.0.0"

   # Set environment variables
   pm2 start src\app.js --name "profile-builder" --env production

   # Enable automatic restart on file changes
   pm2 start src\app.js --name "profile-builder" --watch

   # Set max memory restart
   pm2 start src\app.js --name "profile-builder" --max-memory-restart 300M
   ```

5. Verification Commands:
   ```powershell
   # Check if processes are running
   pm2 list
   tasklist | findstr "node"

   # Check process details
   pm2 show profile-builder
   
   # Monitor resources
   pm2 monit
   ```

6. Port Management:
   ```powershell
   # Find process using specific port
   netstat -ano | findstr :3000
   
   # Kill process by PID
   taskkill /PID XXXX /F
   
   # Alternative: Kill all Node.js processes
   taskkill /IM node.exe /F
   ```

## File Creation (PowerShell)
- `New-Item -Path "public\index.html" -ItemType File`
- `New-Item -Path "public\login.html" -ItemType File`
- `New-Item -Path "public\signup.html" -ItemType File`
- `New-Item -Path "public\profile.html" -ItemType File`
- `New-Item -Path "public\css\styles.css" -ItemType File`
- `New-Item -Path "public\js\scripts.js" -ItemType File`
- `New-Item -Path "src\app.js" -ItemType File`

## Database (PostgreSQL) Commands
1. Service Management (PowerShell):
   - `services.msc` - Open Windows Services Manager
   - `net start postgresql-x64-{version}` - Start PostgreSQL service
   - `net stop postgresql-x64-{version}` - Stop PostgreSQL service

2. Connection Commands (psql):
   ```sql
   psql -h localhost -p 5432 -U postgres
   ```

3. Database Setup (psql):
   ```sql
   CREATE DATABASE profile_builder;
   \c profile_builder
   ```

4. Table Creation (psql - Order matters!):
   ```sql
   CREATE TABLE users (
       id SERIAL PRIMARY KEY,
       username VARCHAR(100) UNIQUE NOT NULL,
       password VARCHAR(100) NOT NULL,
       email VARCHAR(100) UNIQUE NOT NULL
   );

   CREATE TABLE projects (
       id SERIAL PRIMARY KEY,
       user_id INTEGER REFERENCES users(id),
       title VARCHAR(255) NOT NULL,
       description TEXT,
       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );
   ```

5. Database Verification Commands:
   - `\l` - List all databases
   - `\c profile_builder` - Connect to database
   - `\dt` - List all tables
   - `\d users` - Describe users table
   - `\d projects` - Describe projects table
   - `\q` - Quit psql

6. Testing Queries:
   ```sql
   SELECT * FROM users;
   SELECT * FROM projects;
   ```
   \x on
   SELECT * FROM users WHERE id = 3;
   
   The \x on command will display the results in an expanded vertical format, making it easier to read all the fields.
   ```

## Server Commands (PowerShell)
- `node src\app.js` - Start the server
- `Ctrl + C` - Stop the server
- `node --version` - Check Node.js version
- `npm --version` - Check npm version

## Testing Commands
1. Database Connection Test:
   ```sql
   SELECT NOW();
   ```

2. API Testing (PowerShell using curl):
   ```powershell
   # Test signup
   curl -X POST http://localhost:3000/api/auth/signup -H "Content-Type: application/json" -d "{\"username\":\"test\",\"email\":\"test@test.com\",\"password\":\"test123\"}"

   # Test login
   curl -X POST http://localhost:3000/api/auth/login -H "Content-Type: application/json" -d "{\"email\":\"test@test.com\",\"password\":\"test123\"}"
   ```

## Git Commands (PowerShell)
1. Repository Setup:
   ```powershell
   git init
   git add .
   git commit -m "Initial commit"
   ```

2. GitHub Connection:
   ```powershell
   git remote add origin https://github.com/yourusername/profile-builder.git
   git branch -M main
   git push -u origin main
   ```

3. Regular Operations:
   ```powershell
   git status
   git add .
   git commit -m "commit message"
   git push
   ```

## Environment Variable Commands
1. Installation:
   ```powershell
   npm install dotenv
   ```

2. File Creation:
   ```powershell
   # Create .env file
   New-Item -Path ".env" -ItemType File

   # Add to .gitignore
   Add-Content .gitignore ".env"
   ```

3. Environment Testing:
   ```powershell
   # Test if variables are loaded
   node -e "require('dotenv').config(); console.log(process.env.PORT)"

   # Run with specific environment
   SET NODE_ENV=production && node src\app.js
   ```

## File Structure Commands
```powershell
# View basic directory structure
tree

# Expected output:
C:.
+---.vscode
+---node_modules
+---public
|   +---css
|   \---js
\---src

# Save structure to file
tree > project-structure.txt
```

## Authentication Testing Commands
1. JWT Verification:
   ```powershell
   # Check JWT environment variable
   node -e "require('dotenv').config(); console.log(process.env.JWT_SECRET)"

   # Test token generation
   node -e "const jwt = require('jsonwebtoken'); require('dotenv').config(); console.log(jwt.sign({test: 'test'}, process.env.JWT_SECRET))"
   ```

2. Browser Testing:
   ```powershell
   # Open signup page
   Start-Process "http://localhost:3000/signup.html"

   # Open login page
   Start-Process "http://localhost:3000/login.html"
   ```

3. Database Verification:
   ```sql
   -- Check users table
   SELECT username, email, created_at FROM users ORDER BY created_at DESC LIMIT 5;

   -- Check for specific user
   SELECT username, email FROM users WHERE email = 'test@test.com';
   ```

## SQL Commands
```sql
-- Randomize query results
ORDER BY RANDOM()
```

## API Endpoints
- **Fetch Random Projects**: `/api/projects/random`
  - Fetches all projects in random order for display in the carousel.