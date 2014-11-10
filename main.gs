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
  OutsideSheet = ss.getSheets()[0];
  OSMSheet = ss.getSheets()[1];
  sheetDebug = ss.getSheets()[2];
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
  operationType = { osmtag:1, osmin:2, osmtype:3, osmnear:4 };
  matchType = { none:0, match:1, number:2, hrstreetname:3 };
  //elementType = { node:1, way:2, relation:3 };
  
  fieldTypes = recognizeFieldTypes(OutsideSheet);
  rn = OutsideSheet.getLastRow()-numberOfHeaderRows; //Row number za outside array
  OutsideRange = OutsideSheet.getRange(numberOfHeaderRows+1, 1, rn, cn);

  queryArray = createOverpassQuery(fieldTypes);
  querryArrayCounter = 0;
  fullTableArray = new Array();
  fullOSMColorArray = new Array();
  fullOutsideColorArray = new Array(rn);
  fetchData(queryArray);

}

function continueRefresh() {

  OSMSheet.getRange(1,1,OSMSheet.getMaxRows(),OSMSheet.getMaxColumns()).clear();

  OSMSheet.getRange(1, 1, fullTableArray.length, fullTableArray[0].length).setValues(fullTableArray);

  OSMSheet.getRange(1, 1, fullOSMColorArray.length, fullOSMColorArray[0].length).setBackgrounds(fullOSMColorArray);
  
  //popunjavanje redova koji nisu našli para
  for (i = 0; i < fullOutsideColorArray.length; i++) {
    if (fullOutsideColorArray[i] === undefined) {
      fullOutsideColorArray[i] = new Array();
      for (k = 0; k < cn; ++k) {
        fullOutsideColorArray[i].push('#eb5960');
      }
    }
  }
  OutsideSheet.getRange(1,1,OutsideSheet.getMaxRows(),OutsideSheet.getMaxColumns()).clearFormat();
  
  var outsideRange = OutsideSheet.getRange(numberOfHeaderRows+1, 1, rn, cn);
  
  
  outsideRange.setBackgrounds(fullOutsideColorArray);

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
  var oquerryHeader = "[out:json];"
  var oquerrys = new Array();
  var oquerryTags = "";
  var oquerryTypes = new Array();
  var oquerryAreaValues;
  var oquerryAreaKey = "";
  var oquerryAreas = new Array();

  //sheetDebug.appendRow(["količina fieldTypesa", fieldTypes.length]);
  for (i = 0; i < fieldTypes.length; ++i) {
    
    if (fieldTypes[i].operationType == undefined) {
      //sheetDebug.appendRow(["Preskačemo fild type"]);
      continue;
    }
    //sheetDebug.appendRow(["fieldTypes[i].operationType", fieldTypes[i].operationType]);
    if (fieldTypes[i].operationType == operationType.osmtype) {
      oquerryTypes = oquerryTypes.concat( fieldTypes[i].elementType );
      //sheetDebug.appendRow(["element type prije",fieldTypes[i].elementType[0]]);
      //sheetDebug.appendRow(["element type poslije",oquerryTypes[0]]);
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
  //sheetDebug.appendRow(["Kolko tajpova ima",oquerryTypes.length]);
  for (i = 0; i < oquerryTypes.length; ++i) {
    //sheetDebug.appendRow(["Petlja po queryTypeovima",oquerryTypes[i].toString()]);
    if (i > 0) oquerry = oquerry.concat(";");
    oquerry = oquerry.concat(oquerryTypes[i].toString());
    oquerry = oquerry.concat(oquerryTags);
  }
  //dio o areama u kojima se nešto nalazi
  
  for (i = 0; i < oquerryAreas.length; ++i) {
    for (j = 0; j < oquerryAreas[i].values.length; ++j) {
      var areaQueryPart = "area[\"".concat(oquerryAreas[i].key, "\"=\"",
        oquerryAreas[i].values[j], "\"]->.a;")
        //sheetDebug.appendRow([areaQueryPart]);
      var myQuery = new queryObject(oquerryUrl.concat(encodeURIComponent(
        oquerryHeader.concat(areaQueryPart,"(",oquerry.replace("way[", "way(area.a)[").replace("node[", "node(area.a)["), ");out ids tags center;"))),
        oquerryAreas[i].key, oquerryAreas[i].values[j]);
        sheetDebug.appendRow([oquerryHeader.concat("(",oquerry.replace("way[", "way(area.a)[").replace("node[", "node(area.a)["), ");out ids tags center;")]);

      oquerrys.push( myQuery);
    }
  }

  //next line writes overpass querys into debug sheet
  for (i=0;i<oquerrys.length;i++){sheetDebug.appendRow([oquerrys[i].queryString,oquerrys[i].areaTagKey,oquerrys[i].areaTagValue]);}

  return oquerrys;

}

function queryObject(queryString, areaTagKey, areaTagValue) {
  this.queryString = queryString;
  this.areaTagKey = areaTagKey;
  this.areaTagValue = areaTagValue;
};