# Subscription System Setup Guide

## Step 1: Database Setup

### 1. Create Subscription Plans Table
```sql
CREATE TABLE subscription_plans (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    interval VARCHAR(20) NOT NULL DEFAULT 'month',
    features JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert basic plans
INSERT INTO subscription_plans (name, price, features) VALUES
(
    'Basic', 
    20.00,
    '{
        "explore_access": true,
        "leaderboard_access": true,
        "featured_suggestions": true,
        "profile_editing": true,
        "messaging": false,
        "watch_list": false,
        "project_creation": false,
        "personalized_suggestions": false
    }'
),
(
    'Premium', 
    40.00,
    '{
        "explore_access": true,
        "leaderboard_access": true,
        "featured_suggestions": true,
        "profile_editing": true,
        "messaging": true,
        "watch_list": true,
        "project_creation": true,
        "personalized_suggestions": true
    }'
);
```

### 2. Create User Subscriptions Table
```sql
CREATE TABLE user_subscriptions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    plan_id INTEGER REFERENCES subscription_plans(id),
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    current_period_start TIMESTAMP WITH TIME ZONE NOT NULL,
    current_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id)
);

-- Add subscription_id to users table
ALTER TABLE users ADD COLUMN subscription_id INTEGER REFERENCES user_subscriptions(id);
```

### Pause for Server Connection Completion
- Ensure the database is connected to your app.
- Verify the connection with test queries.

## Step 2: Deploy Server on Render.com
- Set up your server on Render.com.
- Ensure the server is live and accessible.

## Step 3: Migrate Database to Render.com
- Move your database to Render for hosting.
- Update your app's database connection settings.

## Step 4: Stripe Integration

### Stripe Setup

#### 1. Set Up Stripe Account
- Sign up at [Stripe](https://stripe.com).
- Obtain your API keys from the Stripe Dashboard.

#### 2. Install Stripe Package
```bash
npm install stripe
```

#### 3. Backend Setup

##### Initialize Stripe
```javascript
// src/config/stripe.js
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

module.exports = stripe;
```

##### Create Subscription Endpoint
```javascript
// src/app.js
const stripe = require('./config/stripe');

app.post('/create-subscription', authenticateToken, async (req, res) => {
    try {
        const { paymentMethodId, planId } = req.body;

        // Create a customer
        const customer = await stripe.customers.create({
            payment_method: paymentMethodId,
            email: req.user.email,
            invoice_settings: {
                default_payment_method: paymentMethodId,
            },
        });

        // Create a subscription
        const subscription = await stripe.subscriptions.create({
            customer: customer.id,
            items: [{ plan: planId }],
            expand: ['latest_invoice.payment_intent'],
        });

        res.json({
            subscriptionId: subscription.id,
            clientSecret: subscription.latest_invoice.payment_intent.client_secret,
        });
    } catch (error) {
        console.error('Error creating subscription:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
```

### 4. Frontend Setup

#### Load Stripe.js
```html
<script src="https://js.stripe.com/v3/"></script>
```

#### Create Subscription
```javascript
// public/js/subscription.js
const stripe = Stripe('your-publishable-key');

async function createSubscription(planId) {
    const { paymentMethod, error } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement, // Assume cardElement is initialized
    });

    if (error) {
        console.error('Payment method error:', error);
        return;
    }

    const response = await fetch('/create-subscription', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
            paymentMethodId: paymentMethod.id,
            planId: planId,
        }),
    });

    const { clientSecret } = await response.json();

    const result = await stripe.confirmCardPayment(clientSecret);

    if (result.error) {
        console.error('Payment confirmation error:', result.error);
    } else {
        console.log('Subscription successful:', result.paymentIntent);
    }
}
```

### 5. Webhook for Subscription Events
```javascript
// src/app.js
app.post('/webhook', express.raw({ type: 'application/json' }), (req, res) => {
    const sig = req.headers['stripe-signature'];

    let event;
    try {
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        console.error('Webhook signature verification failed:', err);
        return res.sendStatus(400);
    }

    // Handle the event
    switch (event.type) {
        case 'invoice.payment_succeeded':
            // Update subscription status in your database
            break;
        case 'customer.subscription.deleted':
            // Handle subscription cancellation
            break;
        default:
            console.log(`Unhandled event type ${event.type}`);
    }

    res.sendStatus(200);
});
```

## Key Points
- Ensure your server can handle Stripe webhooks.
- Use Stripe's test mode for development.
- Secure your API keys and webhook secret.
- Update your database based on Stripe events.

## Access Control
- Use middleware to check subscription status.
- Protect routes and features based on subscription level.

## Frontend Integration
- Use Stripe.js for payment handling.
- Provide UI feedback for subscription status.

## Monitoring and Logging
- Log subscription events for auditing.
- Monitor webhook events for errors.

[More sections to be added as we discuss additional subscription-related topics] 

### Subscription Plans Table
```sql
CREATE TABLE subscription_plans (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    interval VARCHAR(20) NOT NULL DEFAULT 'month',
    features JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert basic plans
INSERT INTO subscription_plans (name, price, features) VALUES
(
    'Basic', 
    20.00,
    '{
        "explore_access": true,
        "leaderboard_access": true,
        "featured_suggestions": true,
        "profile_editing": true,
        "messaging": false,
        "watch_list": false,
        "project_creation": false,
        "personalized_suggestions": false
    }'
),
(
    'Premium', 
    40.00,
    '{
        "explore_access": true,
        "leaderboard_access": true,
        "featured_suggestions": true,
        "profile_editing": true,
        "messaging": true,
        "watch_list": true,
        "project_creation": true,
        "personalized_suggestions": true
    }'
);
```

### User Subscriptions Table
```sql
CREATE TABLE user_subscriptions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    plan_id INTEGER REFERENCES subscription_plans(id),
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    current_period_start TIMESTAMP WITH TIME ZONE NOT NULL,
    current_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id)
);

-- Add subscription_id to users table
ALTER TABLE users ADD COLUMN subscription_id INTEGER REFERENCES user_subscriptions(id);
```

## Access Control Implementation

### 1. Middleware Setup
```javascript
// src/middleware/subscriptionCheck.js

const checkSubscription = async (req, res, next) => {
    try {
        // Get user subscription from database
        const subscription = await pool.query(
            `SELECT s.*, p.features 
             FROM user_subscriptions s
             JOIN subscription_plans p ON s.plan_id = p.id
             WHERE user_id = $1 AND status = 'active'`,
            [req.user.id]
        );

        if (!subscription.rows[0]) {
            req.userSubscription = {
                plan: 'none',
                features: {}
            };
        } else {
            req.userSubscription = {
                plan: subscription.rows[0].name,
                features: subscription.rows[0].features
            };
        }
        next();
    } catch (error) {
        console.error('Subscription check error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { checkSubscription };
```

### 2. Route Protection
```javascript
// src/app.js

const { checkSubscription } = require('./middleware/subscriptionCheck');

// Protected routes
app.get('/messages.html', authenticateToken, checkSubscription, (req, res, next) => {
    if (!req.userSubscription.features.messaging) {
        return res.redirect('/plans.html');
    }
    next();
});

app.get('/watches.html', authenticateToken, checkSubscription, (req, res, next) => {
    if (!req.userSubscription.features.watch_list) {
        return res.redirect('/plans.html');
    }
    next();
});

app.get('/projects.html', authenticateToken, checkSubscription, (req, res, next) => {
    if (!req.userSubscription.features.project_creation) {
        return res.redirect('/plans.html');
    }
    next();
});
```

### 3. Frontend Access Control
```javascript
// public/js/scripts.js

async function checkFeatureAccess() {
    try {
        const response = await fetch('/api/subscription/features', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        const { features } = await response.json();
        
        // Hide/show features based on subscription
        if (!features.messaging) {
            document.querySelectorAll('.messaging-feature').forEach(el => el.style.display = 'none');
        }
        if (!features.watch_list) {
            document.querySelectorAll('.watch-feature').forEach(el => el.style.display = 'none');
        }
        if (!features.project_creation) {
            document.querySelectorAll('.project-feature').forEach(el => el.style.display = 'none');
        }
    } catch (error) {
        console.error('Error checking feature access:', error);
    }
}
```

### 4. API Endpoint Protection
```javascript
// src/app.js

// Protected API endpoints
app.post('/api/messages', authenticateToken, checkSubscription, async (req, res) => {
    if (!req.userSubscription.features.messaging) {
        return res.status(403).json({ 
            message: 'Messaging requires Premium subscription' 
        });
    }
    // Message handling logic
});

app.post('/api/projects', authenticateToken, checkSubscription, async (req, res) => {
    if (!req.userSubscription.features.project_creation) {
        return res.status(403).json({ 
            message: 'Project creation requires Premium subscription' 
        });
    }
    // Project creation logic
});
```

### 5. Subscription Status Check
```javascript
// src/app.js

// Endpoint to check subscription status
app.get('/api/subscription/status', authenticateToken, async (req, res) => {
    try {
        const subscription = await pool.query(
            `SELECT s.*, p.name as plan_name, p.features
             FROM user_subscriptions s
             JOIN subscription_plans p ON s.plan_id = p.id
             WHERE user_id = $1 AND status = 'active'`,
            [req.user.id]
        );

        res.json({
            status: subscription.rows[0]?.status || 'none',
            plan: subscription.rows[0]?.plan_name || 'none',
            features: subscription.rows[0]?.features || {}
        });
    } catch (error) {
        console.error('Error checking subscription:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
```

### 6. Feature Access Helper
```javascript
// src/utils/subscriptionUtils.js

function hasFeatureAccess(subscription, feature) {
    if (!subscription || !subscription.features) return false;
    return !!subscription.features[feature];
}

// Usage example
if (!hasFeatureAccess(req.userSubscription, 'messaging')) {
    return res.status(403).json({ message: 'Feature not available' });
}
```

### 7. Subscription Expiration Check
```javascript
// Add to checkSubscription middleware

const checkSubscriptionExpiration = async (userId) => {
    const now = new Date();
    const result = await pool.query(
        `UPDATE user_subscriptions 
         SET status = 'expired' 
         WHERE user_id = $1 
         AND current_period_end < $2 
         AND status = 'active'
         RETURNING *`,
        [userId, now]
    );
    return result.rows[0];
};
```

This setup provides:
1. Basic/Premium plan structure
2. Feature-based access control
3. Route protection
4. API endpoint protection
5. Frontend feature toggling
6. Subscription status checking
7. Expiration handling

Remember to:
- Update the features list as needed
- Add appropriate error messages
- Implement proper UI feedback
- Add subscription upgrade prompts
- Monitor subscription status changes