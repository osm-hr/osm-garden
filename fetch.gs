function fetchData(queryArray) {
  //sheetDebug.appendRow([queryArray.length]);
  //sheetDebug.appendRow([queryArray[querryArrayCounter].queryString,queryArray[querryArrayCounter].areaTagKey,queryArray[querryArrayCounter].areaTagValue]);
  var tempArray = addObjectToArray(fetchIndividualQuery(queryArray[querryArrayCounter]),
    queryArray[querryArrayCounter].areaTagKey,
    queryArray[querryArrayCounter].areaTagValue);
  var tempOSMColorArray = compareData(tempArray);
  //sheetDebug.appendRow(["ovaj querry je vratio ovolko rowowoa", tempArray.length]);
  for (i = 0;i<tempOSMColorArray.length;i++){
    fullTableArray.push(tempArray[i]);
    fullOSMColorArray.push(tempOSMColorArray[i]);
  }
  
  //sheetDebug.appendRow(["fullTableArray ima ovolko rowowa", fullTableArray.length]);
  //sheetDebug.appendRow(["fullOSMColorArray ima ovolko rowowa", fullOSMColorArray.length]);
  //sheetDebug.appendRow(["fullOutsideColorArray ima ovolko rowowa", fullOutsideColorArray.length]);
  querryArrayCounter++;
  
  if (querryArrayCounter >= queryArray.length) {
    //sheetDebug.appendRow(["Izlaz iz fetch-a"]);
    continueRefresh();
  } else {
    //sheetDebug.appendRow(["Idemo spat"]);
    fetchData(queryArray, fieldTypes);
  }
}

function fetchIndividualQuery(querry) {
  var response = UrlFetchApp.fetch(querry.queryString);
  var obj = JSON.parse(response.getContentText());
  sheetDebug.appendRow(["obj ima ovolko rowowa", obj.elements.length]);
  return obj;
}

function addObjectToArray(obj, areaTagKey, areaTagValue) {
  var object;
  var tableArray = new Array();

  for (j = 0; j < obj.elements.length; ++j) {
    if (areaTagKey != undefined){
      obj.elements[j].tags[areaString.concat(areaTagKey)] = areaTagValue;
      //sheetDebug.appendRow([areaTagKey,areaTagValue]);
    }
    var rowArray = new Array();

    for (i = 0; i < fieldTypes.length; ++i) {

      if (fieldTypes[i].operationType == operationType.osmtype) {
        object = obj.elements[j].type;
      } else if (fieldTypes[i].operationType == operationType.osmin) {
        object = areaTagValue === undefined && fieldTypes[i].key != areaTagKey ? "" : areaTagValue;
      } else if (fieldTypes[i].operationType == operationType.osmnear) {
        if (obj.elements[j].type == "node"){
        //sheetDebug.appendRow([obj.elements[j].type]);
          object = obj.elements[j].lat.toString().concat(";", obj.elements[j].lon.toString());
        } else {
        //sheetDebug.appendRow([obj.elements[j].type]);
          object = obj.elements[j].center.lat.toString().concat(";", obj.elements[j].center.lon.toString());
        }
      } else {
        object = obj.elements[j].tags[fieldTypes[i].key] === undefined ? "" : obj.elements[j].tags[fieldTypes[i].key];
      }
      rowArray.push(object);
    }
    rowArray.push("=HYPERLINK(\"https://www.openstreetmap.org/".concat(obj.elements[j].type,"/",obj.elements[j].id,"\";\"jump\")"));
    //if (rowArray.length!=fieldTypes.length) sheetDebug.appendRow([rowArray.length,fieldTypes.length]);
    tableArray.push(rowArray);
    //sheetDebug.appendRow([rowArray.toString()]);
  }
  return tableArray;
}