require('dotenv').config();
const express = require('express');
const path = require('path');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 3000;

// JWT secret key from environment variables
const JWT_SECRET = process.env.JWT_SECRET;

// Move authenticateToken middleware to the top
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        console.log('No token provided'); // Debug log
        return res.status(401).json({ message: 'No token provided' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        console.log('Decoded token:', decoded); // Debug log
        req.user = decoded;
        next();
    } catch (err) {
        console.error('Token verification error:', err);
        return res.status(403).json({ message: 'Invalid token' });
    }
};

// PostgreSQL connection configuration from environment variables
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

// Test database connection
pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('Database connection error:', err.stack);
    } else {
        console.log('Successfully connected to PostgreSQL');
    }
});

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

// Configure multer for file upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = 'public/uploads';
        // Create directory if it doesn't exist
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Not an image! Please upload an image.'), false);
        }
    }
});

// Authentication Routes
app.post('/api/auth/signup', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Check if user already exists
        const userExists = await pool.query(
            'SELECT * FROM users WHERE email = $1 OR username = $2',
            [email, username]
        );

        if (userExists.rows.length > 0) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert new user
        const result = await pool.query(
            'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id, username, email',
            [username, email, hashedPassword]
        );

        // Create token with complete user object
        const token = jwt.sign({ 
            id: result.rows[0].id,
            username: result.rows[0].username,
            email: result.rows[0].email
        }, JWT_SECRET);

        res.status(201).json({ token });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ message: 'Server error during signup' });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const result = await pool.query(
            'SELECT id, username, email, password FROM users WHERE email = $1',
            [email]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const user = result.rows[0];
        const validPassword = await bcrypt.compare(password, user.password);

        if (!validPassword) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Create token with complete user object
        const token = jwt.sign({ 
            id: user.id,
            username: user.username,
            email: user.email
        }, JWT_SECRET);

        res.json({ token });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error during login' });
    }
});

// Explore users endpoint
app.get('/api/users', authenticateToken, async (req, res) => {
    try {
        console.log('API /users called'); // Debug log
        const currentUserId = req.user.id;

        const query = `
            SELECT 
                u.id,
                u.username,
                u.display_name,
                u.profile_type,
                u.bio,
                u.skills,
                u.profile_image,
                u.creator_specialties,
                u.creator_platforms,
                u.audience_size,
                u.content_categories,
                u.portfolio_links,
                u.account_watchers,
                u.view_count,
                u.follower_count,
                u.brand_description,
                u.industry_sectors,
                u.target_audience,
                u.campaign_goals,
                u.target_market_tags,
                u.target_demographics,
                u.market_size,
                u.company_size_range,
                u.creator_rate_min,
                u.creator_rate_max,
                u.preferred_deal_types,
                u.budget_range,
                u.brand_watch_count,
                u.content_types,
                u.content_formats,
                u.watching_ids,
                u.watched_by_ids,
                CASE 
                    WHEN $1 = ANY(u.watched_by_ids) THEN true 
                    ELSE false 
                END as is_watched
            FROM users u
            WHERE u.id != $1
        `;
        
        const users = await pool.query(query, [currentUserId]);
        console.log('Found users:', users.rows.length); // Debug log

        // Add debug logs for watching relationships
        users.rows.forEach(user => {
            console.log(`User ${user.id} watch status:`, {
                isWatched: user.is_watched,
                watchedBy: user.watched_by_ids?.length || 0,
                watching: user.watching_ids?.length || 0
            });
        });

        res.json(users.rows);
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Leaderboard endpoint
app.get('/api/leaderboard', async (req, res) => {
    try {
        const { category = 'rating' } = req.query;
        const query = `
            SELECT username, ${category}
            FROM users
            ORDER BY ${category} DESC
            LIMIT 10
        `;
        const leaders = await pool.query(query);
        res.json(leaders.rows);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Basic route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

// Update the profile update endpoint
app.post('/api/profile/update', authenticateToken, async (req, res) => {
    try {
        console.log('User from token:', req.user); // Debug log
        console.log('Request body:', req.body); // Debug log
        
        if (!req.user || !req.user.id) {
            console.log('No user ID in token'); // Debug log
            return res.status(403).json({ message: 'Invalid user token' });
        }

        const userId = req.user.id;
        const updates = [];
        const values = [];
        let paramCount = 1;

        // Process each field in the request body
        for (const [key, value] of Object.entries(req.body)) {
            if (value !== undefined && value !== null) {
                updates.push(`${key} = $${paramCount}`);
                values.push(value);
                paramCount++;
            }
        }

        // Add userId to values array
        values.push(userId);

        const query = `
            UPDATE users 
            SET ${updates.join(', ')}
            WHERE id = $${paramCount}
            RETURNING *`;

        console.log('SQL Query:', query); // Debug log
        console.log('Query values:', values); // Debug log

        const result = await pool.query(query, values);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Remove sensitive information
        const userData = result.rows[0];
        delete userData.password;

        res.json(userData);
    } catch (error) {
        console.error('Profile update error:', error);
        res.status(500).json({ message: 'Server error during profile update' });
    }
});

// Add this new endpoint to get user profile data
app.get('/api/profile', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        
        const query = `
            SELECT 
                id,
                username,
                email,
                profile_type,
                display_name,
                bio,
                skills,
                location,
                website,
                profile_image,
                creator_specialties,
                creator_platforms,
                audience_size,
                content_categories,
                portfolio_links,
                creator_rate_min,
                creator_rate_max,
                preferred_deal_types,
                collaboration_preferences,
                brand_description,
                industry_sectors,
                target_audience,
                campaign_preferences,
                budget_range,
                preferred_creator_types,
                campaign_goals,
                collaboration_requirements
            FROM users 
            WHERE id = $1`;
            
        const result = await pool.query(query, [userId]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        const userData = result.rows[0];
        delete userData.password;
        
        console.log('Sending user data:', userData); // Debug log
        res.json(userData);
    } catch (error) {
        console.error('Profile fetch error:', error);
        res.status(500).json({ message: 'Server error while fetching profile' });
    }
});

// Update the image upload endpoint
app.post('/api/profile/upload-image', authenticateToken, upload.single('profile_image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        console.log('File uploaded:', req.file); // Debug log

        const imageUrl = `/uploads/${req.file.filename}`;
        
        // Update user's profile_image in database
        const query = `
            UPDATE users 
            SET profile_image = $1 
            WHERE id = $2 
            RETURNING profile_image`;
        
        const result = await pool.query(query, [imageUrl, req.user.id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        console.log('Image URL saved:', result.rows[0].profile_image); // Debug log
        res.json({ imageUrl: result.rows[0].profile_image });
    } catch (error) {
        console.error('Image upload error:', error);
        res.status(500).json({ message: 'Error uploading image' });
    }
});

// Update watch endpoint to properly handle watch state
app.post('/api/users/:userId/watch', authenticateToken, async (req, res) => {
    try {
        const { userId } = req.params;
        const watcherId = req.user.id;

        // Start transaction
        await pool.query('BEGIN');

        // Check if already watching
        const watcherResult = await pool.query(
            'SELECT watching_ids FROM users WHERE id = $1',
            [watcherId]
        );

        const watchingIds = watcherResult.rows[0].watching_ids || [];
        const isAlreadyWatching = watchingIds.includes(parseInt(userId));

        let watchCount;
        let isWatching;

        if (isAlreadyWatching) {
            // Remove watch from both users
            await pool.query(
                `UPDATE users 
                 SET watching_ids = array_remove(watching_ids, $1)
                 WHERE id = $2`,
                [parseInt(userId), watcherId]
            );

            const result = await pool.query(
                `UPDATE users 
                 SET watched_by_ids = array_remove(watched_by_ids, $1),
                     account_watchers = GREATEST((account_watchers - 1), 0)
                 WHERE id = $2
                 RETURNING account_watchers`,
                [watcherId, userId]
            );

            watchCount = result.rows[0].account_watchers;
            isWatching = false;

            console.log('Watch removed:', { watcherId, userId, watchCount, isWatching });
        } else {
            // Add watch to both users
            await pool.query(
                `UPDATE users 
                 SET watching_ids = array_append(watching_ids, $1)
                 WHERE id = $2`,
                [parseInt(userId), watcherId]
            );

            const result = await pool.query(
                `UPDATE users 
                 SET watched_by_ids = array_append(watched_by_ids, $1),
                     account_watchers = account_watchers + 1
                 WHERE id = $2
                 RETURNING account_watchers`,
                [watcherId, userId]
            );

            watchCount = result.rows[0].account_watchers;
            isWatching = true;

            console.log('Watch added:', { watcherId, userId, watchCount, isWatching });
        }

        await pool.query('COMMIT');

        // Return complete response with all required properties
        res.json({ 
            watchCount,
            isWatching,
            message: isWatching ? 'Successfully watching user' : 'Successfully unwatched user'
        });

    } catch (error) {
        await pool.query('ROLLBACK');
        console.error('Watch toggle error:', error);
        res.status(500).json({ 
            message: 'Error toggling watch status',
            isWatching: false,
            watchCount: 0
        });
    }
});

// Add endpoint to get watching status
app.get('/api/users/:userId/watch-status', authenticateToken, async (req, res) => {
    try {
        const { userId } = req.params;
        const watcherId = req.user.id;

        const result = await pool.query(
            'SELECT watching_ids FROM users WHERE id = $1',
            [watcherId]
        );

        const isWatching = result.rows[0].watching_ids?.includes(parseInt(userId)) || false;

        res.json({ isWatching });
    } catch (error) {
        console.error('Watch status error:', error);
        res.status(500).json({ message: 'Error getting watch status' });
    }
});

// Add public profile endpoint
app.get('/api/users/:userId/public', async (req, res) => {
    try {
        const { userId } = req.params;
        
        const query = `
            SELECT 
                id,
                username,
                profile_type,
                display_name,
                bio,
                skills,
                profile_image,
                creator_specialties,
                creator_platforms,
                audience_size,
                content_categories,
                portfolio_links,
                account_watchers,
                view_count,
                follower_count,
                brand_description,
                industry_sectors,
                campaign_goals,
                target_audience
            FROM users 
            WHERE id = $1`;
            
        const result = await pool.query(query, [userId]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        const userData = result.rows[0];
        delete userData.password;
        
        res.json(userData);
    } catch (error) {
        console.error('Public profile fetch error:', error);
        res.status(500).json({ message: 'Server error while fetching profile' });
    }
});

// Project Management Endpoints
app.post('/api/projects', authenticateToken, async (req, res) => {
    try {
        console.log('Received project data:', req.body); // Debug log

        // Validate required fields
        if (!req.body.name || !req.body.description || !req.body.project_type) {
            return res.status(400).json({
                message: 'Missing required fields',
                required: ['name', 'description', 'project_type']
            });
        }

        // Check if projects table exists
        const checkTable = await pool.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_name = 'projects'
            );
        `);

        console.log('Table check result:', checkTable.rows[0]); // Debug log

        const query = `
            INSERT INTO projects (
                user_id,
                name,
                description,
                project_type,
                created_at,
                updated_at
            ) VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            RETURNING *
        `;

        const values = [
            req.user.id,
            req.body.name,
            req.body.description,
            req.body.project_type
        ];

        console.log('Executing query with values:', values); // Debug log

        const result = await pool.query(query, values);
        console.log('Query result:', result.rows[0]); // Debug log
        
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Detailed error:', {
            message: error.message,
            stack: error.stack,
            code: error.code,
            detail: error.detail
        });
        
        res.status(500).json({ 
            message: 'Error creating project',
            error: error.message,
            detail: error.detail
        });
    }
});

// Get user's projects
app.get('/api/projects', authenticateToken, async (req, res) => {
    try {
        const query = `
            SELECT p.*, 
                COUNT(DISTINCT pc.user_id) as collaborator_count,
                json_agg(DISTINCT pt.tag) as tags
            FROM projects p
            LEFT JOIN project_collaborators pc ON p.id = pc.project_id
            LEFT JOIN project_tags pt ON p.id = pt.project_id
            WHERE p.user_id = $1
            GROUP BY p.id
            ORDER BY p.created_at DESC
        `;
        
        const result = await pool.query(query, [req.user.id]);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching projects:', error);
        res.status(500).json({ message: 'Error fetching projects' });
    }
});

// Get single project
app.get('/api/projects/:id', authenticateToken, async (req, res) => {
    try {
        const query = `
            SELECT p.*, 
                json_agg(DISTINCT pc.*) as collaborators,
                json_agg(DISTINCT pt.tag) as tags,
                json_agg(DISTINCT pm.*) as milestones
            FROM projects p
            LEFT JOIN project_collaborators pc ON p.id = pc.project_id
            LEFT JOIN project_tags pt ON p.id = pt.project_id
            LEFT JOIN project_milestones pm ON p.id = pm.project_id
            WHERE p.id = $1 AND (p.user_id = $2 OR pc.user_id = $2)
            GROUP BY p.id
        `;
        
        const result = await pool.query(query, [req.params.id, req.user.id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Project not found' });
        }
        
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error fetching project:', error);
        res.status(500).json({ message: 'Error fetching project' });
    }
});

// Update project
app.put('/api/projects/:id', authenticateToken, async (req, res) => {
    try {
        // First check if user owns the project
        const checkQuery = 'SELECT user_id FROM projects WHERE id = $1';
        const checkResult = await pool.query(checkQuery, [req.params.id]);
        
        if (checkResult.rows.length === 0) {
            return res.status(404).json({ message: 'Project not found' });
        }
        
        if (checkResult.rows[0].user_id !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to update this project' });
        }

        const updateQuery = `
            UPDATE projects
            SET 
                name = COALESCE($1, name),
                description = COALESCE($2, description),
                /* Add other fields */
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $3
            RETURNING *
        `;

        const result = await pool.query(updateQuery, [
            req.body.name,
            req.body.description,
            // Add other fields
            req.params.id
        ]);

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error updating project:', error);
        res.status(500).json({ message: 'Error updating project' });
    }
});

// Delete project
app.delete('/api/projects/:id', authenticateToken, async (req, res) => {
    try {
        // First check if user owns the project
        const checkQuery = 'SELECT user_id FROM projects WHERE id = $1';
        const checkResult = await pool.query(checkQuery, [req.params.id]);
        
        if (checkResult.rows.length === 0) {
            return res.status(404).json({ message: 'Project not found' });
        }
        
        if (checkResult.rows[0].user_id !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to delete this project' });
        }

        // Delete project and all related data
        await pool.query('BEGIN');
        
        await pool.query('DELETE FROM project_tags WHERE project_id = $1', [req.params.id]);
        await pool.query('DELETE FROM project_collaborators WHERE project_id = $1', [req.params.id]);
        await pool.query('DELETE FROM project_milestones WHERE project_id = $1', [req.params.id]);
        await pool.query('DELETE FROM projects WHERE id = $1', [req.params.id]);
        
        await pool.query('COMMIT');
        
        res.json({ message: 'Project deleted successfully' });
    } catch (error) {
        await pool.query('ROLLBACK');
        console.error('Error deleting project:', error);
        res.status(500).json({ message: 'Error deleting project' });
    }
});

// Update Popular Creators endpoint to randomize results
app.get('/api/popular/creators', authenticateToken, async (req, res) => {
    try {
        const query = `
            SELECT 
                u.*,
                COALESCE(f.follower_count, 0) as follower_count,
                COALESCE(p.project_count, 0) as project_count
            FROM users u
            LEFT JOIN (
                SELECT user_id, COUNT(*) as follower_count 
                FROM followers 
                GROUP BY user_id
            ) f ON u.id = f.user_id
            LEFT JOIN (
                SELECT user_id, COUNT(*) as project_count 
                FROM projects 
                GROUP BY user_id
            ) p ON u.id = p.user_id
            WHERE u.profile_type = 'creator'
            ORDER BY RANDOM()
            LIMIT 10
        `;
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching creators:', error);
        res.status(500).json([]);
    }
});

// Update Popular Brands endpoint to randomize results
app.get('/api/popular/brands', authenticateToken, async (req, res) => {
    try {
        const query = `
            SELECT 
                u.*,
                COALESCE(f.follower_count, 0) as follower_count,
                COALESCE(p.project_count, 0) as project_count
            FROM users u
            LEFT JOIN (
                SELECT user_id, COUNT(*) as follower_count 
                FROM followers 
                GROUP BY user_id
            ) f ON u.id = f.user_id
            LEFT JOIN (
                SELECT user_id, COUNT(*) as project_count 
                FROM projects 
                GROUP BY user_id
            ) p ON u.id = p.user_id
            WHERE u.profile_type = 'brand'
            ORDER BY RANDOM()
            LIMIT 10
        `;
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching brands:', error);
        res.status(500).json([]);
    }
});

// Add this to your existing endpoints
app.get('/api/users/:userId/projects', authenticateToken, async (req, res) => {
    try {
        const query = `
            SELECT p.*, 
                COUNT(DISTINCT pc.user_id) as collaborator_count
            FROM projects p
            LEFT JOIN project_collaborators pc ON p.id = pc.project_id
            WHERE p.user_id = $1
            GROUP BY p.id
            ORDER BY p.created_at DESC
        `;
        
        const result = await pool.query(query, [req.params.userId]);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching user projects:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update the projects endpoint to match actual table structure
app.get('/api/projects/all', authenticateToken, async (req, res) => {
    try {
        const query = `
            SELECT p.*, 
                u.username as creator_name,
                u.profile_type as creator_type
            FROM projects p
            LEFT JOIN users u ON p.user_id = u.id
            ORDER BY p.created_at DESC
        `;
        
        const result = await pool.query(query);
        console.log('Projects fetched:', result.rows); // Debug log
        
        // Ensure we always return an array
        const projects = result.rows || [];
        
        res.json(projects);
    } catch (error) {
        console.error('Detailed error:', error);
        res.status(500).json({ 
            message: 'Error fetching projects',
            error: error.message,
            detail: error.detail
        });
    }
});

// Add this endpoint to fetch all projects for explore page
app.get('/api/explore/projects', authenticateToken, async (req, res) => {
    try {
        const query = `
            SELECT p.*, 
                u.username as creator_name,
                u.profile_type as creator_type,
                COUNT(DISTINCT pc.user_id) as collaborator_count
            FROM projects p
            LEFT JOIN users u ON p.user_id = u.id
            LEFT JOIN project_collaborators pc ON p.id = pc.project_id
            GROUP BY p.id, u.username, u.profile_type
            ORDER BY p.created_at DESC
        `;
        
        const result = await pool.query(query);
        console.log('Projects fetched:', result.rows); // Debug log
        
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching projects:', error);
        res.status(500).json({ message: 'Error fetching projects' });
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
}); 