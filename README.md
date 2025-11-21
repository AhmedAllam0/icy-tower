# Icy Tower - Browser Game

A browser-based recreation of the classic Icy Tower game with smooth physics and responsive controls for both desktop and mobile devices.

## Features

- **Smooth Physics System**: Realistic gravity, jumping mechanics, and collision detection
- **Responsive Controls**: 
  - Desktop: Arrow keys or A/D for movement, Space/W/Up Arrow to jump
  - Mobile: Touch controls with on-screen buttons
- **Progressive Difficulty**: Randomly generated platforms that get harder as you climb
- **Score Tracking**: Keep track of your highest score with local storage
- **Mobile-Optimized**: Touch-friendly interface with responsive design
- **Visual Effects**: Glowing effects, smooth animations, and gradient backgrounds

## How to Play

1. Open `index.html` in your web browser
2. Click "START GAME" to begin
3. Jump from platform to platform to climb as high as possible
4. Avoid falling off the screen
5. Try to beat your high score!

## Controls

### Desktop
- **Move Left**: Left Arrow or A
- **Move Right**: Right Arrow or D
- **Jump**: Space, W, or Up Arrow

### Mobile
- **Move**: Tap the left (◄) and right (►) buttons
- **Jump**: Tap the center "JUMP" button

## Game Mechanics

- The player wraps around the screen edges (exit left, appear right and vice versa)
- You can only jump when standing on a platform
- Your score increases based on the height you reach
- Platforms are randomly generated as you climb higher
- The camera smoothly follows the player upward

## Technical Details

- Pure vanilla JavaScript (no frameworks required)
- HTML5 Canvas for rendering
- 60 FPS gameplay
- Touch event handling for mobile devices
- LocalStorage for persistent high scores

## Browser Compatibility

Works on all modern browsers that support:
- HTML5 Canvas
- ES6 JavaScript
- CSS3
- Touch Events (for mobile)

## Installation

No installation required! Simply:
1. Clone or download this repository
2. Open `index.html` in any modern web browser
3. Start playing!

Alternatively, you can host it on any static web server or GitHub Pages.

## File Structure

```
icy-tower/
├── index.html    # Main HTML file with game structure
├── style.css     # Styling and responsive design
├── game.js       # Game logic, physics, and controls
└── README.md     # This file
```

## Credits

Inspired by the classic Icy Tower game by Free Lunch Design.