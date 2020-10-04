function update(data, data1, xLabel, yLabel, yFormat, tooltip_attrs) {

  const sortingArr = ['< 1 million', '1-6 million', '> 6 million']
  const categories = data.map(function(d) { return d.key; })

  const categoriesSorted = categories.sort((a, b) => {
    return sortingArr.indexOf(a) - sortingArr.indexOf(b);
  })

  let colorScale = d3.scaleOrdinal()
    .range(['green', 'blue', 'orange'])
    .domain(categoriesSorted)

  let colorAccessor = (d) => colorScale(d.key)

  const x = d3.scaleBand()
    .range([ 0, width ])
    .domain(categoriesSorted)
    .padding(0.2);

  svg.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x))

  svg.append("text")
    .attr("transform", `translate(${width/2}, ${height+40})`)
    .attr('text-anchor', 'middle')
    .attr("font-size", '11px')
    .text(xLabel)

  const y = d3.scaleLinear()
    .domain([0, d3.max(data, d=>d.value)])
    .range([ height, 0]);

  svg.append("g")
    .attr("class", "myYaxis")
    .call(d3.axisLeft(y).tickFormat(yFormat));

  svg.append("text")
    .attr("transform", `translate(-40,${height/2})rotate(-90)`)
    .attr('text-anchor', 'middle')
    .attr("font-size", '11px')
    .text(yLabel)

  const bar = svg.selectAll("rect")
    .data(data)

  bar
    .enter()
    .append("rect")
    .merge(bar)
      .attr("x", function(d) { return x(d.key); })
      .attr("y", function(d) { return y(d.value); })
      .attr("width", x.bandwidth())
      .attr("height", function(d) { return height - y(d.value); })
      .attr("fill", colorAccessor)
      .attr('cursor', 'pointer')
      .on("mouseover", function(d) { 
         let items = data1.find(el=>el.key === d.key).values.map(el=>el[tooltip_attrs[0]])
         let items_1 = data1.find(el=>el.key === d.key).values.map(el=>el[tooltip_attrs[1]])
         var keywordList = "<ul>";
          for(var i = 0; i < items.length; i++){
            tooltip_attrs[1] ? keywordList += "<li>" + items[i] + " ("+ d3.format(".2s")(items_1[i]) + " people)</li>" :  keywordList += "<li>" + items[i] + "</li>" 
          }
          keywordList += "</ul>";
         d3.select('.tooltip')
           .style('top', `${d3.select(this).attr('y')+30}px`)
           .style('left', `${+d3.select(this).attr('x')+x.bandwidth()/2+120}px`)
           .style('visibility', 'visible')
           .html("<b>" + tooltip_attrs[2] + ": </b>" + keywordList)
      })
      .on("mouseout", function() { 
         d3.select('.tooltip')
           .style('top', '0px')
           .style('left', '0px')
           .style('visibility', 'hidden')
           .html("")
      })

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