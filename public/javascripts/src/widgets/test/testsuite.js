//-----------------------------------------------------------------------------
// SortedHash API
// An awesome data structure you've always been missing in JavaScript
//-----------------------------------------------------------------------------

var countries,
    countrySelection;

module("Selection", {
  setup: function() {
    countries = new SortedHash();
    countries.set("at", "Austria");
    countries.set("de", "Germany");
    countries.set("ch", "Switzerland");
    countries.set("cz", "Czech");
    countries.set("pl", "Poland");
    
    countrySelection = new Selection(countries, ["pl", "at"])
  },
  teardown: function() {
    delete countries;
  }
});


test("construction", function() {
  ok(countrySelection.selection.length === 2);
  ok(countrySelection.selection.at(0) === 'Poland');
  ok(countrySelection.selection.at(1) === 'Austria');
});

test("Selection#select", function() {
  ok(countrySelection.selection.length === 2);
  
  countrySelection.select('de');
  countrySelection.select('cz');
  
  ok(countrySelection.isSelected('de') === true);
  ok(countrySelection.selection.length === 4);
  
  ok(countrySelection.selection.first() === 'Poland');
  ok(countrySelection.selection.at(1) === 'Austria');
  ok(countrySelection.selection.at(2) === 'Germany');
  ok(countrySelection.selection.get('cz') === 'Czech');
  
});

// s.select('not_available'); // skipped
// s.selection; // [Object#de, Object#cz] a sorted hash reflecting the selection in correct order
// s.selection.first(); // returns first selected item // SortedHash semantics
// s.deselect('cz');


