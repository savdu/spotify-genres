
/* bubbleChart creation function. Returns a function that will
 * instantiate a new bubble chart given a DOM element to display
 * it in and a dataset to visualize.
 *
 * Organization and style inspired by:
 * https://bost.ocks.org/mike/chart/
 *
 */

function bubbleChart() {
  // Constants for sizing
  var width = 800;
  var height = 450;

  var colormap = 'nonlinear'

  // tooltip for mouseover functionality
  var tooltip = floatingTooltip('gates_tooltip', 240);

  // Locations to move bubbles towards, depending
  // on which view mode is selected.
  var center = { x: width / 2, y: height / 2 };

  var bounds = {
    left: { x: width / 3, y: height / 2 },
    right: { x: 2 * width / 3, y: height / 2 }
  }

  var labelsX = {
    'Low': width / 7,
    'High': 6 * width / 7
  }

  // Used when setting up force and
  // moving around nodes
  var damper = 0.102;

  // These will be set in create_nodes and create_vis
  var svg = null;
  var bubbles = null;
  var nodes = [];

  var min = {
    'total_count': 100,
    'danceability': 1,
    'energy': 1,
    'instrumentalness': 1,
    'speechiness': 1,
    'tempo': 100,
    'valence': 1
  }

  var max = {
    'total_count': 0,
    'danceability': 0,
    'energy': 0,
    'instrumentalness': 0,
    'speechiness': 0,
    'tempo': 0,
    'valence': 0
  }

  var color = 'danceability';

  var rgb = {
    'r': 'danceability',
    'g': 'energy',
    'b': 'instrumentalness'
  }

  // Charge function that is called for each node.
  // Charge is proportional to the diameter of the
  // circle (which is stored in the radius attribute
  // of the circle's associated data.
  // This is done to allow for accurate collision
  // detection with nodes of different sizes.
  // Charge is negative because we want nodes to repel.
  // Dividing by 8 scales down the charge to be
  // appropriate for the visualization dimensions.
  function charge(d) {
    return -Math.pow(d.radius, 2.0) / 8;
  }

  // Here we create a force layout and
  // configure it to use the charge function
  // from above. This also sets some contants
  // to specify how the force layout should behave.
  // More configuration is done below.
  var force = d3.layout.force()
    .size([width, height])
    .charge(charge)
    .gravity(-0.01)
    .friction(0.9);

  var colorScale = d3.scale.category10();

  function colormapping(d) {

    // scale data 0 to 1
    scale = ((d[color] - min[color]) / (max[color] - min[color]));

    // normalize left skewed
    if ((color == 'instrumentalness') || (color == 'speechiness')) {
      scale = Math.pow(scale, 1/3);
      newMin = Math.pow(min[color], 1/3);
      newMax = Math.pow(max[color], 1/3);
      scale = ((scale - newMin) / (newMax - newMin));
    }

    // normalize right skewed
    if ((color == 'danceability') || (color == 'energy')) {
      scale = scale * scale;
      newMin = min[color] * min[color];
      newMax = max[color] * max[color];
      scale = ((scale - newMin) / (newMax - newMin));
    }

    if (colormap == 'nonlinear') {
      // nonlinear mapping for normally distributed
      mu = 0.5; sig = 0.25;
      scale = 0.5 * (1 + erf((scale - mu) / (sig * Math.sqrt(2))));          
    }

    // if (scale <= 0.5) scale = 2 * scale*scale;
    // else scale = (2-Math.sqrt(2))*scale*scale+(-1+Math.sqrt(2));

    // console.log(scale);
    return d3.interpolateLab("yellow", "blue")(scale);
  }

  // Sizes bubbles based on their area instead of raw radius
  var radiusScale = d3.scale.pow()
    .exponent(0.5)
    .range([2, 30]);

  /*
   * This data manipulation function takes the raw data from
   * the CSV file and converts it into an array of node objects.
   * Each node will store data and visualization values to visualize
   * a bubble.
   *
   * rawData is expected to be an array of data objects, read in from
   * one of d3's loading functions like d3.csv.
   *
   * This function returns the new node array, with a node in that
   * array for each element in the rawData input.
   */

  function initializeStats(rawData) {
    // initialize stats
    characteristics = ['total_count', 'danceability', 'energy', 'instrumentalness', 'speechiness','tempo', 'valence'];
    for (i = 0; i < characteristics.length; i++) {
      stat = characteristics[i];
      min[stat] = d3.min(rawData, function (d) { return +d[stat]; });
      max[stat] = d3.max(rawData, function (d) { return +d[stat]; });
    }
  }

  function createNodes(rawData) {

    var myNodes = rawData.map(function (d) {
      return {
        id: d.genre,
        radius: radiusScale(+d.total_count),
        total_count: d.total_count,
        value: d.total_count,
        name: d.genre,
        danceability: d.danceability,
        energy: d.energy,
        instrumentalness: d.instrumentalness,
        speechiness: d.speechiness,
        tempo: d.tempo,
        valence: d.valence,
        x: Math.random() * 900,
        y: Math.random() * 800
      };
    });

    // sort them to prevent occlusion of smaller nodes.
    myNodes.sort(function (a, b) { return b.value - a.value; });

    return myNodes;
  }

  /*
   * Main entry point to the bubble chart. This function is returned
   * by the parent closure. It prepares the rawData for visualization
   * and adds an svg element to the provided selector and starts the
   * visualization creation process.
   *
   * selector is expected to be a DOM element or CSS selector that
   * points to the parent element of the bubble chart. Inside this
   * element, the code will add the SVG continer for the visualization.
   *
   * rawData is expected to be an array of data objects as provided by
   * a d3 loading function like d3.csv.
   */
  var chart = function chart(selector, rawData) {

    // Use the max total_amount in the data as the max in the scale's domain
    // note we have to ensure the total_amount is a number by converting it
    // with `+`.
    // var maxAmount = d3.max(rawData, function (d) { return +d.total_amount; });
    initializeStats(rawData);

    radiusScale.domain([0, max['total_count']]);
    nodes = createNodes(rawData);
    // Set the force's nodes to our newly created nodes array.
    force.nodes(nodes);

    // Create a SVG element inside the provided selector
    // with desired size.
    svg = d3.select(selector)
      .append('svg')
      .attr('width', width)
      .attr('height', height);

    // Bind nodes data to what will become DOM elements to represent them.
    bubbles = svg.selectAll('.bubble')
      .data(nodes, function (d) { return d.id; });

    // Create new circle elements each with class `bubble`.
    // There will be one circle.bubble for each object in the nodes array.
    // Initially, their radius (r attribute) will be 0.
    bubbles.enter().append('circle')
      .classed('bubble', true)
      .attr('r', 0)

      .attr('fill', function (d) { return colormapping(d); })
      .attr('stroke', function (d) { return d3.rgb(colormapping(d)).darker(); })

      .attr('stroke-width', 2)
      .on('mouseover', showDetail)
      .on('mouseout', hideDetail);

    // Fancy transition to make bubbles appear, ending with the
    // correct radius
    bubbles.transition()
      .duration(2000)
      .attr('r', function (d) { return d.radius; });

    // Set initial layout to single group.
    groupBubbles();
  };

  /*
   * Sets visualization in "single group mode".
   * The year labels are hidden and the force layout
   * tick function is set to move all nodes to the
   * center of the visualization.
   */
  function groupBubbles() {
    hideLabels();

    force.on('tick', function (e) {
      bubbles.each(moveToCenter(e.alpha))
        .attr('cx', function (d) { return d.x; })
        .attr('cy', function (d) { return d.y; });
    });

    force.start();
  }

  /*
   * Helper function for "single group mode".
   * Returns a function that takes the data for a
   * single node and adjusts the position values
   * of that node to move it toward the center of
   * the visualization.
   *
   * Positioning is adjusted by the force layout's
   * alpha parameter which gets smaller and smaller as
   * the force layout runs. This makes the impact of
   * this moving get reduced as each node gets closer to
   * its destination, and so allows other forces like the
   * node's charge force to also impact final location.
   */
  function moveToCenter(alpha) {
    return function (d) {
      d.x = d.x + (center.x - d.x) * damper * alpha;
      d.y = d.y + (center.y - d.y) * damper * alpha;
    };
  }

  /*
   * Hides Year title displays.
   */
  function hideLabels() {
    svg.selectAll('.labels').remove();
  }

  /*
   * Shows Low and High labels.
   */
   function showLabels() {
    var labelsData = d3.keys(labelsX);
    var years = svg.selectAll('.labels')
      .data(labelsData);

    years.enter().append('text')
      .attr('class', 'year')
      .attr('x', function (d) { return labelsX[d]; })
      .attr('y', 40)
      .attr('text-anchor', 'middle')
      .text(function (d) { return d; });
   }

  function alignBubbles(characteristic) {
    showLabels();

    force.on('tick', function (e) {
      bubbles.each(moveToTimeline(e.alpha, characteristic))
        .attr('cx', function (d) { return d.x; })
        .attr('cy', function (d) { return d.y; });
    });

    force.start();
  }

  function moveToTimeline(alpha, characteristic) {
    return function (d) {
      scale = (d[characteristic] - min[characteristic]) / (max[characteristic] - min[characteristic]);
      left = bounds.left.x + scale * (bounds.right.x - bounds.left.x);
      d.x = d.x + (left - d.x) * damper * alpha * 1.1;
      d.y = d.y + (bounds.right.y - d.y) * damper * alpha * 1.1;
    };
  }

  /*
   * Function called on mouseover to display the
   * details of a bubble in the tooltip.
   */
  function showDetail(d) {
    // change outline to indicate hover state.
    d3.select(this).attr('stroke', 'black');

    var content = '<span class="name">Genre: </span><span class="value">' +
                  d.name +
                  '</span><br/>' +
                  '<span class="name">Total number of tracks: </span><span class="value">' +
                  addCommas(d.value) +
                  '</span><br/>' +
                  '<span class="name">Danceability: </span><span class="value">' +
                  d3.format(".2f")(d.danceability) +
                  '</span><br/>' +
                  '<span class="name">Energy: </span><span class="value">' +
                  d3.format(".2f")(d.energy) +
                  '</span><br/>' +
                  '<span class="name">Instrumentalness: </span><span class="value">' +
                  d3.format(".2f")(d.instrumentalness) +
                  '</span><br/>' +
                  '<span class="name">Speechiness: </span><span class="value">' +
                  d3.format(".2f")(d.speechiness) +
                  '</span><br/>' +
                  '<span class="name">Tempo: </span><span class="value">' +
                  d3.format(".3g")(d.tempo) +
                  '</span><br/>' +
                  '<span class="name">Valence: </span><span class="value">' +
                  d3.format(".2f")(d.valence) +
                  '</span>';
    tooltip.showTooltip(content, d3.event);
  }

  /*
   * Hides tooltip
   */
  function hideDetail(d) {
    // reset outline
    d3.select(this)
      .attr('stroke', d3.rgb(colormapping(d)).darker());

    tooltip.hideTooltip();
  }

  /*
   * Externally accessible function (this is attached to the
   * returned chart function). Allows the visualization to toggle
   * between "single group" and "split by year" modes.
   *
   * displayName is expected to be a string and either 'year' or 'all'.
   */
  chart.toggleDisplay = function (displayName) {
    if (displayName === 'circle') {
      groupBubbles();
    }
    else
      alignBubbles(displayName);
  };

  chart.updateColor = function(characteristic) {
    // rgb[color] = characteristic;
    color = characteristic;

    bubbles
      .attr('fill', function (d) { return colormapping(d); })
      .attr('stroke', function (d) { return d3.rgb(colormapping(d)).darker(); })
  }

  chart.updateColorMapping = function(mapping) {
    colormap = mapping;

    bubbles
      .attr('fill', function (d) { return colormapping(d); })
      .attr('stroke', function (d) { return d3.rgb(colormapping(d)).darker(); })
  }

  // return the chart function from closure.
  return chart;
}

/*
 * Below is the initialization code as well as some helper functions
 * to create a new bubble chart instance, load the data, and display it.
 */

var myBubbleChart = bubbleChart();

/*
 * Function called once data is loaded from CSV.
 * Calls bubble chart function to display inside #vis div.
 */
function display(error, data) {
  if (error) {
    console.log(error);
  }

  myBubbleChart('#vis', data);
}

/*
 * Sets up the layout buttons to allow for toggling between view modes.
 */
function setupButtons() {

  d3.select('#toolbar')
    .selectAll('.button')
    .on('click', function () {

      // Remove active class from all buttons
      d3.select('#toolbar').selectAll('.button').classed('active', false);
      // Find the button just clicked
      var button = d3.select(this);

      // Set it as the active button
      button.classed('active', true);

      // Get the id of the button
      var buttonId = button.attr('id');

      // Toggle the bubble chart based on
      // the currently clicked button.
      myBubbleChart.toggleDisplay(buttonId);
    });

    d3.select('#color')
    .selectAll('.button')
    .on('click', function () {
      
      // Remove active class from all buttons
      d3.select('#color').selectAll('.button').classed('active', false);
      // Find the button just clicked
      var button = d3.select(this);

      // Set it as the active button
      button.classed('active', true);

      // Get the id of the button
      var buttonId = button.attr('id');

      // Toggle the bubble chart based on
      // the currently clicked button.
      myBubbleChart.updateColor(buttonId);
    });
    d3.select('#colormapping')
    .selectAll('.button')
    .on('click', function () {
      
      // Remove active class from all buttons
      d3.select('#colormapping').selectAll('.button').classed('active', false);
      // Find the button just clicked
      var button = d3.select(this);

      // Set it as the active button
      button.classed('active', true);

      // Get the id of the button
      var buttonId = button.attr('id');

      // Toggle the bubble chart based on
      // the currently clicked button.
      myBubbleChart.updateColorMapping(buttonId);
    });

}

/*
 * Helper function to convert a number into a string
 * and add commas to it to improve presentation.
 */
function addCommas(nStr) {
  nStr += '';
  var x = nStr.split('.');
  var x1 = x[0];
  var x2 = x.length > 1 ? '.' + x[1] : '';
  var rgx = /(\d+)(\d{3})/;
  while (rgx.test(x1)) {
    x1 = x1.replace(rgx, '$1' + ',' + '$2');
  }

  return x1 + x2;
}

// Load the data.
d3.csv('data/lean1.csv', display);

// setup the buttons.
setupButtons();