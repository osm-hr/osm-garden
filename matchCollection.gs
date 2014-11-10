/**
* Returns if the two values are matching.
*
* @param {data} value coming from outside data
* @param {osm} value coming from osm
* @param {mt} matching type (match, number, hrstreetname...)
* @param {parameter} general parameter for matching
* @return {boolean} the result of the exponential calculation
*/
function matchData(data, osm, mt, parameter) {
  if (mt == matchType.match){
  //sheetDebug.appendRow(["MatchData pita", data, osm]);
  //sheetDebug.appendRow(["MatchData kaže ==", data == osm]);
  //sheetDebug.appendRow(["MatchData kaže ===", data === osm]);
    return data === osm;
  }
  //looks if a number is within limits that comes in "parameter"
  if (mt == matchType.number)
  {
    if (data > osm){
      var diff = data - osm;
    }
    else {
      var diff = osm - data;
    }
    
    if (diff == 0)
      return true;
    
    if (diff <= parameter)
      return diff;
  }
    
  if (mt == matchType.hrstreetname)
    {
      if (data.toLowerCase() === osm.toLowerCase()) return true;
      
      //Za "Ulica grada Vukovara" æe prihvatiti "grada vukovara"
      if (data.toLowerCase() === osm.toLowerCase().replace("ulica ", "")) return true; 
      
      //Za "Vukovarska ulica" æe prihvatiti "vukovarska"
      if (data.toLowerCase() === osm.toLowerCase().replace(" ulica", "")) return true;
      
      if (data.toLowerCase() === osm.toLowerCase().replace("ulica", "ul.")) return true;
      
      if (data.toLowerCase() === osm.toLowerCase().replace("aleja", "al.")) return true;
      
    }
    
    return false;
}

/**
* Returns if any of the values in array is matching with the wanted value.
*
* @param {data} array value coming from outside data
* @param {osm} value coming from osm
* @param {mt} matching type (match, number, hrstreetname...)
* @param {parameter} general parameter for matching
* @return {boolean} the result of the exponential calculation
*/
function matchArrayData(data, osm, mt, parameter) {

  for (m = 0; m < data.length; m++) {
    var res;
    res = matchData(data[m], osm, mt, parameter);
    if (res != false) {
      return res;
    }
  }
  return false;
}

function getMatchType(data) {
  switch(data.split(matchTypeDelimiter)[1])
  {
    case "hrstreetname":
      return matchType.hrstreetname;
    case "number":
      return matchType.number;
  }
  return matchType.match;
}