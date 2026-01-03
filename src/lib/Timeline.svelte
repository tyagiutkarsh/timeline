<script>
  import { onMount } from 'svelte';
  import * as d3 from 'd3';
  import { parseTimelineMd, getDate } from './parser.js';

  let entries = [];
  let svgElement;
  let containerWidth = 1400;
  let containerHeight = 700;
  let transform = { x: 0, y: 0, k: 1 };
  let contentWidth = 1400;
  
  const margin = { top: 100, right: 100, bottom: 50, left: 100 };
  const categoryColors = {
    'Personal': '#6B8E23',
    'Professional': '#4169E1', 
    'Fitness': '#DC143C'
  };

  let visibleCategories = new Set(['Personal', 'Professional', 'Fitness']);
  let positions = [];
  let xScale;
  let yScale;
  let isMobile = false;
  $: timelineY = containerHeight / 2;
  $: timelineX = 50; // X position for vertical timeline on mobile

  onMount(async () => {
    const response = await fetch('/timeline.md');
    const markdown = await response.text();
    entries = parseTimelineMd(markdown);
    
    updateDimensions();
    calculatePositions();
    setupZoom();
    
    window.addEventListener('resize', updateDimensions);
  });
  
  function updateDimensions() {
    if (svgElement) {
      containerWidth = svgElement.parentElement.clientWidth;
      containerHeight = svgElement.parentElement.clientHeight;
      isMobile = containerWidth < 768;
    }
  }

  function calculatePositions() {
    if (entries.length === 0) return;
    
    const dates = entries.map(getDate);
    const minDate = d3.min(dates);
    const maxDate = d3.max(dates);
    
    if (isMobile) {
      // Mobile: vertical timeline
      const contentHeight = entries.length * 100; // Space per entry
      yScale = d3.scaleLinear()
        .domain([0, entries.length - 1])
        .range([margin.top, contentHeight]);
      
      calculateMobilePositions();
      return;
    }
    
    // Desktop: horizontal timeline
    // Calculate content width based on zoom
    contentWidth = containerWidth * transform.k;
    
    xScale = d3.scaleTime()
      .domain([minDate, maxDate])
      .range([margin.left, contentWidth - margin.right]);
    
    // Sort entries by date for collision detection
    const sortedEntries = entries
      .map((entry, i) => ({ ...entry, originalIndex: i }))
      .sort((a, b) => getDate(a) - getDate(b));
    
    const minVerticalOffset = 80;
    const verticalSpacing = 45;
    const minHorizontalGap = 100; // Minimum horizontal distance before checking collision
    
    const tempPositions = [];
    
    for (let i = 0; i < sortedEntries.length; i++) {
      const entry = sortedEntries[i];
      const x = xScale(getDate(entry));
      const side = i % 2 === 0 ? -1 : 1;
      
      // Check for collisions with ALL previous entries
      let verticalOffset = minVerticalOffset;
      let attempts = 0;
      
      while (attempts < 10) {
        const testY = timelineY + (side * verticalOffset);
        let hasCollision = false;
        
        // Check against all previous positions
        for (let j = 0; j < tempPositions.length; j++) {
          const prev = tempPositions[j];
          const xDiff = Math.abs(x - prev.x);
          
          // Only check collision if horizontally close
          if (xDiff < minHorizontalGap) {
            const yDiff = Math.abs(testY - prev.y);
            
            // If on same side and vertically close, there's a collision
            if (yDiff < 35) {
              hasCollision = true;
              break;
            }
          }
        }
        
        if (!hasCollision) {
          break;
        }
        
        verticalOffset += verticalSpacing;
        attempts++;
      }
      
      const y = timelineY + (side * verticalOffset);
      
      tempPositions.push({
        ...entry,
        id: entry.originalIndex,
        x,
        y,
        labelY: y,
        textX: x + 10 // Offset text to the right of the line
      });
    }
    
    positions = tempPositions;
  }
  
  function calculateMobilePositions() {
    // Sort entries by date (newest first)
    const sortedEntries = entries
      .map((entry, i) => ({ ...entry, originalIndex: i }))
      .sort((a, b) => getDate(b) - getDate(a)); // Descending order
    
    const verticalSpacing = 80;
    
    positions = sortedEntries.map((entry, i) => {
      const y = margin.top + (i * verticalSpacing);
      
      return {
        ...entry,
        id: entry.originalIndex,
        x: timelineX,
        y: y,
        labelY: y,
        textX: timelineX + 20 // Text to the right of the line
      };
    });
  }

  function setupZoom() {
    if (isMobile) {
      // Mobile: only allow vertical panning, no zoom
      const zoom = d3.zoom()
        .scaleExtent([1, 1])
        .on('zoom', (event) => {
          transform = { x: 0, y: event.transform.y, k: 1 };
        });
      
      d3.select(svgElement).call(zoom);
    } else {
      // Desktop: horizontal zoom and pan
      const zoom = d3.zoom()
        .scaleExtent([1, 5])
        .on('zoom', (event) => {
          transform = event.transform;
          calculatePositions(); // Recalculate positions on zoom
        });
      
      d3.select(svgElement).call(zoom);
    }
  }

  function handleClick(entry) {
    if (entry.link) {
      window.open(entry.link, '_blank');
    }
  }

  function getConnectorPath(pos) {
    // Straight vertical line from dot to text
    const nodeY = timelineY;
    return `M ${pos.x} ${nodeY} L ${pos.x} ${pos.y}`;
  }
  
  function toggleCategory(category) {
    if (visibleCategories.has(category)) {
      visibleCategories.delete(category);
    } else {
      visibleCategories.add(category);
    }
    visibleCategories = visibleCategories; // Trigger reactivity
  }
  
  function resetView() {
    // Reset transform to initial state
    const identity = d3.zoomIdentity;
    d3.select(svgElement).transition().duration(750).call(
      d3.zoom().transform,
      identity
    );
    transform = { x: 0, y: 0, k: 1 };
    calculatePositions();
  }
  
  $: filteredPositions = positions.filter(pos => visibleCategories.has(pos.category));
  
  // Calculate timeline bounds based on filtered positions
  $: timelineBounds = filteredPositions.length > 0 ? {
    minX: Math.min(...filteredPositions.map(p => p.x)),
    maxX: Math.max(...filteredPositions.map(p => p.x)),
    minY: Math.min(...filteredPositions.map(p => p.y)),
    maxY: Math.max(...filteredPositions.map(p => p.y))
  } : { minX: margin.left, maxX: contentWidth - margin.right, minY: margin.top, maxY: margin.top };

  $: transformString = isMobile ? `translate(0, ${transform.y})` : `translate(${transform.x}, 0)`;
</script>

<div class="timeline-container">
  <div class="legend">
    {#each Object.entries(categoryColors) as [category, color]}
      <div 
        class="legend-item" 
        class:inactive={!visibleCategories.has(category)}
        on:click={() => toggleCategory(category)}
      >
        <svg width="30" height="20">
          <line 
            x1="0" y1="10" x2="25" y2="10"
            stroke={color}
            stroke-width="3"
            stroke-linecap="round"
            opacity={visibleCategories.has(category) ? 1 : 0.3}
          />
        </svg>
        <span style="color: {color}; opacity: {visibleCategories.has(category) ? 1 : 0.3}">{category}</span>
      </div>
    {/each}
  </div>

  <svg bind:this={svgElement} width={containerWidth} height={containerHeight}>
    <defs>
      <filter id="pencil-texture">
        <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="4" result="noise"/>
        <feDisplacementMap in="SourceGraphic" in2="noise" scale="1.2"/>
      </filter>
    </defs>

    <g transform={transformString}>
      {#if filteredPositions.length > 0}
        {#if isMobile}
          <!-- Mobile: vertical timeline -->
          <line
            x1={timelineX}
            y1={timelineBounds.minY}
            x2={timelineX}
            y2={timelineBounds.maxY}
            stroke="#000"
            stroke-width="2"
          />
        {:else}
          <!-- Desktop: horizontal timeline -->
          <line
            x1={timelineBounds.minX}
            y1={timelineY}
            x2={timelineBounds.maxX}
            y2={timelineY}
            stroke="#000"
            stroke-width="2"
          />
        {/if}
      {/if}

      {#each filteredPositions as pos}
        {#if isMobile}
          <!-- Mobile: horizontal line from dot to text -->
          <line
            x1={pos.x}
            y1={pos.y}
            x2={pos.textX - 5}
            y2={pos.y}
            stroke="#000"
            stroke-width="1"
          />
        {:else}
          <!-- Desktop: vertical line from dot to text -->
          <line
            x1={pos.x}
            y1={timelineY}
            x2={pos.x}
            y2={pos.y - 25}
            stroke="#000"
            stroke-width="1"
          />
        {/if}

        <circle
          cx={isMobile ? pos.x : pos.x}
          cy={isMobile ? pos.y : timelineY}
          r="5"
          fill={categoryColors[pos.category]}
          stroke={categoryColors[pos.category]}
          stroke-width="2"
        />

        <text
          x={pos.textX}
          y={isMobile ? pos.labelY : pos.labelY - 10}
          fill={categoryColors[pos.category]}
          class="timeline-text"
          class:clickable={pos.link}
          text-anchor="start"
          on:click={() => handleClick(pos)}
        >
          {pos.title}
        </text>

        <text
          x={pos.textX}
          y={isMobile ? pos.labelY + 12 : pos.labelY + 2}
          fill="#666"
          class="date-text"
          text-anchor="start"
        >
          {pos.month}, {pos.year}
        </text>
      {/each}
      
      {#if filteredPositions.length === 0}
        <!-- Empty state message -->
        <text
          x={isMobile ? containerWidth / 2 : containerWidth / 2}
          y={isMobile ? containerHeight / 2 : timelineY}
          fill="#999"
          font-family="Inter, sans-serif"
          font-size="9"
          text-anchor="middle"
        >
          Select a timeline
        </text>
      {/if}
    </g>
  </svg>

  <div class="controls">
    <p>Scroll to zoom • Drag to pan</p>
  </div>
  
  <button class="home-button" on:click={resetView} title="Reset view">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
      <polyline points="9 22 9 12 15 12 15 22"></polyline>
    </svg>
  </button>
  
  <!-- <div class="disclaimer">
    <span class="asterisk">*</span> There is a recency bias on this page, have spent enough time updating 2025 data
  </div> -->
</div>

<style>
  .timeline-container {
    width: 100%;
    height: 100vh;
    overflow: hidden;
    background: #fdfdf8;
    position: relative;
  }

  svg {
    cursor: grab;
    display: block;
  }

  svg:active {
    cursor: grabbing;
  }

  .legend {
    position: absolute;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(255, 255, 255, 0.95);
    padding: 15px 20px;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    z-index: 10;
    display: flex;
    gap: 30px;
  }

  .legend-item {
    display: flex;
    align-items: center;
    gap: 10px;
    font-family: 'Inter', sans-serif;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s;
    user-select: none;
  }

  .legend-item:hover {
    transform: scale(1.05);
  }
  
  .legend-item.inactive {
    opacity: 0.5;
  }

  .timeline-text {
    font-family: 'Inter', sans-serif;
    font-size: 12px;
    font-weight: 500;
  }

  .date-text {
    font-family: 'Inter', sans-serif;
    font-size: 9px;
    font-weight: 400;
  }

  .clickable {
    cursor: pointer;
    transition: opacity 0.2s;
    text-decoration: underline;
  }

  .clickable:hover {
    opacity: 0.7;
  }

  .controls {
    position: absolute;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    font-family: 'Inter', sans-serif;
    font-size: 12px;
    color: #666;
    background: rgba(255, 255, 255, 0.9);
    padding: 10px 20px;
    border-radius: 20px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    z-index: 5;
  }

  .controls p {
    margin: 0;
  }
  
  .home-button {
    position: absolute;
    bottom: 20px;
    left: 20px;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.95);
    border: 1px solid #ddd;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    color: #666;
    z-index: 5;
  }
  
  .home-button:hover {
    background: #f0f0f0;
    transform: scale(1.05);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
  
  .home-button:active {
    transform: scale(0.95);
  }
  
  .disclaimer {
    position: absolute;
    bottom: 70px;
    left: 50%;
    transform: translateX(-50%);
    font-family: 'Inter', sans-serif;
    font-size: 10px;
    color: #999;
    max-width: 300px;
    line-height: 1.4;
    text-align: center;
    z-index: 5;
  }
  
  .disclaimer .asterisk {
    font-size: 6px;
    vertical-align: super;
  }
  
  @media (max-width: 768px) {
    .controls {
      font-size: 10px;
      padding: 8px 16px;
      bottom: 10px;
      left: 50%;
    }
    
    .disclaimer {
      font-size: 8px;
      max-width: 250px;
      bottom: 50px;
      left: 50%;
    }
    
    .legend {
      flex-direction: column;
      gap: 10px;
      padding: 10px 15px;
      font-size: 12px;
    }
    
    .home-button {
      width: 36px;
      height: 36px;
      bottom: 10px;
      left: 10px;
    }
    
    .home-button svg {
      width: 14px;
      height: 14px;
    }
  }
</style>
