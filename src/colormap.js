var width = 700,
    height = 30,
    divisions = 700;

var newData = [];
var sectionWidth = Math.floor(width / divisions);

for (var i=0; i < width; i+= sectionWidth ) {
    newData.push(i);
}

var colorScaleLin = d3.scale.linear()
      .domain([0, newData.length-1])
      .interpolate(d3.interpolateLab)
      .range(['yellow', 'blue']);

var colorScalePow = d3.scale.pow().exponent(.6)
      .domain([0, newData.length-1])
      .interpolate(d3.interpolateLab)
      .range(['yellow', 'blue']);

function erf(x) {
    // constants
    var a1 =  0.254829592;
    var a2 = -0.284496736;
    var a3 =  1.421413741;
    var a4 = -1.453152027;
    var a5 =  1.061405429;
    var p  =  0.3275911;

    // Save the sign of x
    var sign = 1;
    if (x < 0) {
        sign = -1;
    }
    x = Math.abs(x);

    // A&S formula 7.1.26
    var t = 1.0/(1.0 + p*x);
    var y = 1.0 - (((((a5*t + a4)*t) + a3)*t + a2)*t + a1)*t*Math.exp(-x*x);

    return sign*y;
}

////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////


var vis = d3.select("#colormap")
    .append("svg")
        .attr("width", width)
        .attr("height", height);

vis.selectAll('rect')
    .data(newData)
    .enter()
    .append('rect')
        .attr("x", function(d) { return d; })
        .attr("y", 0)
        .attr("height", height)
        .attr("width", sectionWidth)
        .attr('fill', function(d, i) { return colorScaleLin(i)})
        .text('linear');
vis.append("text")
  .attr("class", "x axis")
  .style("font-family", "Work sans")
  .attr("x", width * 9 / 10)
  .attr("y", height / 2)
  .attr("dy", ".35em")
  .text("linear")
  .style("fill", "white");


////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////


// var vis2 = d3.select("#colormap")
//     .append("svg")
//         .attr("width", width)
//         .attr("height", height);

// vis2.selectAll('rect')
//     .data(newData)
//     .enter()
//     .append('rect')
//         .attr("x", function(d) { return d; })
//         .attr("y", 0)
//         .attr("height", height)
//         .attr("width", sectionWidth)
//         .attr('fill', function(d, i) { return colorScalePow(i)});


////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////

var mu = 0.5,
    sig = 0.25;
    
var vis3 = d3.select("#colormap")
    .append("svg")
        .attr("width", width)
        .attr("height", height);

vis3.selectAll('rect')
    .data(newData)
    .enter()
    .append('rect')
        .attr("x", function(d) {return d; })
        .attr("y", 0)
        .attr("height", height)
        .attr("width", sectionWidth)
        .attr('fill', function(d, i) {

          // scale to [0, 1]
          i /= divisions;
          i = 0.5 * (1 + erf((i - mu) / (sig * Math.sqrt(2))));          

          // // scale to [0, 1]
          // i /= divisions;

          // if (i <= 0.5) i = 2 * i*i;
          // else i = (2-Math.sqrt(2))*i*i+(-1+Math.sqrt(2));

          return d3.interpolateLab("yellow", "blue")(i);
        });

vis3.append("text")
  .style("fill", "white")
  .style("font-family", "Work sans")
  .attr("x", width * 9 / 10)
  .attr("y", height / 2)
  .attr("dy", ".35em")
  .text("nonlinear")

setupButtons();