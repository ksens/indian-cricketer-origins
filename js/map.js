let clicked = false
const margin = {top: 0, right: 0, bottom: 0, left: 0};
const width = 850 - margin.left - margin.right;
const height = width*0.85 - margin.top - margin.bottom;

const svg = d3.select('.chart')
  .append('svg')
  .attr('width', width)
  .attr('height', height)

const g = svg.append('g')
  .attr('class', 'map')
  .attr('transform', 'translate(0, 0)')

function Zoom(initZoom, svg) {

  const zoom = d3.zoom()
    .scaleExtent([1, 20])
    .on('zoom', zoomed);

  if (initZoom == 2) { // delhi
    g.attr('transform', `translate(-1173.3975825439707,-163.70595060723429) scale(4)`)
  } if (initZoom == 3){ //chennai - bangalore
    g.attr('transform', `translate(-1173.3975825439707,-2063.70595060723429) scale(4)`)
  } 
  svg.call(zoom)

  function zoomed() {

    g.attr('transform', d3.event.transform)
    
    //g.selectAll(".player-marker")
      //.attr('r', function(d) { return d3.select(this).attr("r")/d3.event.transform.k })
      //.attr("stroke-width", 1/d3.event.transform.k)

  }

  d3.select('#zoom-in').on('click', function() {
    zoom.scaleBy(svg.transition().duration(750), 1.3);
  });

  d3.select('#zoom-out').on('click', function() {
    zoom.scaleBy(svg.transition().duration(750), 1 / 1.3);
  });

}

function tooltip(svg) {

  // create a tooltip
  let Tooltip = d3.select(".chart")
    .append("div")
    .attr("class", "tooltip")

  let mouseover = function(d) {
    clicked = false
    Tooltip
      .html(
        "<div style='padding: 10px'><img width='90px' src=" + d.Player_image + "></div><div>" + 
        "<h3>" + d.Player_name + "</h3><p>" + 
        "State: <span>" + d.State + "</span></p><p>" + 
        "Birthplace: <span>" + d.Birthplace + "</span></p><p>" + 
        "Birthplace Pop.: <span>" + d.population + "</span></p><p>" + 
        "Role: <span>" + d.Major_contribution + "</span></p><p>" +         
        "Number of matches: <span>" + d.Number_of_ODIs_played + "</span></p>" + 
        "<a href=" + d.Player_url + " target='_blank'>Cricinfo profile</a>"
      )
      .style("left", (d3.event.clientX + 25).toString() + "px")
      .style("top", (d3.event.clientY - 70).toString() + "px")
      //.style("left", (projection([+d.Longitude, +d.Latitude])[0] + 25).toString() + "px")
      //.style("top", (projection([+d.Longitude, +d.Latitude])[1] - 70).toString() + "px")
      .style("opacity", 1)

    svg.selectAll('#marker-' + d.Player_name.replace(/\s/g, ""))
      .attr("fill-opacity", 1)
      .lower()

  }

  let mouseleave = function(d) {

    if(clicked){ // prevent tooltip from hiding if marker is clicked
      Tooltip.style("opacity", 1)
    } else {
      Tooltip.style("opacity", 0)
    }

    svg.selectAll('circle.player-marker')
      .attr("fill-opacity", .3)
  }

  return {mouseover, mouseleave}
}

function drawMap(districts, states, players, type) {

  const projection = d3.geoMercator()
    .center([78.9629, 20.5937])
    .scale(width*1.55) 
    .translate([ width/2, height/2 + 20 ])
    
  const path = d3.geoPath().projection(projection);

  let map = g.append('g')

  let statesG = map.selectAll('g.state')
    .data(states.features)
    .enter().append("g")
    .attr("class", 'state')

  statesG 
    .append('path')
      .attr('class', 'state-path')
      .attr('d', path)
      .style('fill', 'lightgray')
      .style('stroke', 'none')
      .style('stroke-width', 0)
      .style('opacity', 1)

  const highlightedStates = ["Delhi", "Kolkata", "Chennai", "Bangalore Urban", "Hyderabad", "Greater Bombay"]

  let statesAccessor = (d) => highlightedStates.indexOf(d.properties.NAME_2) !== -1
  
  let data = districts.features.filter(statesAccessor)

  let districtsG = map.selectAll('g.district')
    .data(data)
    .enter().append("g")
    .attr("class", 'district')

  districtsG 
    .append('path')
      .attr('class', 'district-path')
      .attr('d', path)
      .style('fill', 'black')
      .style('stroke', 'none')
      .style('stroke-width', 0)
      .style('opacity', 1)
      
  // only append labels for selected districts
  districtsG 
    .append('text')
      .attr('class', 'district-text')
      .attr("transform", function (d) { return "translate(" + path.centroid(d) + ")"; })
      .attr('dy', '-1.25em')
      .attr("text-anchor", "middle")
      .attr("alignment-baseline", "central")
      .text(function (d) { 
        if(d.properties.NAME_2 === "Bangalore Urban"){
          return "Bangalore"
        } else if(d.properties.NAME_2 === "Greater Bombay"){
          return "Mumbai"
        } else {
          return d.properties.NAME_2;
        }
      })

    players.forEach(d=>{
      d.classification = classification(+d.population)
    })

    
    if(type==='adjusted_delhi'){

      Zoom(2, svg) 
      drawMarkersAdj(players, g, projection)

    } else if(type==='adjusted_chennai_bangalore'){

      Zoom(3, svg) 
      drawMarkersAdj(players, g, projection)

    } else if(type==='bubble'){

      const title = svg.append('g')
        .attr('class', 'title')
        .attr('transform', 'translate(92, 30)')

      title.append("text")
        .text('Indian Cricketers')
        .style('font-size', '2em')

      Zoom(1, svg) 

      drawMarkers(players, g, projection)
    }
      
}

function drawMarkers(data, svg, projection) {
  
  let {mouseover, mouseleave} = tooltip(svg)
  let sortingArr = ['> 6 million', '1-6 million', '< 1 million']
  let roles = data.map(d=>d.classification).filter(onlyUnique)

  roles = roles.sort((a, b) => {
    return sortingArr.indexOf(a) - sortingArr.indexOf(b);
  })

  let colorScale = d3.scaleOrdinal()
    .range(['orange', 'blue', 'green'])
    .domain(roles)

  let radiusScale = d3.scaleSqrt()
    .range([0, 20])
    .domain([0, d3.max(data, d => +d.Number_of_ODIs_played)])

  let colorAccessor = (d) => colorScale(d.classification)
  let radiusAccessor = (d) => radiusScale(+d.Number_of_ODIs_played)
  
  let markers = svg.append('g')

  let playerG = markers.selectAll('circle.player-marker')
    .data(data)
    .enter().append('circle')
      .attr('class', 'player-marker')
      .attr('id', d => 'marker-' + d.Player_name.replace(/\s/g, ""))
      .attr("cx", function (d) { return projection([+d["Longitude (ORIG)"], +d["Latitude (ORIG)"]])[0] })
      .attr("cy", function (d) { return projection([+d["Longitude (ORIG)"], +d["Latitude (ORIG)"]])[1] })
      .attr('r', radiusAccessor)
      .attr("fill-opacity", .3)
      .attr('fill', colorAccessor)
      .attr('stroke', colorAccessor)
      .attr("stroke-width", 1)
      .style('cursor', 'pointer')
      .on("click", function(){
        mouseover
        clicked = !clicked
      })
      .on("mouseover", mouseover)
      .on("mouseleave", mouseleave)
  
  drawLegend(roles, colorScale, d3.select('svg')) 
  drawRadiusLegend(radiusScale, d3.select('svg'))

}

function drawMarkersAdj(data, svg, projection) {

  let {mouseover, mouseleave} = tooltip(svg)
  let roles = data.map(d=>d.classification).filter(onlyUnique)

  let colorScale = d3.scaleOrdinal()
    .range(['orange', 'blue', 'green'])
    .domain(roles)

  let colorAccessor = (d) => colorScale(d.classification)
  
  let markers = svg.append('g')

  let playerG = markers.selectAll('circle.player-marker')
    .data(data)
    .enter().append('circle')
      .attr('class', 'player-marker')
      .attr('id', d => 'marker-' + d.Player_name.replace(/\s/g, ""))
      .attr("cx", function (d) { return projection([+d.Longitude, +d.Latitude])[0] })
      .attr("cy", function (d) { return projection([+d.Longitude, +d.Latitude])[1] })
      .attr('r', 1.5)
      .attr("fill-opacity", .3)
      .attr('fill', colorAccessor)
      .attr('stroke', colorAccessor)
      .attr("stroke-width", 0.5)
      .style('cursor', 'pointer')
      .on("click", function(){
        mouseover
        clicked = !clicked
      })
      .on("mouseover", mouseover)
      .on("mouseleave", mouseleave)
  
  drawLegend(roles, colorScale, d3.select('svg'))  

}

function drawLegend(data, scale, svg) {

  let R = 8
  const svgLegend = svg.append('g')
    .attr('class', 'legend')
    .attr('transform', 'translate(0, 40)')

  svgLegend.append('text')
    .attr("transform", function (d, i) {return "translate(92," + 25 + ")"})
    .style('font-weight', 'bold')
    .style('font-size', 13)
    .text('Birthplace Population')

  const legend = svgLegend.selectAll('.legend')
    .data(data)
    .enter().append('g')
      .attr("class", "legend")
      .attr("transform", function (d, i) {return "translate(100," + (i+2) * 25 + ")"})

  legend.append("circle")
      .attr("class", "legend-node")
      .attr("cx", 0)
      .attr("cy", 0)
      .attr("r", R)
      .attr("fill", d=>scale(d))

  legend.append("text")
      .attr("class", "legend-text")
      .attr("x", R*2)
      .attr("y", R/2)
      .text(d=>d)

}

function drawRadiusLegend(size, svg) {

  var valuesToShow = [50, 200, 400]
  var xCircle = 120
  var xLabel = 180
  var yCircle = 245

  const svgLegend = svg.append('g')
    .attr('class', 'radius-legend')
    .attr('transform', 'translate(0, 0)')

  svgLegend.append('text')
    .attr("transform", function (d, i) {return "translate(92," + 190 + ")"})
    .style('font-weight', 'bold')
    .style('font-size', 13)
    .text('Number of ODIs Played')

  svgLegend
    .selectAll(".radius-legend")
    .data(valuesToShow)
    .enter()
    .append("circle")
      .attr("cx", xCircle)
      .attr("cy", function(d){ return yCircle - size(d) } )
      .attr("r", function(d){ return size(d) })
      .style("fill", "none")
      .attr("stroke", "black")

  // Add legend: segments
  svgLegend
    .selectAll(".radius-legend")
    .data(valuesToShow)
    .enter()
    .append("line")
      .attr('x1', function(d){ return xCircle + size(d) } )
      .attr('x2', xLabel)
      .attr('y1', function(d){ return yCircle - size(d) } )
      .attr('y2', function(d){ return yCircle - size(d) } )
      .attr('stroke', 'black')
      .style('stroke-dasharray', ('2,2'))

  // Add legend: labels
  svg
    .selectAll("legend")
    .data(valuesToShow)
    .enter()
    .append("text")
      .attr('x', xLabel)
      .attr('y', function(d){ return yCircle - size(d) } )
      .text( function(d){ return d } )
      .style("font-size", 8)
      .attr('alignment-baseline', 'middle')

}

function onlyUnique(value, index, self) { 
    return self.indexOf(value) === index;
}

function classification(d){
  if(d > 6000000){
    return '> 6 million'
  } else if(d > 1000000 & d <= 6000000){
    return '1-6 million'
  } else if(d <= 1000000){
    return '< 1 million'
  }
}