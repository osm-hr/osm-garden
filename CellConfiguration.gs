function PrintConfiguration(ft) {
  
  if (typeof globalVariablesInitialized === 'undefined' || globalVariablesInitialized!==true){
    initGlobalVariables();
  }
  
  var oSheet = getOutsideSheet();
  var targetArray = oSheet.getRange(1, 1, getNumberOfHeaderRows(), ft.length);
  
  var operationArray = [];
  var i;
  var nameCell;
  var keyCell;
  var valueCell;
  var operationCell;
  for (i=0;i<ft.length;i++){
  
    
    nameCell = ft[i].name;
    switch(ft[i].operationType){
      case operationType.osmtag:
        keyCell=tagString+ft[i].key;
        if (ft[i].anyValue==true){
          valueCell = anyString;
          operationCell = matchString;
        } else {
          valueCell=ft[i].value.join(delimiterString);
          operationCell = osmString + delimiterString + matchString;
        }
        break;
      case operationType.osmin:
        operationCell = inString;
        keyCell=tagString+ft[i].key;
        valueCell=ft[i].value.join(delimiterString);
        break;
      case operationType.osmtype:
        keyCell=typeString;
        operationCell=typeString + delimiterString + matchString;
        valueCell = ft[i].elementType.join(delimiterString);
        break;
      case operationType.osmnear:
        keyCell=nearString;
        operationCell=nearString;
        valueCell=ft[i].distance+"";
        break;
    default:
      break;
    }
    if (i === 0){
      for (var k = 0;k<numberOfHeaderRows;k++){
        operationArray[k] = [];
      }
    }
    operationArray[0].push(nameCell);
    operationArray[1].push(keyCell);
    operationArray[2].push(valueCell);
    operationArray[3].push(operationCell);
  }
  targetArray.setValues(operationArray);
  return(true);
}

function tester(){
  var fut = [{"anyValue":false,"operationType":1,"compare":1,"name":"vrtiæ","value":["kindergarten"],"mandatoryCompare":false,"key":"amenity","mandatoryOSM":true},{"anyValue":true,"operationType":1,"compare":1,"name":"ime","mandatoryCompare":false,"key":"name","mandatoryOSM":false},{"anyValue":true,"operationType":1,"compare":1,"name":"ulicasacd","mandatoryCompare":false,"key":"addr:street","mandatoryOSM":false},{"anyValue":true,"operationType":1,"compare":1,"name":"broj","mandatoryCompare":false,"key":"addr:housenumber","mandatoryOSM":false},{"anyValue":true,"operationType":1,"compare":1,"name":"e-mail","mandatoryCompare":false,"key":"email","mandatoryOSM":false},{"anyValue":true,"operationType":1,"compare":1,"name":"web","mandatoryCompare":false,"key":"website","mandatoryOSM":false},{"distance":0.5,"operationType":4,"name":"koordinate"},{"anyValue":false,"operationType":2,"compare":0,"name":"zagreb","value":["Q1435"],"mandatoryCompare":false,"key":"wikidata","mandatoryOSM":false},{"operationType":3,"compare":1,"name":"tip","mandatoryCompare":false,"elementType":["node","way"],"mandatoryOSM":false}];
  PrintConfiguration(fut);
  
}

function recognizeFieldTypes(sheet) {
  
  if (typeof globalVariablesInitialized === 'undefined' || globalVariablesInitialized!==true){
    initGlobalVariables();
  }
  var operationArray = sheet.getRange(1, 1, numberOfHeaderRows, sheet.getLastColumn()).getValues();
  var fieldTypes = new Array();
  for (i = 0; i < operationArray[0].length + 1; ++i) {
  
    var myFieldType = new Object();
    fieldTypes.push(myFieldType);
    var nameCell = operationArray[0][i];
    var keyCell = operationArray[1][i];
    var valueCell = operationArray[2][i];
    var operationCell = operationArray[3][i];
    myFieldType.name = nameCell;
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
              myFieldType.mandatoryOSM = true;
            }
            break;
          case anchorString:
            myFieldType.mandatoryCompare = true;
            myFieldType.compare = getMatchType(operationValues[j]);
            break;
          case matchString:
            if(myFieldType.operationType != operationType.osmin){
              myFieldType.operationType = operationType.osmtag;
            }
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

function getFieldTypes(){
  return recognizeFieldTypes(getOutsideSheet());
}