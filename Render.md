# Render Deployment Guide

## Project Structure
Our project structure differs from typical Render deployments but is fully compatible:

### Server Setup
```javascript
// Traditional server.js equivalent is in our src/app.js:
const express = require('express');
const app = express();
const port = process.env.PORT || 2000;
```
What's happening here:
- Express setup is integrated directly in app.js
- Port configuration automatically adapts to Render's environment
- Fallback to port 2000 for local development
- No need for separate server.js configuration

### Database Connection
```javascript
// Traditional database.js equivalent is also in our src/app.js:
const { Pool } = require('pg');
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,  // Render provides this
    ssl: process.env.NODE_ENV === 'production' ? {
        rejectUnauthorized: false  // Required for Render's SSL
    } : false  // Disabled for local development
});
```
Understanding the configuration:
- Pool manages database connections efficiently
- `DATABASE_URL` format: `postgres://username:password@host:port/database`
- SSL configuration switches based on environment
- Production requires SSL for security
- Development runs without SSL for easier local testing

## Deployment Steps

### 1. Database Setup
[Location: **Render Dashboard**]
1. Create a new PostgreSQL database in Render:
   - Go to Render Dashboard > New + > PostgreSQL
   - Choose region closest to your users
   - Select appropriate database plan
   - Name your database (e.g., `profile_builder_db`)

2. Save the provided `External Database URL`:
   [Location: **Render Dashboard > Database > Connection**]
   - This URL contains all connection details
   - Format: `postgres://username:password@host:port/database_name`
   - Store this securely - you'll need it for environment variables

3. SSL Requirements:
   [Location: **Local Development - src/app.js**]
   ```javascript
   const pool = new Pool({
       connectionString: process.env.DATABASE_URL,
       ssl: process.env.NODE_ENV === 'production' ? {
           rejectUnauthorized: false
       } : false
   });
   ```
   - Render requires SSL for all database connections
   - This is a security measure for encrypted data transmission
   - Our code handles this with the SSL configuration in pool setup

### 2. Web Service Setup
[Location: **Render Dashboard**]
1. Create a new Web Service:
   - Go to Render Dashboard > New + > Web Service
   - This creates the environment where your app will run

[Location: **Local Development - Terminal**]
2. Connect to your GitHub repository:
   ```bash
   # Create and switch to deployment branch
   git checkout -b render-deploy
   git push -u origin render-deploy
   ```

[Location: **Render Dashboard**]
3. Configure build settings:
   - Build Command: `npm install`
     - Installs all dependencies from package.json
     - Runs before starting the application
   
   - Start Command: `node src/app.js`
     - Launches your application
     - Uses Node.js to run your Express server
     - Points to your main application file

### 3. Environment Variables
Required variables in Render dashboard:
```
NODE_ENV=production    # Tells app to run in production mode
PORT=10000            # Port your app will run on (Render assigns this)
DATABASE_URL=postgres://your_render_db_url  # Your database connection string
JWT_SECRET=your_jwt_secret  # Secret key for JWT authentication
```

How to set:
1. Go to Web Service > Environment
2. Add each variable individually
3. Values are encrypted and securely stored
4. Changes require redeployment to take effect

### 4. Build Configuration
Our `package.json` configuration explained:
```json
{
  "name": "profile-builder",  // Project identifier
  "main": "src/app.js",      // Entry point for the application
  "scripts": {
    "start": "node src/app.js"  // Command Render uses to start app
  }
}
```

## Important Notes

### Database Connection Details
The database connection is handled through the Pool configuration:
```javascript
const pool = new Pool({
    // DATABASE_URL from environment variables
    connectionString: process.env.DATABASE_URL,
    
    // SSL configuration for Render
    ssl: process.env.NODE_ENV === 'production' ? {
        rejectUnauthorized: false  // Required for Render's SSL cert
    } : false  // Disabled in development
});
```

Key points:
- `connectionString`: Uses the DATABASE_URL from Render
- `ssl`: Required for secure database communication
- `rejectUnauthorized: false`: Allows Render's SSL certificate
- Conditional setup: SSL in production, none in development

### File Structure Explanation
- `src/app.js` as main file:
  - Contains Express server setup
  - Handles database connection
  - Manages routes and middleware
  - Simplifies deployment process

- `public` directory:
  - Contains all static files (HTML, CSS, client-side JS)
  - Automatically served by Express
  - No additional configuration needed
  - Files accessible at root URL (e.g., `/styles.css`)

### Monitoring Details
1. View logs in Render dashboard:
   - Real-time log streaming
   - Error tracking
   - Performance metrics
   - Deploy status

2. Monitor database metrics:
   - Connection count
   - Query performance
   - Storage usage
   - CPU/Memory usage

3. Set up alerts:
   - Deploy failures
   - Error rate spikes
   - Resource usage warnings
   - Custom metric thresholds

### Common Issues
1. Database Connection:
   - Ensure `DATABASE_URL` is correct
   - Check SSL configuration
   - Verify database credentials

2. Application Startup:
   - Check logs for startup errors
   - Verify port configuration
   - Ensure all dependencies are installed

3. Static Files:
   - Verify public directory structure
   - Check file permissions
   - Confirm static middleware setup

## Deployment Checklist

### Pre-Deployment
- [ ] All dependencies listed in package.json
- [ ] Environment variables documented
- [ ] Database migrations ready
- [ ] Static files organized in public directory

### Deployment
- [ ] Create PostgreSQL database
- [ ] Configure Web Service
- [ ] Set environment variables
- [ ] Deploy application
- [ ] Run database migrations

### Post-Deployment
- [ ] Verify database connection
- [ ] Test all API endpoints
- [ ] Check static file serving
- [ ] Monitor application logs
- [ ] Test user authentication
- [ ] Verify file uploads (if applicable)

## Maintenance

### Regular Tasks
1. Monitor database performance
2. Check application logs
3. Update dependencies
4. Backup database
5. Monitor error rates

### Scaling
- Adjust instance size as needed
- Monitor database connections
- Configure auto-scaling if required

## Support
- Render Documentation: [docs.render.com](https://docs.render.com)
- PostgreSQL Documentation: [postgresql.org](https://www.postgresql.org)
- Express.js Documentation: [expressjs.com](https://expressjs.com) 

## GitHub Branch Management for Render

### Creating Deployment Branch
1. Create and switch to new branch:
```bash
# From your local repository
git checkout -b render-deploy
```

2. Push branch to GitHub:
```bash
git push -u origin render-deploy
```

### Why a Separate Branch?
- **Continuous Deployment**: Render automatically deploys when changes are pushed to the linked branch
- **Production Stability**: Main branch remains stable while deployment branch handles production-specific changes
- **Environment Separation**: Keeps development (main) and production (render-deploy) configurations separate

### Branch Configuration
1. In Render Dashboard:
   - Select your web service
   - Go to Settings > Build & Deploy
   - Under "Branch", select `render-deploy`

### Deployment-Specific Changes
Add to render-deploy branch:
```diff
// src/app.js
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
+    ssl: {
+        rejectUnauthorized: false // Required for Render PostgreSQL
+    }
});
```

### Workflow
1. **Development**:
   - Work on `main` branch
   - Test locally
   - Commit and push changes

2. **Deployment**:
```bash
# Switch to deployment branch
git checkout render-deploy

# Merge changes from main
git merge main

# Push to trigger deployment
git push origin render-deploy
```

### Automatic Deployment
- Every push to `render-deploy` triggers:
  1. Automatic build
  2. Run tests
  3. Deploy if successful
  4. Rollback on failure

### Monitoring Deployments
1. View deploy logs in Render dashboard
2. Check build status
3. Monitor application performance
4. Review error logs

### Best Practices
1. Never push directly to `render-deploy`
2. Always merge from `main`
3. Test locally before merging
4. Keep deployment branch clean
5. Document branch-specific configurations

### Rollback Process
If deployment fails:
1. Render automatically maintains previous version
2. To manually rollback:
```bash
# Revert last merge
git checkout render-deploy
git revert HEAD
git push origin render-deploy
```

## Branch Switching Workflow

### Initial Setup
```bash
# First time only - create and push render-deploy branch
git checkout -b render-deploy
git push -u origin render-deploy

# Return to main for development
git checkout main
```

### Daily Development Workflow
1. **Start Development** (Always work on main):
```bash
# Ensure you're on main branch
git checkout main

# Get latest changes
git pull origin main
```

2. **Before Deployment** (After testing on main):
```bash
# Save all main branch changes
git add .
git commit -m "feat: your changes description"
git push origin main

# Switch to deployment branch
git checkout render-deploy

# Get latest deployment branch changes
git pull origin render-deploy

# Merge main changes into deployment
git merge main

# Push to trigger deployment
git push origin render-deploy
```

3. **After Deployment** (Return to development):
```bash
# After verifying deployment, return to main
git checkout main
```

### Branch Status Checks
```bash
# Check current branch
git branch --show-current

# List all branches
git branch -a

# Check branch status
git status
```

### Emergency Fixes
If you need to fix deployment issues:
```bash
# Switch to deployment branch
git checkout render-deploy

# Make emergency fixes
git add .
git commit -m "fix: emergency deployment fix"
git push origin render-deploy

# After deployment succeeds, switch back
git checkout main

# Don't forget to apply the same fixes to main
git cherry-pick [commit-hash]
# or manually apply the changes
```

### Branch Synchronization
Periodically ensure branches are in sync:
```bash
# Update both branches
git fetch --all

# Check differences
git checkout render-deploy
git diff main

# Sync if needed
git merge main
git push origin render-deploy

# Return to development
git checkout main
```

## Project Structure Deep Dive

### Server Setup Explained
```javascript
// Traditional server.js equivalent is in our src/app.js:
const express = require('express');
const app = express();
const port = process.env.PORT || 2000;
```
What's happening here:
- Express setup is integrated directly in app.js
- Port configuration automatically adapts to Render's environment
- Fallback to port 2000 for local development
- No need for separate server.js configuration

### Database Connection Explained
```javascript
// Traditional database.js equivalent is also in our src/app.js:
const { Pool } = require('pg');
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,  // Render provides this
    ssl: process.env.NODE_ENV === 'production' ? {
        rejectUnauthorized: false  // Required for Render's SSL
    } : false  // Disabled for local development
});
```
Understanding the configuration:
- Pool manages database connections efficiently
- `DATABASE_URL` format: `postgres://username:password@host:port/database`
- SSL configuration switches based on environment
- Production requires SSL for security
- Development runs without SSL for easier local testing

## Pre-Deployment Checklist Explained

### Dependencies Check
- [ ] All dependencies listed in package.json
    - Check for missing packages
    - Verify correct versions
    - Include both production and development dependencies
    - Remove unused packages

### Environment Variables
- [ ] Environment variables documented
    - List all required variables
    - Document purpose of each variable
    - Include example values
    - Note any sensitive information handling

### Database Preparation
- [ ] Database migrations ready
    - Prepare SQL migration scripts
    - Test migrations locally
    - Document rollback procedures
    - Version control your schema changes

### Static Files
- [ ] Static files organized in public directory
    - Verify file structure
    - Check file permissions
    - Optimize assets (images, CSS, JS)
    - Ensure correct paths in HTML

## Deployment Process Detailed

### Database Setup
- [ ] Create PostgreSQL database
    1. Choose appropriate plan size
    2. Set backup frequency
    3. Configure access controls
    4. Note connection details

### Service Configuration
- [ ] Configure Web Service
    1. Set compute resources
    2. Configure auto-scaling rules
    3. Set up health checks
    4. Configure custom domains

### Environment Setup
- [ ] Set environment variables
    1. Production flags
    2. Database credentials
    3. API keys
    4. Service configurations

### Application Launch
- [ ] Deploy application
    1. Initial build
    2. Database migration
    3. Service start
    4. Health check verification

### Database Migration
- [ ] Run database migrations
    1. Backup current data
    2. Apply schema changes
    3. Verify data integrity
    4. Test database functions

## Post-Deployment Verification

### Connection Testing
- [ ] Verify database connection
    1. Check connection pool
    2. Test query performance
    3. Monitor connection count
    4. Verify SSL status

### API Verification
- [ ] Test all API endpoints
    1. Check response codes
    2. Verify data formats
    3. Test error handling
    4. Monitor response times

### Static Content
- [ ] Check static file serving
    1. Verify asset loading
    2. Check caching headers
    3. Test CDN integration
    4. Monitor load times

### System Monitoring
- [ ] Monitor application logs
    1. Check error rates
    2. Monitor performance metrics
    3. Set up alerts
    4. Configure log retention

### Security Verification
- [ ] Test user authentication
    1. Verify login flow
    2. Check token handling
    3. Test permission levels
    4. Monitor auth failures

### File Operations
- [ ] Verify file uploads (if applicable)
    1. Test upload limits
    2. Check storage paths
    3. Verify file access
    4. Monitor storage usage

## Maintenance Procedures

### Performance Monitoring
1. Monitor database performance
   - Query execution times
   - Connection pool status
   - Index effectiveness
   - Storage utilization

2. Check application logs
   - Error patterns
   - Performance bottlenecks
   - User activity
   - System health

3. Update dependencies
   - Security patches
   - Feature updates
   - Compatibility checks
   - Update testing

4. Backup database
   - Regular schedules
   - Verify backup integrity
   - Test restoration
   - Retention policies

5. Monitor error rates
   - Set up alerts
   - Track trends
   - Investigate spikes
   - Document resolutions

### Scaling Strategies

#### Instance Scaling
- Adjust instance size as needed
  - Monitor CPU usage
  - Check memory utilization
  - Track response times
  - Analyze cost efficiency

#### Database Management
- Monitor database connections
  - Connection pool size
  - Active connections
  - Connection timeouts
  - Query performance

#### Auto-scaling Configuration
- Configure auto-scaling if required
  - Set scaling triggers
  - Define resource limits
  - Configure cool-down periods
  - Monitor scaling events

## Subscription Integration

### Prerequisites
[Location: **Local Development - Terminal**]
1. Install Stripe dependencies:
```bash
npm install stripe @stripe/stripe-js
```

### Backend Setup
[Location: **Local Development - src/app.js**]
1. Initialize Stripe:
```javascript
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
```

2. Add environment variables:
[Location: **Render Dashboard > Environment**]
```
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Database Updates
[Location: **Local Development - SQL**]
1. Add subscription tables:
```sql
CREATE TABLE subscriptions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    stripe_subscription_id VARCHAR(255),
    stripe_customer_id VARCHAR(255),
    plan_type VARCHAR(50),
    status VARCHAR(50),
    current_period_end TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE subscription_plans (
    id SERIAL PRIMARY KEY,
    stripe_price_id VARCHAR(255),
    name VARCHAR(100),
    price DECIMAL(10,2),
    interval VARCHAR(50),
    features JSONB
);
```

### API Routes
[Location: **Local Development - src/app.js**]
1. Create subscription endpoints:
```javascript
// Create subscription
app.post('/api/subscriptions', authenticateToken, async (req, res) => {
    try {
        const { priceId } = req.body;
        const userId = req.user.id;

        // Create or get Stripe customer
        let customer;
        const user = await pool.query('SELECT stripe_customer_id FROM users WHERE id = $1', [userId]);
        
        if (user.rows[0].stripe_customer_id) {
            customer = user.rows[0].stripe_customer_id;
        } else {
            const newCustomer = await stripe.customers.create({
                email: req.user.email
            });
            customer = newCustomer.id;
            
            await pool.query('UPDATE users SET stripe_customer_id = $1 WHERE id = $2', 
                [customer, userId]);
        }

        // Create subscription
        const subscription = await stripe.subscriptions.create({
            customer: customer,
            items: [{ price: priceId }],
            payment_behavior: 'default_incomplete',
            expand: ['latest_invoice.payment_intent']
        });

        res.json({
            subscriptionId: subscription.id,
            clientSecret: subscription.latest_invoice.payment_intent.client_secret
        });
    } catch (error) {
        console.error('Subscription error:', error);
        res.status(500).json({ message: 'Error creating subscription' });
    }
});

// Webhook handler
app.post('/webhook', express.raw({type: 'application/json'}), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        event = stripe.webhooks.constructEvent(
            req.body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (err) {
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle subscription events
    switch (event.type) {
        case 'customer.subscription.updated':
        case 'customer.subscription.deleted':
            const subscription = event.data.object;
            await updateSubscriptionStatus(subscription);
            break;
    }

    res.json({ received: true });
});
```

### Frontend Integration
[Location: **Local Development - public/js/subscription.js**]
```javascript
const stripe = Stripe('your_publishable_key');

async function handleSubscription(priceId) {
    try {
        const response = await fetch('/api/subscriptions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ priceId })
        });

        const { clientSecret } = await response.json();

        // Confirm payment
        const result = await stripe.confirmCardPayment(clientSecret);

        if (result.error) {
            throw new Error(result.error.message);
        }

        // Handle successful subscription
        window.location.href = '/subscription-success';
    } catch (error) {
        console.error('Error:', error);
    }
}
```

### Render-Specific Configuration

#### 1. Webhook Setup
[Location: **Render Dashboard > Web Service > Settings**]
1. Configure webhook endpoint:
   ```
   https://your-app-name.onrender.com/webhook
   ```

2. Add route configuration:
   - Go to Settings > Routes
   - Click "Add Route"
   - Source Path: `/webhook`
   - Destination Path: `/webhook`
   - HTTP Method: POST
   - Headers: 
     ```
     Content-Type: application/json
     Stripe-Signature: ${STRIPE_WEBHOOK_SECRET}
     ```

[Location: **Stripe Dashboard**]
3. Configure Stripe webhook:
   - Go to Developers > Webhooks
   - Click "Add endpoint"
   - Enter Render URL: `https://your-app-name.onrender.com/webhook`
   - Select events:
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.payment_succeeded`
     - `invoice.payment_failed`
   - Save endpoint and copy Signing Secret

#### 2. Environment Variables
[Location: **Render Dashboard > Web Service > Environment**]
1. Add Stripe variables:
   ```
   STRIPE_SECRET_KEY=sk_live_...       # Live secret key
   STRIPE_TEST_SECRET_KEY=sk_test_...  # Test secret key
   STRIPE_PUBLISHABLE_KEY=pk_live_...  # Live publishable key
   STRIPE_TEST_PUBLISHABLE_KEY=pk_test_... # Test publishable key
   STRIPE_WEBHOOK_SECRET=whsec_...     # Webhook signing secret
   STRIPE_PRICE_ID_BASIC=price_...     # Basic plan price ID
   STRIPE_PRICE_ID_PRO=price_...       # Pro plan price ID
   ```

2. Update frontend configuration:
[Location: **Local Development - public/js/config.js**]
```javascript
const STRIPE_CONFIG = {
    publishableKey: process.env.NODE_ENV === 'production' 
        ? process.env.STRIPE_PUBLISHABLE_KEY 
        : process.env.STRIPE_TEST_PUBLISHABLE_KEY,
    priceIds: {
        basic: process.env.STRIPE_PRICE_ID_BASIC,
        pro: process.env.STRIPE_PRICE_ID_PRO
    }
};
```

### Testing Subscription Flow

#### 1. Local Testing Setup
[Location: **Local Development - Terminal**]
```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login to Stripe
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:2000/webhook

# In another terminal, trigger test events
stripe trigger payment_intent.succeeded
```

#### 2. Test Subscription Creation
[Location: **Local Development - Browser**]
1. Test card numbers:
   ```
   Success: 4242 4242 4242 4242
   Decline: 4000 0000 0000 0002
   3D Secure: 4000 0027 6000 3184
   ```

2. Test webhook handling:
   ```bash
   # View webhook logs
   stripe listen --log-level debug
   
   # Trigger specific events
   stripe trigger customer.subscription.created
   stripe trigger customer.subscription.updated
   ```

#### 3. Verify Database Updates
[Location: **Local Development - psql**]
```sql
-- Check subscription records
SELECT * FROM subscriptions WHERE user_id = 1;

-- Verify customer IDs
SELECT stripe_customer_id FROM users WHERE id = 1;
```

#### 4. Monitor Stripe Events
[Location: **Stripe Dashboard > Developers > Events**]
- Watch for webhook delivery
- Check event processing
- Verify subscription status
- Monitor payment success/failure

### Testing
[Location: **Local Development**]
1. Test subscription flow:
```bash
# Use Stripe CLI for webhook testing
stripe listen --forward-to localhost:2000/webhook
```

### Production Considerations
1. Update Stripe webhook endpoints
2. Configure proper SSL
3. Set up error monitoring
4. Implement subscription status checks
5. Add subscription management UI

### Deployment Checklist
- [ ] Stripe keys configured in Render
- [ ] Webhook endpoints updated
- [ ] Database migrations run
- [ ] SSL configured
- [ ] Test subscriptions in production