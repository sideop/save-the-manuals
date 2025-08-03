function createComebackChart() {
  const container = document.getElementById("comeback-chart")

  container.innerHTML = ""
  const containerRect = container.getBoundingClientRect()
  const containerWidth = containerRect.width
  const containerHeight = 400

  const margin = { top: 40, right: 40, bottom: 120, left: 60 }
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
    .scaleBand()
    .domain(comebackCars.map((d) => d.model))
    .range([0, width])
    .padding(0.1)

  const yScale = d3
    .scaleLinear()
    .domain([0, d3.max(comebackCars, (d) => d.takeRate)])
    .range([height, 0])

  const bars = g
    .selectAll(".bar")
    .data(comebackCars)
    .enter()
    .append("rect")
    .attr("class", "bar")
    .attr("x", (d) => xScale(d.model))
    .attr("width", xScale.bandwidth())
    .attr("y", (d) => yScale(d.takeRate))
    .attr("height", (d) => height - yScale(d.takeRate))
    .attr("fill", (d) => brandColors[d.brand])
    .attr("opacity", 0.8)
    .style("cursor", "pointer")
    .on("mouseover", function(event, d) {
      d3.select(this)
        .attr("opacity", 1)
        .attr("stroke", "#fff")
        .attr("stroke-width", 2)
      
      const tooltip = d3.select("body").append("div")
        .attr("class", "car-tooltip")
        .style("position", "absolute")
        .style("background", "rgba(0,0,0,0.95)")
        .style("color", "white")
        .style("padding", "12px")
        .style("border-radius", "8px")
        .style("font-size", "14px")
        .style("pointer-events", "none")
        .style("z-index", "1000")
        .style("border", "1px solid rgba(255,255,255,0.2)")
        .style("box-shadow", "0 8px 32px rgba(0,0,0,0.4)")
        .style("backdrop-filter", "blur(8px)")
        .style("min-width", "200px")
      
      tooltip.html(`
        <div style="margin-bottom: 8px;">
          <strong style="color: #f39c12; font-size: 16px;">${d.model}</strong><br>
          <span style="color: #bdc3c7; font-size: 12px;">${d.brand}</span>
        </div>
        <div style="border-top: 1px solid rgba(255,255,255,0.2); padding-top: 8px;">
          <div style="margin-bottom: 4px;">
            <span style="color: #3498db;">🏁</span> <strong>${d.horsepower} hp</strong>
          </div>
          <div style="margin-bottom: 4px;">
            <span style="color: #e74c3c;">⚙️</span> <strong>${d.engine}</strong>
          </div>
          <div style="margin-bottom: 4px;">
            <span style="color: #2ecc71;">⏱️</span> <strong>0-60: ${d.zeroToSixty}</strong>
          </div>
          <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid rgba(255,255,255,0.2);">
            <span style="color: #f1c40f;">📊</span> <strong>Manual Take Rate: ${d.takeRate}%</strong>
          </div>
        </div>
      `)
        .style("left", (event.pageX + 15) + "px")
        .style("top", (event.pageY - 10) + "px")
    })
    .on("mouseout", function() {
      d3.select(this)
        .attr("opacity", 0.8)
        .attr("stroke", "none")
      
      d3.selectAll(".car-tooltip").remove()
    })

  const labels = g
    .selectAll(".bar-label")
    .data(comebackCars)
    .enter()
    .append("text")
    .attr("class", "bar-label")
    .attr("x", (d) => xScale(d.model) + xScale.bandwidth() / 2)
    .attr("y", (d) => yScale(d.takeRate) - 5)
    .attr("text-anchor", "middle")
    .attr("fill", "black")
    .attr("font-weight", "bold")
    .attr("font-size", "12px")
    .text((d) => `${d.takeRate}%`)

  g.append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(xScale))
    .selectAll("text")
    .attr("transform", "rotate(-45)")
    .style("text-anchor", "end")
    .attr("font-size", "10px")

  g.append("g")
    .call(d3.axisLeft(yScale))
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", -40)
    .attr("x", -height / 2)
    .attr("fill", "black")
    .style("text-anchor", "middle")
    .text("Manual Take Rate (%)")

  window.comebackElements = { bars, labels, height, yScale }
}

function animateComebackChart() {
  if (!window.comebackElements) return

  const { bars, labels, height, yScale } = window.comebackElements

  bars
    .attr("height", 0)
    .attr("y", height)
    .transition()
    .delay((d, i) => i * 200)
    .duration(800)
    .attr("y", (d) => yScale(d.takeRate))
    .attr("height", (d) => height - yScale(d.takeRate))

  labels
    .attr("opacity", 0)
    .transition()
    .delay((d, i) => i * 200 + 400)
    .duration(500)
    .attr("opacity", 1)
}

window.createComebackChart = createComebackChart
window.animateComebackChart = animateComebackChart
