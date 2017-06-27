// Margin convention from https://bl.ocks.org/mbostock/3019563
var margin = {top: 50, right: 10, bottom: 20, left: 10};
var width = 1500 - margin.left - margin.right;
var height = 650 - margin.top - margin.bottom;
var svg = d3.select("body")
  .append("svg")
    .attr("width", 1500)
    .attr("height", 650)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


function ready(error, geo, reqs) {
  var projection = d3.geoMercator().scale(1).translate([0,0]);
  var path = d3.geoPath().projection(projection);

  var bounds = path.bounds(geo);
  var timeScale = d3.scaleTime()
    .domain([new Date(2016, 0, 1), new Date(2017, 0, 1)])
    .range([0.3, 1.65]);
  var s = 0.95 / Math.max((bounds[1][0] - bounds[0][0]) / width, (bounds[1][1] - bounds[0][1]) / height);

  var geoG = svg.append("g").attr("class", "geo");
  timeScale.ticks(20).forEach(function(d) {
    var t = [((width*timeScale(d)) - s * (bounds[1][0] + bounds[0][0])) / 2, (height - s * (bounds[1][1] + bounds[0][1])) / 2];
    projection.scale(s).translate(t);
    geoG.append("g").selectAll("path")
      .data(geo.features, function(d) { return d.properties.ward; })
      .enter()
      .append("path")
        .attr("fill", "#aaaaaa")
        .attr("stroke", "#aaaaaa")
        .attr("stroke-width", 2)
        .attr("d", path);
  });


  var reqG = svg.append("g").attr("class", "reqs");
  reqG.selectAll("circle")
    .data(reqs)
    .enter()
    .append("circle")
      .attr("r", 1)
      .attr("cx", function(d) {
        var timeObj = d3.timeParse("%m/%d/%Y")(d.create_date);
        var t = [((width*timeScale(timeObj)) - s * (bounds[1][0] + bounds[0][0])) / 2, (height - s * (bounds[1][1] + bounds[0][1])) / 2];
        projection.scale(s).translate(t);
        return projection([+d.lon, +d.lat])[0];
      })
      .attr("cy", function(d) { return projection([+d.lon, +d.lat])[1]; })
      .style("fill", "#08306b")
      .style("opacity", 0.3);
}

(function() {
  d3.queue()
    .defer(d3.json, "chi_wards.geojson")
    .defer(d3.csv, "potholes.csv")
    .await(ready);
})()
