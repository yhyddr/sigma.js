/**
 * Sigma.js Labels Heuristics
 * ===========================
 *
 * Heuristics related to label display.
 */
const DEFAULT_CELL = {
  width: 200,
  height: 150
};

const DEFAULT_CELL_POOL = 1;

exports.getLabelsToDisplay = function(
  camera,
  lastCameraState,
  cache,
  visibleNodes,
  displayedLabels,
  params
) {

  const cameraState = camera.getState();

  const zooming = cameraState.ratio < lastCameraState.ratio,
        unzooming = cameraState.ratio > lastCameraState.ratio,
        panning = !zooming && !unzooming;

  // If we are panning, we shouldn't change label selection
  if (panning && displayedLabels.size !== 0)
    return Array.from(displayedLabels);

  const cell = DEFAULT_CELL;

  // Building the grid
  const grid = {};

  const worthyBuckets = new Set();

  for (let i = 0, l = visibleNodes.length; i < l; i++) {
    const node = visibleNodes[i],
          data = cache[node];

    const pos = camera.graphToDisplay(data.x, data.y);

    const x = Math.floor(pos.x / cell.width),
          y = Math.floor(pos.y / cell.height);

    const key = x + ';' + y;

    let bucket = grid[key];

    if (typeof bucket === 'undefined') {
      bucket = [];
      grid[key] = bucket;
    }

    bucket.push(node);

    if (zooming && displayedLabels.has(node))
      worthyBuckets.add(bucket);
  }

  // Selecting worthy labels
  const worthyLabels = zooming ? Array.from(displayedLabels) : [];

  for (const key in grid) {
    const bucket = grid[key];

    if (worthyBuckets.has(bucket))
      continue;

    bucket.sort(function(a, b) {
      a = cache[a];
      b = cache[b];

      if (a.size < b.size)
        return 1;

      if (a.size > b.size)
        return -1;

      return 0;
    });

    let i = 0,
        l = bucket.length;

    while (i < DEFAULT_CELL_POOL && i < l) {

      if (unzooming && !displayedLabels.has(bucket[i])) {
        i++;
        continue;
      }

      worthyLabels.push(bucket[i]);
      i++;
    }
  }

  return worthyLabels;
};
