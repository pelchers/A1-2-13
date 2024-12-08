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
                u.target_demographics,
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
                target_demographics,
                campaign_preferences,
                budget_range,
                preferred_creator_types,
                campaign_goals,
                collaboration_requirements,
                watching_ids,
                watched_project_ids
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

// Add user watch endpoint
app.post('/api/users/:userId/watch', authenticateToken, async (req, res) => {
    try {
        const targetUserId = parseInt(req.params.userId);
        const watcherId = req.user.id;

        // Start transaction
        await pool.query('BEGIN');

        try {
            // Get current watcher's watching_ids
            const watcherResult = await pool.query(
                'SELECT watching_ids FROM users WHERE id = $1',
                [watcherId]
            );

            // Get target user's watched_by_ids and account_watchers
            const targetResult = await pool.query(
                'SELECT watched_by_ids, account_watchers FROM users WHERE id = $1',
                [targetUserId]
            );

            const watchingIds = watcherResult.rows[0].watching_ids || [];
            const isWatching = watchingIds.includes(targetUserId);

            let message;
            let watchCount;

            if (isWatching) {
                // Remove from watching_ids of watcher
                await pool.query(
                    `UPDATE users 
                     SET watching_ids = array_remove(watching_ids, $1)
                     WHERE id = $2`,
                    [targetUserId, watcherId]
                );

                // Remove from watched_by_ids of target and decrease account_watchers
                const result = await pool.query(
                    `UPDATE users 
                     SET watched_by_ids = array_remove(watched_by_ids, $1),
                         account_watchers = GREATEST(COALESCE(account_watchers, 0) - 1, 0)
                     WHERE id = $2
                     RETURNING account_watchers`,
                    [watcherId, targetUserId]
                );

                watchCount = result.rows[0].account_watchers;
                message = 'Successfully unwatched user';
            } else {
                // Add to watching_ids of watcher
                await pool.query(
                    `UPDATE users 
                     SET watching_ids = array_append(watching_ids, $1)
                     WHERE id = $2`,
                    [targetUserId, watcherId]
                );

                // Add to watched_by_ids of target and increase account_watchers
                const result = await pool.query(
                    `UPDATE users 
                     SET watched_by_ids = array_append(watched_by_ids, $1),
                         account_watchers = COALESCE(account_watchers, 0) + 1
                     WHERE id = $2
                     RETURNING account_watchers`,
                    [watcherId, targetUserId]
                );

                watchCount = result.rows[0].account_watchers;
                message = 'Successfully watching user';
            }

            await pool.query('COMMIT');

            res.json({
                watchCount,
                isWatching: !isWatching,
                message
            });

        } catch (error) {
            await pool.query('ROLLBACK');
            throw error;
        }

    } catch (error) {
        console.error('Watch toggle error:', error);
        res.status(500).json({
            message: 'Error updating watch status',
            watchCount: 0,
            isWatching: false
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
                target_demographics,
                creator_rate_min,
                creator_rate_max,
                preferred_deal_types
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
        const {
            name, description, project_type, status, visibility,
            timeline, start_date, end_date, budget_range,
            payment_terms, payment_format, target_audience,
            campaign_goals, content_category, content_length,
            technical_requirements, equipment_needed
        } = req.body;

        const query = `
            INSERT INTO projects (
                name, description, user_id, project_type, status,
                visibility, timeline, start_date, end_date,
                budget_range, payment_terms, payment_format,
                target_audience, campaign_goals, content_category,
                content_length, technical_requirements, equipment_needed,
                created_at, updated_at
            ) VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12,
                $13, $14, $15, $16, $17, $18, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
            ) RETURNING *
        `;

        const values = [
            name, description, req.user.id, project_type, status,
            visibility, timeline, start_date, end_date,
            budget_range, payment_terms, payment_format,
            target_audience, campaign_goals, content_category,
            content_length, technical_requirements, equipment_needed
        ];

        const result = await pool.query(query, values);
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error creating project:', error);
        res.status(500).json({ message: 'Error creating project' });
    }
});

// Get user's projects
app.get('/api/projects', authenticateToken, async (req, res) => {
    try {
        const query = `
            SELECT * FROM projects 
            WHERE user_id = $1 
            ORDER BY created_at DESC
        `;
        const result = await pool.query(query, [req.user.id]);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching projects:', error);
        res.status(500).json({ message: 'Error fetching projects' });
    }
});

// Get single project - public view
app.get('/api/projects/:id', async (req, res) => {
    try {
        const query = `
            SELECT p.*, 
                u.username as creator_name,
                u.profile_type as creator_type
            FROM projects p
            LEFT JOIN users u ON p.user_id = u.id
            WHERE p.id = $1
        `;
        
        const result = await pool.query(query, [req.params.id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Project not found' });
        }
        
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error fetching project:', error);
        res.status(500).json({ message: 'Error fetching project details' });
    }
});

// Update project
app.put('/api/projects/:id', authenticateToken, async (req, res) => {
    try {
        // First check if user owns the project
        const checkQuery = `
            SELECT user_id FROM projects WHERE id = $1
        `;
        const checkResult = await pool.query(checkQuery, [req.params.id]);
        
        if (checkResult.rows.length === 0) {
            return res.status(404).json({ message: 'Project not found' });
        }
        
        if (checkResult.rows[0].user_id !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to update this project' });
        }

        const {
            name, description, project_type, status, visibility,
            timeline, start_date, end_date, budget_range,
            payment_terms, payment_format, target_audience,
            campaign_goals, content_category, content_length,
            technical_requirements, equipment_needed
        } = req.body;

        const query = `
            UPDATE projects 
            SET name = $1,
                description = $2,
                project_type = $3,
                status = $4,
                visibility = $5,
                timeline = $6,
                start_date = $7,
                end_date = $8,
                budget_range = $9,
                payment_terms = $10,
                payment_format = $11,
                target_audience = $12,
                campaign_goals = $13,
                content_category = $14,
                content_length = $15,
                technical_requirements = $16,
                equipment_needed = $17,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $18 AND user_id = $19
            RETURNING *
        `;

        const values = [
            name, description, project_type, status, visibility,
            timeline, start_date, end_date, budget_range,
            payment_terms, payment_format, target_audience,
            campaign_goals, content_category, content_length,
            technical_requirements, equipment_needed,
            req.params.id, req.user.id
        ];

        const result = await pool.query(query, values);
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
        const checkQuery = `
            SELECT user_id FROM projects WHERE id = $1
        `;
        const checkResult = await pool.query(checkQuery, [req.params.id]);
        
        if (checkResult.rows.length === 0) {
            return res.status(404).json({ message: 'Project not found' });
        }
        
        if (checkResult.rows[0].user_id !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to delete this project' });
        }

        const query = `
            DELETE FROM projects 
            WHERE id = $1 AND user_id = $2
            RETURNING id
        `;
        
        await pool.query(query, [req.params.id, req.user.id]);
        res.json({ message: 'Project deleted successfully' });
    } catch (error) {
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
                COUNT(DISTINCT pc.user_id) as collaborator_count,
                CASE 
                    WHEN $1 = ANY(p.watcher_ids) THEN true 
                    ELSE false 
                END as is_watched
            FROM projects p
            LEFT JOIN users u ON p.user_id = u.id
            LEFT JOIN project_collaborators pc ON p.id = pc.project_id
            GROUP BY p.id, u.username, u.profile_type
            ORDER BY p.created_at DESC
        `;
        
        const result = await pool.query(query, [req.user.id]);
        console.log('Projects fetched:', result.rows);
        
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching projects:', error);
        res.status(500).json({ message: 'Error fetching projects' });
    }
});

// Add project watch endpoint
app.post('/api/projects/:projectId/watch', authenticateToken, async (req, res) => {
    try {
        const { projectId } = req.params;
        const userId = req.user.id;

        // First check if project exists
        const projectCheck = await pool.query(
            'SELECT id, watch_count, watcher_ids FROM projects WHERE id = $1',
            [projectId]
        );

        if (projectCheck.rows.length === 0) {
            return res.status(404).json({ 
                message: 'Project not found',
                watchCount: 0,
                isWatching: false
            });
        }

        // Start transaction
        await pool.query('BEGIN');

        // Get current user's watched projects
        const userResult = await pool.query(
            'SELECT watched_project_ids FROM users WHERE id = $1',
            [userId]
        );

        const watchedProjectIds = userResult.rows[0].watched_project_ids || [];
        const isWatching = watchedProjectIds.includes(parseInt(projectId));

        let watchCount;
        let message;

        if (isWatching) {
            // Remove project from user's watched list
            await pool.query(
                `UPDATE users 
                 SET watched_project_ids = array_remove(watched_project_ids, $1)
                 WHERE id = $2`,
                [parseInt(projectId), userId]
            );

            // Update project's watchers and count
            const result = await pool.query(
                `UPDATE projects 
                 SET watcher_ids = array_remove(watcher_ids, $1),
                     watch_count = GREATEST((watch_count - 1), 0)
                 WHERE id = $2
                 RETURNING watch_count`,
                [userId, projectId]
            );

            watchCount = result.rows[0].watch_count;
            message = 'Project unwatched successfully';
        } else {
            // Add project to user's watched list
            await pool.query(
                `UPDATE users 
                 SET watched_project_ids = array_append(watched_project_ids, $1)
                 WHERE id = $2`,
                [parseInt(projectId), userId]
            );

            // Update project's watchers and count
            const result = await pool.query(
                `UPDATE projects 
                 SET watcher_ids = array_append(watcher_ids, $1),
                     watch_count = COALESCE(watch_count, 0) + 1
                 WHERE id = $2
                 RETURNING watch_count`,
                [userId, projectId]
            );

            watchCount = result.rows[0].watch_count;
            message = 'Project watched successfully';
        }

        await pool.query('COMMIT');

        res.json({ 
            watchCount,
            isWatching: !isWatching,
            message
        });

    } catch (error) {
        await pool.query('ROLLBACK');
        console.error('Watch toggle error:', error);
        res.status(500).json({ 
            message: 'Error updating watch status',
            watchCount: 0,
            isWatching: false
        });
    }
});

// Route to get chats for a user
app.get('/api/chats', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const result = await pool.query(`
            SELECT * FROM chats 
            WHERE user1_id = $1 OR user2_id = $1
        `, [userId]);

        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching chats:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Route to get messages for a chat
app.get('/api/chats/:chatId/messages', authenticateToken, async (req, res) => {
    try {
        const { chatId } = req.params;
        const result = await pool.query(`
            SELECT messages FROM chats
            WHERE id = $1
        `, [chatId]);

        const messages = result.rows[0].messages || [];
        res.json(messages);
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Route to send a message
app.post('/api/chats/:chatId/messages', authenticateToken, async (req, res) => {
    try {
        const { chatId } = req.params;
        const { content } = req.body;
        const senderId = req.user.id;
        const timestamp = new Date().toISOString();

        const newMessage = { sender_id: senderId, content, timestamp };

        await pool.query(`
            UPDATE chats
            SET messages = messages || $1::jsonb
            WHERE id = $2
        `, [JSON.stringify(newMessage), chatId]);

        res.status(201).json({ message: 'Message sent' });
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Route to start a new chat or get existing chat
app.post('/api/chats', authenticateToken, async (req, res) => {
    try {
        const { user2Id } = req.body;
        const user1Id = req.user.id;

        // Fetch usernames
        const user1Result = await pool.query('SELECT username FROM users WHERE id = $1', [user1Id]);
        const user2Result = await pool.query('SELECT username FROM users WHERE id = $1', [user2Id]);

        const user1Username = user1Result.rows[0].username;
        const user2Username = user2Result.rows[0].username;

        // Check if chat already exists
        const existingChat = await pool.query(`
            SELECT id FROM chats 
            WHERE (user1_id = $1 AND user2_id = $2) OR (user1_id = $2 AND user2_id = $1)
        `, [user1Id, user2Id]);

        if (existingChat.rows.length > 0) {
            return res.json({ chatId: existingChat.rows[0].id });
        }

        // Create new chat if it doesn't exist
        const result = await pool.query(`
            INSERT INTO chats (user1_id, user2_id, user1_username, user2_username) 
            VALUES ($1, $2, $3, $4) 
            RETURNING id
        `, [user1Id, user2Id, user1Username, user2Username]);
        res.status(201).json({ chatId: result.rows[0].id });
    } catch (error) {
        console.error('Error starting chat:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Route to search users
app.get('/api/users/search', authenticateToken, async (req, res) => {
    try {
        const { query } = req.query;
        const result = await pool.query(`
            SELECT id, username FROM users 
            WHERE username ILIKE $1
        `, [`%${query}%`]);
        res.json(result.rows);
    } catch (error) {
        console.error('Error searching users:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update the profile PUT endpoint
app.put('/api/profile', authenticateToken, async (req, res) => {
    try {
        const {
            display_name,
            bio,
            profile_type,
            creator_specialties,
            creator_platforms,
            audience_size,
            content_categories,
            portfolio_links,
            brand_description,
            industry_sectors,
            campaign_goals,
            target_demographics,
            creator_rate_min,
            creator_rate_max,
            preferred_deal_types
        } = req.body;

        // Ensure arrays are properly handled
        const normalizeArray = (arr) => Array.isArray(arr) ? arr : [];

        const query = `
            UPDATE users 
            SET display_name = $1,
                bio = $2,
                profile_type = $3,
                creator_specialties = $4,
                creator_platforms = $5,
                audience_size = $6,
                content_categories = $7,
                portfolio_links = $8,
                brand_description = $9,
                industry_sectors = $10,
                campaign_goals = $11,
                target_demographics = $12,
                creator_rate_min = $13,
                creator_rate_max = $14,
                preferred_deal_types = $15
            WHERE id = $16
            RETURNING *
        `;

        const values = [
            display_name,
            bio,
            profile_type,
            normalizeArray(creator_specialties),
            normalizeArray(creator_platforms),
            audience_size,
            normalizeArray(content_categories),
            normalizeArray(portfolio_links),
            brand_description,
            normalizeArray(industry_sectors),
            normalizeArray(campaign_goals),
            normalizeArray(target_demographics),
            creator_rate_min,
            creator_rate_max,
            normalizeArray(preferred_deal_types),
            req.user.id
        ];

        const result = await pool.query(query, values);
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Profile update error:', error);
        res.status(500).json({ message: 'Error updating profile' });
    }
});

// Get users watching current user
app.get('/api/watches/watchers', authenticateToken, async (req, res) => {
    try {
        //Get users where current user's ID is in their watching_ids
        const result = await pool.query(`
            SELECT 
                u.*,
                true as is_watched -- They're watching us, so we're watching them
            FROM users u 
            WHERE $1 = ANY(u.watching_ids)
        `, [req.user.id]);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching watchers:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get users that current user watches
app.get('/api/watches/watching', authenticateToken, async (req, res) => {
    try {
        // Get current user's watching_ids and fetch those users
        const result = await pool.query(`
            SELECT 
                u.*,
                true as is_watched -- We're watching them
            FROM users u 
            WHERE u.id = ANY(
                SELECT unnest(watching_ids) 
                FROM users 
                WHERE id = $1
            )
        `, [req.user.id]);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching watching:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get projects that current user watches
app.get('/api/watches/projects', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT * FROM projects 
            WHERE id = ANY(
                SELECT unnest(watched_project_ids) 
                FROM users 
                WHERE id = $1
            )
        `, [req.user.id]);
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
}); 