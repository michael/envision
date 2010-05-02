require 'test_helper'

class FilterCriteriaTest < ActiveSupport::TestCase

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
  
  test "construction of filter criteria" do
    filter_criteria = FilterCriteria.new([
      {:property_id => 1, :values => ["Foo", "Bar"]},
      {:property_id => 2, :values => ["Dog"]}
    ])
    
    assert filter_criteria.length == 2
    assert filter_criteria.first.kind_of?(FilterCriterion)
    assert filter_criteria.first.property.name == "Languages spoken"
  end
  
end