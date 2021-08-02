// NOTE: This script is written to be compatible with node version 6.
// I know, that's sad. But please maintain that compatibility.

var counties = require( './lib/county-map.json' );
var fs = require( 'fs' );

function initializeData( data ) {
  var lines = data.split( '\n' );
  var headers = lines[3].split( '\t' );

  lines.splice( 0, 4 );

  var json = [];

  var someJson = lines.map( function( line ) {
    var tabs = line.split( '\t' );
    var obj = {};

    tabs.map( ( content, index ) => {
      obj[headers[index]] = content;
    } );

    json.push( obj );

  } );

  return json;
}

function getContactInfo ( val, program ) {
  if ( val ) {
    if ( val.startsWith( 'http' ) ){
      return ['url', val];
    } else if ( val.startsWith( 'www' ) ) {
      return ['url', 'http://' + val ];
    } else {
      return ['phone', val];
    }
  }
}

function processPrograms( programs ) {
  let results = {
    geographic:[],
    tribal:[]
  };
  let noContact = [];
  let noURL = [];
  let noCounty = [];
  programs.forEach( item => {
    let itemCopy = {};
    // Copy and rename values
    // Copy Geographic Level as Type
    let type = item['Geographic Level'];
    itemCopy['type'] = type;
    // Copy State as State
    itemCopy['state'] = item['State'];
    // Set State to territory name if territory
    if ( type === 'Territory' ) {
      let val = item['Tribal Government/ Territory'];
      if ( val === 'Commonwealth of the Northern Mariana Islands' ) {
        // Rename Mariana Islands to match state name
        itemCopy['state'] = 'Northern Mariana Islands';
      } else {
        itemCopy['state'] = val;
      }
    }
    // copy Program Name as Program
    itemCopy['program'] = item['Program Name'];
    // Set Name based on type
    itemCopy['name'] = item['City/County/ Locality'] ||
                       item['Tribal Government/ Territory'] ||
                       item['State'];
    // Add County if type === 'City'
    if ( type === 'City' ) {
      const state = item['State'];
      let stateObj = counties[state] || {};
      let county = stateObj[item['City/County/ Locality']]
      itemCopy['county'] = county;
      if (!county) {
        noCounty.push( `${item['City/County/ Locality']}, ${item['State']}`)
      }
    }
    // check to see whether contact info is URL or phone
    // and set Phone or URL property
    let contact = getContactInfo(
      item['Program Page Link  (Phone # if Link is Unavailable)']
    )
    if (contact) {
      itemCopy[contact[0]] = contact[1];
      if ( contact[0] === 'phone' ) {
        noURL.push( [item['Program Name'], contact[1]] )
      }
    } else {
      noContact.push(item['Program Name']);
    }



    if ( itemCopy.type === 'Tribal Government' ) {      
      results.tribal.push(itemCopy);
    } else {
      results.geographic.push(itemCopy);
    }

  })
  return {
    programs: results,
    noContact: noContact,
    noCounty: noCounty,
    noURL: noURL
  }
}



// "main" code

if ( process.argv[2] == null ) {
  console.log( 'No argument was provided! This script requires a TSV file as its sole argument.' );
} else {
  fs.readFile( process.argv[2], 'utf8' , ( err, data ) => {
    if (err) {
      console.error( err );
      return;
    }

    // process the data
    var json = initializeData( data );
    var results = processPrograms( json );

    fs.writeFile( 'output/erap.json', JSON.stringify( results.programs ), (err) => {
      if (err) throw err;
      console.log('The file has been saved!');
    })

  } );

}
