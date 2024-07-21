function averageData(cylinders, data) {
  var avgData = cylinders.map((c) => {
    const cyData = data.filter((d) => {
      return d.EngineCylinders == c;
    });

    // const meanEngineCylinders = d3.mean(
    //   cyData.map((d) => {
    //     return d.EngineCylinders;
    //   })
    // );
    const makeList = cyData.map((d) => {
      return d.Make;
    });

    return {
      EngineCylinders: c,
      makeList: makeList,
      meanAverageCityMPG: meanAverageCityMPG,
      meanAverageHighwayMPG: meanAverageHighwayMPG,
      AverageMPG: (meanAverageCityMPG + meanAverageHighwayMPG) / 2.0,
    };
  });

  return avgData;
}

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

  //   data = averageData(cylinders, data);
  data = addFuelList(data);
  console.log(data);

  // sort based on # cylinders
  data.sort((a, b) => {
    return b['EngineCylinders'] - a['EngineCylinders'];
  });

  //outer (include axis) 700x800, inner (only chart data) 600x600
  margin = { x: 100, y: 50 }; //padding
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

  //scatter plot
  //create g
  d3.select('svg')
    .append('g')
    .attr('transform', 'translate(' + margin.x + ',' + margin.y + ')') //move whole chart
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
    .style('opacity', function (d, i) {
        if (d.FuelList.length >1) {
        return 0.7;
        } else {
        return 0.5;
        }
    });
  // .style('opacity', 0.7);

  //y axis
  d3.select('svg')
    .append('g')
    .attr('transform', 'translate(' + margin.x + ',' + (margin.y - 5) + ')')
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
