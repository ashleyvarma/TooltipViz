"use-strict";

let year = 1980;
let chart = "";
let xScale = "";
let yXcale = "";
let data = "";
let svgContainer = "";

const plot = {
    width: 800,
    height: 600,
    marginAll: 75
}

const small_plot = {
    width: 500,
    height: 500,
    marginAll: 75
}

window.onload = function () {
    svgContainer = d3.select("#chart")
        .append('svg')
        .attr('width', plot.width)
        .attr('height', plot.height);
    chart = d3.select("#populationViz")
        .append('svg')
        .attr('width', plot.width)
        .attr('height', plot.height);
    d3.csv("gapminder.csv")
        .then((d) => makeScatterPlot(d))
}

function makeScatterPlot(csvData) {
    data = csvData.filter((data) => {return data.fertility != "NA" && data.life_expectancy != "NA"})
    let fertility_rate_data = data.map((row) => parseFloat(row["fertility"]));
    let life_expectancy_data = data.map((row) => parseFloat(row["life_expectancy"]));
    let axesLimits = findMinMax(fertility_rate_data, life_expectancy_data);
    let mapFunctions = drawAxes(axesLimits, "fertility", "life_expectancy", svgContainer, plot);
    plotData(mapFunctions);
    makeLabels(svgContainer, plot, "Fertility Rate vs. Life Expectancy (1980)",'Fertility Rate','Life Expectancy');
    labels(svgContainer, data);
}

function labels(svgContainer, data) {
    let pop = data.filter(function(d) { return +d["population"] > 100000000 && +d["year"] == year})
    svgContainer.selectAll('.text')
    .data(pop)
    .enter()
    .append('text')
        .attr('x', function(d) { return xScale(+d['fertility']) + 20})
        .attr('y', function(d) { return yScale(+d['life_expectancy'])})
        .text(function(d){ return d["country"]})
        .attr("font-family", "Arial")
        .attr("font-size", "14px")
        .attr("font-weight", "bold")
}

function makeLabels(svgContainer, plot, title, x, y) {
    svgContainer.append('text')
        .attr('x', (plot.width - 2 * plot.marginAll) / 2 - 90)
        .attr('y', plot.marginAll / 2 + 10)
        .attr("font-family", "Arial")
        .style('font-size', '12pt')
        .text(title);

    svgContainer.append('text')
        .attr('x', (plot.width - 0.5 * plot.marginAll) / 2 - 30)
        .attr('y', plot.height - 10)
        .attr("font-family", "Arial")
        .style('font-size', '12pt')
        .text(x);

    svgContainer.append('text')
        .attr('transform', 'translate( 15,' + (plot.height / 2 + 45) + ') rotate(-90)')
        .attr("font-family", "Arial")
        .style('font-size', '12pt')
        .text(y);
}

function plotData(map) {
    curData = data.filter((row) => {
        return row["year"] == year 
    })
    let pop_data = data.map((row) => +row["population"]);
    let pop_limits = d3.extent(pop_data);
    let pop_map_func = d3.scaleSqrt()
        .domain([pop_limits[0], pop_limits[1]])
        .range([3, 20]);

    let xMap = map.x;
    let yMap = map.y;
    let div = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);
    let toolChart = div.append('svg')
        .attr('width', small_plot.width)
        .attr('height', small_plot.height)
    svgContainer.selectAll('.dot')
        .data(data.filter( function (row){ return row["year"] == year}))
        .enter()
        .append('circle')
        .attr('cx', xMap)
        .attr('cy', yMap)
        .attr("r", function(d) {
          return Math.sqrt(d.population)/600
      })
        .attr('stroke', "rgb(46,46,45)")
        .attr('fill', 'rgb(255, 102, 153)')
        .style("opacity", "0.5")
        .on("mouseover", (d) => {
            toolChart.selectAll("*").remove()
            div.transition()
                .duration(500)
                .style("opacity", .8);
            plotPopulation(d.country, toolChart)
            div.style("left", (d3.event.pageX + 10) + "px")
                .style("top", (d3.event.pageY + 10) + "px");
            
        })
        .on("mouseout", (d) => {
            div.transition()
                .duration(500)
                .style("opacity", 0);
        });    
}

function plotPopulation(country, toolChart) {
    let countryData = data.filter((row) => {return row.country == country})
    let population = countryData.map((row) => parseInt(row["population"]));
    let year = countryData.map((row) => parseInt(row["year"]));

    let axesLimits = findMinMax(year, population);
    let mapFunctions = drawAxes(axesLimits, "year", "population", toolChart, small_plot);
    toolChart.append("path")
        .datum(countryData)
        .attr("fill", "none")
        .attr("stroke", "#000066")
        .attr("stroke-width", 2.5)
        .attr("d", d3.line()
                    .x(function(d) { return mapFunctions.xScale(d.year) })
                    .y(function(d) { return mapFunctions.yScale(d.population) }))
    makeLabels(toolChart, small_plot, "Population Over Time For " + country, "Year", "Population (in Millions)");
}

function drawAxes(limits, x, y, svgContainer, plot) {
    let xValue = function (d) {
        return +d[x];
    }

     xScale = d3.scaleLinear()
        .domain([limits.xMin, limits.xMax]) 
        .range([plot.marginAll, plot.width - plot.marginAll])

    let xMap = function (d) {
        return xScale(xValue(d));
    };

    let xAxis = d3.axisBottom().scale(xScale);
    svgContainer.append("g")
        .attr('transform', 'translate(0, ' + (plot.height - plot.marginAll) + ')')
        .call(xAxis);

    let yValue = function (d) {
        return +d[y]
    }

    yScale = d3.scaleLinear()
        .domain([limits.yMax, limits.yMin + 10])
        .range([plot.marginAll, plot.height - plot.marginAll])

    let yMap = function (d) {
        return yScale(yValue(d));
    };

    let yAxis = d3.axisLeft().scale(yScale);
    svgContainer.append('g')
        .attr('transform', 'translate(' + plot.marginAll + ', 0)')

        .call(yAxis);

    return {
        x: xMap,
        y: yMap,
        xScale: xScale,
        yScale: yScale
    };
}

function findMinMax(x, y) {
    let xMin = d3.min(x);
    let xMax = d3.max(x);
    let yMin = d3.min(y);
    let yMax = d3.max(y);
    return {
        xMin: xMin,
        xMax: xMax,
        yMin: yMin,
        yMax: yMax
    }
}

function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}