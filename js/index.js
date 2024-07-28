function addFuelList(data) {
  //data is list of obj
  var newData = [];
  var FuelDict = {}; //'MakeCylinderCount': [Fuels]
  //for each row of date
  for (const row of data) {
    //new obj
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
    newRowData.FuelList = FuelDict[m + c]; // new data
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

  //added fuel list to data
  data = addFuelList(data);

  // sort based on # cylinders
  data.sort((a, b) => {
    return b['EngineCylinders'] - a['EngineCylinders'];
  });

  //outer (include axis) 900x800, inner (only chart data) 600x600
  margin = { left: 150, right: 150, top: 25, bottom: 75 }; //padding
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

  // bind fuel type to value
  color = d3.scaleOrdinal(
    ['Gasoline', 'Electricity', 'Diesel'],
    ['red', 'orange', 'blue']
  );

  /* 
        tooltip 
        */
  // create a tooltip
  //show tooltip box & outline circle when selected
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
    // console.log(d);
    tooltip.style('opacity', 1);
    d3.select(this).style('stroke', 'black');
  };

  mousemove = function (d) {
    // console.log(d3.mouse(this));
    tooltip
      .html(
        '<p> <b>Cylinder Count: </b>' +
          d.EngineCylinders +
          '</p> <p> <b>Fuel(s): </b>' +
          d.FuelList +
          '</p> <p> <b>Make(s): </b>' +
          d.Make +
          '</p>'
      )
      .style('left', d3.mouse(this)[0] + margin.left + 20 + 'px')
      .style('top', d3.mouse(this)[1] + margin.top + 'px');
  };

  // A function that change this tooltip when the leaves a point: just need to set opacity to 0 again
  mouseleave = function (d) {
    tooltip.style('opacity', 0);
    d3.select(this).style('stroke', 'none');
  };

  //add annotations
  // put annotations infornt of data points so you can select tooltip
  const type = d3.annotationCalloutCircle;

  const annotations = [
    {
      note: {
        title: 'Economical brands',
        label: 'Focus on 4-8 cylinder engines',
        wrap: 300,
      },
      dy: -80,
      dx: 162,
      x: margin.left + 315,
      y: margin.top + 250,
      subject: {
        radius: 175,
        radiusPadding: 5,
      },
    },
    {
      note: {
        title: 'Luxury brands',
        label: 'Offers larger cylinder engines',
        wrap: 200,
      },
      dy: -80,
      dx: 0,
      x: margin.left + 550,
      y: margin.top + 525,
      subject: {
        radius: 75,
        radiusPadding: 5,
      },
    },
    {
      note: {
        title: 'Tesla: Example of Electric Vehicle Brands',
        label: 'Use engines with zero cylinders',
        wrap: 300,
      },
      dy: 0,
      dx: 200,
      x: margin.left + 46,
      y: margin.top,
      subject: {
        radius: 8,
        radiusPadding: 5,
      },
    },
  ];

  const makeAnnotations = d3.annotation().type(type).annotations(annotations);

  d3.select('#chart')
    .select('svg')
    .append('g')
    .attr('class', 'annotation-group')
    .call(makeAnnotations)
    //make it appear later
    .style('opacity', 0)
    .transition()
    .delay(500)
    .duration(1000)
    .style('opacity', 1);

  //scatter plot
  //create g
  d3.select('#chart')
    .select('svg')
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
    .style('opacity', 0.5)
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
    .call(
      d3.axisBottom(x).tickValues([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12])
    );

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
    .attr('x', margin.left + 385)
    .attr('y', inner_chart.y + margin.top + 50)
    .style('font-size', 18)
    .text('Engine Cylinder Counts');

  /* 
        fuel types label 
        describe color labels for fuels
        */
  const fuelTypes = ['Electricity', 'Diesel', 'Gasoline'];

  countColor = d3.scaleOrdinal(fuelTypes, ['orange', 'blue', 'red']);
  const colorWidth = 30;
  // select the outerest div
  d3.select('#fuel-colors')
    //create svg & g
    .select('svg')
    .append('g')
    .attr('id', 'colorTable') // assign id to newly made svg
    .attr('transform', 'translate(' + 0 + ',' + margin.top + ')') //padding

    .selectAll()
    .data(fuelTypes) //import data
    .enter()
    .append('rect') //add color rects
    .attr('x', () => {
      return 0;
    })
    .attr('y', (d, i) => {
      return (i + 1) * 20;
    })
    .attr('height', 15)
    .attr('width', (d) => {
      return colorWidth;
    })
    //fill rect colors based on label
    .style('fill', (d) => {
      return countColor(d);
    })
    .style('opacity', 0.7);

  //create color fuel labels
  d3.select('#colorTable') // select inner container just created
    .selectAll()
    .data(fuelTypes) //import data
    .enter()

    //add labels
    .append('text')
    .attr('x', () => {
      return colorWidth + 10;
    })
    .attr('y', (d, i) => {
      return (i + 1.7) * 20;
    })
    .attr('height', 15)
    .attr('width', (d) => {
      return colorWidth;
    })
    .text((d) => {
      return d;
    });

  //create title for color-fuel labels
  d3.select('#colorTable') // select inner container just created
    .append('text')
    .text('Fuel Types');
}
