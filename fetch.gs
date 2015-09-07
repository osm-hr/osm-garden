function fetchData(queryArray, outsideData) {
  //sheetDebug.appendRow([outsideData.length, 'početak feća']);
    
  var OSMData = addObjectToArray(fetchIndividualQuery(queryArray[querryArrayCounter]),
    queryArray[querryArrayCounter].areaTagKey,
    queryArray[querryArrayCounter].areaTagValue);
  
  compareOSM.addNewData(OSMData);
    
  querryArrayCounter++;
  
  if (querryArrayCounter >= queryArray.length) {
    continueRefresh();
  } else {
    fetchData(queryArray, outsideData);
  }
}

function fetchIndividualQuery(querry) {
  var response = UrlFetchApp.fetch(querry.queryString);
  var obj = JSON.parse(response.getContentText());
  //sheetDebug.appendRow(["obj ima ovolko rowowa", obj.elements.length]);
  return obj;
}

function addObjectToArray(obj, areaTagKey, areaTagValue) {
  var object;
  var tableArray = new Array();

  for (j = 0; j < obj.elements.length; ++j) {
    
    //Every element gets the area tag which tells which area it was found in
    if (areaTagKey != undefined){
      obj.elements[j].tags[areaString.concat(areaTagKey)] = areaTagValue;
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
          if (obj.elements[j].center === undefined){
            object = "0;0";
          } else {
            object = obj.elements[j].center.lat.toString().concat(";", obj.elements[j].center.lon.toString());
          }
        }
      } else {
        object = obj.elements[j].tags[fieldTypes[i].key] === undefined ? "" : obj.elements[j].tags[fieldTypes[i].key];
      }
      rowArray.push(object);
    }
    
    for (i = 0; i < metaFieldTypes.length; ++i) {
      switch (metaFieldTypes[i]){
        case metaType.jump:
          rowArray.push("=HYPERLINK(\"https://www.openstreetmap.org/".concat(obj.elements[j].type,"/",obj.elements[j].id,"\";\"jump\")"));
          break;
        case metaType.timestampOSM:
          rowArray.push(obj.osm3s.timestamp_osm_base);
          break;
        case metaType.user:
          rowArray.push("=HYPERLINK(\"https://www.openstreetmap.org/user/".concat(obj.elements[j].user,"\";\"",obj.elements[j].user,"\")"));
          break;
        case metaType.timestampElement:
          rowArray.push(obj.elements[j].timestamp);
          break;
        case metaType.version:
          rowArray.push("Verzija: ".concat(obj.elements[j].version));
          break;
        case metaType.changeset:
          rowArray.push("=HYPERLINK(\"https://www.openstreetmap.org/changeset/".concat(obj.elements[j].changeset,"\";\"changeset\")"));
          break;
        case metaType.type:
          rowArray.push(obj.elements[j].type);
          break;
        case metaType.id:
          rowArray.push(obj.elements[j].id);
          break;
        case metaType.latlon:
          rowArray.push("latlong");
          break;
      }
    }
    //if (rowArray.length!=fieldTypes.length) sheetDebug.appendRow([rowArray.length,fieldTypes.length]);
    tableArray.push(rowArray);
    //sheetDebug.appendRow([rowArray.toString()]);
  }
  return tableArray;
}