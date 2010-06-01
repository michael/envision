ENV["RAILS_ENV"] = "development"
require File.expand_path('../../../config/environment', __FILE__)


desc 'Initialize redis db with some example data'

namespace :redis do
  task :seed do
    
    start = Time.now
    
    # Empty the database
    Collection.redis.flushdb
    
    # Register a sample collection
    c = Collection.create(:name => "World's countries", :uri => "http://localhost:4567/countries")
    
    # Load the collection
    c.load
    
    # Create an example view
    view = View.new(:name => "Example View")
    view.collection = c
    view.save
    
    
    # Register another sample collection
    c2 = Collection.create(:name => "Last.fm playlists", :uri => "http://localhost:4567/playlists")
    
    # Load the collection
    c2.load
    
    # Create an example view
    view = View.new(:name => "Artist Co-occurrences")
    view.collection = c2
    view.save
    
    stop = Time.now
    runtime = stop - start
    
    puts "Successfully seeded redis db in #{runtime} seconds. Populated with some example data..."
  end
end