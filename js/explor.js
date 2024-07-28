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
        '<b>Average Combined MPG: </b>' +
          d.avgMPG +
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

  /* 
        scatter plot
        */
  //create g
  crt = d3
    .select('svg')
    .append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')') //move whole chart
    .selectAll('circle') // create circle
    .data(data); //import data

  d3.selectAll('circle').remove();

  crt
    .enter()
    .append('circle') //adds circle
    .merge(crt)

    //d: data, i: index, from csv
    .attr('cx', function (d, i) {
      return x(d.EngineCylinders);
    })
    .attr('cy', function (d, i) {
      return y(d.avgMPG);
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

  /* 
        axis
        */
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
    .text('MPG Values');

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

  /* 
        Fuel checkbox
        */
  // current fuel types selected
  fuelSelected = ['Diesel', 'Electricity', 'Gasoline'];
  mpg = 'avgMPG';
  make = 'All';

  d3.select('form#fuel-checkbox')
    .selectAll('input')
    .on('change', function () {
      if (this.checked) {
        // console.log('checked');
        // console.log(this);
        fuelSelected.push(this.value);
        // console.log(fuelSelected);
      } else {
        // console.log('unchecked');
        // console.log(this);
        fuelSelected = fuelSelected.filter((item) => item !== this.value);
        // console.log(fuelSelected);
      }
      update(fuelSelected, mpg, make);
    });

  /* 
        MPG dropdown
        */

  d3.select('select#city-highway-dropdown').on('change', function () {
    // console.log(this.value);
    mpg = this.value;
    update(fuelSelected, mpg, make);
  });

  /* 
        make dropdown
        */

  d3.select('select#make-dropdown').on('change', function () {
    // console.log(this.value);
    make = this.value;
    update(fuelSelected, mpg, make);
  });

  /* 
  update func
   */
  function update(fuelSelected, mpg, make) {
    const inSelectedFuel = (d) => {
      return fuelSelected.includes(d.Fuel);
    };
    const SelectedMake = (d) => {
      return d.Make == make;
    };

    //change annotation's fuel list based on selected mpg value
    if (mpg == 'AverageCityMPG') {
        MPGtext = 'Average City MPG'
      fuelList = 'cityCyl';
      makeList = 'cityCylMake';
    } else if (mpg == 'AverageHighwayMPG') {
        MPGtext = 'Average Highway MPG';
      fuelList = 'hwCyl';
      makeList = 'hwCylMake';
    } else {
        MPGtext = 'Average Combined MPG';
      fuelList = 'avgCyl';
      makeList = 'avgCylMake';
    }

    //include only data whoses fuel type is part of selected fuel list
    // if picked a certain make, only show its data points
    if (make !== 'All') {
      filteredData = data.filter(inSelectedFuel).filter(SelectedMake);
      fuelList = 'Fuel';
      makeList = 'Make'
    } else {
      filteredData = data.filter(inSelectedFuel);
    }


    /*tooltip functions */
    // Three function that change the tooltip when user hover / move / leave a cell
    mouseover = function (d) {
      // console.log(d);
      tooltip.style('opacity', 1);
      d3.select(this).style('stroke', 'black');
    };

    mousemove = function (d) {
      tooltip
        .html(
          '<b>'+ MPGtext +': </b>' +
            d[mpg] +
            '<p> <b>Cylinder Count: </b>' +
            d.EngineCylinders +
            '</p> <p> <b>Fuel(s): </b>' +
            d[fuelList] +
            '</p> <p> <b>Make(s): </b>' +
            d[makeList] +
            '</p>'
        )
        .style('left', d3.mouse(this)[0] + margin.left + 20 + 'px')
        .style('top', d3.mouse(this)[1] + margin.top + 'px');
    };

    mouseleave = function (d) {
      tooltip.style('opacity', 0);
      d3.select(this).style('stroke', 'none');
    };

    //select data points
    updateScatter = d3
      .select('#chart')
      .select('svg')
      .select('g')
      .selectAll('.circle') // select all circles
      .data(filteredData); //filter data

    d3.selectAll('circle').remove();

    updateScatter
      .enter()
      .append('circle')

      .attr('cx', function (d, i) {
        return x(d.EngineCylinders);
      })
      .attr('cy', function (d, i) {
        return y(d[mpg]);
      })
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
  }
}
