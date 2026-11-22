(() => {
  'use strict';
  const paths = {
    shop:'<path d="M4 10v10h16V10M3 10l2-6h14l2 6m-18 0c0 3.2 4.5 3.2 4.5 0 0 3.2 4.5 3.2 4.5 0 0 3.2 4.5 3.2 4.5 0 0 3.2 4.5 3.2 4.5 0M9 20v-6h5v6"/>',
    coin:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="6"/><path d="M13.5 9.2c-2.8-1.7-5.1.8-4 3.6.8 2.1 4.5 2.4 5-1h-2.3"/>',
    fence:'<path d="M3 10h18M3 16h18M5 20V7l2-3 2 3v13m6 0V7l2-3 2 3v13"/>',
    notebook:'<rect x="5" y="3" width="15" height="18" rx="2"/><path d="M9 3v18M3 7h3m-3 5h3m-3 5h3m7-10h4m-4 4h3"/>',
    book:'<path d="M12 6C9 3.5 5 3.4 2.5 5v14c3-1.5 6.5-1.3 9.5 1 3-2.3 6.5-2.5 9.5-1V5c-2.5-1.6-6.5-1.5-9.5 1Zm0 0v14"/>',
    leaf:'<path d="M20.5 3.5c-5 1-11.8.6-15.4 5.8-2.6 3.7-1.4 8.1 1.6 9.7 3.5 1.9 8.9.5 11.4-3.9 1.5-2.6 1.6-6.3 2.4-11.6Z"/><path d="M3 22c2.5-5 6.8-9.5 11.6-12.8"/>',
    sprout:'<path d="M12 21v-6c0-2.9 1.1-5.6 3.9-8.1"/><path d="M12.5 12.3c-1-5.2 2.8-8.9 8.7-9.1.1 6.1-2.7 10.3-8.7 9.1ZM11.8 16.3C5.6 17.2 2.5 12.9 2.5 8.8c5.1-.2 8.9 1.5 9.3 7.5Z"/>',
    droplet:'<path d="M12 2.8C10 6.3 5.2 10.8 5.2 15a6.8 6.8 0 0 0 13.6 0c0-4.2-4.8-8.7-6.8-12.2Z"/><path d="M9 15.5c.2 1.3.9 2.1 2 2.4"/>',
    water:'<path d="M8 9h10v8.5a2 2 0 0 1-2 2h-6a2 2 0 0 1-2-2v-1L3 12V9l5 3m10-1h1.4a3 3 0 0 0 0-6H16l-1 4M5 8 3 6"/>',
    pen:'<path d="m14.3 5.2 4.5 4.5M3.5 20.5l4.6-1L20.6 7a1.8 1.8 0 0 0 0-2.5l-2.1-2a1.8 1.8 0 0 0-2.5 0L3.9 15.2l-.4 5.3ZM13 21h7.5"/>',
    sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M4.9 4.9l1.5 1.5m11.2 11.2 1.5 1.5m0-14.2-1.5 1.5M6.4 17.6l-1.5 1.5"/>',
    calendar:'<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M7 3v5m10-5v5M3 11h18m-13 4h1m4 0h1"/>',
    help:'<circle cx="12" cy="12" r="9.2"/><path d="M9.8 9.2a2.3 2.3 0 1 1 4.5.6c-.1 1.8-2.3 1.9-2.3 4m0 3h.01"/>',
    plus:'<path d="M12 5v14M5 12h14"/>', x:'<path d="m6 6 12 12M18 6 6 18"/>',
    'chevron-right':'<path d="m9 5 7 7-7 7"/>',
    'arrow-right':'<path d="M4 12h15m-6-6 6 6-6 6"/>',
    clipboard:'<rect x="5" y="5" width="14" height="16" rx="2"/><rect x="9" y="2.5" width="6" height="5" rx="1.5"/><path d="m8.5 14 2.1 2.1 4.8-5"/>',
    check:'<path d="m4 12 5.2 5.3L20 6.6"/>',
    sparkle:'<path d="m10 3 1.9 5.9L18 11l-6.1 2.2-1.9 5.9-2-5.9L2 11l6-2.1L10 3Zm9 12 1 2.6 2.5.9-2.5.8-1 2.7-.8-2.7-2.7-.8 2.7-.9 1-2.6Z"/>',
    search:'<circle cx="10.4" cy="10.4" r="6.2"/><path d="m15.1 15.1 5.2 5.2"/>',
    clock:'<circle cx="12" cy="12" r="9"/><path d="M12 6v6l4 2"/>',
    pot:'<path d="m5.4 12 1.8 8h9.6l1.8-8M4 9h16v3H4zM12 8c0-3.7 2.1-5.7 5.5-6-.1 3.3-2.2 5.9-5.5 6Zm-.2.5C8.8 8.8 6.7 7.2 6.3 4.3c2.6-.1 4.9 1 5.5 4.2Z"/>',
    flower:'<path d="M12 6c-2.6-5.1-8.1-1.3-5.2 3-5.6-.4-5.5 6.3 0 6-2.5 4.6 2.4 7.6 5.2 3 2.8 4.6 7.8 1.5 5.2-3 5.5.3 5.6-6.4 0-6C20 4.7 14.6.9 12 6Z"/><circle cx="12" cy="12" r="2.6"/>',
    sunleaf:'<path d="M3 18c1-5.5 6-8.8 12-8.2-.2 6.5-4.2 10.8-10.1 9.1M4 19l6-5.5M15 3v2m5.6-.1-1.4 1.4m3 3.7h-2"/><path d="M10 7a5.4 5.4 0 0 1 8.1 6"/>',
    globe:'<circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4.1" ry="9"/><path d="M3 12h18"/>',
    mountain:'<path d="M2 20 10.5 5 19 20H2Zm12-9 2.5-4.5L23 18h-4m-11.2-8.4 2.7 2 2.7-2"/>',
    ruler:'<path d="m2.5 16.5 14-14 5 5-14 14-5-5Zm5-5 2.5 2.4m1-5.9 2.6 2.4m.8-5.6 2.5 2.4"/>',
    camera:'<path d="M3 7h4l2-3h6l2 3h4v13H3z"/><circle cx="12" cy="13" r="3.5"/>',
    chart:'<path d="M4 3v17h17M7 15l4-5 4 2 5-7"/>',
    'external-link':'<path d="M14 3h7v7m0-7L11 13M9 5H4v15h15v-5"/>'
  };
  const aliases = {pencil:'pen', edit:'pen', notebookpen:'notebook', 'book-open':'book', 'plus-circle':'plus', 'bar-chart':'chart', 'line-chart':'chart', plant:'sprout', 'chevron':'chevron-right', drop:'droplet', add:'plus'};
  window.gardenIcon = (name, size = 20) => '<svg class="ui-icon" aria-hidden="true" focusable="false" width="' + Number(size) + '" height="' + Number(size) + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">' + (paths[name] || paths[aliases[name]] || paths.leaf) + '</svg>';
})();
