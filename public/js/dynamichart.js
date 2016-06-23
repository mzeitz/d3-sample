/**
 * Created by miriamz on 6/17/16.
 */
window.onload = function() {
    var width = 960;
    var height = 500;

    var margin = {top: 20, right: 20, bottom: 20, left: 50};
    var c = d3.scale.category20c();
    var svg = d3.select("#d3").append('svg')
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.right + ")");


    var xScale = d3.scale.linear()
        .range([0, width - margin.left - margin.right]);

    var yScale = d3.scale.linear()
        .range([height - margin.top - margin.bottom, 0]);

    var line = d3.svg.line().interpolate("monotone")
        .x(function (d) {
            return xScale(d.x);
        })
        .y(function (d) {
            return yScale(d.y);
        });
    
    function generateData(line, points) {
        return d3.range(line).map(function () {
            return d3.range(points).map(function (item, index) {
                return {x: index/(points -1), y: Math.random() * 100};
            });
        });
    }

    function createGraph() {
        var data = generateData(3, 8);

        var yMin = data.reduce(function (pv, cv) {
            var currMin = cv.reduce(function (pv, cv) {
                return Math.min(pv, cv.y);
            }, 100);
            return Math.min(pv, currMin);
        }, 100);

        var yMax = data.reduce(function (pv, cv) {
            var currMax = cv.reduce(function (pv, cv) {
                return Math.max(pv, cv.y);
            }, 0);
            return Math.max(pv, currMax);
        }, 0);

        yScale.domain([yMin, yMax]);

        var yAxis = d3.svg.axis().scale(yScale).orient("left");

        if (svg.selectAll(".y.axis")[0].length < 1){
            svg.append("g")
                .attr("class", "y axis")
                .call(yAxis);
        } else {
            svg.selectAll(".y.axis").transition().duration(1500).call(yAxis);
        }

        var lines = svg.selectAll(".line")
            .data(data)
            .attr("class", "line");

        lines.transition().duration(1500)
            .attr("d", line)
            .style("stroke", function() {
                return c(Math.floor(Math.random()*20));

            });

        lines.enter()
            .append("path")
            .attr("class", "line")
            .attr("d", line)
            .style("stroke", function() {
                return c(Math.floor(Math.random()*20));
            });
        lines.exit().remove();
    }

    createGraph();
    setInterval(createGraph, 1500);
}