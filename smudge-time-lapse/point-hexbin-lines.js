// Margin convention from https://bl.ocks.org/mbostock/3019563
var margin = {top: 20, right: 0, bottom: 0, left: 0};
var width = 4000 - margin.left - margin.right;
var height = 500 - margin.top - margin.bottom;
var svg = d3.select("body")
  .append("svg")
    .attr("width", 4000)
    .attr("height", 500)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


function ready(error, geo, reqs) {
  var projection = d3.geoMercator().scale(1).translate([0,0]);
  var path = d3.geoPath().projection(projection);

  var bounds = path.bounds(geo);
  var timeScale = d3.scaleTime()
    .domain([new Date(2016, 0, 1), new Date(2016, 11, 1)])
    .range([0.12, 1.9]);
  var s = 1 / Math.max((bounds[1][0] - bounds[0][0]) / width, (bounds[1][1] - bounds[0][1]) / height);

  var geoG = svg.append("g").attr("class", "geo");
  timeScale.ticks(12).forEach(function(d) {
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

  var hexbin = d3.hexbin()
    .size([width, height])
    .radius(30);

  var lineG = svg.append("g").attr("class", "lines");

  reqs = reqs.filter(function(d) {
    var startDate = new Date(2016, 0, 1);
    var endDate = new Date(2017, 0, 1);
    var createDate = d3.timeParse("%m/%d/%Y")(d.create_date);
    var completeDate = d3.timeParse("%m/%d/%Y")(d.complete_date);
    return createDate >= startDate && createDate <= endDate && completeDate >= startDate && completeDate <= endDate;
  });
  reqs.forEach(function(d) {
    var createDate = d3.timeParse("%m/%d/%Y")(d.create_date);
    var timeObj = new Date(2016, createDate.getMonth(), 1);
    var t = [((width*timeScale(timeObj)) - s * (bounds[1][0] + bounds[0][0])) / 2, (height - s * (bounds[1][1] + bounds[0][1])) / 2];
    projection.scale(s).translate(t);
    var p = projection([+d.lon, +d.lat]);
    d[0] = p[0], d[1] = p[1];
  });
  var reqData = hexbin(reqs).sort(function(a, b) { return b.length - a.length; });
  var reqRadius = d3.scaleSqrt().domain([0, reqData[0].length]).range([0, 15]);
  var reqG = svg.append("g").attr("class", "reqs");
  reqG.selectAll("circle")
    .data(reqData)
  .enter().append("circle")
    .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })
    .attr("fill", "#08306b")
    .attr("r", function(d) { return reqRadius(d.length); });

  // lineG.selectAll("polyline")
  //   .data(reqData)
  //   .enter()
  //     .append("")
  // reqG.selectAll("line")
  //   .data(reqs)
  //   .enter()
  //   .append("line")
  //     .attr("x1", function(d) {
  //       var timeObj = d3.timeParse("%m/%d/%Y")(d.create_date);
  //       var t = [((width*timeScale(timeObj)) - s * (bounds[1][0] + bounds[0][0])) / 2, (height - s * (bounds[1][1] + bounds[0][1])) / 2];
  //       projection.scale(s).translate(t);
  //       return projection([+d.lon, +d.lat])[0];
  //     })
  //     .attr("x2", function(d) {
  //       var timeObj = d3.timeParse("%m/%d/%Y")(d.complete_date);
  //       var t = [((width*timeScale(timeObj)) - s * (bounds[1][0] + bounds[0][0])) / 2, (height - s * (bounds[1][1] + bounds[0][1])) / 2];
  //       projection.scale(s).translate(t);
  //       return projection([+d.lon, +d.lat])[0];
  //     })
  //     .attr("y1", function(d) { return projection([+d.lon, +d.lat])[1]; })
  //     .attr("y2", function(d) { return projection([+d.lon, +d.lat])[1]; })
  //     .style("stroke-width", "0.05")
  //     .style("stroke", "#08306b");
}

(function() {
  d3.queue()
    .defer(d3.json, "chi_wards.geojson")
    .defer(d3.csv, "potholes.csv")
    .await(ready);
})()
