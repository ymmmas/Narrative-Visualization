function addNewData(data) {
  //data is list of obj
  var newData = [];
  var avgCylDict = {}; //'avgMPG+CylinderCount': [Fuels]
  var cityCylDict = {}; //'cityMPG+CylinderCount': [Fuels]
  var hwCylDict = {}; //'hwMPG+CylinderCount': [Fuels]

  var avgCylMakeDict = {}; //'avgMPG+CylinderCount': [Make]
  var cityCylMakeDict = {}; //'cityMPG+CylinderCount': [Make]
  var hwCylMakeDict = {}; //'hwMPG+CylinderCount': [Make]
  //for each row of date
  for (const row of data) {
    //new obj
    var newRowData = {};

    cMPG = row.AverageCityMPG;
    hMPG = row.AverageHighwayMPG;
    cyl = row.EngineCylinders;

    avgMPG = (Number(cMPG) + Number(hMPG)) / 2;

    if (cMPG + cyl in cityCylDict) {
      cityCylDict[cMPG + cyl].push(row.Fuel);
      cityCylMakeDict[cMPG + cyl].push(row.Make);
    } else {
      cityCylDict[cMPG + cyl] = [row.Fuel];
      cityCylMakeDict[cMPG + cyl] = [row.Make];
    }

    if (hMPG + cyl in hwCylDict) {
      hwCylDict[hMPG + cyl].push(row.Fuel);
      hwCylMakeDict[hMPG + cyl].push(row.Make);
    } else {
      hwCylDict[hMPG + cyl] = [row.Fuel];
      hwCylMakeDict[hMPG + cyl] = [row.Make];
    }

    if (avgMPG + cyl in avgCylDict) {
      avgCylDict[avgMPG + cyl].push(row.Fuel);
      avgCylMakeDict[avgMPG + cyl].push(row.Make);
    } else {
      avgCylDict[avgMPG + cyl] = [row.Fuel];
      avgCylMakeDict[avgMPG + cyl] = [row.Make];
    }

    newRowData.Make = row.Make;
    newRowData.EngineCylinders = cyl;
    newRowData.AverageCityMPG = cMPG;
    newRowData.AverageHighwayMPG = hMPG;
    newRowData.Fuel = row.Fuel;

    //new data
    newRowData.avgMPG = avgMPG;
    newRowData.avgCyl = avgCylDict[avgMPG + cyl];
    newRowData.cityCyl = cityCylDict[cMPG + cyl];
    newRowData.hwCyl = hwCylDict[hMPG + cyl];
    newRowData.avgCylMake = avgCylMakeDict[avgMPG + cyl];
    newRowData.cityCylMake = cityCylMakeDict[cMPG + cyl];
    newRowData.hwCylMake = hwCylMakeDict[hMPG + cyl];

    // console.log(newData);

    newData.push(newRowData);
  }
  return newData;
}

async function init() {
  //find out cur y-value from html id
  value = document.getElementsByClassName('main')[0].id;

  // AWAIT! for data
  data = await d3.csv('https://flunky.github.io/cars2017.csv');

  //add new data
  data = addNewData(data);

  //outer (include axis) 700x800, inner (only chart data) 600x600
  margin = { left: 150, right: 50, top: 25, bottom: 75 }; //padding
  inner_chart = { x: 600, y: 600 };

  //domain:  values of x axis (# of cylinders), range of inner chart
  x = d3.scaleLinear().domain([-1, 12]).range([0, inner_chart.x]);
  //domain: values of y axis (cityMPG), range of inner chart
  // y = d3.scaleLinear().domain([0, 150]).range([inner_chart.y, 0]);
  y = d3.scaleLog([10, 150], [inner_chart.y, 0]).base(10);

  // bind fuel type to value
  color = d3.scaleOrdinal(
    ['Gasoline', 'Electricity', 'Diesel'],
    ['red', 'orange', 'blue']
  );

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
    tooltip.style('opacity', 1);
    d3.select(this).style('stroke', 'black');
  };
  if (value == 'AverageCityMPG') {
    MPGtext = 'Average City MPG';
  } else {
    MPGtext = 'Average Highway MPG';
  }

  mousemove = function (d) {
    tooltip
      .html(
        '<b>' +
          MPGtext +
          ': </b>' +
          d[value] +
          '<p> <b>Cylinder Count: </b>' +
          d.EngineCylinders +
          '</p> <p> <b>Fuel(s): </b>' +
          d.avgCyl +
          '</p> <p> <b>Make(s): </b>' +
          d.avgCylMake +
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
  const type = d3.annotationCalloutRect;

  // 2d array, annotations[0] = list of annotations for city, annotations[1] = list for highway
  const annotations = [
    [
      {
        note: {
          title: '4-cylinder vehicles',
          label: 'achieve around 20-40 MPG',
          wrap: 300,
        },
        dy: -80,
        dx: 80,
        x: margin.left + 257,
        y: margin.top + 280,
        subject: {
          width: -50,
          height: 190,
        },
      },
      {
        note: {
          title: 'Higher cylinder vehicles',
          label: 'drop to around 12-17 MPG',
          wrap: 300,
        },
        dy: -40,
        dx: 20,
        x: margin.left + 400,
        y: margin.top + 475,
        subject: {
          width: 220,
          height: 130,
        },
      },
      {
        note: {
          title: 'Electric vehicles (zero cylinder)',
          label: 'have the highest city MPG.',
          wrap: 300,
        },
        dy: 50,
        dx: 130,
        x: margin.left + 70,
        y: 10,
        subject: {
          width: -50,
          height: 300,
        },
      },
    ],
    [
      {
        note: {
          title: '4-cylinder vehicles',
          label: 'achieve around 25-40 MPG',
          wrap: 300,
        },
        dy: -80,
        dx: 80,
        x: margin.left + 257,
        y: margin.top + 270,
        subject: {
          width: -50,
          height: 150,
        },
      },
      {
        note: {
          title: 'Higher cylinder vehicles',
          label: 'drop to around 12-26 MPG',
          wrap: 300,
        },
        dy: -40,
        dx: 20,
        x: margin.left + 400,
        y: margin.top + 375,
        subject: {
          width: 220,
          height: 130,
        },
      },
      {
        note: {
          title: 'Electric vehicles (zero cylinder)',
          label: 'have the highest city MPG.',
          wrap: 300,
        },
        dy: 50,
        dx: 130,
        x: margin.left + 70,
        y: 50,
        subject: {
          width: -50,
          height: 130,
        },
      },
    ],
  ];

  //change annotation index based on current html page being load
  //if of true -> 0, else ->1
  annotationsIndex = value.includes('City') ? '0' : '1';
  const makeAnnotations = d3
    .annotation()
    .type(type)
    .annotations(annotations[annotationsIndex]);

  d3.select('svg')
    .append('g')
    .attr('class', 'annotation-group')
    .call(makeAnnotations)
    // make it appear later
    .style('opacity', 0)
    .transition()
    .delay(500)
    .duration(1000)
    .style('opacity', 1);

  //scatter plot
  //create g
  d3.select('svg')
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
      return y(d[value]);
    })
    //Number(d.EngineCylinders) + 2.5
    .attr('r', function (d, i) {
      return 5;
    }) //fill in color based on fuel type
    .style('fill', function (d, i) {
      return color(d.Fuel);
    })
    .style('opacity', 0.5)
    .on('mouseover', mouseover)
    .on('mousemove', mousemove)
    .on('mouseleave', mouseleave);

  //y axis
  d3.select('svg')
    .append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
    .style('font-size', 20)
    //tickValues to set vlues you want to show on axis
    //tickFormat to change e+ value to number
    .call(
      d3
        .axisLeft(y)
        .tickValues([10, 20, 30, 40, 50, 80, 100, 120, 150])
        .tickFormat(d3.format('d'))
    );

  //x axis, y translate value is range+margin (need to be placed at bottom)
  d3.select('svg')
    .append('g')
    .attr(
      'transform',
      'translate(' + margin.left + ',' + (inner_chart.y + margin.top) + ')'
    )
    .style('font-size', 14)
    //tickValues to set vlues you want to show on axis
    //tickFormat to change e+ value to number
    .call(
      d3.axisBottom(x).tickValues([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12])
    );

  //y axis label
  d3.select('svg')
    .append('text')
    .attr('text-anchor', 'end')
    .attr('transform', 'rotate(-90)')
    .attr('y', margin.left - 120)
    .attr('x', margin.top - 275)
    .style('font-size', 18)
    .text(MPGtext);

  //x axis label
  d3.select('svg')
    .append('text')
    .attr('text-anchor', 'end')
    .attr('x', margin.left + 350)
    .attr('y', inner_chart.y + margin.top + 50)
    .style('font-size', 18)
    .text('Engine Cylinders');


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
