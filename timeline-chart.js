
function createTimelineChart() {
  const container = document.getElementById("timeline-chart")

  container.innerHTML = ""

  const containerRect = container.getBoundingClientRect()
  const containerWidth = containerRect.width
  const containerHeight = 400

  const margin = { top: 40, right: 60, bottom: 60, left: 80 }
  const width = Math.max(300, containerWidth - margin.left - margin.right)
  const height = containerHeight - margin.top - margin.bottom

  const svg = d3
    .select(container)
    .append("svg")
    .attr("width", "100%")
    .attr("height", containerHeight)
    .attr("viewBox", `0 0 ${containerWidth} ${containerHeight}`)
    .attr("preserveAspectRatio", "xMidYMid meet")

  const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`)

  const xScale = d3
    .scaleLinear()
    .domain(d3.extent(historicalData, (d) => d.year))
    .range([0, width])

  const yScale = d3
    .scaleLinear()
    .domain([0, d3.max(historicalData, (d) => d.percentage)])
    .range([height, 0])

  const zoom = d3.zoom()
    .scaleExtent([1, 10]) 
    .translateExtent([[0, 0], [width, height]])
    .extent([[0, 0], [width, height]])
    .on("zoom", (event) => {
      const newXScale = event.transform.rescaleX(xScale)
      const newYScale = event.transform.rescaleY(yScale)
      
      const newLine = d3
        .line()
        .x((d) => newXScale(d.year))
        .y((d) => newYScale(d.percentage))
        .curve(d3.curveMonotoneX)
      
      g.select(".line-path")
        .attr("d", newLine(historicalData))
      
      g.selectAll(".dot")
        .attr("cx", (d) => newXScale(d.year))
        .attr("cy", (d) => newYScale(d.percentage))
      
      g.selectAll(".key-dot")
        .attr("cx", (d) => newXScale(d.year))
        .attr("cy", (d) => newYScale(d.percentage))
      
      g.selectAll(".key-label")
        .attr("x", (d) => newXScale(d.year))
        .attr("y", (d) => newYScale(d.percentage) - 15)
      
      g.select(".x-axis")
        .call(d3.axisBottom(newXScale).tickFormat(d3.format("d")))
      
      g.select(".y-axis")
        .call(d3.axisLeft(newYScale))
    })

  svg.call(zoom)

  const line = d3
    .line()
    .x((d) => xScale(d.year))
    .y((d) => yScale(d.percentage))
    .curve(d3.curveMonotoneX)

  g.append("g")
    .attr("class", "x-axis")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(xScale).tickFormat(d3.format("d")))
    .append("text")
    .attr("x", width / 2)
    .attr("y", 40)
    .attr("fill", "black")
    .style("text-anchor", "middle")
    .text("Year")

  g.append("g")
    .attr("class", "y-axis")
    .call(d3.axisLeft(yScale))
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", -50)
    .attr("x", -height / 2)
    .attr("fill", "black")
    .style("text-anchor", "middle")
    .text("Market Share (%)")

  const path = g
    .append("path")
    .attr("class", "line-path")
    .datum(historicalData)
    .attr("fill", "none")
    .attr("stroke", "#e74c3c")
    .attr("stroke-width", 3)
    .attr("d", line)

  const dots = g
    .selectAll(".dot")
    .data(historicalData)
    .enter()
    .append("circle")
    .attr("class", "dot")
    .attr("cx", (d) => xScale(d.year))
    .attr("cy", (d) => yScale(d.percentage))
    .attr("r", 4)
    .attr("fill", "#e74c3c")
    .style("cursor", "pointer")
    .on("mouseover", function(event, d) {
      d3.select(this).attr("r", 6)
      const tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("position", "absolute")
        .style("background", "rgba(0,0,0,0.8)")
        .style("color", "white")
        .style("padding", "8px")
        .style("border-radius", "4px")
        .style("font-size", "12px")
        .style("pointer-events", "none")
        .style("z-index", "1000")
      
      tooltip.html(`${d.year}: ${d.percentage}%`)
        .style("left", (event.pageX + 10) + "px")
        .style("top", (event.pageY - 10) + "px")
    })
    .on("mouseout", function() {
      d3.select(this).attr("r", 4)
      d3.selectAll(".tooltip").remove()
    })

  const keyYears = [2021, 2022, 2023]
  g.selectAll(".key-dot")
    .data(historicalData.filter((d) => keyYears.includes(d.year)))
    .enter()
    .append("circle")
    .attr("class", "key-dot")
    .attr("cx", (d) => xScale(d.year))
    .attr("cy", (d) => yScale(d.percentage))
    .attr("r", 8)
    .attr("fill", "none")
    .attr("stroke", "#f39c12")
    .attr("stroke-width", 3)

  g.selectAll(".key-label")
    .data(historicalData.filter((d) => keyYears.includes(d.year)))
    .enter()
    .append("text")
    .attr("class", "key-label")
    .attr("x", (d) => xScale(d.year))
    .attr("y", (d) => yScale(d.percentage) - 15)
    .attr("text-anchor", "middle")
    .attr("fill", "#f39c12")
    .attr("font-weight", "bold")
    .attr("font-size", "12px")
    .text((d) => `${d.percentage}%`)

  const zoomControls = g.append("g")
    .attr("class", "zoom-controls")
    .attr("transform", `translate(${width - 100}, 10)`)

  zoomControls.append("rect")
    .attr("x", 0)
    .attr("y", 0)
    .attr("width", 30)
    .attr("height", 30)
    .attr("fill", "rgba(255,255,255,0.9)")
    .attr("stroke", "#ccc")
    .attr("stroke-width", 1)
    .style("cursor", "pointer")
    .on("click", () => {
      svg.transition().duration(300).call(
        zoom.scaleBy, 1.5
      )
    })

  zoomControls.append("text")
    .attr("x", 15)
    .attr("y", 20)
    .attr("text-anchor", "middle")
    .attr("font-size", "16px")
    .attr("font-weight", "bold")
    .text("+")

  zoomControls.append("rect")
    .attr("x", 35)
    .attr("y", 0)
    .attr("width", 30)
    .attr("height", 30)
    .attr("fill", "rgba(255,255,255,0.9)")
    .attr("stroke", "#ccc")
    .attr("stroke-width", 1)
    .style("cursor", "pointer")
    .on("click", () => {
      svg.transition().duration(300).call(
        zoom.scaleBy, 1/1.5
      )
    })

  zoomControls.append("text")
    .attr("x", 50)
    .attr("y", 20)
    .attr("text-anchor", "middle")
    .attr("font-size", "16px")
    .attr("font-weight", "bold")
    .text("−")

  zoomControls.append("rect")
    .attr("x", 70)
    .attr("y", 0)
    .attr("width", 30)
    .attr("height", 30)
    .attr("fill", "rgba(255,255,255,0.9)")
    .attr("stroke", "#ccc")
    .attr("stroke-width", 1)
    .style("cursor", "pointer")
    .on("click", () => {
      svg.transition().duration(300).call(
        zoom.transform, d3.zoomIdentity
      )
    })

  zoomControls.append("text")
    .attr("x", 85)
    .attr("y", 20)
    .attr("text-anchor", "middle")
    .attr("font-size", "12px")
    .attr("font-weight", "bold")
    .text("⟲")

  g.append("text")
    .attr("x", 10)
    .attr("y", -10)
    .attr("font-size", "12px")
    .attr("fill", "#666")
    .text("Scroll to zoom • Drag to pan • Click dots for details")

  window.timelineElements = { path, dots }
}

function animateTimelineChart() {
  if (!window.timelineElements) return

  const { path, dots } = window.timelineElements

  const totalLength = path.node().getTotalLength()
  path
    .attr("stroke-dasharray", totalLength + " " + totalLength)
    .attr("stroke-dashoffset", totalLength)
    .transition()
    .duration(2000)
    .attr("stroke-dashoffset", 0)

  dots
    .attr("opacity", 0)
    .transition()
    .delay((d, i) => i * 100)
    .duration(500)
    .attr("opacity", 1)
}

window.createTimelineChart = createTimelineChart
window.animateTimelineChart = animateTimelineChart
