// Margin convention from https://bl.ocks.org/mbostock/3019563
var margin = {top: 50, right: 10, bottom: 20, left: 10};
var width = 500 - margin.left - margin.right;
var height = 650 - margin.top - margin.bottom;
var svg = d3.select("body")
  .append("svg")
    .attr("width", 500)
    .attr("height", 650)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var projection, path, hexbin;

function ready(error, reqs) {
  // var treeItems = reqs.filter

  var treeHexbin = d3.hexbin()
    .size([width, height])
    .radius(10);
  // var sanitationHexbin = d3.hexbin()
  //   .size([width, height]);
  //   .radius(12);
  var potholeHexbin = d3.hexbin()
    .size([width, height])
    .radius(8);
  var graffitiHexbin = d3.hexbin()
    .size([width, height])
    .radius(6);

  reqs.forEach(function(d) {
    var p = projection([+d.lon, +d.lat]);
    d[0] = p[0], d[1] = p[1];
  });

  var treeReqs = reqs.filter(function(d) { return d.category === "tree_debris"; });
  var sanitationReqs = reqs.filter(function(d) { return d.category === "sanitation"; });
  var potholeReqs = reqs.filter(function(d) { return d.category === "pot_holes"; });
  var graffitiReqs = reqs.filter(function(d) { return d.category === "graffiti"; });

  // var radScale = d3.scaleLinear()
  //   .domain([sanitationReqs.length, graffitiReqs.length])
  //   .range([14, 6]);
  //
  // treeHexbin.radius(radScale(treeReqs.length));
  // sanitationHexbin.radius(radScale(sanitationReqs.length));
  // potholeHexbin.radius(radScale(potholeReqs.length));
  // graffitiHexbin.radius(radScale(graffitiReqs.length));

  var treeData = treeHexbin(treeReqs)
    .sort(function(a, b) { return b.length - a.length; });
  var treeRadius = d3.scaleSqrt()
      .domain([0, treeData[0].length])
      .range([0, 5]);

  // var sanitationData = sanitationHexbin(sanitationReqs)
  //   .sort(function(a, b) { return b.length - a.length; });
  // var sanitationRadius = d3.scaleSqrt()
  //   .domain([0, sanitationData[0].length])
  //   .range([0, 5]);

  var potholeData = potholeHexbin(potholeReqs)
    .sort(function(a, b) { return b.length - a.length; });
  var potholeRadius = d3.scaleSqrt()
    .domain([0, potholeData[0].length])
    .range([0, 5]);

  var graffitiData = graffitiHexbin(graffitiReqs)
    .sort(function(a, b) { return b.length - a.length; });
  var graffitiRadius = d3.scaleSqrt()
    .domain([0, graffitiData[0].length])
    .range([0, 5]);

  var treeFeature = svg.append("g")
    .selectAll("circle")
      .data(treeData)
    .enter().append("circle")
      .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })
      // .attr("fill", "#4daf4a")
      // .attr("fill", "#377eb8")
      .attr("fill", "#e7298a")
      .style("opacity", 0.6)
      .attr("r", function(d) { return treeRadius(d.length); });

  // var sanitationFeature = svg.append("g")
  //   .selectAll("circle")
  //     .data(sanitationData)
  //   .enter().append("circle")
  //     .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })
  //     .attr("fill", "#377eb8")
  //     .style("opacity", 0.6)
  //     .attr("r", function(d) { return sanitationRadius(d.length); });

  var potholeFeature = svg.append("g")
    .selectAll("circle")
      .data(potholeData)
    .enter().append("circle")
      .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })
      // .attr("fill", "#984ea3")
      .attr("fill", "#7570b3")
      .style("opacity", 0.6)
      .attr("r", function(d) { return potholeRadius(d.length); });

  var graffitiFeature = svg.append("g")
    .selectAll("circle")
      .data(graffitiData)
    .enter().append("circle")
      .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })
      // .attr("fill", "#e41a1c")
      .attr("fill", "#1b9e77")
      .style("opacity", 0.6)
      .attr("r", function(d) { return graffitiRadius(d.length); });
}

(function() {
  // Potentially mess around with projections?
  projection = d3.geoMercator()
    .scale(62716.64304560785)
    .translate([96272.44234516108, 50809.62911496658]);
  path = d3.geoPath().projection(projection);

  d3.queue()
    .defer(d3.csv, "data/311_calls.csv")
    .await(ready);
})()
