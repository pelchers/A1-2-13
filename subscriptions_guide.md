# Subscription System Guide

## Database Structure

### Why Multiple Tables?
Instead of using a single subscriptions table or adding fields to the users table, we use multiple tables for:

1. **Data Consistency & Integrity**
   - Each piece of data stored in one place
   - Foreign keys ensure valid relationships
   - Reduced data redundancy
   - Easier plan updates

2. **Historical Tracking**
   - Payment history
   - Subscription changes
   - Audit trails
   - Analytics capabilities

3. **Scalability**
   - Easy addition of new features
   - Flexible pricing structures
   - Complex billing scenarios
   - Application growth

4. **Performance Benefits**
   - Better query optimization
   - Efficient indexing
   - Improved caching
   - Optimized memory usage

5. **Clear Business Logic**
   - Cleaner code organization
   - Reduced complexity
   - Better maintainability
   - Easier testing

### Database Schema

```sql
-- Subscription Plans/Products Table
CREATE TABLE subscription_plans (
    id SERIAL PRIMARY KEY,
    stripe_product_id VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Price Tiers for Plans
CREATE TABLE subscription_prices (
    id SERIAL PRIMARY KEY,
    stripe_price_id VARCHAR(255) UNIQUE NOT NULL,
    plan_id INTEGER REFERENCES subscription_plans(id),
    amount INTEGER NOT NULL, -- Amount in cents
    currency VARCHAR(3) DEFAULT 'USD',
    interval VARCHAR(20) NOT NULL, -- 'month' or 'year'
    interval_count INTEGER DEFAULT 1,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User Subscriptions
CREATE TABLE user_subscriptions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    stripe_subscription_id VARCHAR(255) UNIQUE NOT NULL,
    stripe_customer_id VARCHAR(255) NOT NULL,
    plan_id INTEGER REFERENCES subscription_plans(id),
    price_id INTEGER REFERENCES subscription_prices(id),
    status VARCHAR(50) NOT NULL,
    current_period_start TIMESTAMP NOT NULL,
    current_period_end TIMESTAMP NOT NULL,
    cancel_at_period_end BOOLEAN DEFAULT false,
    canceled_at TIMESTAMP,
    ended_at TIMESTAMP,
    trial_start TIMESTAMP,
    trial_end TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Subscription Features
CREATE TABLE subscription_features (
    id SERIAL PRIMARY KEY,
    plan_id INTEGER REFERENCES subscription_plans(id),
    feature_key VARCHAR(100) NOT NULL,
    feature_value JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(plan_id, feature_key)
);

-- Payment History
CREATE TABLE subscription_payments (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    subscription_id INTEGER REFERENCES user_subscriptions(id),
    stripe_invoice_id VARCHAR(255) UNIQUE NOT NULL,
    amount_paid INTEGER NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    status VARCHAR(50) NOT NULL,
    payment_method_type VARCHAR(50),
    invoice_pdf VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Integration with Stripe

### Data Flow
```
User selects plan → Create Stripe Customer → Create Stripe Subscription → 
Store references in our DB → Monitor webhook events for updates
```

### Example Code
```javascript
// Creating a subscription
const subscription = await stripe.subscriptions.create({
    customer: stripeCustomerId,
    items: [{ price: stripePriceId }]
});

// Storing in our database
await pool.query(`
    INSERT INTO user_subscriptions (
        user_id,
        stripe_subscription_id,
        stripe_customer_id,
        plan_id,
        status,
        current_period_start,
        current_period_end
    ) VALUES ($1, $2, $3, $4, $5, $6, $7)
`, [
    userId,
    subscription.id,
    subscription.customer,
    planId,
    subscription.status,
    new Date(subscription.current_period_start * 1000),
    new Date(subscription.current_period_end * 1000)
]);
```

## Webhook Handling
Basic webhook structure for handling subscription events:

```javascript
app.post('/stripe-webhook', async (req, res) => {
    const event = req.body;

    switch (event.type) {
        case 'customer.subscription.updated':
            await updateSubscriptionStatus(event.data.object);
            break;
        case 'invoice.payment_succeeded':
            await recordPayment(event.data.object);
            break;
    }
});
```

## Complete Implementation Checklist

### 1. Initial Setup
- [ ] Create Stripe account
- [ ] Install Stripe CLI
- [ ] Add Stripe secret key to .env
```bash
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### 2. Database Setup
- [ ] Create subscription tables
```sql
-- Run all CREATE TABLE statements listed in Database Schema section
```
- [ ] Add indexes for performance
```sql
CREATE INDEX idx_user_subs_user_id ON user_subscriptions(user_id);
CREATE INDEX idx_user_subs_status ON user_subscriptions(status);
CREATE INDEX idx_sub_features_plan ON subscription_features(plan_id);
```

### 3. Stripe Product Setup
- [ ] Create products in Stripe dashboard
- [ ] Create price points for each product
- [ ] Store product/price IDs in database
```sql
INSERT INTO subscription_plans (stripe_product_id, name, description)
VALUES ('prod_xyz...', 'Basic Plan', 'Basic features');
```

### 4. Backend Implementation

#### Install Dependencies
```bash
npm install stripe
npm install express-rate-limit
```

#### API Routes Setup
```javascript
// Subscription routes
app.post('/api/subscriptions/create', authenticateToken, createSubscription);
app.get('/api/subscriptions/current', authenticateToken, getCurrentSubscription);
app.post('/api/subscriptions/cancel', authenticateToken, cancelSubscription);
app.post('/api/subscriptions/update', authenticateToken, updateSubscription);
```

#### Webhook Handler
```javascript
// Webhook endpoint
app.post('/stripe-webhook', 
    express.raw({type: 'application/json'}),
    handleStripeWebhook
);
```

#### Middleware for Route Protection
```javascript
const checkSubscription = async (req, res, next) => {
    const subscription = await getUserSubscription(req.user.id);
    if (!subscription || subscription.status !== 'active') {
        return res.status(403).json({ error: 'Subscription required' });
    }
    next();
};
```

### 5. Frontend Implementation

#### Add Subscription UI
- [ ] Create subscription plans page
- [ ] Add payment form components
- [ ] Implement subscription management UI
- [ ] Add subscription status indicators

#### Client-side Stripe Setup
```html
<script src="https://js.stripe.com/v3/"></script>
```

```javascript
const stripe = Stripe('pk_test_...');
```

### 6. Testing
- [ ] Test subscription creation
- [ ] Test webhook handling
- [ ] Test subscription cancellation
- [ ] Test payment failure scenarios
- [ ] Test subscription renewal
- [ ] Test feature access control

### 7. Production Deployment

#### Database Migration
- [ ] Create production database
- [ ] Set up database connection pooling
```javascript
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false // For Heroku
    }
});
```

#### Environment Setup
- [ ] Update environment variables
- [ ] Switch to Stripe live keys
- [ ] Configure production webhook endpoints

#### Hosting Service Setup
- [ ] Deploy to hosting service (e.g., Heroku, AWS)
- [ ] Configure SSL
- [ ] Set up domain
- [ ] Update Stripe webhook URLs

#### Production Checks
- [ ] Verify Stripe live mode
- [ ] Test end-to-end subscription flow
- [ ] Monitor webhook delivery
- [ ] Set up logging and monitoring
- [ ] Configure backup systems

### 8. Maintenance Tasks
- [ ] Set up subscription monitoring
- [ ] Create admin dashboard
- [ ] Implement analytics tracking
- [ ] Set up automated testing
- [ ] Create backup procedures

### 9. Security Measures
- [ ] Implement rate limiting
```javascript
const rateLimit = require('express-rate-limit');
app.use('/api/subscriptions/', rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
}));
```
- [ ] Add request validation
- [ ] Implement error handling
- [ ] Set up monitoring for suspicious activity

### 10. Documentation
- [ ] API documentation
- [ ] Subscription management guide
- [ ] Troubleshooting guide
- [ ] Update user documentation

### 11. Compliance
- [ ] Privacy policy updates
- [ ] Terms of service updates
- [ ] GDPR compliance checks
- [ ] PCI compliance verification

### 12. Optimization
- [ ] Database query optimization
- [ ] Caching implementation
- [ ] Performance monitoring
- [ ] Load testing

[More sections to be added as we discuss additional subscription-related topics] 