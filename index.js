function addFuelList(data) {
  var newData = [];
  var FuelDict = {}; //'MakeCylinderCount': [Fuels]
  for (const row of data) {
    var newRowData = {};

    m = row.Make;
    c = row.EngineCylinders;
    if (m + c in FuelDict) {
      FuelDict[m + c].push(row.Fuel);
    } else {
      FuelDict[m + c] = [row.Fuel];
    }

    newRowData.Make = m;
    newRowData.EngineCylinders = c;
    newRowData.FuelList = FuelDict[m + c];
    newRowData.AverageCityMPG = row.AverageCityMPG;
    newRowData.AverageHighwayMPG = row.AverageHighwayMPG;
    newRowData.Fuel = row.Fuel;

    newData.push(newRowData);
  }
  return newData;
}

async function init() {
  // AWAIT! for data
  data = await d3.csv('https://flunky.github.io/cars2017.csv');

  cylinders = [
    ...new Set(
      data.map((d) => {
        return d.EngineCylinders;
      })
    ),
  ];

  //added fuel list to data
  data = addFuelList(data);
  // console.log(data);

  // sort based on # cylinders
  data.sort((a, b) => {
    return b['EngineCylinders'] - a['EngineCylinders'];
  });

  //outer (include axis) 700x800, inner (only chart data) 600x600
  margin = { left: 150, right: 50, top: 25, bottom: 75 }; //padding
  inner_chart = { x: 600, y: 600 };

  //domain:  values of x axis (# of cylinders), range of inner chart
  x = d3.scaleLinear().domain([-1, 12]).range([0, inner_chart.x]);
  //domain: values of y axis (different make brands), range of inner chart
  y = d3
    .scaleBand()
    .domain(
      data.map((d) => {
        return d.Make;
      })
    )
    .range([inner_chart.y, 0]);

  //   fuels = [
  //     ...new Set(
  //       data.map((d) => {
  //         return d.Fuel;
  //       })
  //     ),
  //   ];

  // bind fuel type to value
  color = d3.scaleOrdinal(
    ['Gasoline', 'Electricity', 'Diesel'],
    ['red', 'orange', 'blue']
  );

  // create a tooltip
  tooltip = d3
    .select('#chart')
    .append('div')
    .style('opacity', 0)
    .attr('class', 'tooltip')
    .style('background-color', 'white')
    .style('border', 'solid')
    .style('border-width', '1px')
    .style('border-radius', '5px')
    .style('padding', '10px')
    .style('position', 'absolute');

  // Three function that change the tooltip when user hover / move / leave a cell
  mouseover = function (d) {
    console.log(d)
    tooltip.style('opacity', 1);
    d3.select(this).style('stroke', 'black');
  };

  mousemove = function (d) {
    console.log(d3.mouse(this));
    tooltip
      .html('The exact value of ' + d.EngineCylinders)
      .style('left', d3.mouse(this)[0] + margin.left + 20 + 'px') // It is important to put the +90: other wise the tooltip is exactly where the point is an it creates a weird effect
      .style('top', d3.mouse(this)[1] +125 + 'px');
  };

  // A function that change this tooltip when the leaves a point: just need to set opacity to 0 again
  mouseleave = function (d) {
    tooltip.style('opacity', 0);
    d3.select(this).style('stroke', 'none');
  };

  //scatter plot
  //create g
  d3.select('#chart').select('svg')
    .append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')') //move whole chart
    .selectAll('circle') // create circle
    .data(data) //import data
    .enter()
    .append('circle') //adds circle

    //d: data, i: index, from csv
    .attr('cx', function (d, i) {
      return x(d.EngineCylinders);
    })
    .attr('cy', function (d, i) {
      return y(d.Make);
    })
    //Number(d.EngineCylinders) + 2.5
    .attr('r', function (d, i) {
      return 5;
    })
    //fill in color based on fuel type
    .style('fill', function (d, i) {
      if (d.FuelList.includes('Gasoline') && d.FuelList.includes('Diesel')) {
        return 'blue';
      }
      return color(d.Fuel);
    })
    // change opacity of color based on fuel amount
    .style('opacity', function (d, i) {
      if (d.FuelList.length > 1) {
        return 0.7;
      } else {
        return 0.5;
      }
    })
    // .style('opacity', 0.7)
    .on('mouseover', mouseover)
    .on('mousemove', mousemove)
    .on('mouseleave', mouseleave);

  //y axis
  d3.select('svg')
    .append('g')
    .attr(
      'transform',
      'translate(' + margin.left + ',' + (margin.top - 5) + ')'
    )
    .call(d3.axisLeft(y));

  //x axis, y translate value is range+margin (need to be placed at bottom)
  d3.select('svg')
    .append('g')
    .attr(
      'transform',
      'translate(' + margin.left + ',' + (inner_chart.y + margin.top) + ')'
    )
    .style('font-size', 14)
    .call(d3.axisBottom(x));

  //y axis label
  d3.select('svg')
    .append('text')
    .attr('text-anchor', 'end')
    .attr('transform', 'rotate(-90)')
    .attr('y', margin.left - 120)
    .attr('x', margin.top - 325)
    .style('font-size', 18)
    .text('Make');

  //x axis label
  d3.select('svg')
    .append('text')
    .attr('text-anchor', 'end')
    .attr('x', margin.left + 350)
    .attr('y', inner_chart.y + margin.top + 50)
    .style('font-size', 18)
    .text('Engine Cylinders');

  
}
