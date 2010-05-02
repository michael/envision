require 'test_helper'

class ItemTest < ActiveSupport::TestCase

  def setup
    Item.redis.flushdb
    
    @item = Item.create(:name => "John")
    
    @attribute = Attribute.new
    @attribute.item = @item
    @attribute.save
  end
  
  def teardown
    Item.redis.flushdb
  end
    
  test "has name" do
    assert @item.name == "John"
  end
  
  test "has one attribute" do
    assert @item.attributes.length == 1
  end
  
  test "change attribute association" do
    @attribute.item = @item_2 = Item.create
    assert @attribute.item != @item
    @attribute.save
    assert @item.attributes.length == 0 #, "must not have assigned attributes"
    assert @item_2.attributes.length == 1 #, "must have one assigned attribute"
    @item = Item.get(@item.id) # reload item
  end
  
  test "list all items" do
    Item.create
    Item.create
    assert Item.all.length == 3
  end
    
  test "delete item" do
    assert true
  end
  

  
end