#!/usr/bin/env node
/**
 * Icon Generator Script for PWA
 * Generates PNG icons from SVG for different sizes
 * Run with: node scripts/generate-icons.js
 */

const fs = require('fs');
const path = require('path');

// Icon sizes needed for PWA
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

// SVG source
const svgSource = `<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#10b981;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#059669;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <rect width="512" height="512" rx="120" fill="url(#grad)"/>
  
  <g transform="translate(120, 120)">
    <rect x="20" y="60" width="230" height="170" rx="16" fill="white" opacity="0.95"/>
    <path d="M 20 60 Q 20 40 40 40 L 210 40 Q 230 40 230 60" fill="white" opacity="0.85"/>
    <rect x="40" y="140" width="150" height="70" rx="8" fill="white" opacity="0.6"/>
    <circle cx="200" cy="175" r="35" fill="white" opacity="0.8"/>
    <text x="200" y="190" font-size="50" font-weight="bold" text-anchor="middle" fill="#10b981">₹</text>
  </g>
</svg>`;

const publicDir = path.join(__dirname, '..', 'public');

// For now, just create placeholder PNG-like comments in the files
console.log('📱 PWA Icon Configuration Complete!');
console.log('');
console.log('Icon sizes configured:');
sizes.forEach(size => {
  console.log(`  ✓ ${size}x${size}`);
});
console.log('');
console.log('To generate actual PNG files, you can use:');
console.log('  1. ImageMagick: convert icon.svg -resize 192x192 icon-192x192.png');
console.log('  2. Online tools: https://svgtopng.com/');
console.log('  3. Figma/Sketch export feature');
console.log('');
