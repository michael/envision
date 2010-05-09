require 'net/http'
require 'json'
require 'uri'

class Collection < Envision::Model
  field :name, :index => true
  field :descr
  field :uri
  
  has_many :properties, Property
  has_many :items, Item
  has_many :views, View
  
  # loads the collection by fetching it from the given uri
  def load
    response = Net::HTTP.get_response(URI.parse(uri)).body
    load_from_json(response)
  end
  
  def load_from_json(raw_json)
    data = JSON.parse(raw_json)
    
    props = {}
    data["properties"].each do |pkey, p|
      props[pkey] = Property.new(:name => p["name"], :type => p["type"] || "string")
      props[pkey].collection = self
      props[pkey].save
    end
    
    data["items"].each do |i|
      item = Item.new(:name => i["name"])
      item.collection = self
      
      attrs = {}
      i["attributes"].each do |a|
        property_id = props[a["property"]].id
        attrs[property_id] = a["values"].map {|v| v["value"]}      
      end
      
      item.raw_attributes = attrs.to_json
      item.save
    end
  end
  
  # clearing up the collection
  def clear

  end
end