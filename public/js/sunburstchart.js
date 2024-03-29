/**
 * Created by miriamz on 6/17/16.
 */
window.onload = function(){
    var url= "https://data.sfgov.org/resource/4f84-bdsf.json?";
    var query = "$query=SELECT%20sector_general%20AS%20parent," +
        "%20sector_detail%20AS%20name," +
        "%20emissions_mtco2e%20AS%20value";
    var httpRequest = new XMLHttpRequest();

    var width = 960,
        height = 800,
        radius = (Math.min(width, height) / 2) - 10;

    var format = d3.format(".2f");

    var x = d3.scale.linear()
        .range([0, 2 * Math.PI]);

    var y = d3.scale.sqrt()
        .range([0, radius]);

    var color = d3.scale.category20c();

    var partition = d3.layout.partition()
        .value(function(d) { return d.value; });

    var arc = d3.svg.arc()
        .startAngle(function(d) { return Math.max(0, Math.min(2 * Math.PI, x(d.x))); })
        .endAngle(function(d) { return Math.max(0, Math.min(2 * Math.PI, x(d.x + d.dx))); })
        .innerRadius(function(d) { return Math.max(0, y(d.y)); })
        .outerRadius(function(d) { return Math.max(0, y(d.y + d.dy)); });
    var svg = d3.select("#d3").append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", "translate(" + (width/2) + "," + (height/2) + ")");

    function sunburstRender(root){

        var g = svg.selectAll("g")
            .data(partition.nodes(root))
            .enter().append("g");

        var path = g.append("path")
            .attr("d", arc)
            .style("fill", function(d) {
                return color(d.name);
            })
            .on("click", click);


        var text = g.append("text")
            .attr("class", function(d){
                return "name side" + d.depth;
            })
            .attr("transform", function(d) {
                return "rotate(" + computeTextRotation(d, d.depth) + ")";
            })
            .attr("x", function (d) {
                return y(d.y);
            })

            .attr("dx", "6")
            .attr("dy", ".35em")

            .text(function(d) {
                return d.name;

            });
        var centerText = g.append("text")
            .attr("class", "value")
            .attr("dx", "6")
            .attr("x", function (d) {
                return y(d.y);
            })
            .attr("dy", "2em")
            .attr("opacity", function(d){
                if (d.depth == 0){
                    return 1;
                } return 0;
            })
            .text(function(d) {
                return format(d.value) + " mtC02e";
            });

        d3.select(self.frameElement).style("height", height + "px");
        function click(d) {
            console.log("CLICKED: " + d["name"]);

            var textVal = d["value"];
            console.log(textVal);
            var clicked = d["name"];
            var newDepth = d["depth"];
            text.transition().attr("opacity", 0);
            centerText.transition().attr("opacity", 0);
            path.transition()
                .duration(750)
                .attrTween("d", arcTween(d))
                .each("end", function(e, i){
                    if (e.x >= d.x && e.x < (d.x + d.dx)){
                        var arcText = d3.select(this.parentNode).select(".name");
                        arcText.attr("class", function(e){
                            var currDepth = e.depth - newDepth;

                            return "name side" + currDepth;
                        });
                        var valueText = d3.select(this.parentNode).select(".value");

                        arcText.transition().duration(750)
                            .attr("opacity", 1)
                            .attr("transform", function() {
                                return "rotate(" + computeTextRotation(e, e.depth - newDepth) + ")";
                            })


                            .attr("x", function(d) {
                                return y(d.y);
                            });
                        if ((arcText["0"]["0"]["__data__"]["name"]) === clicked){
                            console.log("center text transition called");
                            valueText.transition().duration(750)
                                .attr("opacity", 1)
                                .attr("x", function(d) {
                                    return y(d.y);
                                });
                        }
                    }
                });
        }
    }



    function arcTween(d) {
        var xd = d3.interpolate(x.domain(), [d.x, d.x + d.dx]),
            yd = d3.interpolate(y.domain(), [d.y, 1]),
            yr = d3.interpolate(y.range(), [d.y ? 20 : 0, radius]);
        return function(d, i) {
            return i
                ? function (t) {
                return arc(d);
            } : function (t) {
                x.domain(xd(t));
                y.domain(yd(t)).range(yr(t));
                return arc(d);
            };
        };
    }

    function computeTextRotation(d, depth) {
        if (depth == 0){
            return 0;
        }
        return (x(d.x + d.dx/2) - Math.PI / 2) / Math.PI * 180;
    }


    function createTree(json, rootName){
        var root = {
            name: rootName,
            childKeys: [],
            children: [],
            value: 0,
            depth: 0
        };
        var parent = root;
        var node;
        var childNode;
        for (var i = 0; i < json.length; i++){
            var data = json[i];

            var value;
            if ((!data["value"]) || parseFloat(data["value"]) === Number.NaN){

                value = 0;


            } else {
                value = parseFloat(data["value"]);
            }
            if (!(root.childKeys[data["parent"]] > -1)){
                console.log("not found: " + data["parent"]);
                console.log(root.childKeys[data["parent"]]);
                node = {
                    name: data["parent"],
                    childKeys: [],
                    children: [],
                    value: 0,
                    depth: root.depth + 1
                };


                root.children.push(node);
                root.childKeys[data["parent"]] = root.children.indexOf(node);

            } else {
                node = root.children[root.childKeys[data["parent"]]];
            } if (!(node.name === data["name"])) {
                if (!(node.childKeys[data["name"]] > -1)) {
                    childNode = {
                        name: data["name"],
                        childKeys: [],
                        children: [],
                        value: value,
                        depth: node.depth + 1
                    };

                    node.children.push(childNode);
                    node.childKeys[data["name"]] = node.children.indexOf(childNode);
                } else {
                    childNode = node.children[node.childKeys[data["name"]]];
                    childNode.value += value;
                }
            }
            node.value += value;
            root.value += value;


        }
        return root;
    }

    function init(json){
        var root = createTree(json, "San Fransisco Community");
        console.log(root);
        sunburstRender(root);
    }


    httpRequest.onreadystatechange = function() {
        console.log("http state change");
        if (httpRequest.readyState === XMLHttpRequest.DONE && httpRequest.status === 200)
        {
            console.log("parsing response");
            var json = JSON.parse(httpRequest.responseText);
            init(json);
        };
    }


    httpRequest.open("GET", url + query, true);
    httpRequest.setRequestHeader("Accept", "application/json");
    httpRequest.send();
};