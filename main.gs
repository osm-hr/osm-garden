function onOpen(e) {
  var ui = SpreadsheetApp.getUi();
  
  ui.createAddonMenu()
      .addItem('Start', 'runRefresh')
      .addToUi();
  showSidebar();
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
  anyString = "*";
  operationType = { osmtag:1, osmin:2, osmtype:3, osmnear:4 };
  //elementType = { node:1, way:2, relation:3 };
  
  fieldTypes = recognizeFieldTypes();
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

function recognizeFieldTypes() {

  var operationArray = OutsideSheet.getRange(2, 1, 3, OutsideSheet.getLastColumn()).getValues();
  //sheetDebug.appendRow([operationArray.length,operationArray[0].length]);
  var fieldTypes = new Array();
  for (i = 0; i < operationArray[0].length + 1; ++i) {
    //sheetDebug.appendRow(["i=",i]);
    var myFieldType = new Object();
    fieldTypes.push(myFieldType);
    if (operationArray[0][i] != undefined && operationArray[0][i].indexOf(tagString) == 0){
      //sheetDebug.appendRow([tagString]);
      myFieldType.key = operationArray[0][i].substr(tagString.length, operationArray[0][i].length);
      //sheetDebug.appendRow([myFieldType.key]);
      if(operationArray[2][i].indexOf(inString) > -1){
        //sheetDebug.appendRow([inString]);
        myFieldType.operationType = operationType.osmin;
      } else if (operationArray[2][i].indexOf(osmString) > -1){
        //sheetDebug.appendRow([osmString]);
        myFieldType.operationType = operationType.osmtag;
      }
      if (operationArray[1][i] === anyString){
        //sheetDebug.appendRow(["*"]);
        myFieldType.anyValue = true;
      } else {
        myFieldType.anyValue = false;
        myFieldType.value = operationArray[1][i].split(delimiterString);
        //sheetDebug.appendRow([myFieldType.value.toString()]);
      }
      myFieldType.mandatoryCompare = operationArray[2][i].indexOf(anchorString) > -1 ? true : false;
      //sheetDebug.appendRow(["mandatoryCompare",myFieldType.mandatoryCompare]);
      myFieldType.mandatoryOSM = operationArray[2][i].indexOf(osmString) > -1 ? true : false;
      //sheetDebug.appendRow(["mandatoryOSM",myFieldType.mandatoryOSM]);
      myFieldType.compare = operationArray[2][i].indexOf(matchString) > -1 ? true : false;
      ////sheetDebug.appendRow(["compare",myFieldType.compare]);
      
    } else if (operationArray[0][i] != undefined && operationArray[0][i] === typeString) {
      //sheetDebug.appendRow([typeString]);
      myFieldType.operationType = operationType.osmtype;
      myFieldType.elementType = operationArray[1][i].split(delimiterString);
      myFieldType.compare = operationArray[2][i].indexOf(matchString) > -1 ? true : false;
      //sheetDebug.appendRow(["elementType",myFieldType.elementType[0]]);
    } else if (operationArray[0][i] != undefined && operationArray[0][i] === nearString) {
      myFieldType.operationType = operationType.osmnear;
      myFieldType.distance = parseFloat(operationArray[1][i]);
    } else {
      cn = i;
      //sheetDebug.appendRow(["pop",cn]);
      fieldTypes.pop();
      break;
    }
  }
  /*var fieldValues = new Array();

  for (i = 0; i < cn; ++i) {
    if (values[i].indexOf(haskvString) == 0 || values[i].indexOf(tagString) == 0) {
      fieldValues.push(values[i].slice(values[i].indexOf("=") + 1, values[i].length));
    } else if (values[i].indexOf(intagString) == 0) {
      fieldValues.push(areaString.concat(values[i].slice(values[i].indexOf("=") + 1, values[i].length)));
    } else if (values[i] === typeString) {
      fieldValues.push(typeString.concat("$"));
    }
  }*/

  //sheet.appendRow([fieldValues.toString()]);
  //sheetDebug.appendRow(["gotono!"]);
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
  //sheetDebug.appendRow(["ovo je oquerry",oquerry]);
  //dio o areama u kojima se nešto nalazi
  
  //sheetDebug.appendRow([oquerryAreas.length, oquerryAreas[0].values.length]);
  for (i = 0; i < oquerryAreas.length; ++i) {
    for (j = 0; j < oquerryAreas[i].values.length; ++j) {
      //sheetDebug.appendRow([oquerryAreas[i].key]);
      //sheetDebug.appendRow([oquerryAreas[i].values[j]]);
      var areaQueryPart = "area[\"".concat(oquerryAreas[i].key, "\"=\"",
        oquerryAreas[i].values[j], "\"]->.a;")
        sheetDebug.appendRow([areaQueryPart]);
      var myQuery = new queryObject(oquerryUrl.concat(encodeURIComponent(
        oquerryHeader.concat(areaQueryPart,"(",oquerry.replace("way[", "way(area.a)[").replace("node[", "node(area.a)["), ");out ids tags center;"))),
        oquerryAreas[i].key, oquerryAreas[i].values[j]);
        sheetDebug.appendRow([oquerryHeader.concat("(",oquerry.replace("way[", "way(area.a)[").replace("node[", "node(area.a)["), ");out ids tags center;")]);
         //var myQuery = new queryObject(oquerryUrl.concat(encodeURIComponent(
        //oquerryHeader.concat("area[\"", oquerryAreas[i].key, "\"=\"",
        //oquerryAreas[i].values[j], "\"];(",
        //oquerry.replace("area", "area(area)").replace("way[", "way(area)[").replace("node", "node(area)"), ");out body qt;"))),
        //oquerryAreas[i].key, oquerryAreas[i].values[j]);
      //sheetDebug.appendRow([myQuery.queryString]);
      /*myQuery.queryString=oquerryUrl.concat(encodeURIComponent(oquerryHeader.concat("area[\"",oquerryAreaKey,"\"=\"",oquerryAreaValues[i].toString(),"\"];(",oquerry.replace("node","node(area)").replace("way","way(area)"),");out body qt;")));
      myQuery.areaTagKey=oquerryAreaKey;
      myQuery.areaTagValue=oquerryAreaValues[i].toString();*/
      oquerrys.push( myQuery);
    }
  }

  //}
  //next line writes overpass querys into debug sheet
  for (i=0;i<oquerrys.length;i++){sheetDebug.appendRow([oquerrys[i].queryString,oquerrys[i].areaTagKey,oquerrys[i].areaTagValue]);}

  return oquerrys;

}

function queryObject(queryString, areaTagKey, areaTagValue) {
  this.queryString = queryString;
  this.areaTagKey = areaTagKey;
  this.areaTagValue = areaTagValue;
};
