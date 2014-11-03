function compareData(OSMData) {
  //sheetDebug.appendRow(["Došli u compare"]);
  var mandatoryColumns = new Array();
  var coordinatesColumn;
  var dataOutsideData = OutsideRange.getValues();
  var colorOSMData = new Array(OSMData.length);
  var latlongMatching = false;
  var matchArray = new Array();
  var distance;

  for (i = 0; i < fieldTypes.length; ++i) {
    if (fieldTypes[i].mandatoryCompare) {
      mandatoryColumns.push(i);
    }
  }
  
  for (i = 0; i < fieldTypes.length; ++i) {
    if (fieldTypes[i].operationType == operationType.osmnear) {
      latlongMatching = true;
      //sheetDebug.appendRow(["latlongMatching = true"]);
      coordinatesColumn = i;
      distance = fieldTypes[i].distance;
      break;
    }
  }

  //Sort lists
  var sortString;
  var sortNumber;
  var outsideArray = new Array();
  var OSMArray = new Array();
  var distanceOutsideArray = new Array();
  var distanceOSMArray = new Array();
  
  if (latlongMatching) {
  for (i = 0; i < dataOutsideData.length; ++i) {
    sortNumber = getDistanceFromLatLonInKm(0,0,parseFloat(dataOutsideData[i][coordinatesColumn].split(";")[0]),
                                           parseFloat(dataOutsideData[i][coordinatesColumn].split(";")[1]));
    distanceOutsideArray[i] = new Array();
    distanceOutsideArray[i].push(sortNumber);
    distanceOutsideArray[i].push(i);
  }
  distanceOutsideArray.sort(sortFunction);
    
  for (i = 0; i < OSMData.length; ++i) {
    sortNumber = getDistanceFromLatLonInKm(0,0,parseFloat(OSMData[i][coordinatesColumn].split(";")[0]),
                                           parseFloat(OSMData[i][coordinatesColumn].split(";")[1]));
    distanceOSMArray[i] = new Array();
    distanceOSMArray[i].push(sortNumber);
    distanceOSMArray[i].push(i);
  }
  distanceOSMArray.sort(sortFunction);
  
  var j = 0;
  for (i = 0; i < distanceOutsideArray.length; ++i) {
    while (j < distanceOSMArray.length) {

      if (distanceOutsideArray[i][0]  <  distanceOSMArray[j][0] - distance) {
        //sheetDebug.appendRow([i,j,distanceOutsideArray[i][0], distanceOSMArray[j][0], distance,dataOutsideData[distanceOutsideArray[i][1]][coordinatesColumn],OSMData[distanceOSMArray[j][1]][coordinatesColumn],"Udaljenost je prevelika"]);
        break;
      }
      if (distanceOutsideArray[i][0] > distanceOSMArray[j][0] + distance) {
      //sheetDebug.appendRow([i,j,distanceOutsideArray[i][0], distanceOSMArray[j][0], distance,dataOutsideData[distanceOutsideArray[i][1]][coordinatesColumn],OSMData[distanceOSMArray[j][1]][coordinatesColumn],"Udaljenost je premala"]);
        j++;
        continue;
      }
      //sheetDebug.appendRow([i,j,distanceOutsideArray[i][0], distanceOSMArray[j][0], distance,dataOutsideData[distanceOutsideArray[i][1]][coordinatesColumn],OSMData[distanceOSMArray[j][1]][coordinatesColumn],"Udaljenost je ok", getDistanceFromLatLonInKm(
                                      //parseFloat(dataOutsideData[distanceOutsideArray[i][1]][coordinatesColumn].split(";")[0]),
                                      //parseFloat(dataOutsideData[distanceOutsideArray[i][1]][coordinatesColumn].split(";")[1]),
                                      //parseFloat(OSMData[distanceOSMArray[j][1]][coordinatesColumn].split(";")[0]),
                                      //parseFloat(OSMData[distanceOSMArray[j][1]][coordinatesColumn].split(";")[1]))]);
      var distanceBetweenFeatures = getDistanceFromLatLonInKm( parseFloat(dataOutsideData[distanceOutsideArray[i][1]][coordinatesColumn].split(";")[0]),
                                      parseFloat(dataOutsideData[distanceOutsideArray[i][1]][coordinatesColumn].split(";")[1]),
                                      parseFloat(OSMData[distanceOSMArray[j][1]][coordinatesColumn].split(";")[0]),
                                      parseFloat(OSMData[distanceOSMArray[j][1]][coordinatesColumn].split(";")[1]));
      if ( distanceBetweenFeatures < distance){
      //sheetDebug.appendRow([i,j,"NAŠLI SMO MEČ"]);
      var outsideRow = distanceOutsideArray[i][1];
      var OSMRow = distanceOSMArray[j][1];
      matchArray.push([outsideRow,OSMRow,distanceBetweenFeatures]);
      
      } else { //sheetDebug.appendRow([i,j,distanceOutsideArray[i][0], distanceOSMArray[j][0], distance,dataOutsideData[distanceOutsideArray[i][1]][coordinatesColumn],OSMData[distanceOSMArray[j][1]][coordinatesColumn],"Ali ipak nisu blizu"]);
        if (distanceOutsideArray[i][0]  <  distanceOSMArray[j][0]) {
        break;
      }
      if (distanceOutsideArray[i][0] > distanceOSMArray[j][0]) {
        j++;
        continue;
      }
      
      }
      j++;
    }
  }
  
  } else {
  
  
  for (i = 0; i < rn; ++i) {
    sortString = "";
    for (j = 0; j < mandatoryColumns.length; ++j) {
      sortString = sortString.concat("$$$$$", dataOutsideData[i][mandatoryColumns[j]]);
    }
    outsideArray[i] = new Array();
    outsideArray[i].push(sortString);
    outsideArray[i].push(i);
  }
  //sheetDebug.appendRow(["Počeo sort outsideDate"]);
  outsideArray.sort(sortFunction);
  //sheetDebug.appendRow(["Završio sort outsideDate"]);
  for (i = 0; i < OSMData.length; ++i) {
    sortString = "";
    for (j = 0; j < mandatoryColumns.length; ++j) {
      sortString = sortString.concat("$$$$$", OSMData[i][mandatoryColumns[j]]);
    }
    OSMArray[i] = new Array();
    OSMArray[i].push(sortString);
    OSMArray[i].push(i);
  }
  //sheetDebug.appendRow(["Počeo sort OSMDate"]);
  OSMArray.sort(sortFunction);
  //sheetDebug.appendRow(["Završio sort OSMDate"]);
  //

  var j = 0;
  for (i = 0; i < outsideArray.length; ++i) {
    while (j < OSMArray.length) {
      //sheetDebug.appendRow([i,j,dataOutsideData[i][dataOutsideData[i].length-2],OSMData[j][OSMData[j].length-2]]);
      if (OSMArray[j][0] > outsideArray[i][0]) {
        //sheetDebug.appendRow(["break"]);
        break;
      }
      if (OSMArray[j][0] < outsideArray[i][0]) {
        //sheetDebug.appendRow(["break"]);
        j++;
        continue;
      }

      var outsideRow = outsideArray[i][1];
      var OSMRow = OSMArray[j][1];
      //sheetDebug.appendRow([outsideRow,OSMRow]);
      matchArray.push([outsideRow,OSMRow]);
      //sheetDebug.appendRow([matchArray[0][0],matchArray[0][1]]);
      //sheetDebug.appendRow(["nije break"]);
      
      //colorOSMData[OSMRow] = new Array();
      //sheetDebug.appendRow(["match"]);
      
      j++;
    }
  }
  }
  for (i=0;i<matchArray.length;i++)  {
  var outsideRow = matchArray[i][0];
  var OSMRow = matchArray[i][1];
  colorOSMData[OSMRow] = new Array();
  fullOutsideColorArray[outsideRow] = new Array();
  for (k = 0; k < fieldTypes.length; ++k) {
        if (fieldTypes[k].mandatoryCompare || fieldTypes[k].compare){
        if (dataOutsideData[outsideRow][k].toString() === OSMData[OSMRow][k].toString() ||
          dataOutsideData[outsideRow][k].toString().indexOf(OSMData[OSMRow][k].toString().concat("|")) == 0 ||
          dataOutsideData[outsideRow][k].toString().indexOf("|".concat(OSMData[OSMRow][k].toString())) ==
          dataOutsideData[outsideRow][k].toString().length - OSMData[OSMRow][k].length - 1 ||
          dataOutsideData[outsideRow][k].toString().indexOf("|".concat(OSMData[OSMRow][k].toString(), "|")) > -1) {
          colorOSMData[OSMRow].push('#a7f6b2');
          fullOutsideColorArray[outsideRow].push('#a7f6b2');
        } else {
          colorOSMData[OSMRow].push('#eb5960');
          fullOutsideColorArray[outsideRow].push('#eb5960');
          if (OSMData[OSMRow][k].toString()==="n/a"){
            //sheetDebug.appendRow(["Različiti"]);
          }
        }}else if (fieldTypes[k].operationType == operationType.osmnear) {
        colorOSMData[OSMRow].push('#fffacd');
        fullOutsideColorArray[outsideRow].push('#fffacd');
        OSMData[OSMRow][k] = (matchArray[i][2]*1000).toFixed(1).toString().concat("m");
        
        }else{colorOSMData[OSMRow].push('#ffffff');
        fullOutsideColorArray[outsideRow].push('#ffffff');}
      }
  }
  
  //sheetDebug.appendRow(["colorOSMData.length", colorOSMData.length]);
  for (i = 0; i < colorOSMData.length; i++) {
    if (colorOSMData[i] === undefined) {
      colorOSMData[i] = new Array();
      //sheetDebug.appendRow(["Dodao san jednoga"]);
      for (k = 0; k < cn; ++k) {
        colorOSMData[i].push('#eb5960');
      }
    }
  }
  //for (i = 0; i < colorOSMData.length; i++) {
  //sheetDebug.appendRow([colorOSMData[i].length]);
  //}
  //sheetDebug.appendRow([OSMData.length, OSMData[0].length - 2, colorOSMData.length, colorOSMData[0].length]);
  //sheetDebug.getRange(1, 1, colorOSMData.length, colorOSMData[0].length).setValues(colorOSMData);
  return colorOSMData;
}


function sortFunction(a, b) {
  if (a[0] === b[0]) {
    return 0;
  } else {
    return (a[0] < b[0]) ? -1 : 1;
  }
}
