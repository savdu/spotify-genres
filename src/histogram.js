function histogram() {

    var chart = function chart(selector, rawData) {
        data = getCharData(rawData, 'danceability');

        // A formatter for counts.
        var formatCount = d3.format(",.0f");

        var margin = {top: 20, right: 30, bottom: 30, left: 30},
        width = 960 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;

        var max = d3.max(data);
        var min = d3.min(data);
        var x = d3.scale.linear()
        .domain([min, max])
        .range([0, width]);

        // Generate a histogram using twenty uniformly-spaced bins.
        var data = d3.layout.histogram()
        .bins(x.ticks(20))
        (data);

        var yMax = d3.max(data, function(d){return d.length});
        var yMin = d3.min(data, function(d){return d.length});
        var colorScale = d3.scale.linear()
        .domain([yMin, yMax])
        .range([d3.rgb(color).brighter(), d3.rgb(color).darker()]);

        var y = d3.scale.linear()
        .domain([0, yMax])
        .range([height, 0]);

        var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom");

        var svg = d3.select("body").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        var bar = svg.selectAll(".bar")
        .data(data)
        .enter().append("g")
        .attr("class", "bar")
        .attr("transform", function(d) { return "translate(" + x(d.x) + "," + y(d.y) + ")"; });

        bar.append("rect")
        .attr("x", 1)
        .attr("width", (x(data[0].dx) - x(0)) - 1)
        .attr("height", function(d) { return height - y(d.y); })
        .attr("fill", function(d) { return colorScale(d.y) });

        bar.append("text")
        .attr("dy", ".75em")
        .attr("y", -12)
        .attr("x", (x(data[0].dx) - x(0)) / 2)
        .attr("text-anchor", "middle")
        .text(function(d) { return formatCount(d.y); });

        svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);
    }

return chart;
}


// var allHistogram = histogram();


// var color = "steelblue";

// // Generate a 1000 data points using normal distribution with mean=20, deviation=5
// // var values = d3.range(1000).map(d3.random.normal(20, 5));
// // console.log(values);
// var data = d3.csv('data/track-stats-genre.csv', display);

// function display(error, data) {
//   if (error) {
//     console.log(error);
// }
//   // values=[];
//   // data.forEach(function(d) {
//   //   values.push(parseFloat(d.instrumentalness));
//   // });

//   // values = getCharData(data, 'danceability');
//   // allHistogram('#dist', values);
//   allHistogram('#dist', data);
// }

// function getCharData(data, characteristic) {
//     values=[];

//     data.forEach(function(d) {
//         values.push(parseFloat(d[characteristic]));
//     });

//     return values;
// }

// function setupButtons() {

//   d3.select('#toolbar')
//   .selectAll('.button')
//   .on('click', function () {

//       var button = d3.select(this);

//       // Get the id of the button
//       var buttonId = button.attr('id');

//       // Toggle the bubble chart based on
//       // the currently clicked button.
//       // myBubbleChart.toggleDisplay(buttonId);
//       console.log(buttonId);
//   });
// }

// setupButtons();