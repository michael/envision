require 'test_helper'

class PropertyTest < ActiveSupport::TestCase

  def setup
    Property.redis.flushdb
    
    @collection = Collection.create(:name => "Countries")
    # populate collection with items, attributes and values from fixture
    @collection.load_from_json(load_fixture('countries'))
    
    @property = @collection.properties.first # unique_languages
  end
  
  def teardown
    Property.redis.flushdb
  end
    
  test "has the right data" do
    assert @collection.items.length == 41
    assert @collection.properties.length == 3
    assert @property.name == "Languages spoken"
  end
  
  test "unique_values" do
    puts @property.unique_values.inspect
  end
  
end