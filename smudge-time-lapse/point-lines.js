// Margin convention from https://bl.ocks.org/mbostock/3019563
var margin = {top: 20, right: 0, bottom: 0, left: 0};
var width = 3600 - margin.left - margin.right;
var height = 650 - margin.top - margin.bottom;
var svg = d3.select("body")
  .append("svg")
    .attr("width", 3600)
    .attr("height", 650)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


function ready(error, geo, reqs) {
  var projection = d3.geoMercator().scale(1).translate([0,0]);
  var path = d3.geoPath().projection(projection);

  var bounds = path.bounds(geo);
  var timeScale = d3.scaleTime()
    .domain([new Date(2016, 0, 1), new Date(2017, 0, 1)])
    .range([0.2, 1.8]);
  var s = 1 / Math.max((bounds[1][0] - bounds[0][0]) / width, (bounds[1][1] - bounds[0][1]) / height);

  var geoG = svg.append("g").attr("class", "geo");
  timeScale.ticks(40).forEach(function(d) {
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

  reqs = reqs.filter(function(d) {
    var startDate = new Date(2016, 0, 1);
    var endDate = new Date(2017, 0, 1);
    var createDate = d3.timeParse("%m/%d/%Y")(d.create_date);
    var completeDate = d3.timeParse("%m/%d/%Y")(d.complete_date);
    return createDate >= startDate && createDate <= endDate && completeDate >= startDate && completeDate <= endDate;
  });
  var reqG = svg.append("g").attr("class", "reqs");
  reqG.selectAll("line")
    .data(reqs)
    .enter()
    .append("line")
      .attr("x1", function(d) {
        var timeObj = d3.timeParse("%m/%d/%Y")(d.create_date);
        var t = [((width*timeScale(timeObj)) - s * (bounds[1][0] + bounds[0][0])) / 2, (height - s * (bounds[1][1] + bounds[0][1])) / 2];
        projection.scale(s).translate(t);
        return projection([+d.lon, +d.lat])[0];
      })
      .attr("x2", function(d) {
        var timeObj = d3.timeParse("%m/%d/%Y")(d.complete_date);
        var t = [((width*timeScale(timeObj)) - s * (bounds[1][0] + bounds[0][0])) / 2, (height - s * (bounds[1][1] + bounds[0][1])) / 2];
        projection.scale(s).translate(t);
        return projection([+d.lon, +d.lat])[0];
      })
      .attr("y1", function(d) { return projection([+d.lon, +d.lat])[1]; })
      .attr("y2", function(d) { return projection([+d.lon, +d.lat])[1]; })
      .style("stroke-width", "0.05")
      .style("stroke", "#08306b");
}

(function() {
  d3.queue()
    .defer(d3.json, "chi_wards.geojson")
    .defer(d3.csv, "potholes.csv")
    .await(ready);
})()
