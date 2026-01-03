# Timeline

An interactive, pencil-sketch styled timeline visualization built with Svelte and D3.js.

## Features

- 📊 Interactive timeline with zoom and pan
- ✏️ Hand-drawn pencil aesthetic
- 🎨 Color-coded categories (Personal, Professional, Fitness)
- 🔗 Clickable links on timeline entries
- 📝 Simple markdown-based data format

## Getting Started

### Install Dependencies

```bash
npm install
```

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Adding Timeline Entries

Edit `public/timeline.md` to add your own entries:

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

### Format

```
Month, Year: Title [Optional Link]
```

- Month: 3-letter abbreviation (Jan, Feb, Mar, etc.)
- Year: 4-digit year
- Title: Event description
- Link: Optional URL in square brackets

### Categories

Define categories using markdown headers (`# Category Name`). Each category gets a unique pencil color:

- **Personal**: Olive green (#6B8E23)
- **Professional**: Royal blue (#4169E1)
- **Fitness**: Crimson red (#DC143C)

To add new categories, update the `categoryColors` object in `src/lib/Timeline.svelte`.

## Building for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

## Tech Stack

- [Svelte](https://svelte.dev/) - Reactive UI framework
- [Vite](https://vitejs.dev/) - Build tool
- [D3.js](https://d3js.org/) - Data visualization and scales
- [Caveat Font](https://fonts.google.com/specimen/Caveat) - Handwritten typography

## Credits

Inspiration: [@_diginova](https://x.com/_diginova)

## License

MIT
