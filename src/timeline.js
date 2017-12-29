function motionchart() {

  var min = {
    'danceability': 1,
    'energy': 1,
    'instrumentalness': 1,
    'speechiness': 1,
    'tempo': 100,
    'valence': 1
  }

  var max = {
    'danceability': 0,
    'energy': 0,
    'instrumentalness': 0,
    'speechiness': 0,
    'tempo': 0,
    'valence': 0
  }

  var charX = 'danceability',
      charY = 'energy';

  // Chart dimensions.
  var margin = {top: 35, right: 35, bottom: 35, left: 35},
      width = 700 - margin.right,
      height = 500 - margin.top - margin.bottom;

  // Various scales. These domains make assumptions of data, naturally.
  var xScale = d3.scale.linear().domain([0, 1]).range([0, width]),
      yScale = d3.scale.linear().domain([0, 1]).range([height, 0]),
      radiusScale = d3.scale.pow().exponent(0.5).range([0, 0.5]),
      colorScale = d3.scale.category20c();

  // The x & y axes.
  var xAxis = d3.svg.axis().orient("bottom").scale(xScale).ticks(12, d3.format(",d")),
      yAxis = d3.svg.axis().scale(yScale).orient("left");

  // Create the SVG container and set the origin.
  var svg = d3.select("#timeline").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  // Add the x-axis.
  var XAxis = svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);

  // Add the y-axis.
  var YAxis = svg.append("g")
      .attr("class", "y axis")
      .call(yAxis);

  // Add an x-axis label.
  var labelX = svg.append("text")
      .attr("class", "x label")
      .attr("text-anchor", "end")
      .attr("x", width)
      .attr("y", height - 6)
      .text(charX);

  // Add a y-axis label.
  var labelY = svg.append("text")
      .attr("class", "y label")
      .attr("text-anchor", "end")
      .attr("y", 6)
      .attr("dy", ".75em")
      .attr("transform", "rotate(-90)")
      .text(charY);

  // Add the year label; the value is set on transition.
  var label = svg.append("text")
      .attr("class", "year label")
      .attr("text-anchor", "end")
      .attr("y", height - 24)
      .attr("x", width)
      .text("Year");

  var tooltip = floatingTooltip('gates_tooltip', 240);
  function showDetail(d) {
    // change outline to indicate hover state.
    d3.select(this).attr('stroke', 'black');

    var content = '<span class="name">Genre: </span><span class="value">' +
                  d.genre +
                  '</span><br/>' +
                  '<span class="name">Total number of tracks: </span><span class="value">' +
                  addCommas(d.total_count) +
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

  function hideDetail(d) {
    d3.select(this)
      .attr('stroke', function(d) { return d3.rgb(colorScale(d.genre)).darker(); })
    tooltip.hideTooltip();
  }

  // Positions the dots based on data.
  function position(dot) {
    dot .attr("cx", function(d) { return xScale(d[charX]); })
        .attr("cy", function(d) { return yScale(d[charY]); })
        .attr("r", function(d) { return radiusScale(d.total_count); })
        .style("fill", function(d) { return colorScale(d.genre); })
        .attr('stroke', function(d) { return d3.rgb(colorScale(d.genre)).darker(); })
  }

    // Defines a sort order so that the smallest dots are drawn on top.
  function order(a, b) {
    return b.total_count - a.total_count;
  }

  var mouseYear = 1960;

  // Add an overlay for the year label interaction.
  var box = label.node().getBBox();
  var overlay = svg.append("rect")
    .attr("class", "overlay")
    .attr("x", box.x)
    .attr("y", box.y)
    .attr("width", box.width)
    .attr("height", box.height);

  function initializeStats(rawData) {
    characteristics = ['total_count', 'danceability', 'energy', 'instrumentalness', 'speechiness','tempo', 'valence'];
    for (i = 0; i < characteristics.length; i++) {
      stat = characteristics[i];
      min[stat] = d3.min(rawData, function (d) { return +d[stat]; });
      max[stat] = d3.max(rawData, function (d) { return +d[stat]; });
    }
  }

  var chart = function chart(selector, rawData) {

    initializeStats(rawData);

    overlay.on("mouseover", enableInteraction);

    // Add a dot per nation. Initialize the data at 1960, and set the colors.
    var dot = svg.append("g")
        .attr("class", "dots")
      .selectAll(".dot")
        // .data(interpolateData(1960))
        .data(allData())
      .enter().append("circle")
        .attr("class", "dot")
        .style("fill", function(d) { return colorScale(d.genre); })
        .attr('stroke', function(d) { return d3.rgb(colorScale(d.genre)).darker(); })
        // .call(position)
        .sort(order)
        .on('mouseover', showDetail)
        .on('mouseout', hideDetail);

    // After the transition finishes, you can mouseover to change the year.
    function enableInteraction() {
      var yearScale = d3.scale.linear()
          .domain([1960, 2017])
          .range([box.x + 10, box.x + box.width - 10])
          .clamp(true);

      // Cancel the current transition, if any.
      // svg.transition().duration(0);

      overlay
          .on("mouseover", mouseover)
          .on("mouseout", mouseout)
          .on("mousemove", mousemove)
          .on("touchmove", mousemove);

      function mouseover() {
        label.classed("active", true);
      }

      function mouseout() {
        label.classed("active", false);
      }

      function mousemove() {
        mouseYear = yearScale.invert(d3.mouse(this)[0]);
        displayYear(yearScale.invert(d3.mouse(this)[0]));
      }
    }

    function allData() {
      return rawData.map(function(d) {
        return {
          genre: d.genre,
          total_count: d.total_count,
          energy: d.energy,
          valence: d.valence
        };
      });
    }

    // Interpolates the dataset for the given (fractional) year.
    function interpolateData(year) {
      return rawData.map(function(d) {

        var currYear = d.year;

        return {
          genre: d.genre,
          total_count: interpolateValues(d.total_count,year, currYear),
          danceability: interpolateValues(d.danceability, year,currYear),
          energy: interpolateValues(d.energy,year,currYear),
          instrumentalness: interpolateValues(d.instrumentalness, year, currYear),
          speechiness: interpolateValues(d.speechiness, year,currYear),
          tempo: interpolateValues(d.tempo, year,currYear),
          valence: interpolateValues(d.valence,year,currYear)
        };
      });
    }

    function interpolateValues(values, year, currYear) {
      if (Math.round(year) == parseInt(currYear)) {
        return values;
      }
      else return 0;
    }
    
    // Tweens the entire chart by first tweening the year, and then the data.
    // For the interpolated data, the dots and label are redrawn.
    function tweenYear() {
      var year = d3.interpolateNumber(1960, 2017);
      return function(t) { displayYear(year(t)); };
    }

    // Updates the display to show the specified year.
    function displayYear(year) {
      dot.data(interpolateData(year)).call(position).sort(order);
      label.text(Math.round(year));
    }

    function updateDisplay() {
      displayYear(mouseYear);
    }
  };

  toggleDisplay = function (axis, characteristic) {

    if (axis == 'X') {
      console.log(min[characteristic]);
      charX = characteristic;
      xScale = d3.scale.linear().domain([min[characteristic], max[characteristic]]).range([0, width]);
      xAxis = d3.svg.axis().orient("bottom").scale(xScale).ticks(12, d3.format(",d"));
    }

    else {
      charY = characteristic;
      yScale = d3.scale.linear().domain([min[characteristic], max[characteristic]]).range([height, 0]);
      yAxis = d3.svg.axis().scale(yScale).orient("left");
    }

    console.log(min[characteristic], max[characteristic]);

    // update labels
    XAxis.call(xAxis);
    YAxis.call(yAxis);
    labelX.text(charX);
    labelY.text(charY);
  }

  return chart;
};


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function setupButtons() {

  d3.select('#timelineX')
    .selectAll('.button')
    .on('click', function () {

      // Remove active class from all buttons
      d3.select('#timelineX').selectAll('.button').classed('active', false);
      // Find the button just clicked
      var button = d3.select(this);

      // Set it as the active button
      button.classed('active', true);

      // Get the id of the button
      var buttonId = button.attr('id');

      // Toggle the bubble chart based on
      // the currently clicked button.
      toggleDisplay('X', buttonId);
    });

  d3.select('#timelineY')
    .selectAll('.button')
    .on('click', function () {
      
    // Remove active class from all buttons
    d3.select('#timelineY').selectAll('.button').classed('active', false);
    // Find the button just clicked
    var button = d3.select(this);

    // Set it as the active button
    button.classed('active', true);

    // Get the id of the button
    var buttonId = button.attr('id');

    // Toggle the bubble chart based on
    // the currently clicked button.
    toggleDisplay('Y', buttonId);
  });
}

var motionchart1 = motionchart();

function display(error, data) {
  if (error) {
    console.log(error);
  }
  motionchart1('#timeline', data);
};

// Load the data.
d3.csv('data/lean.csv', display);

setupButtons();