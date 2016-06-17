/**
 * Created by miriamz on 6/17/16.
 */
function createChart(data){
    var width = 900, height = 400;
    var margin = {top: 20, right:200, bottom:0, left:20};
    var c= d3.scale.category20c();
    var x = d3.scale.linear().range([0, width]);
    var xAxis = d3.svg.axis().scale(x).orient("top");
    //fix to compute rather than hardcode
    var start_year = 1985, end_year = 2016;

    var formatYears = d3.format("0000");
    xAxis.tickFormat(formatYears);

    //insert into div
    var svg = d3.select("#d3").append('svg')
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .style("margin-left", margin.left + "px")
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


    x.domain([start_year, end_year]);
    var xScale = d3.scale.linear()
        .domain([start_year, end_year])
        .range([0, width]);

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + 0 + ")")
        .call(xAxis);

    for (var i = 0; i < data.length; i++) {
        var g = svg.append("g").attr("class", "sector");

        var circles = g.selectAll("circle")
            .data(data[i]['values'])
            .enter()
            .append("circle");

        var text = g.selectAll("text")
            .data(data[i]['values'])
            .enter()
            .append("text");

        var rScale = d3.scale.linear()
        //fix to compute max, not hardcoded
            .domain([0, 2300000])
            .range([2, 12]);
        circles.attr("cx", function(d, j){
            return xScale(d[0]);
        })
            .attr("cy", i*30+20)
            .attr("r", function(d) {
                return rScale(d[1]);
            })
            .style("fill", function(d) {
                return c(i);
            });
        text.attr("y", i*30+25)
            .attr("x", function(d) {
                return xScale(d[0]) - 30;
            })
            .attr("class", "value")
            .text(function(d) {
                return parseFloat(d[1]).toFixed(2);
            })
            .style("fill", function(d) {
                return c(i);
            })
            .style("display", "none");
        g.append("text")
            .attr("y", i *30+25)
            .attr("x", width + 20)
            .attr("class", "label")
            .text(truncate(data[i]['name'], 30, "..."))
            .style("fill", function(d) {
                return c(i);
            })
            .on("mouseover", mouseover)
            .on("mouseout", mouseout);
    };


};
function mouseover(p) {
    var g = d3.select(this).node().parentNode;
    d3.select(g).selectAll("circle").style("display", "none");
    d3.select(g).selectAll("text.value").style("display", "block");

};

function mouseout(p) {
    var g = d3.select(this).node().parentNode;
    d3.select(g).selectAll("circle").style("display", "block");
    d3.select(g).selectAll("text.value").style("display", "none");
};
function truncate(str, maxLength, suffix) {
    if(str.length > maxLength) {
        str = str.substring(0, maxLength + 1);
        str = str.substring(0, Math.min(str.length, str.lastIndexOf(" ")));
        str = str + suffix;
    }
    return str;
}