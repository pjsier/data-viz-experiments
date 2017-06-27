// Margin convention from https://bl.ocks.org/mbostock/3019563
var margin = {top: 50, right: 10, bottom: 20, left: 10};
var width = 500 - margin.left - margin.right;
var height = 2500 - margin.top - margin.bottom;
var svg = d3.select("body")
  .append("svg")
    .attr("width", 500)
    .attr("height", 2500)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


function ready(error, geo, divvy) {
  var projection = d3.geoMercator().scale(1).translate([0,0]);
  var path = d3.geoPath().projection(projection);

  var bounds = path.bounds(geo);
  var timeScale = d3.scaleTime()
    .domain([new Date(2016, 5, 18), new Date(2016, 5, 19)])
    .range([0.3, 1.65]);
  var s = 0.95 / Math.max((bounds[1][0] - bounds[0][0]) / width, (bounds[1][1] - bounds[0][1]) / height);

  var geoG = svg.append("g").attr("class", "geo");
  timeScale.ticks(24).forEach(function(d) {
    var t = [(width - s * (bounds[1][0] + bounds[0][0])) / 2, ((height*timeScale(d)) - s * (bounds[1][1] + bounds[0][1])) / 2];
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


  var divvyG = svg.append("g").attr("class", "divvy");
  divvyG.selectAll("line")
    .data(divvy)
    .enter()
    .append("line")
      .attr("x1", function(d) { return projection([+d.from_lon, +d.from_lat])[0]; })
      .attr("x2", function(d) { return projection([+d.to_lon, +d.to_lat])[0]; })
      .attr("y1", function(d) {
        var timeStr = "2016-06-18 " + d.start_time;
        var timeObj = d3.timeParse("%Y-%m-%d %H:%M")(timeStr);
        var t = [(width - s * (bounds[1][0] + bounds[0][0])) / 2, ((height*timeScale(timeObj)) - s * (bounds[1][1] + bounds[0][1])) / 2];
        projection.scale(s).translate(t);
        return projection([+d.from_lon, +d.from_lat])[1];
      })
      .attr("y2", function(d) {
        var timeStr = "2016-06-18 " + d.end_time;
        var timeObj = d3.timeParse("%Y-%m-%d %H:%M")(timeStr);
        var t = [(width - s * (bounds[1][0] + bounds[0][0])) / 2, ((height*timeScale(timeObj)) - s * (bounds[1][1] + bounds[0][1])) / 2];
        projection.scale(s).translate(t);
        return projection([+d.to_lon, +d.to_lat])[1];
      })
      .style("stroke-width", "0.1")
      .style("stroke", "#08306b");
}

(function() {
  d3.queue()
    .defer(d3.json, "chi_wards.geojson")
    .defer(d3.csv, "divvy.csv")
    .await(ready);
})()
