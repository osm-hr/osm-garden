function onOpen(e) {
  var ui = SpreadsheetApp.getUi();
  
  ui.createAddonMenu()
      .addItem('Start', 'runRefresh')
      .addToUi();
  //showSidebar();
}

function onInstall(e) {
  onOpen(e);
}

function showSidebar() {
  var ui = HtmlService.createHtmlOutputFromFile('Sidebar')
      .setTitle('Rezultati');
  SpreadsheetApp.getUi().showSidebar(ui);
}

function runRefresh() {
  ss = SpreadsheetApp.getActiveSpreadsheet();
  OutsideSheet = ss.getSheetByName("Data");
  if (OutsideSheet === null) {
     ss.insertSheet("Data");
    return;
  }
  OSMSheet = ss.getSheetByName("OSM");
  if (OSMSheet === null) OSMSheet = ss.insertSheet("OSM");
  sheetDebug = ss.getSheetByName("Debug");
  if (sheetDebug === null) sheetDebug = ss.insertSheet("Debug");
  DiffSheet = ss.getSheetByName("Diff");
  if (DiffSheet === null) DiffSheet = ss.insertSheet("Diff");
  numberOfHeaderRows = 4;
  cn = 0;
  //var arrValues = OutsideSheet.getRange(2,1,1,OutsideSheet.getLastColumn()).getValues();
  //while (typeof arrValues[0].shift() === "string") cn++;
  areaString = "area$";
  osmString = "osmtag";
  typeString = "osmtype";
  matchString = "match";
  nearString = "osmnear";
  inString = "osmin";
  tagString = "tag=";
  anchorString = "anchor";
  delimiterString = "|";
  matchTypeDelimiter = ":";
  anyString = "*";
  colourCorrect = "#a7f6b2";
  colourFalse = "#eb5960";
  colourNear = "#ccff99";
  colourNeutral = "#ffffff";
  operationType = { osmtag:1, osmin:2, osmtype:3, osmnear:4 };
  metaType = { jump:0, timestampOSM:1, user:2, timestampElement:3, version:4, changeset:5, type:6, id:7, latlon:8};
  matchType = { none:0, match:1, number:2, hrstreetname:3 };
  elementType = { node:0, way:1, relation:2 };
  compareType = { positive:0, negative:1 };
  //elementType = { node:1, way:2, relation:3 };
  
  fieldTypes = recognizeFieldTypes(OutsideSheet);
  metaFieldTypes = [metaType.jump,metaType.user,metaType.changeset,metaType.timestampOSM,metaType.timestampElement];
  for (var ft = 0; ft<fieldTypes.length; ft++)
  {
    if (fieldTypes[ft].operationType == operationType.osmnear)
    {
      metaFieldTypes.push(metaType.latlon);  
    }
  }
  rn = OutsideSheet.getLastRow()-numberOfHeaderRows; //Row number za outside array
  OutsideRange = OutsideSheet.getRange(numberOfHeaderRows+1, 1, rn, cn);
  var outsideData = OutsideRange.getValues();
  sheetDebug.appendRow([outsideData.length]);
  if (OSMSheet.getLastRow() > 0){
    OSMRange = OSMSheet.getRange(1, 1, OSMSheet.getLastRow(), fieldTypes.length + metaFieldTypes.length);
    OldOSMData = OSMRange.getValues();
  }else{
    OldOSMData = new Array();
  }
  
  //var atticData = getAtticData();
  queryArray = createOverpassQuery(fieldTypes);
  querryArrayCounter = 0;
  fullTableArray = new Array();
  fullOSMColorArray = new Array();
  fullOutsideColorArray = new Array(rn);
  compareOSM = new Comparer( fieldTypes, metaFieldTypes );
  compareOSM.setOldData(outsideData);
  compareOSM.setOldNewData(OldOSMData);
  fetchData(queryArray, outsideData);

}

function continueRefresh() {

  compareOSM.compareData();
  
  OSMSheet.clear();

  OSMSheet.getRange(1, 1, compareOSM.newValue.length, compareOSM.newValue[0].length).setValues(compareOSM.newValue);

  OSMSheet.getRange(1, 1, compareOSM.newColour.length, compareOSM.newColour[0].length).setBackgrounds(compareOSM.newColour);
  
  if (compareOSM.diffValue.length > 0){
    var diffLR = DiffSheet.getLastRow();
    if (diffLR > 0){
      var currentValues = DiffSheet.getRange(1, 1, diffLR, DiffSheet.getLastColumn()).getValues();
      var currentBackgrounds = DiffSheet.getRange(1, 1, diffLR, compareOSM.diffColour[0].length).getBackgrounds();
      DiffSheet.getRange(1,1,OSMSheet.getMaxRows(),OSMSheet.getMaxColumns()).clear();
      while(currentValues.length) compareOSM.diffValue.push(currentValues.shift());
      while(currentBackgrounds.length) compareOSM.diffColour.push(currentBackgrounds.shift());
    }
    DiffSheet.getRange(1, 1, compareOSM.diffValue.length, compareOSM.diffValue[0].length).setValues(compareOSM.diffValue);
    DiffSheet.getRange(1, 1, compareOSM.diffColour.length, compareOSM.diffColour[0].length).setBackgrounds(compareOSM.diffColour);
  }
  
  //popunjavanje redova koji nisu našli para
  
  OutsideSheet.clearFormats();
  
  var outsideRange = OutsideSheet.getRange(numberOfHeaderRows+1, 1, compareOSM.oldColour.length, compareOSM.oldColour[0].length);
  for (var i = 0; i<compareOSM.oldColour.length; ++i){
    if (  compareOSM.oldColour[i] === undefined)
      sheetDebug.appendRow(["Nema old Color ovaj red:",i]);
  }
  
  outsideRange.setBackgrounds(compareOSM.oldColour);

}

function recognizeFieldTypes(sheet) {

  var operationArray = sheet.getRange(2, 1, 3, sheet.getLastColumn()).getValues();
  var fieldTypes = new Array();
  for (i = 0; i < operationArray[0].length + 1; ++i) {
  
    var myFieldType = new Object();
    fieldTypes.push(myFieldType);
    var keyCell = operationArray[0][i];
    var valueCell = operationArray[1][i];
    var operationCell = operationArray[2][i];

    if (keyCell != undefined && keyCell.indexOf(tagString) == 0 || keyCell === typeString){
    //init myFieldType
      myFieldType.mandatoryOSM = false;
      myFieldType.mandatoryCompare = false;
      myFieldType.compare = matchType.none;
      var operationValues = operationCell.split(delimiterString);
      for (j=0;j<operationValues.length;j++){
      
        switch (operationValues[j].split(matchTypeDelimiter)[0])
        {
          case inString:
            myFieldType.operationType = operationType.osmin;
            break;
          case osmString:
            if(myFieldType.operationType != operationType.osmin){
              myFieldType.operationType = operationType.osmtag;
            }
            break;
          case anchorString:
            myFieldType.mandatoryCompare = true;
            myFieldType.compare = getMatchType(operationValues[j]);
            break;
          case osmString:
            myFieldType.mandatoryOSM = true;
            break;
          case matchString:
            myFieldType.compare = getMatchType(operationValues[j]);
            break;
        }
      }
    }
    
    if (keyCell != undefined && keyCell.indexOf(tagString) == 0){
      myFieldType.key = keyCell.substr(tagString.length, keyCell.length);
     if (valueCell === anyString){
          myFieldType.anyValue = true;
        } else {
          myFieldType.anyValue = false;
          if (typeof valueCell === 'string'){
            myFieldType.value = valueCell.split(delimiterString);
          } else if (typeof valueCell === 'number'){
            myFieldType.value = new Array();
            myFieldType.value.push(valueCell);
          }
        }
    } else if (keyCell != undefined && keyCell === typeString) {
      myFieldType.operationType = operationType.osmtype;
      myFieldType.elementType = valueCell.split(delimiterString);
    } else if (keyCell != undefined && keyCell === nearString) {
      myFieldType.operationType = operationType.osmnear;
      myFieldType.distance = parseFloat(valueCell);
    } else {
      cn = i;

      fieldTypes.pop();
      break;
    }
  }

  return fieldTypes;
}

function createOverpassQuery(fieldTypes) {
  var oquerry = "";
  var oquerryUrl = "http://overpass-api.de/api/interpreter?data=";
  var oquerryHeader = "[out:json];";
  //var d = new Date();
  //var atticQueryHeader = "[diff:\"".concat(d.getFullYear(),"-",d.getMonth(),"-",d.getDate(),"T",d.getHours(),":",d.getMinutes(),":",d.getSeconds(),"Z\"]");
  var oquerrys = new Array();
  var oquerryTags = "";
  var oquerryTypes = new Array();
  var oquerryAreaValues;
  var oquerryAreaKey = "";
  var oquerryAreas = new Array();

  for (i = 0; i < fieldTypes.length; ++i) {
    
    if (fieldTypes[i].operationType == undefined) {
      continue;
    }
    if (fieldTypes[i].operationType == operationType.osmtype) {
      oquerryTypes = oquerryTypes.concat( fieldTypes[i].elementType );
    }
    if (fieldTypes[i].operationType == operationType.osmin) {
      var newArea = new Object();
      newArea.key=fieldTypes[i].key;
      newArea.values=fieldTypes[i].value;
      oquerryAreas.push(newArea);
    }
    if (fieldTypes[i].operationType == operationType.osmtag) {
      oquerryTags = oquerryTags.concat("[\"", fieldTypes[i].key, "\"~\"", fieldTypes[i].value.join("|"), "\"]");
    }
  }
  for (i = 0; i < oquerryTypes.length; ++i) {
    if (i > 0) oquerry = oquerry.concat(";");
    oquerry = oquerry.concat(oquerryTypes[i].toString());
    oquerry = oquerry.concat(oquerryTags);
  }
  //dio o areama u kojima se nešto nalazi
  
  for (i = 0; i < oquerryAreas.length; ++i) {
    for (j = 0; j < oquerryAreas[i].values.length; ++j) {
      var areaQueryPart = "area[\"".concat(oquerryAreas[i].key, "\"=\"",
        oquerryAreas[i].values[j], "\"]->.a;");
        //sheetDebug.appendRow([areaQueryPart]);
        var queryString = oquerryUrl.concat(encodeURIComponent(
        oquerryHeader.concat(areaQueryPart,"(",oquerry.replace("way[", "way(area.a)[").replace("node[", "node(area.a)["), ");out meta center;")));
        var atticQueryString = oquerryUrl.concat(encodeURIComponent(
        oquerryHeader.concat(areaQueryPart,"(",oquerry.replace("way[", "way(area.a)[").replace("node[", "node(area.a)["), ");out meta center;")));
      var myQuery = new queryObject(queryString, oquerryAreas[i].key, oquerryAreas[i].values[j]);
        //sheetDebug.appendRow([oquerryHeader.concat("(",oquerry.replace("way[", "way(area.a)[").replace("node[", "node(area.a)["), ");out ids tags center;")]);

      oquerrys.push( myQuery);
    }
  }

  //next line writes overpass querys into debug sheet
  //for (i=0;i<oquerrys.length;i++){sheetDebug.appendRow([oquerrys[i].queryString,oquerrys[i].areaTagKey,oquerrys[i].areaTagValue]);}

  return oquerrys;

}

function queryObject(queryString, areaTagKey, areaTagValue) {
  this.queryString = queryString;
  this.areaTagKey = areaTagKey;
  this.areaTagValue = areaTagValue;
};
