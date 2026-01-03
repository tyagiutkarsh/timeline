<script>
  import { onMount } from 'svelte';
  import * as d3 from 'd3';
  import { parseTimelineMd, getDate } from './parser.js';

  let entries = [];
  let svgElement;
  let width = 1400;
  let height = 700;
  let transform = { x: 0, y: 0, k: 1 };
  
  const margin = { top: 50, right: 100, bottom: 50, left: 100 };
  const categoryColors = {
    'Personal': '#6B8E23',
    'Professional': '#4169E1', 
    'Fitness': '#DC143C'
  };

  let positions = [];
  let xScale;
  let timelineY = height / 2;

  onMount(async () => {
    const response = await fetch('/timeline.md');
    const markdown = await response.text();
    entries = parseTimelineMd(markdown);
    
    calculatePositions();
    setupZoom();
  });

  function calculatePositions() {
    if (entries.length === 0) return;
    
    const dates = entries.map(getDate);
    const minDate = d3.min(dates);
    const maxDate = d3.max(dates);
    
    xScale = d3.scaleTime()
      .domain([minDate, maxDate])
      .range([margin.left, width - margin.right]);
    
    positions = entries.map((entry, i) => {
      const x = xScale(getDate(entry));
      const side = i % 2 === 0 ? -1 : 1;
      const baseOffset = 80 + Math.random() * 20;
      const y = timelineY + (side * baseOffset);
      
      return {
        ...entry,
        id: i,
        x,
        y,
        labelY: y + (side * 10)
      };
    });
  }

  function setupZoom() {
    const zoom = d3.zoom()
      .scaleExtent([0.5, 3])
      .on('zoom', (event) => {
        transform = event.transform;
      });
    
    d3.select(svgElement).call(zoom);
  }

  function handleClick(entry) {
    if (entry.link) {
      window.open(entry.link, '_blank');
    }
  }

  function getConnectorPath(pos) {
    const nodeY = timelineY;
    const controlOffset = (pos.y - nodeY) * 0.3;
    
    return `M ${pos.x} ${nodeY} Q ${pos.x} ${nodeY + controlOffset}, ${pos.x} ${pos.y}`;
  }

  $: transformString = `translate(${transform.x}, ${transform.y}) scale(${transform.k})`;
</script>

<div class="timeline-container">
  <div class="legend">
    {#each Object.entries(categoryColors) as [category, color]}
      <div class="legend-item">
        <svg width="30" height="20">
          <line 
            x1="0" y1="10" x2="25" y2="10"
            stroke={color}
            stroke-width="3"
            stroke-linecap="round"
          />
        </svg>
        <span style="color: {color}">{category}</span>
      </div>
    {/each}
  </div>

  <svg bind:this={svgElement} {width} {height}>
    <defs>
      <filter id="pencil-texture">
        <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="4" result="noise"/>
        <feDisplacementMap in="SourceGraphic" in2="noise" scale="1.2"/>
      </filter>
    </defs>

    <g transform={transformString}>
      <line
        x1={margin.left}
        y1={timelineY}
        x2={width - margin.right}
        y2={timelineY}
        stroke="#333"
        stroke-width="2"
        class="timeline-axis"
      />

      {#each positions as pos}
        <path
          d={getConnectorPath(pos)}
          stroke={categoryColors[pos.category]}
          stroke-width="1.5"
          fill="none"
          class="connector-line"
          stroke-dasharray="3, 2"
        />

        <circle
          cx={pos.x}
          cy={timelineY}
          r="6"
          fill={categoryColors[pos.category]}
          stroke={categoryColors[pos.category]}
          stroke-width="2"
          class="timeline-node"
        />

        <text
          x={pos.x}
          y={pos.labelY}
          fill={categoryColors[pos.category]}
          class="timeline-text"
          class:clickable={pos.link}
          text-anchor="middle"
          on:click={() => handleClick(pos)}
        >
          {pos.title}
        </text>

        <text
          x={pos.x}
          y={pos.labelY + 20}
          fill="#666"
          class="date-text"
          text-anchor="middle"
        >
          {pos.month}, {pos.year}
        </text>
      {/each}
    </g>
  </svg>

  <div class="controls">
    <p>Scroll to zoom • Drag to pan</p>
  </div>
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
    right: 20px;
    background: rgba(255, 255, 255, 0.95);
    padding: 15px 20px;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    z-index: 10;
  }

  .legend-item {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 8px;
    font-family: 'Caveat', cursive;
    font-size: 18px;
    font-weight: 600;
  }

  .legend-item:last-child {
    margin-bottom: 0;
  }

  .timeline-axis {
    filter: url(#pencil-texture);
  }

  .connector-line {
    filter: url(#pencil-texture);
    stroke-linecap: round;
  }

  .timeline-node {
    filter: url(#pencil-texture);
    transition: r 0.2s;
  }

  .timeline-node:hover {
    r: 8;
  }

  .timeline-text {
    font-family: 'Caveat', cursive;
    font-size: 18px;
    font-weight: 600;
    filter: url(#pencil-texture);
  }

  .date-text {
    font-family: 'Caveat', cursive;
    font-size: 14px;
    filter: url(#pencil-texture);
  }

  .clickable {
    cursor: pointer;
    transition: opacity 0.2s;
  }

  .clickable:hover {
    opacity: 0.7;
    text-decoration: underline;
  }

  .controls {
    position: absolute;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    font-family: 'Caveat', cursive;
    font-size: 16px;
    color: #666;
    background: rgba(255, 255, 255, 0.9);
    padding: 10px 20px;
    border-radius: 20px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .controls p {
    margin: 0;
  }
</style>
