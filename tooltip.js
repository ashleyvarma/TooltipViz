var margin = {top: 20, right: 20, bottom: 30, left: 40},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

/* 
 * value accessor - returns the value to encode for a given data object.
 * scale - maps value to a visual display encoding, such as a pixel position.
 * map function - maps from data value to display value
 * axis - sets up axis
 */ 

// setup x 
var xValue = function(d) { return d["fertility"];}, // data -> value
    xScale = d3.scale.linear()
        .range([0, width]), // value -> display
    xMap = function(d) { return xScale(xValue(d));}, // data -> display
    xAxis = d3.svg.axis()
        .scale(xScale)
        .orient("bottom")


// setup y
var yValue = function(d) { return d["life_expectancy"];}, // data -> value
    yScale = d3.scale.linear().range([height, 0]), // value -> display
    yMap = function(d) { return yScale(yValue(d));}, // data -> display
    yAxis = d3.svg.axis().scale(yScale).orient("left");


// add the graph canvas to the body of the webpage
var svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// add the tooltip area to the webpage
var tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

// tooltip mouseover event handler
var tipMouseover = function(d) {
    data = d3.csv("gapminder.csv")
    var html  = "<br>" + d["country"] + "</br>";

    // get year min and max for us
    const yearLimits = d3.extent(data, d => d['year'])
    // get scaling function for years (x axis)
    const xScale = d3.scale.linear()
        .domain([d3.min(data, yearLimits)-1, d3.max(data, yearLimits)+1])
        .range([margin.left, width + margin.left])

    // make x axis
    tooltip.append("g")
        .attr("transform", "translate(0," + (height + margin.top) + ")")
        // .call(d3.axisBottom(xScale))
        .call(xScale)
        .append("text")
        .attr("class", "label")
        .attr("x", width)
        .attr("y", -6)
        .style("text-anchor", "end")
        .text("Year");

    // get min and max life expectancy for US
    const populationLimits = d3.extent(data, d => d['population']) 

    // get scaling function for y axis
    const yScale = d3.scale.linear()
        .domain([d3.min(data, populationLimits)-1, d3.max(data, populationLimits)+1])
        .range([margin.top, margin.top + height])

    // make y axis
    tooltip.append("g")
        .attr("transform", "translate(" + margin.left + ",0)")
        // .call(d3.axisLeft(yScale))
        .call(yScale)
        .append("text")
        .attr("class", "label")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("Population");

    // d3's line generator
    const line = d3.svg.line()
        .x(d => xScale(+d['year'])) // set the x values for the line generator
        .y(d => yScale(+d['life_expectancy'])) // set the y values for the line generator

    tooltip.html(html)
        .style("left", (d3.event.pageX + 15) + "px")
        .style("top", (d3.event.pageY - 15) + "px")
    .transition()
        .duration(200) // ms
        .style("opacity", .9) // started as 0!

    // append line to svg
    tooltip.append("path")
        .datum(d)
        .attr("d", function(d) { return line(d) })
        .attr("fill", "steelblue")
        .attr("stroke", "steelblue")

};
// tooltip mouseout event handler
var tipMouseout = function(d) {
    tooltip.transition()
        .duration(300) // ms
        .style("opacity", 0); // don't care about position!
};

let year = 1980;

// load data
d3.csv("gapminder.csv", function(error, data) {
    // change string (from CSV) into number format
    data.forEach(function(d) {
        d["fertility"] = +d["fertility"];
        d["life_expectancy"] = +d["life_expectancy"];
        d["year"] = +d["year"];
        //console.log(d);
    });
    drawScatterPlot(data.filter(function(d) {return d["year"] === year}));
});

function drawScatterPlot(data) {

    // don't want dots overlapping axis, so add in buffer to data domain
    // update x axis scale
    xScale.domain([d3.min(data, xValue)-1, d3.max(data, xValue)+1]);
    // update y axis scale
    yScale.domain([d3.min(data, yValue)-5, d3.max(data, yValue)+10]); 

    // x-axis
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)
        .append("text")
        .attr("class", "label")
        .attr("x", width)
        .attr("y", -6)
        .style("text-anchor", "end")
        .text("Fertility");
        

    // y-axis
    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
        .append("text")
        .attr("class", "label")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("Life Expectancy");

    // draw dots
    svg.selectAll("dot")
        .data(data)
        .enter()
        .append("circle")
        .attr("class", "dot")
        .attr("r", function(d) {
            return Math.sqrt(d.population)/600
        })
        .attr("cx", xMap)
        .attr("cy", yMap)
        .style("fill", "RGB(246,149,130)") 
        .style("opacity", "0.5")
        .on("mouseover", tipMouseover)
        .on("mouseout", tipMouseout);
    
    let pop = data.filter(function(d) { return d.population > 100000000 })
    // redraw larger dots
    svg.selectAll("dot")
        .data(pop)
        .enter()
        .append("circle")
        .attr("class", "dot")
        .attr("r", function(d) {
            return Math.sqrt(d.population)/600
        })
        .attr("cx", xMap)
        .attr("cy", yMap)
        .style("fill", "RGB(253, 171, 219)") 
        .style("opacity", "0.5")
        .on("mouseover", tipMouseover)
        .on("mouseout", tipMouseout);

    svg.selectAll("dot")
        .data(pop)
        .enter()
        .append('text')
        .attr("font-family", "sans-serif")
        .attr("font-size", "14px")
        .attr("font-weight", "bold")
        .attr('x', function(d) { return xScale(+d['fertility']) + 20})
        .attr('y', function(d) { return yScale(+d['life_expectancy'])})
        .text(function(d) { return d['country'] })

}     
    