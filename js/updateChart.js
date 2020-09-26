function update(data) {

  const sortingArr = ['< 1 million', '1-5 million', '> 5 million']
  const categories = data.map(function(d) { return d.key; })

  const categoriesSorted = categories.sort((a, b) => {
    return sortingArr.indexOf(a) - sortingArr.indexOf(b);
  })

  let colorScale = d3.scaleOrdinal()
    .range(['orange', 'blue', 'green'])
    .domain(categoriesSorted)

  let colorAccessor = (d) => colorScale(d.key)

  const x = d3.scaleBand()
    .range([ 0, width ])
    .domain(categoriesSorted)
    .padding(0.2);

  svg.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x))

  const y = d3.scaleLinear()
    .domain([0, d3.max(data, d=>d.value)])
    .range([ height, 0]);
  svg.append("g")
    .attr("class", "myYaxis")
    .call(d3.axisLeft(y));

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
}

function classification(d){
  if(d > 5000000){
    return '> 5 million'
  } else if(d > 1000000 & d <= 5000000){
    return '1-5 million'
  } else if(d <= 1000000){
    return '< 1 million'
  }
}