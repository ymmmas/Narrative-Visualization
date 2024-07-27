async function init() {
  //find out cur y-value from html id
  value = document.getElementsByClassName('data-value')[0].id;

  // AWAIT! for data
  data = await d3.csv('https://flunky.github.io/cars2017.csv');

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
    console.log(d);
    tooltip.style('opacity', 1);
    d3.select(this).style('stroke', 'black');
  };

  mousemove = function (d) {
    console.log(d3.mouse(this));
    tooltip
      .html(
        'cylinders: ' +
          d.EngineCylinders +
          ' mpg: ' +
          d[value] +
          ' fuel: ' +
          d.Fuel
      ) // need edit
      .style('left', d3.mouse(this)[0] + margin.left + 20 + 'px')
      .style('top', d3.mouse(this)[1] + 125 + 'px');
  };

  // A function that change this tooltip when the leaves a point: just need to set opacity to 0 again
  mouseleave = function (d) {
    tooltip.style('opacity', 0);
    d3.select(this).style('stroke', 'none');
  };

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
    .call(
      d3.axisLeft(y).tickFormat(function (e) {
        if (Math.abs(e) != e) {
          return;
        }

        return e;
      })
    );

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
    .attr('x', margin.top - 275)
    .style('font-size', 18)
    .text(value);

  //x axis label
  d3.select('svg')
    .append('text')
    .attr('text-anchor', 'end')
    .attr('x', margin.left + 350)
    .attr('y', inner_chart.y + margin.top + 50)
    .style('font-size', 18)
    .text('Engine Cylinders');

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
        y: margin.top + 425,
        subject: {
          width: -50,
          height: 120,
        },
      },
      {
        note: {
          title: 'Higher cylinder vehicles',
          label: 'drop to around 15-20 MPG',
          wrap: 300,
        },
        dy: -40,
        dx: 20,
        x: margin.left + 400,
        y: margin.top + 510,
        subject: {
          width: 220,
          height: 70,
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
          label: 'achieve around 30-40 MPG',
          wrap: 300,
        },
        dy: -80,
        dx: 80,
        x: margin.left + 257,
        y: margin.top + 425,
        subject: {
          width: -50,
          height: 90,
        },
      },
      {
        note: {
          title: 'Higher cylinder vehicles',
          label: 'drop to around 15-20 MPG',
          wrap: 300,
        },
        dy: -40,
        dx: 20,
        x: margin.left + 400,
        y: margin.top + 480,
        subject: {
          width: 220,
          height: 70,
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
        y: 115,
        subject: {
          width: -50,
          height: 200,
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


  //describe color labels for fuels
  const fuelTypes = [
    'Electricity;    1',
    'Electricity;    >= 2',
    'Diesel & Gasoline;    >= 2',
    'Gasoline;    1',
    'Gasoline;    >= 2',
  ];

  countColor = d3.scaleOrdinal(
    [
      'Electricity;    1',
      'Electricity;    >= 2',
      'Diesel & Gasoline;    >= 2',
      'Gasoline;    1',
      'Gasoline;    >= 2',
    ],
    ['orange', 'orange', 'blue', 'red', 'red']
  );
  const colorWidth = 30;
  // select the outerest div
  d3.select('#color-filter')
    //create svg & g
    .select('svg')
    .append('g')
    .attr('id', 'colorTable') // assign id to newly made svg
    .attr('transform', 'translate(' + 20 + ',' + margin.top + ')') //padding

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
    .style('opacity', function (d, i) {
      console.log(d);
      if (d.includes('2') || d.includes('Diesel')) {
        return 1;
      } else {
        return 0.5;
      }
    });

  //create color text labels
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
    .text('Fuel Type;   Value Counts');
}
