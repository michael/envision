require 'net/http'
require 'json'
require 'uri'

class Collection < Envision::Model
  field :name, :index => true
  field :descr
  field :uri
    
  def to_hash
    {
      :id => id,
      :name => name,
      :descr => descr,
      :uri => uri
    }
  end
  
  def to_hash_with_content
    result = JSON.parse(Net::HTTP.get_response(::URI.parse(uri)).body)
    
    result.merge!({
      :id => id,
      :name => name,
      :descr => descr,
      :uri => uri
    })
  end
  
  def to_json
    JSON.pretty_generate(to_hash)
  end
end