# Getting Started with Your Timeline

## Quick Start

1. **Run the dev server:**
   ```bash
   npm run dev
   ```
   Open http://localhost:5173

2. **View the timeline:**
   - Homepage: http://localhost:5173/
   - Timeline: http://localhost:5173/timeline

## Adding Your Own Events

Edit `public/timeline.md`:

```markdown
# Personal
Feb, 2025: started onehour.runclub [https://www.instagram.com/onehour.runclub/]
Jul, 2025: First DJ set

# Professional  
Aug, 2022: Joined Shopflo
Oct, 2025: Started Supertrainer

# Fitness
Oct, 2024: First Ironman 70.3 (Goa, IN)
```

## How It Works

- **Categories**: Defined by `# Header` in markdown
- **Colors**: Each category has a unique pencil color
- **Links**: Add `[URL]` after event title (optional)
- **Format**: `Month, Year: Title [Link]`

## Customization

### Add New Categories

Edit `src/lib/Timeline.svelte` and add to `categoryColors`:

```javascript
const categoryColors = {
  'Personal': '#6B8E23',
  'Professional': '#4169E1', 
  'Fitness': '#DC143C',
  'Creative': '#9370DB'  // Add your own!
};
```

### Adjust Layout

- Timeline height: `height` variable in Timeline.svelte
- Timeline width: `width` variable
- Vertical spacing: `baseOffset` in `calculatePositions()`

## Deployment

When you're ready to deploy:

```bash
npm run build
```

The `dist/` folder contains your static site. You can deploy to:
- GitHub Pages
- Vercel
- Netlify
- Any static hosting

## Repository

https://github.com/tyagiutkarsh/timeline

## Credits

Inspiration: [@_diginova](https://x.com/_diginova)
