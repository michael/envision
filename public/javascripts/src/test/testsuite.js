//-----------------------------------------------------------------------------
// Sheet
//-----------------------------------------------------------------------------

var sheet = new Sheet(null, new Collection(countries_fixture), plain_sheet_spec);

module('Commands');

test("command execution", function() {
  
  ok(sheet.collection.all('items').length === 6);
  
  // apply commands
  var cmd1 = sheet.applyCommand({
    command: 'add_criterion',
    options: {
      property: 'official_language',
      operator: 'CONTAINS',
      value: 'English Language'
    }
  });
  
  ok(sheet.commands.length === 1);
  ok(sheet.collection.all('items').length === 2);
  
  var cmd2 = sheet.applyCommand({
    command: 'add_criterion',
    options: {
      property: 'form_of_government',
      operator: 'CONTAINS',
      value: 'Constitution'
    }
  });
  
  ok(sheet.commands.length === 2);
  ok(sheet.collection.all('items').length === 1);
  ok(sheet.collection.get('items', 'usa').value('name') === 'United States of America');
  
  // inverse command should revert the original command
  var invcmd1 = sheet.applyCommand({
    command: 'remove_criterion',
    options: {
      property: 'form_of_government',
      operator: 'CONTAINS',
      value: 'Constitution'
    }
  });
  
  ok(sheet.commands.length === 1);
  ok(sheet.collection.all('items').length === 2);
  ok(sheet.collection.get('items', 'uk'));
  ok(sheet.collection.get('items', 'usa'));
});


