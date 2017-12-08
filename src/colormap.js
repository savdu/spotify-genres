// var margin = {top: 35, right: 35, bottom: 35, left: 35},
//   width = 940 - margin.right,
//   height = 100 - margin.top - margin.bottom;

// var svg = d3.select("#colormap").append("svg")
//   .attr("fill", "black")
//   .attr("width", 300)
//   .attr("height", 100);










var svg = d3.select("#colormap").append("svg")
   .attr("width", "100%")
   .attr("height", 20)
    // .attr("width", width + margin.right + margin.left)



//Append a defs (for definition) element to your SVG
var defs = svg.append("defs");

//Append a linearGradient element to the defs and give it a unique id
var linearGradient = defs.append("linearGradient")
    .attr("id", "linear-gradient");
//Horizontal gradient
linearGradient
    .attr("x1", "0%")
    .attr("y1", "0%")
    .attr("x2", "100%")
    .attr("y2", "0%");

//Set the color for the start (0%)
linearGradient.append("stop") 
    .attr("offset", "0%")   
    .attr("stop-color", "red"); //light blue

//Set the color for the end (100%)
linearGradient.append("stop") 
    .attr("offset", "100%")   
    .attr("stop-color", "blue"); //dark blue




svg.append("rect")
    .attr("width", "100%")
    .attr("height", "100%")
   .style("fill", "url(#linear-gradient)");