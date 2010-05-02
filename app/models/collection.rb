require 'net/http'
require 'json'
require 'uri'

class Collection < Envision::Model
  field :name, :index => true
  field :descr
  field :uri
  
  has_many :properties, Property
  has_many :items, Item
  
  # loads the collection by fetching it from the given uri
  def load
    response = Net::HTTP.get_response(URI.parse(uri)).body
    load_from_json(response)
  end
  
  def load_from_json(raw_json)
    data = JSON.parse(raw_json)
    
    props = {}
    data["properties"].each do |pkey, p|
      props[pkey] = Property.new(:name => p["name"], :type => "string")
      props[pkey].collection = self
      props[pkey].save
    end
    
    data["items"].each do |i|
      item = Item.new(:name => i["name"])
      item.collection = self
      item.save
      i["attributes"].each do |a|
        attrib = Attribute.new
        attrib.item = item
        attrib.property = props[a["property"]]
        attrib.save
        a["values"].each do |v|
          val = Value.new
          val.value = v["value"]
          val.attribute = attrib
          val.save
        end
      end
    end
  end
  
  # clearing up the collection
  def clear

  end
end