function getTranslations(){
  var locale = Session.getActiveUserLocale();
  
  var languageStrings = {
  
      "en" : {
   EnterQuery: 'Entering the query',
   StartingQuery: 'Start the query',
   Results: 'Results',
   Help: 'Help',
   ChooseColumn: '1. Choose column',
   ComparisonType: '2. Comparison type',
   Tag: '2. Tag',
   ElementType: '2. Element type',
   Distance: '2. Distance',
   ColumnName: 'Column name',
   RadioTag: 'Tag',
        RadioTagTooltip: 'Element tag is checked',
   RadioType: 'Type (Node, way or relation)',
        RadioTypeTooltip: 'OSM element is downloaded only if is of this type (node, way and/or relation)',
   RadioNear: 'Near coordinates',
        RadioNearTooltip: 'Element coordinates must be near given coordinates (with ways and relations, their center is used)',
   RadioIn: 'Inside polygon',
        RadioInTooltip: 'OSM element is downloaded only if it is inside an area with the given tag. The tag should be unique in the OSM database, so you could use \x22wikidata=*\x22 or \x22ISO3166-1=*\x22',
   Key: 'Key (for example &quot;place&quot;)',
   Value: 'Value (for example &quot;village&quot;)',
      ValueTooltip: 'If this option is selected, Overpass query is limited to given values. More values can be delimited with |',
   AnyValue: 'Any value',
        AnyValueTooltip: 'If this option is selected, then the Overpass query is not limited. Whatever the value is, it will be downloaded and then compared.',
   MandatoryTag: 'Mandatory key-value combination',
        MandatoryTagTooltip: 'If this option is selected, then this tag is mandatory to find the match for this data. If it is not selected, then this tag will only be compared with the one from OSM.',
   AddColumnButton: 'Add Column',
   AllowedDistance: 'Allowed distance from given coordinates in meters:',
        Node: 'node',
        Way: 'way',
        Relation: 'relation',
        SaveButton: 'Save',
      SaveButtonProgress: 'Saving...',
        AddToEmailListButton: 'Add to list',
      RemoveFromEmailListButton: 'Remove from list',
        ReturnAllMails: 'All emails',
        RunScriptButton: 'Run script now',
        RunScriptButtonProgress: 'Script running...',
      QuestionWantScriptRunEvery2Days: 'Do you want the script to run every 2 days?',
      ScriptRunEveryXDays: 'Script is run circa every {0} days.',
        LastTimeScriptRun:  'Script ran sucessfully {0} ago',
        ScriptNotRunAutomatically: 'Script is not run automatically',
        Days:'days',
        Hours:'hours',
        Minutes:'minutes',
        EmailInvalid:'Email address is invalid.',
        EmailAddSucess:'Email sucessfully added.',
        EmailAddFail:'Adding email failed, or email already added.',
        EmailDeleteSucess:'Email sucessfully removed.',
        EmailDeleteFail:'Removing email failed, or email was not in present.',
        HelpColours: 'Colours',
      HelpRowIsRedTitle: 'Whole row is red',
            HelpRowIsGreenTitle: 'Whole row is green',
      HelpRowIsRedGreenTitleOne: 'Some cells ',
      HelpRowIsRedGreenTitleTwo: 'are red, ',
      HelpRowIsRedGreenTitleThree: 'and some are green',
        HelpRowIsYellowTitle: 'A cell is yellow',
      HelpRowIsRedBody: 'This data wasn&apos;t found amongst data downloaded from OSM. Likewise, this data is available in OSM, but it isn&apos;t amongst our selected data.',
      HelpRowIsGreenBody: 'This data was found in OSM, and all attributes are correct.',
      HelpRowIsRedGreenBody: 'Data was found in OSM, but attributes aren&apos;t the same. For data to be conected, cells with &quot;anchor&quot; must be the same. Attributes which are not the same are red.',
      HelpRowIsYellowBody: 'This colour is found only in cells with coordinates. If a cell is yellow, OSM data is within the given distance from the coordinate.',
        Yes: 'Yes',
        No: 'No'
  },
    
    "hr" : {
   EnterQuery: 'Upisivanje upita',
   StartingQuery: 'Pokretanje upita',
   Results: 'Rezultati',
   Help: 'Pomo�',
   ChooseColumn: '1. Odabir kolone',
   ComparisonType: '2. Tip usporedbe',
   Tag: '2. Oznaka',
   ElementType: '2. Tip elementa',
   Distance: '2. Udaljenost',
   ColumnName: 'Ime kolone',
   RadioTag: 'Oznaka (tag)',
      RadioTagTooltip: 'Provjerava se oznaka (tag) elementa',
   RadioType: 'Tip (to�ka, put ili relacija)',
      RadioTypeTooltip: 'OSM element se skida samo ako je ovog tipa (to�ka, put i/ili relacija)',
   RadioNear: 'Blizu koordinate',
      RadioNearTooltip: 'Provjerava se udaljenost OSM elementa od zadanih koordinata (kod puteva i relacija se gleda udaljenost od centra OSM elementa)',
   RadioIn: 'Unutar poligona',
      RadioInTooltip: 'OSM element se skida samo ako je unutar poligona sa zadanom oznakom. Oznaka bi trebala biti jedinstvena u bazi, recimo &quot;wikidata=*&quot; ili &quot;ISO3166-1=*&quot;',
   Key: 'Klju� (na primjer &quot;place&quot;)',
   Value: 'Vrijednost (na primjer &quot;village&quot;)',
      ValueTooltip: 'Ako je odabrana ova opcija onda se upit na Overpass ograni�ava na upisane vrijednosti. Vi�e vrijednosti odijeliti sa znakom |',
   AnyValue: 'Bilo koja vrijednost',
      AnyValueTooltip: 'Ako je odabrana ova opcija, onda se upit na Overpass ne�e ograni�iti. Skinut �e se kakva god bila vrijednost na tom klju�u, i onda �e se usporediti.',
   MandatoryTag: 'Obavezna kombinacija klju�a i vrijednosti',
      MandatoryTagTooltip: 'Ako je odabrana ova opcija, onda je ova oznaka (tag) obavezna kako bi se na�ao pandan. Ako ovo nije odabrano, onda �e se ova oznaka samo usporediti sa onom iz OSM-a.',
   AddColumnButton: 'Dodaj kolonu',
   AllowedDistance: 'Dopu�tena udaljenost od postavljene koordinate u metrima:',
        Node: 'to�ka',
        Way: 'put',
        Relation: 'relacija',
        SaveButton: 'Spremi',
      SaveButtonProgress: 'Spremam...',
        AddToEmailListButton: 'Dodaj u listu',
      RemoveFromEmailListButton: 'Bri�i iz liste',
      ReturnAllMails: 'Svi mailovi',
        RunScriptButton: 'Pokreni skriptu sada',
      RunScriptButtonProgress: 'Skripta radi...',
      QuestionWantScriptRunEvery2Days: '�elite li da se skripta pokre�e svaka 2 dana?',
      ScriptRunEveryXDays: 'Skripta se pokre�e otprilike svakih {0} dana.',
       LastTimeScriptRun: 'Skripta zadnji put uspje�no pokrenuta prije {0}',
      ScriptNotRunAutomatically: 'Skripta se ne pokre�e automatski.',
        Days:'dana',
        Hours:'sati',
        Minutes:'minuta',
      EmailInvalid:'Email adresa nije ispravna.',
      EmailAddSucess:'Uspje�no dodano.',
        EmailAddFail:'Dodavanje nije uspjelo ili email ve� postoji.',
        EmailDeleteSucess:'Uspje�no izbrisano.',
        EmailDeleteFail:'Brisanje nije uspjelo ili email nije postojao.',
      HelpColours: 'Boje',
      HelpRowIsRedTitle: 'Cijeli redak je crven',
            HelpRowIsGreenTitle: 'Cijeli redak je zelen',
      HelpRowIsRedGreenTitleOne: 'Neke �elije',
      HelpRowIsRedGreenTitleTwo: 'su crvene, ',
      HelpRowIsRedGreenTitleThree: 'a neke zelene',
      HelpRowIsYellowTitle: '�elija je �uta',
      HelpRowIsRedBody: 'Ovaj podatak nije na�en me�u podacima koji su skinuti iz OSM-a. Tako�er, mo�da podatak postoji u OSM-u, ali nema ga me�u zadanim podacima.',
      HelpRowIsGreenBody: 'Ovaj podatak je na�en u OSM-u, i svi atributi su ispravni.',
      HelpRowIsRedGreenBody: 'Podatak je na�en u OSM-u, ali atributi nisu isti. Kako bi se podatak smatrao na�enim, �elije sa oznakom &quot;anchor&quot; moraju biti iste. Atributi koji se ne podudaraju su crveni.',
      HelpRowIsYellowBody: 'Ova boja se pojavljuje samo u �elijama sa koordinatama. Ako je �uta, onda je unutar zadane udaljenosti na�en ispravan podatak.',
      Yes: 'Da',
        No: 'Ne'
  }
  };
  
   var scriptProperties = PropertiesService.getScriptProperties();
  scriptProperties.deleteAllProperties();
  var myLanguage = languageStrings[locale.slice(0,2)];
  if (myLanguage === undefined){
   myLanguage =  languageStrings["en"];
  }
  return myLanguage;
}

