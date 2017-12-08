/**
 * Sigma.js Labels Heuristics
 * ===========================
 *
 * Heuristics related to label display.
 */
import Camera from '../camera'

const DEFAULT_CELL = {
  width: 200,
  height: 150
};

const DEFAULT_CELL_POOL = 1;

exports.getLabelsToDisplay = function(
  camera,
  lastCameraState,
  cache,
  nodeOrder,
  visibleNodes,
  lastVisibleNodes,
  displayedLabels,
  params
) {

  // TODO: probable memory leak on displayed label when panning when zoomed

  const cameraState = camera.getState(),
        dimensions = camera.getDimensions();

  const centeredCamera = new Camera(dimensions);
  // centeredCamera.setState({ratio: cameraState.ratio});

// console.log(offset)
  // const oldCamera = new Camera(dimensions);
  // oldCamera.setState(lastCameraState);
  centeredCamera.setState({ratio: cameraState.ratio});

  const zooming = cameraState.ratio < lastCameraState.ratio,
        panning = cameraState.x !== lastCameraState.x || cameraState.y !== lastCameraState.x,
        unzooming = cameraState.ratio > lastCameraState.ratio,
        unzoomedPanning = !zooming && !unzooming && cameraState.ratio >= 1;

  // If we are panning while unzoomed, we shouldn't change label selection
  if (unzoomedPanning && displayedLabels.size !== 0)
    return Array.from(displayedLabels);

  // Adapting the cellWidth
  let cellWidthRemainder = dimensions.width % DEFAULT_CELL.width,
      cellWidth = (
        DEFAULT_CELL.width +
        (cellWidthRemainder / Math.floor(dimensions.width / DEFAULT_CELL.width))
      );

  let cellHeightRemainder = dimensions.height % DEFAULT_CELL.height,
      cellHeight = (
        DEFAULT_CELL.height +
        (cellWidthRemainder / Math.floor(dimensions.height / DEFAULT_CELL.height))
      );

  // Building the grid
  const grid = {};

  const worthyBuckets = new Set();
  const worthyLabels = (zooming || (panning && !unzooming)) ? Array.from(displayedLabels) : [];

  for (let i = 0, l = visibleNodes.length; i < l; i++) {
    const node = visibleNodes[i],
          data = cache[node];

    let pos = camera.graphToDisplay(data.x, data.y);

    const centeredPos = centeredCamera.graphToDisplay(data.x, data.y);

    if (panning && !unzooming && !zooming)
      pos = centeredPos;

    if (data.label === 'Region Polaire')
      console.log(pos, centeredPos);

    // Filtering out-of-view nodes (quadtree quirk)
    // TODO: this should probably be done by quadtree beforehand?
    // if (
    //   (pos.x < 0 || pos.x > dimensions.width) ||
    //   (pos.y < 0 || pos.y > dimensions.height)
    // )
    //   continue;

    // TODO: filter negative buckets and further than required
    const x = Math.floor(pos.x / cellWidth) % ((panning && !unzooming && !zooming) ? 1 : cellWidth),
          y = Math.floor(pos.y / cellHeight) % ((panning && !unzooming && !zooming) ? 1 : cellHeight);
if (data.label === 'Region Polaire')
      console.log(x, y);
    const key = x + ';' + y;

    let bucket = grid[key];

    if (unzooming && worthyBuckets.has(key)) {
      if (!displayedLabels.has(node))
        continue;

      const championData = cache[bucket[0]];

      if (championData.label === 'Region Polaire' || data.label === 'Region Polaire') {
        console.log(championData.label, championData.size, data.label, data.size);
      }

      if (data.size > championData.size) {
        bucket[0] = node;
      }

      if (data.size === championData.size) {
        const challengerOrder = nodeOrder[node],
              championOrder = nodeOrder[bucket[0]];

        if (challengerOrder < championOrder)
          bucket[0] = node;
      }

      continue;
    }

    if (typeof bucket === 'undefined') {
      bucket = [];
      grid[key] = bucket;
    }

    if (displayedLabels.has(node))
      worthyBuckets.add(key);

    bucket.push(node);
  }

  // Selecting worthy labels
  for (const key in grid) {
    const bucket = grid[key];

    if ((zooming || (panning && !unzooming)) && worthyBuckets.has(key))
      continue;

    // TODO: if we keep the only 1 label per cell, we don't need sorting
    // it's just a matter of keeping the max above
    bucket.sort(function(a, b) {
      // const aDisplayed = displayedLabels.has(a),
      //       bDisplayed = displayedLabels.has(b);

      const aData = cache[a],
            bData = cache[b];

      // if (aDisplayed < bDisplayed)
      //   return -1;

      // if (aDisplayed > bDisplayed)
      //   return 1;

      if (aData.size < bData.size)
        return 1;

      if (aData.size > bData.size)
        return -1;

      const aOrder = nodeOrder[a],
            bOrder = nodeOrder[b];

      if (aOrder < bOrder)
        return 1;

      if (aOrder > bOrder)
        return -1;

      return 0;
    });

    let i = 0,
        l = bucket.length;

    while (i < DEFAULT_CELL_POOL && i < l) {
      const node = bucket[i];

      worthyLabels.push(node);
      i++;
    }
  }

  return worthyLabels;
};
