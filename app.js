const url =
  "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json";

d3.json(url)
  .then((data) => callback(data))
  .catch((err) => console.log(err));

function callback(data) {
  const svgWidth = 1200;
  const svgHeight = 600;
  const padding = 60;

  const minYear = d3.min(data.monthlyVariance, (d) => d.year);
  const maxYear = d3.max(data.monthlyVariance, (d) => d.year);
  const numberOfYears = maxYear - minYear;

  const xScale = d3
    .scaleLinear()
    .domain([minYear, maxYear])
    .range([padding, svgWidth - padding]);

  const yScale = d3
    .scaleTime()
    .domain([new Date(0, 0, 0, 0, 0, 0, 0), new Date(0, 12, 0, 0, 0, 0, 0)])
    .range([padding, svgHeight - padding]);

  const chartSVG = d3
    .select("#d3-container")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);

  const tooltip = d3
    .select("main")
    .append("div")
    .attr("id", "tooltip")
    .style("opacity", 0);

  const cells = chartSVG
    .selectAll("rect")
    .data(data.monthlyVariance)
    .enter()
    .append("rect")
    .attr("class", "cell")
    .attr("fill", (d) => {
      if (d.variance <= -1) {
        return "#81ecec";
      } else if (d.variance <= 0) {
        return "#ffeaa7";
      } else if (d.variance <= 1) {
        return "#fab1a0";
      } else {
        return "#ff7675";
      }
    })
    .attr("data-year", (d) => d.year)
    .attr("data-month", (d) => d.month - 1)
    .attr("data-temp", (d) => data.baseTemperature + d.variance)
    .attr("width", (d) => (svgWidth - 2 * padding) / numberOfYears)
    .attr("height", (d) => (svgHeight - 2 * padding) / 12)
    .attr("x", (d) => xScale(d.year))
    .attr("y", (d) => yScale(new Date(0, d.month - 1, 0, 0, 0, 0, 0)))
    .on("mouseover", (event, d) => {
      let date = new Date(d.year, d.month);
      tooltip.style("opacity", 1);
      tooltip.attr("data-year", d.year);
      tooltip
        .html(
          "<span class='date'>" +
            d3.timeFormat("%B, %Y")(date - 1) +
            "</span>" +
            "<br />" +
            "<span class='temperature'>" +
            d3.format(".1f")(data.baseTemperature + d.variance) +
            "&#8451;" +
            " | " +
            "</span>" +
            "<span class='variance'>" +
            d3.format("+.1f")(d.variance) +
            "&#8451;" +
            "</span>"
        )
        .style("left", event.pageX + "px")
        .style("top", event.pageY - 100 + "px");
    })
    .on("mouseout", (d) => {
      tooltip.style("opacity", 0);
    });

  const xAxis = d3
    .axisBottom(xScale)
    // Reformat tick labels to remove commas in years
    .tickFormat(d3.format("d"));
  const yAxis = d3
    .axisLeft(yScale)
    // Show the full month as a string
    .tickFormat(d3.timeFormat("%B"));

  chartSVG
    .append("g")
    .attr("id", "x-axis")
    .attr("class", "axisWhite")
    .attr("transform", "translate(0," + (svgHeight - padding) + ")")
    .call(xAxis);
  chartSVG
    .append("g")
    .attr("id", "y-axis")
    .attr("class", "axisWhite")
    .attr("transform", "translate(" + padding + ",0)")
    .call(yAxis);
}
