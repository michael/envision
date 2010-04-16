class Property < Ohm::Model
  attribute :name
  attribute :type # string, number, datetime, link
  
  index :name
  
  def validate
    assert_present :name
    assert_present :type
  end
end