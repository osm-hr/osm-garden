function Comparer(fieldTypes, metaFieldTypes) {
  var that = this;
  this.ft = fieldTypes; //definition found in the first few rows of the Data sheet
  this.mft = metaFieldTypes;
  this.newValue = new Array();
  this.newColour = new Array();
  this.oldColour = new Array();
  this.diffValue = new Array();
  this.diffColour = new Array();
  met = { oldEl:0, newEl:1 };//MatchElementType
  saet = { valueEl:0, orderEl:1, coordEl:2 };//sortedArrayElementType

  var mandatoryColumns = new Array();
  for (var i = 0; i < this.ft.length; ++i) {
    if (this.ft[i].mandatoryCompare) {
      mandatoryColumns.push(i);
    }
  }

  var latlongMatching = false;
  for (var i = 0; i < this.ft.length; ++i) {
    if (this.ft[i].operationType == operationType.osmnear) {
      latlongMatching = true;
      var coordinatesColumn = i;
      var distance = fieldTypes[i].distance;
      break;
    }
  }
  for (var i = 0; i < this.mft.length; ++i) {
    if (this.mft[i] == metaType.latlon) {
      var metaCoordinatesColumn = i + this.ft.length;
    }
  }

  this.oldSet = new Array(); //when comparing, this is the Data sheet, when diffing, it is the old OSM sheet
  this.newSet = new Array(); //when comparing, this is the OSM sheet, when diffing, it is the just downloaded OSM data
  this.oldnewSet = new Array();
  var oldRowNumber;

  this.setOldData = function(outsideData) {
    this.oldSet = outsideData;
    oldRowNumber = outsideData.length;
    if (this.oldSet.length > 0 && this.oldSet[0].length == this.ft.length) {
      return true;
    } else {
      return false;
    }
  };
  
  this.setOldNewData = function(outsideData) {
    this.oldNewSet = outsideData;
    if (this.oldNewSet.length > 0 && this.oldNewSet[0].length == this.ft.length) {
      return true;
    } else {
      return false;
    }
  };

  this.addNewData = function(OSMData) {
    this.newSet = this.newSet.concat(OSMData); //It is concated because sometimes we have multiple Overpass queries
    sheetDebug.appendRow(["Sada ima redova:", this.newSet.length]);
  };

  this.compareData = function() {
    initContent();
    var md = sortAndMatchData(this.oldSet, this.newSet, compareType.positive);
    compareMatched(this.oldSet, this.newSet, md, compareType.positive, this.ft, coordinatesColumn);
	
	md = sortAndMatchData(this.oldNewSet, this.newValue, compareType.negative);
	addNonMatchedData(md, this.ft);
	compareMatched(this.oldNewSet, this.newValue, md, compareType.negative, this.ft, coordinatesColumn);

  };

  function initContent() {
    that.newValue = that.newSet.slice(); //Slice without arguments copies the array
    that.newColour = new Array(that.newSet.length);
    that.oldColour = new Array(that.oldSet.length);

  }

  function sortAndMatchData(os, ns, ct) {
    var matchData = new Object();
    if (latlongMatching) {
      var outsideArray = createArrayForDistanceSorting(os, coordinatesColumn, ct);
      outsideArray.sort(sortFunction);
      var OSMArray = createArrayForDistanceSorting(ns, coordinatesColumn, ct);
      OSMArray.sort(sortFunction);
      if (ct === compareType.positive) {
        matchData = matchSortedDistanceArrays(outsideArray, OSMArray, distance);
      } else if (ct === compareType.negative) {
        matchData = matchSortedStringArrays(outsideArray, OSMArray);
      }
    } else {
      var outsideArray = createArrayForStringSorting(os, mandatoryColumns);
      outsideArray.sort(sortFunction);
      var OSMArray = createArrayForStringSorting(ns, mandatoryColumns);
      OSMArray.sort(sortFunction);
      matchData = matchSortedStringArrays(outsideArray, OSMArray);
    }
    return matchData;
  };

  function createArrayForDistanceSorting(arrayForSorting, coordinatesColumn, ct) {
    var sortNumber;
    var distanceArray = new Array();
    for (var i = 0; i < arrayForSorting.length; ++i) {
      if (ct == compareType.positive) {
        sortNumber = getDistanceFromLatLonInKm(0, 0, parseFloat(arrayForSorting[i][coordinatesColumn].split(";")[0]),
          parseFloat(arrayForSorting[i][coordinatesColumn].split(";")[1]));
      } else if (ct == compareType.negative) {
        sortNumber = arrayForSorting[i][coordinatesColumn];
      }

      distanceArray[i] = new Array();
      distanceArray[i].push(sortNumber);
      distanceArray[i].push(i);
      distanceArray[i].push(arrayForSorting[i][coordinatesColumn]);
    }
    return distanceArray;
  }

  function createArrayForStringSorting(arrayForSorting, mandatoryColumns) {
    var sortNumber;
    var distanceArray = new Array();
    for (var i = 0; i < arrayForSorting.length; ++i) {
      sortNumber = "";
      for (var j = 0; j < mandatoryColumns.length; ++j) {
        sortNumber = sortNumber.concat("$$$$$", arrayForSorting[i][mandatoryColumns[j]]);
      }
      distanceArray[i] = new Array();
      distanceArray[i].push(sortNumber);
      distanceArray[i].push(i);
    }
    return distanceArray;
  }

  function matchSortedDistanceArrays(outsideArray, OSMArray, distance) {
    var matchArray = new Array();
    var noMatchOSMArray = new Array();
    var noMatchOutsideArray = new Array();
    var j = 0;
    for (var i = 0; i < outsideArray.length; ++i) {
      while (j < OSMArray.length) {

        if (outsideArray[i][saet.valueEl] < OSMArray[j][saet.valueEl] - distance) {
          noMatchOutsideArray.push(outsideArray[i][saet.orderEl]);
          break;
        }
        if (outsideArray[i][saet.valueEl] > OSMArray[j][saet.valueEl] + distance) {
          noMatchOSMArray.push(OSMArray[j][saet.orderEl]);
          j++;
          continue;
        }

        var distanceBetweenFeatures = getDistanceFromLatLonInKm(
			parseFloat(outsideArray[i][saet.coordEl].split(";")[0]),
			parseFloat(outsideArray[i][saet.coordEl].split(";")[1]),
			parseFloat(OSMArray[j][saet.coordEl].split(";")[0]),
			parseFloat(OSMArray[j][saet.coordEl].split(";")[1]));
        if (distanceBetweenFeatures < distance) {

          var outsideRow = outsideArray[i][saet.orderEl];
          var OSMRow = OSMArray[j][saet.orderEl];
          matchArray.push([outsideRow, OSMRow, distanceBetweenFeatures]);

        } else {
          if (outsideArray[i][0] < OSMArray[j][0]) {
            noMatchOutsideArray.push(outsideArray[i][saet.orderEl]);
            break;
          }
          if (outsideArray[i][0] > OSMArray[j][0]) {
            noMatchOSMArray.push(OSMArray[j][saet.orderEl]);
            j++;
            continue;
          }

        }
        j++;
        break;
      }
    }

    for (var nm = j; nm < OSMArray.length; ++nm) {
      noMatchOSMArray.push(OSMArray[nm][1]);
    }
    return {
      matched: matchArray,
      noMatchOutside: noMatchOutsideArray,
      noMatchOSM: noMatchOSMArray
    };
  }

  function matchSortedStringArrays(outsideArray, OSMArray) {
    var matchArray = new Array();
    var noMatchOSMArray = new Array();
    var noMatchOutsideArray = new Array();
    var j = 0;
    for (var i = 0; i < outsideArray.length; ++i) {
      while (j < OSMArray.length) {
        if (outsideArray[i][saet.orderEl]=== 6748)
        {
          kajjeovo=4;
        }
        if (OSMArray[j][saet.valueEl] > outsideArray[i][saet.valueEl]) {
          noMatchOutsideArray.push(outsideArray[i][saet.orderEl]);
          break;
        }
        if (OSMArray[j][saet.valueEl] < outsideArray[i][saet.valueEl]) {
          noMatchOSMArray.push(OSMArray[j][saet.orderEl]);
          j++;
          continue;
        }
        var outsideRow = outsideArray[i][saet.orderEl];
        var OSMRow = OSMArray[j][saet.orderEl];
        matchArray.push([outsideRow, OSMRow]);
        j++;
		break;
      }
    }

    for (var nm = j; nm < OSMArray.length; ++nm) {
      noMatchOSMArray.push(OSMArray[nm][saet.orderEl]);
    }
	for (var nm = i; nm < outsideArray.length; ++nm) {
      noMatchOutsideArray.push(outsideArray[nm][saet.orderEl]);
    }
	
	qualityControl(outsideArray, OSMArray, matchArray, noMatchOutsideArray, noMatchOSMArray);
    return {
      matched: matchArray,
      noMatchOutside: noMatchOutsideArray,
      noMatchOSM: noMatchOSMArray
    };
  }

  function compareMatched(oldSet, newSet, matchData, ct, fieldTypes, coordinatesColumn) {
    for (var i = 0; i < matchData.matched.length; i++) {
      var outsideRow = matchData.matched[i][met.oldEl];
      var OSMRow = matchData.matched[i][met.newEl];

      if (ct === compareType.positive) {
        var insertOSMRow = OSMRow;
      } else if (ct === compareType.negative) {
        var insertOSMRow = that.diffValue.length;
        that.diffValue[insertOSMRow] = oldSet[matchData.matched[i][met.oldEl]].slice();
        //negativeCompareMatch gets true if any of the fields is not the same as before
        var negativeCompareMatch = false;
      }
      
      if (ct === compareType.positive) {
        that.oldColour[outsideRow] = new Array();
		that.newColour[insertOSMRow] = new Array();
      }else if (ct === compareType.negative) {
		that.diffColour[insertOSMRow] = new Array();
	  }
      for (var k = 0; k < fieldTypes.length; ++k) {
        if (fieldTypes[k].operationType == operationType.osmnear) {

          if (ct === compareType.positive) {
            that.newColour[insertOSMRow][k] = colourNear;
            that.newValue[insertOSMRow][k] = (matchData.matched[i][2] * 1000).toFixed(1).toString().concat("m");
            that.oldColour[outsideRow].push(colourNear);
          } else if (ct === compareType.negative) {
            that.diffColour[insertOSMRow][k] = colourNeutral;
            that.diffValue[insertOSMRow][k] = oldSet[outsideRow][coordinatesColumn];
          }
        } else if (fieldTypes[k].mandatoryCompare || fieldTypes[k].compare != matchType.none) {
          var parameter = fieldTypes[k].compare == matchType.number ? fieldTypes[k].value[0] : 0;
          if(i==119){
            var thk=232;
          }
          var matchResult = matchArrayData(oldSet[outsideRow][k].toString().split("|"), newSet[OSMRow][k], fieldTypes[k].compare, parameter);
          if (matchResult === true) {
            if (ct === compareType.positive) {
              that.newColour[insertOSMRow][k] = colourCorrect;
              that.oldColour[outsideRow].push(colourCorrect);
            } else if (ct === compareType.negative) {
              that.diffColour[insertOSMRow][k] = colourNeutral;
            }
          } else if (matchResult === false) {
            if (ct === compareType.positive) {
              that.newColour[insertOSMRow][k] = colourFalse;
              that.oldColour[outsideRow].push(colourFalse);
            } else if (ct === compareType.negative) {
              that.diffColour[insertOSMRow][k] = colourFalse;
              negativeCompareMatch = true;
            }
          } else if (typeof matchResult === 'number') {
            if (ct === compareType.positive) {
              that.newColour[insertOSMRow][k] = colourNear;
              that.oldColour[outsideRow].push(colourNear);
			  that.newValue[insertOSMRow][k] = matchResult;
            } else if (ct === compareType.negative) {
              that.diffColour[insertOSMRow][k] = colourNeutral;
			  that.diffValue[insertOSMRow][k] = matchResult;
            }
          } else {
            if (ct === compareType.positive) {
              that.oldColour[outsideRow].push('#000000');
			  that.newColour[insertOSMRow][k] = '#000000';
            } else if (ct === compareType.negative) {
              that.diffColour[insertOSMRow][k] = '#000000';
            }
          }
        } else {
          
          if (ct === compareType.positive) {
            that.oldColour[outsideRow].push(colourNeutral);
			that.newColour[insertOSMRow][k] = colourNeutral;
          } else if (ct === compareType.negative) {
              that.diffColour[insertOSMRow][k] = colourNeutral;
            }
        }
      }

      if (latlongMatching === true) {
        for (var k = fieldTypes.length; k < fieldTypes.length + metaFieldTypes.length; ++k) {
          if (newSet[OSMRow][k] === "latlong") {
		  if (ct === compareType.positive) {
            that.newValue[insertOSMRow][k] = oldSet[outsideRow][coordinatesColumn];
          } else if (ct === compareType.negative) {
              that.diffValue[insertOSMRow][k] = oldSet[outsideRow][coordinatesColumn];
            }
          }
        }
      }

      if (ct === compareType.negative && negativeCompareMatch == false) {
        that.diffValue.pop();
        that.diffColour.pop();
      }


    }
    if (ct === compareType.positive) {
	//Ovo bi se moglo zamjeniti petljom koja ide po nonMatched
      for (var i = 0; i < that.newColour.length; i++) {
        if (that.newColour[i] === undefined) {
          that.newColour[i] = new Array();
          for (var k = 0; k < fieldTypes.length; ++k) {
            that.newColour[i].push(colourFalse);
          }
        }
      }
	  for (var i = 0; i < matchData.noMatchOutside.length; ++i)
	  {
		if (that.oldColour[i] === undefined)
		{
			that.oldColour[matchData.noMatchOutside[i]] = new Array();
			for (var k = 0; k < fieldTypes.length; ++k) {
				that.oldColour[matchData.noMatchOutside[i]].push(colourFalse);
			}
		}
	  }
	  //Provjera zbog nesavršenosti sustava
	  for (var i = 0; i < that.oldColour.length; ++i)
	  {
	  if (that.oldColour[i] === undefined)
		{
			that.oldColour[i] = new Array();
			for (var k = 0; k < fieldTypes.length; ++k) {
				that.oldColour[i].push("#ff9999");
			}
		}
	  }
    }
  }

  function addNonMatchedData(md, ft) {
    for (var u = 0; u < md.noMatchOutside.length; ++u) {
      that.diffValue[u] = that.oldNewSet[md.noMatchOutside[u]].slice();
      that.diffColour[u] = new Array();
      while (that.diffColour[u].length < ft.length)
        that.diffColour[u].push(colourFalse);
    }
    for (var v = 0; v < md.noMatchOSM.length; ++v) {
      that.diffValue[v] = that.newSet[md.noMatchOSM[v]].slice();
      that.diffColour[v] = new Array();
      while (that.diffColour[v].length < ft.length)
        that.diffColour[v].push(colourCorrect);
    }
  };

  function sortFunction(a, b) {
    if (a[0] === b[0]) {
      return 0;
    } else {
      return (a[0] < b[0]) ? -1 : 1;
    }
  };
  
  function qualityControl(oldArray, newArray, matchArray, noMatchOldArray, noMatchNewArray){
  
	for (var i = 0; i < matchArray.length; ++i)
	{
		var nonMatchedOld = noMatchOldArray.indexOf(matchArray[i][met.oldEl]);
		if (nonMatchedOld >= 0)
		{
			sheetDebug.appendRow(["Isti stari element u matchanim:".concat(i, " i nematchanim", nonMatchedOld)]);
		}
		var nonMatchedNew = noMatchOldArray.indexOf(matchArray[i][met.oldEl]);
		if (nonMatchedNew >= 0)
		{
			sheetDebug.appendRow(["Isti novi element u matchanim:".concat(i, " i nematchanim", nonMatchedNew)]);
		}
	}
	
	var oldMatchedArray = new Array();
	var newMatchedArray = new Array();
	for (var i = 0; i < matchArray.length; ++i)
	{
		oldMatchedArray.push(matchArray[i][met.oldEl]);
		newMatchedArray.push(matchArray[i][met.newEl]);
	}
	
	for (var i = 0; i < oldArray.length; ++i)
	{
		var matchedOld = oldMatchedArray.indexOf(oldArray[i][saet.orderEl]);
		var nonMatchedOld = noMatchOldArray.indexOf(oldArray[i][saet.orderEl]);
		if (matchedOld < 0 && nonMatchedOld < 0)
		{
			sheetDebug.appendRow(["Starog elementa:".concat(i, " nema ni u matchanim ni u nematchanim")]);
		}
	}
	for (var i = 0; i < newArray.length; ++i)
	{
		var matchedNew = newMatchedArray.indexOf(newArray[i][saet.orderEl]);
		var nonMatchedNew = noMatchNewArray.indexOf(newArray[i][saet.orderEl]);
		if (matchedNew < 0 && nonMatchedNew < 0)
		{
			sheetDebug.appendRow(["Novog elementa:".concat(i, " nema ni u matchanim ni u nematchanim")]);
		}
	}
	sheetDebug.appendRow(["Broj svih starih", oldArray.length]);
    sheetDebug.appendRow(["Broj svih novih", newArray.length]);
    sheetDebug.appendRow(["Broj spojenih", matchArray.length]);
    sheetDebug.appendRow(["Broj nespojenih starih", noMatchOldArray.length]);
    sheetDebug.appendRow(["Broj nespojenih novih", noMatchNewArray.length]);
    sheetDebug.appendRow(["----------------------"]);
  }
}