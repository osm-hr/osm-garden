function onOpen(e) {
  var ui = SpreadsheetApp.getUi();
  
  ui.createAddonMenu()
      .addItem('Pokreni skriptu', 'runRefresh')
      .addToUi();
  ui.createAddonMenu()
      .addItem('Otvori traku', 'showSidebar')
      .addToUi();
  showSidebar();
}

function onInstall(e) {
  onOpen(e);
  initTriggers();
}

function showSidebar() {
  var ui = HtmlService.createHtmlOutputFromFile('Sidebar')
      .setTitle('OSM Garden');
  SpreadsheetApp.getUi().showSidebar(ui);
}

function initGlobalVariables(){
  globalVariablesInitialized = true;
  ss = SpreadsheetApp.getActiveSpreadsheet();
  OutsideSheet = ss.getSheetByName("Data");
  OSMSheet = ss.getSheetByName("OSM");
  if (OSMSheet === null) OSMSheet = ss.insertSheet("OSM");
  sheetDebug = ss.getSheetByName("Debug");
  if (sheetDebug === null) sheetDebug = ss.insertSheet("Debug");
  DiffSheet = ss.getSheetByName("Diff");
  if (DiffSheet === null) DiffSheet = ss.insertSheet("Diff");
  numberOfHeaderRows = 4;
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
}

function getOutsideSheet(){
  ss = SpreadsheetApp.getActiveSpreadsheet();
  return ss.getSheetByName("Data");
}

function getDebugSheet(){
  ss = SpreadsheetApp.getActiveSpreadsheet();
  return ss.getSheetByName("Debug");
}

function getNumberOfHeaderRows(){
  return 4;  
}

function runRefresh() {
  initGlobalVariables();
  if (OutsideSheet === null) {
     ss.insertSheet("Data");
    return;
  }
  cn = 0;
  
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
  queryArray = createOverpassQuery(fieldTypes, false);
  querryArrayCounter = 0;
  fullTableArray = new Array();
  fullOSMColorArray = new Array();
  fullOutsideColorArray = new Array(rn);
  compareOSM = new Comparer( fieldTypes, metaFieldTypes );
  compareOSM.setOldData(outsideData);
  compareOSM.setOldNewData(OldOSMData);
  fetchData(queryArray, outsideData);
  setTimeLastRun();
  return true;
}

function setTimeLastRun(){
  var d = new Date();
  var timeStamp = d.getTime();
  var documentProperties = PropertiesService.getDocumentProperties();
  documentProperties.setProperty("lastRun", timeStamp);
}

function getTimeLastRunDiff(){
  var d = new Date();
  var timeStamp = d.getTime();
  var documentProperties = PropertiesService.getDocumentProperties();
  var lastRun = documentProperties.getProperty("lastRun");
  var lastRunNum =  parseFloat(lastRun);
  return dhm(timeStamp-lastRunNum);
}

function continueRefresh() {

  compareOSM.compareData();
  
  OSMSheet.clear();

  var OSMSheetValueRange = OSMSheet.getRange(1, 1, compareOSM.newValue.length, compareOSM.newValue[0].length);
  //var nf = [];
  //for (var nfw = 0;nfw<OSMSheetValueRange.getWidth();nfw++){
  //  for (var nfh = 0;nfh<OSMSheetValueRange.getHeight();nfh++){
  //    nf[nfh] = [];
  //    nf[nfh][nfw] = '';
  //  }
  //}
  //OSMSheetValueRange.setNumberFormats(nf);
  OSMSheetValueRange.setValues(compareOSM.newValue);
  
  var OSMSheetColourRange = OSMSheet.getRange(1, 1, compareOSM.newColour.length, compareOSM.newColour[0].length);
  OSMSheetColourRange.setBackgrounds(compareOSM.newColour);
  
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
  SendDiff(compareOSM.diffValue);
  //popunjavanje redova koji nisu našli para
  
  OutsideSheet.clearFormats();
  
  var outsideRange = OutsideSheet.getRange(numberOfHeaderRows+1, 1, compareOSM.oldColour.length, compareOSM.oldColour[0].length);
  for (var i = 0; i<compareOSM.oldColour.length; ++i){
    if (  compareOSM.oldColour[i] === undefined)
      sheetDebug.appendRow(["Nema old Color ovaj red:",i]);
  }
  
  outsideRange.setBackgrounds(compareOSM.oldColour);

}

function createOverpassQuery(fieldTypes, forUser) {
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
    if (fieldTypes[i].operationType == operationType.osmtag && fieldTypes[i].mandatoryOSM == true) {
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
      var newHeader = oquerryHeader.concat(areaQueryPart,"(",oquerry.replace("way[", "way(area.a)[").replace("node[", "node(area.a)[").replace("relation[", "relation(area.a)["), ");out meta center;");
      if (forUser){  
      var queryString = oquerryUrl.concat(newHeader);
      }else{
        var queryString = oquerryUrl.concat(encodeURIComponent(newHeader));
      }
        //var atticQueryString = oquerryUrl.concat(encodeURIComponent(
        //oquerryHeader.concat(areaQueryPart,"(",oquerry.replace("way[", "way(area.a)[").replace("node[", "node(area.a)[").replace("relation[", "relation(area.a)["), ");out meta center;")));
      var myQuery = new queryObject(queryString, oquerryAreas[i].key, oquerryAreas[i].values[j]);
        //sheetDebug.appendRow([oquerryHeader.concat("(",oquerry.replace("way[", "way(area.a)[").replace("node[", "node(area.a)["), ");out ids tags center;")]);

      oquerrys.push( myQuery);
    }
  }

  //next line writes overpass querys into debug sheet
  //for (i=0;i<oquerrys.length;i++){sheetDebug.appendRow([oquerrys[i].queryString,oquerrys[i].areaTagKey,oquerrys[i].areaTagValue]);}

  return oquerrys;

}

function getOverpassQuery(){
  var ft = recognizeFieldTypes(getOutsideSheet());
  return createOverpassQuery(ft, true);

}

function queryObject(queryString, areaTagKey, areaTagValue) {
  this.queryString = queryString;
  this.areaTagKey = areaTagKey;
  this.areaTagValue = areaTagValue;
};
