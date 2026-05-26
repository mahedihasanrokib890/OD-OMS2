const fs = require('fs');
let c = fs.readFileSync('e:\\New project 2\\index.html', 'utf8');

c = c.replace('<div class="emp-hero-banner" id="attHeroBanner">', '<div class="emp-hero-banner emp-only" id="attHeroBanner">');
c = c.replace('<div class="emp-att-strip">', '<div class="emp-att-strip emp-only">');
c = c.replace('<div class="att-actions-pro">', '<div class="att-actions-pro emp-only">');
c = c.replace('<div class="att-info-grid">', '<div class="att-info-grid emp-only">');

fs.writeFileSync('e:\\New project 2\\index.html', c, 'utf8');
console.log('Added emp-only classes');
