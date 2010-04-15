# super nasty fix - ensures that the models are loaded in correct order
# AND NEVERTHELESS IT DOESN'T WORK YET :(
puts "initializing models..."
puts FacetCategory[1].name
Facet
Item
Collection