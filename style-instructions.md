# Style Instructions

## Lottie Animations

### Setup
1. Include Lottie library in HTML:
```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/lottie-web/5.12.2/lottie.min.js"></script>
```

2. Create container:
```html
<div id="lottie-container"></div>
```

3. Style container:
```css
#lottie-container {
    width: 300px;
    height: 300px;
    margin: 0 auto;
}
```

4. Initialize animation:
```javascript
const animation = lottie.loadAnimation({
    container: document.getElementById('lottie-container'),
    renderer: 'svg',
    loop: true,
    autoplay: true,
    path: '/animations/your-animation.json'
});
```

### Configuration Options
- `loop` (boolean): Enable continuous playback
- `autoplay` (boolean): Start playing automatically
- `renderer` (string): 'svg', 'canvas', or 'html'
- `path` (string): URL to Lottie JSON file
- `speed` (number): Animation speed multiplier
- `direction` (number): 1 for forward, -1 for reverse

### Animation Controls
```javascript
animation.play();      // Start animation
animation.pause();     // Pause animation
animation.stop();      // Stop and reset
animation.setSpeed(2); // Change speed
```

## Color Scheme
- Primary Green: `#07543D`
- Secondary Orange: `#ffa726`
- Background Light: `#e8ffd1`
- Text Dark: `#333333`
- Text Light: `#ffffff`

## Typography
- Headers: System font stack
- Body: Arial, sans-serif
- Font Sizes:
  - Large Headers: 4.5em
  - Section Headers: 2.5em
  - Body Text: 1em
  - Small Text: 0.9em

## Layout Guidelines
- Max Content Width: 1500px
- Standard Padding: 2rem
- Grid Gap: 2rem
- Border Radius: 
  - Large: 15px
  - Medium: 12px
  - Small: 8px

## Component Styles

### Cards
```css
.card {
    background: white;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.card:hover {
    transform: translateY(-5px);
    box-shadow: 0 6px 16px rgba(0,0,0,0.15);
}
```

### Buttons
```css
.button {
    padding: 15px 40px;
    border-radius: 50px;
    font-size: 1.2em;
    transition: all 0.3s ease;
}

.primary-button {
    background: #07543D;
    color: white;
}

.secondary-button {
    background: #ffa726;
    color: white;
}
```

### Section Transitions
```css
.section {
    position: relative;
    overflow: hidden;
}

.section::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 30px;
    background: linear-gradient(45deg, transparent 25%, #nextSectionColor 25%) -30px 0,
                linear-gradient(-45deg, transparent 25%, #nextSectionColor 25%) -30px 0;
    background-size: 60px 30px;
}
```

## Responsive Breakpoints
```css
/* Mobile */
@media (max-width: 768px) {
    /* Mobile styles */
}

/* Tablet */
@media (max-width: 1024px) {
    /* Tablet styles */
}

/* Desktop */
@media (max-width: 1200px) {
    /* Desktop styles */
}

/* Large Desktop */
@media (min-width: 1201px) {
    /* Large desktop styles */
}
```

## Animation Guidelines

### Hover Effects
```css
.interactive-element {
    transition: all 0.3s ease;
}

.interactive-element:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 30px rgba(0,0,0,0.3);
}
```

### Loading States
```css
.loading {
    animation: pulse 1.5s infinite;
}

@keyframes pulse {
    0% { opacity: 1; }
    50% { opacity: 0.5; }
    100% { opacity: 1; }
}
```

### Page Transitions
```css
.page-transition {
    animation: fadeIn 0.5s ease-in-out;
}

@keyframes fadeIn {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
}
```

## Best Practices
1. Maintain consistent spacing using the defined variables
2. Use semantic HTML elements
3. Ensure all interactive elements have hover states
4. Implement smooth transitions for state changes
5. Follow mobile-first responsive design
6. Keep animations subtle and purposeful
7. Maintain consistent color usage across components
8. Use proper contrast ratios for accessibility
9. Implement loading states for async operations
10. Keep animations under 300ms for optimal UX

## File Organization
```
public/
├── css/
│   ├── styles.css          # Main styles
│   └── animations.css      # Animation-specific styles
├── js/
│   └── animations.js       # Animation controls
└── animations/
    └── lottie-files/       # Lottie JSON files
```

# Spline Integration Guide

## Setup

### 1. Include Spline Runtime
```html
<script type="module" src="https://unpkg.com/@splinetool/viewer@0.9.490/build/spline-viewer.js"></script>
```

### 2. Add Spline Component
```html
<spline-viewer 
  url="https://prod.spline.design/your-scene-id/scene.splinecode"
  events-target="global"
></spline-viewer>
```

### 3. Style Container
```css
spline-viewer {
    width: 100%;
    height: 500px;  /* Adjust as needed */
    border-radius: 12px;
    overflow: hidden;
}
```

### 4. Initialize with JavaScript
```javascript
document.addEventListener('spline-viewer-load', () => {
    const viewer = document.querySelector('spline-viewer');
    // Access the Spline runtime
    const spline = viewer.spline;
});
```

## Configuration Options

### Viewer Attributes
- `url`: Scene URL from Spline
- `events-target`: 'global' or 'local'
- `loading`: 'eager' or 'lazy'
- `background-color`: Custom background color
- `auto-rotate`: Enable auto rotation
- `auto-play`: Start animations automatically

### Example with All Options
```html
<spline-viewer 
  url="your-scene-url"
  events-target="global"
  loading="eager"
  background-color="#ffffff"
  auto-rotate="true"
  auto-play="true"
></spline-viewer>
```

## Event Handling

### Basic Events
```javascript
// Scene loaded
document.addEventListener('spline-viewer-load', () => {
    console.log('Spline scene loaded');
});

// Mouse interactions
document.addEventListener('spline-mouse-down', (event) => {
    const { target, position } = event.detail;
    console.log('Clicked:', target, 'at position:', position);
});

// Animation events
document.addEventListener('spline-animation-start', (event) => {
    console.log('Animation started:', event.detail.name);
});
```

### Advanced Interaction
```javascript
const viewer = document.querySelector('spline-viewer');

// Control camera
viewer.spline.setCamera('Camera 1');

// Trigger animation
viewer.spline.emitEvent('mouseHover', 'Object1');

// Modify object properties
viewer.spline.setObjectProperty('Object1', 'scale', 2);
```

## Performance Optimization

### Loading Strategies
```html
<!-- Lazy loading for off-screen content -->
<spline-viewer 
  loading="lazy"
  preload="false"
  buffer-size="2"
></spline-viewer>
```

### Performance Settings
```javascript
// Reduce quality for better performance
viewer.spline.setQuality('low');

// Disable shadows for better performance
viewer.spline.setShadowsEnabled(false);

// Limit frame rate
viewer.spline.setFrameRate(30);
```

## Responsive Design

### CSS Approach
```css
/* Mobile */
@media (max-width: 768px) {
    spline-viewer {
        height: 300px;
    }
}

/* Tablet */
@media (max-width: 1024px) {
    spline-viewer {
        height: 400px;
    }
}

/* Desktop */
@media (min-width: 1025px) {
    spline-viewer {
        height: 500px;
    }
}
```

### JavaScript Approach
```javascript
function adjustSplineViewport() {
    const viewer = document.querySelector('spline-viewer');
    if (window.innerWidth < 768) {
        viewer.spline.setZoom(0.5);
    } else {
        viewer.spline.setZoom(1);
    }
}

window.addEventListener('resize', adjustSplineViewport);
```

## Best Practices

1. **Loading**
   - Use lazy loading for off-screen content
   - Show loading placeholder
   - Implement fallback content

2. **Performance**
   - Optimize model complexity
   - Use appropriate texture sizes
   - Implement level of detail (LOD)
   - Monitor frame rates

3. **Interaction**
   - Keep interactions intuitive
   - Provide visual feedback
   - Consider mobile touch events
   - Add loading indicators

4. **Accessibility**
   - Provide alternative content
   - Add ARIA labels
   - Ensure keyboard navigation
   - Consider reduced motion preferences

## Common Issues & Solutions

### Performance
```javascript
// Monitor performance
let fps = 0;
viewer.spline.onRender(() => {
    fps = viewer.spline.getFPS();
    if (fps < 30) {
        viewer.spline.setQuality('low');
    }
});
```

### Memory Management
```javascript
// Clean up when removing from DOM
function cleanupSpline() {
    const viewer = document.querySelector('spline-viewer');
    viewer.spline.dispose();
    viewer.remove();
}
```

### Error Handling
```javascript
viewer.addEventListener('error', (event) => {
    console.error('Spline error:', event.detail);
    // Show fallback content
    viewer.style.display = 'none';
    document.getElementById('fallback').style.display = 'block';
});
``` 