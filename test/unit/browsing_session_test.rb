require 'test_helper'

class BrowsingSessionTest < ActiveSupport::TestCase

  def setup
    Envision::Model.redis.flushdb
    
    @collection = Collection.create(:name => "Countries")
    # populate collection with items, attributes and values from fixture
    @collection.load_from_json(load_fixture('countries'))
    
    @property = @collection.properties.first # unique_languages
  end
  
  def teardown
    Envision::Model.redis.flushdb
  end
    
  test "has the right data" do
    assert @collection.items.length == 41
    assert @collection.properties.length == 3
    assert @property.name == "Languages spoken"
  end
  
  test "derive facets" do
    set = Set.new(@collection)
    puts set.facets.first.inspect
  end
  
end