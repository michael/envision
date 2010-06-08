ENV["RAILS_ENV"] = "development"
require File.expand_path('../../../config/environment', __FILE__)


desc 'Initialize redis db with some example data'

namespace :redis do
  task :seed do
    
    start = Time.now
    
    # Empty the database
    Collection.redis.flushdb
    
    # Create some users
    u = User.create(:username => "michael", :first_name => "Michael", :last_name => "Aufreiter")
    u2 = User.create(:username => "oliver", :first_name => "Oliver", :last_name => "")
    
    # Create some collections
    c = Collection.create(:name => "World's countries", :uri => "http://collections.quasipartikel.at/countries")
    c2 = Collection.create(:name => "Last.fm playlists", :uri => "http://collections.quasipartikel.at/playlists")
    
    # Create some projects
    p = Project.new(:name => "Comparing the world's countries")
    p.user = u
    p.save
    
    p2 = Project.new(:name => "Music Artist similarities")
    p2.user = u
    p2.save
    
    # Create some sheets
    s = Sheet.new(:name => "Population vs. GDP")
    s.project = p
    s.collection = c
    s.save
    
    s2 = Sheet.new(:name => "Area vs. Population per Currency")
    s2.project = p
    s2.collection = c
    s2.save
    
    s3 = Sheet.new(:name => "Co-Occurrence Analysis")
    s3.collection = c2
    s3.project = p2
    s3.save
    
    stop = Time.now
    runtime = stop - start
    
    puts "Successfully seeded redis db in #{runtime} seconds. Populated with some example data..."
  end
end