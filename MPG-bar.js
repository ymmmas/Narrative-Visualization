async function init() {
  //find out cur y-value from html id
  value = document.getElementsByClassName('data-value')[0].id;

  // AWAIT! for data
  data = await d3.csv('https://flunky.github.io/cars2017.csv');

  //outer (include axis) 700x800, inner (only chart data) 600x600
  margin = { x: 100, y: 50 }; //padding
  inner_chart = { x: 600, y: 600 };

  //domain:  values of x axis (# of cylinders), range of inner chart
  x = d3.scaleLinear().domain([-1, 12]).range([0, inner_chart.x]);
  //domain: values of y axis (cityMPG), range of inner chart
  y = d3.scaleLinear().domain([0, 150]).range([inner_chart.y, 0]);
  //   y = d3.scaleLog([10, 150], [inner_chart.y, 0]).base(10);
  var yh = d3.scaleLinear().domain([0, 150]).range([0, inner_chart.y]);

  //scatter plot
  //create g
  d3.select('svg')
    .append('g')
    .attr('transform', 'translate(' + (margin.x-25) + ',' + margin.y + ')') //move whole chart
    .selectAll('rect') // create rect
    .data(data) //import data
    .enter()
    .append('rect') //adds rect

    //d: data, i: index, from csv
    .attr('x', function (d, i) {
      return x(d.EngineCylinders);
    })
    .attr('y', function (d, i) {
      return y(d[value]);
    })
    .attr('width',600/13)
    .attr("height",function(d) { return yh(d[value]); })

  //y axis
  d3.select('svg')
    .append('g')
    .attr('transform', 'translate(' + margin.x + ',' + margin.y + ')')
    .call(d3.axisLeft(y));

  //x axis, y translate value is range+margin (need to be placed at bottom)
  d3.select('svg')
    .append('g')
    .attr(
      'transform',
      'translate(' + margin.x + ',' + (inner_chart.y + margin.y) + ')'
    )
    .call(d3.axisBottom(x));
}
