###################################################
# A simple Redis Object Mapper
# It's based on Hurl::Model but makes heavy use of
# the brandnew redis hash datastructure and adds
# basic support for associations
# no more json serialization
# New: support for redis list data structure
###################################################
# 
# Usage:
#
# 
# class User < Envision::Model
#   field :name
#   field :email, :index => true
#
#   list :nick_names
#
#   has_many :addresses, Address
# end

# class Address < Envision::Model
#   field :street
#   field :zip
#   field :city
#   
#   belongs_to :user, User
# end
# 

# User.create(:name => "foo", "email" => "foo@bar.com")
# User.all => [ #<User: @id=1>]
# @user = User.get(1)
# @address = Address.new(:street => "Foostreet", "1212", "Barcity")
# @address.user = @user
# @address.save
# 
# @user.addresses => [ #<Address: @id=1>]
# @address.user => #<User: @id=1>
# 
# 
# Known issues:
# - 
# - old indices are not deleted for the moment
# - indices are always unique

# Design decisions:
# - for code-complexity reasons associations can be only be changed on the child-side.

require 'redis'

module Envision
  
  class Model
  
    class Relationship
      attr_accessor :model, :type
      def initialize(model, type)

        @model = model
        @type = type
      end
    end
  
    attr_accessor :id
  
    #
    # class methods
    #

    def self.create(fields = {})
      obj = new(fields)
      obj.save
      obj
    end

    def self.indices
      @indices ||= []
    end
  
    def self.fields
      @fields ||= [:id]
    end
    
    def self.list_fields
      @list_fields ||= []
    end
  
    def self.relationships
      @relationships ||= {}
    end
    
    def self.list(list_name)
      list_fields << list_name
    end
    
    def self.field(field, options = {})
      fields << field unless fields.include?(field)
      index(field) if options[:index]
      attr_accessor field.to_sym
    end
  
    def self.index(field)
      indices << field unless indices.include?(field)
      sing = (class << self; self end)
      sing.send(:define_method, "find_by_#{field}") do |value|
        get(redis.hget(key(:indices, field), value))
      end
    end
  
    # associations
  
    def self.has_many(relationship_name, model)
      relationships[relationship_name] = Relationship.new(model, :collection)
    end
  
    def self.belongs_to(relationship_name, model)
      relationships[relationship_name] = Relationship.new(model, :reference)
    end
  
    def self.get(id)
      return nil unless redis.exists(key(id))
      field_values = {}
    
      fields.each do |field|
        field_values[field] = redis.hget(key(id), field)
      end
      new(field_values.merge(:saved => true))
    end
    
    def self.all
      res = []
      redis.lrange(key(:all), 0, -1).each do |id|
        res << get(id)
      end
      res
    end

    def self.inherited(subclass)
      subclass.index :id
    end

    def self.key(*parts)
      "#{name}:#{parts.join(':')}"
    end

    def key(*parts)
      self.class.key(*parts)
    end

    def self.redis
      @redis ||= Redis.new(:port => 6380)
    end

    def redis
      self.class.redis
    end

    #
    # instance methods
    #
    def initialize(fields = {})
      @errors = {}
    
      load_fields(fields)
      @associations = {}
      @lists = {}
      
      setup_associations
      setup_lists
    end
  
    def load_fields(fields)
      fields.each do |key, value|
        send "#{key}=", value
      end
    end
    
    def setup_lists
      self.class.list_fields.each do |list_field|
        # list getter
        self.class.send(:define_method, list_field) do
          @lists[list_field] ||= fetch_list(list_field)
        end

        # list setter
        self.class.send(:define_method, "#{list_field}=") do |l|
          @lists[list_field] = l
        end
      end
      
    end
    
    def setup_associations
      self.class.relationships.each do |name, r|
        if (r.type == :reference)
          # reference getter
          self.class.send(:define_method, name) do
            @associations[name] ||= fetch_association(name, r)
          end
        
          # reference setter
          self.class.send(:define_method, "#{name}=") do |obj|
            @associations[name] = obj
          end
        else
          # collection getter
          self.class.send(:define_method, name) do
            @associations[name] ||= fetch_association(name, r)
          end
        end
      end
    end
  
    def fetch_association(name, r)
      if (r.type == :reference)
        r.model.get(redis.get(key(id, :associations, name)))
      else
        res = []
        redis.lrange(key(id, :associations, name), 0, -1).each do |id|
          res << r.model.get(id)
        end
        res
      end
    end
    
    def fetch_list(name)
      redis.lrange(key(id, :lists, name), 0, -1)
    end
    
    
    # @param name [Symbol,String] Relationship name
    # @param relationship [Model::Relationship] Relationship instance
    # @param obj [Object] target object
    # TODO: optimize (too many if-then-else cascades)
    def store_reference(name, r, obj)
      prev = r.model.get(redis.get(key(id, :associations, name)))
      
      if (prev != obj) # reference has changed
        
        if (obj) # don't store nil reference
          redis.set(key(id, :associations, name), obj.id)
        elsif(prev)
          # remove reference if existent
          redis.del(key(prev.id, :associations, name))
        end
        
        if (prev) # remove obsolete back link
          redis.lrem(prev.key(prev.id, :associations, self.class.to_s.tableize), 0, self.id)
        end
        
        if (obj) # don't store back links for nil references
          redis.rpush(obj.key(obj.id, :associations, self.class.to_s.tableize), self.id)
        end
      end
    end
  
    def errors
      @errors
    end

    def save
      if valid?
        
        # save fields
        self.class.fields.each do |field|
          redis.hset(key(id), field, send(field))
        end
      
        # save indices
        self.class.indices.each do |index|
          redis.hset(key(:indices, index), send(index), id)
        end
        
        # save lists
        self.class.list_fields.each do |list_field|
          redis.del(self.key(self.id, :lists, list_field))
          
          self.send(list_field).each do |item|
            redis.rpush(self.key(self.id, :lists, list_field), item)
          end
        end
              
        # update references
        self.class.relationships.select {|k,r| r.type == :reference }.each do |name, r|
          # fetch association if it hasn't been set explicitly
          @associations[name] = fetch_association(name, r) unless @associations.has_key?(name)
          store_reference(name, r, @associations[name])
        end
        
        # put it on the all list
        redis.rpush(key(:all), self.id) unless saved?
        
        @saved = true
      else
        false
      end
      
    end
    
    # checks if the obj has any incoming references
    def is_referenced?
      self.class.relationships.select {|k,r| r.type == :collection }.each do |name, r|
        return true if self.send(name).length > 0
      end
      false
    end
    
    # removes all outgoing references
    def remove_outgoing_references
      self.class.relationships.select {|k,r| r.type == :reference }.each do |name, r|
        @associations[name] = nil
        store_reference(name, r, @associations[name])
      end
    end
    
    def destroy
      # stop if the obj has incoming references
      return false if is_referenced?
      
      remove_outgoing_references
      
      # remove the object
      redis.del(key(id))
      
      # remove obj from the all list
      redis.lrem(key(:all), 0, self.id)
      @saved = false
      
      return true
    end

    def id
      @id ||= generate_id
    end

    def generate_id
      redis.incr key(:id)
    end

    def saved?
      @saved
    end

    def saved=(saved)
      @saved = saved
    end

    def valid?
      saved? || validate
    end

    def validate
      errors.empty?
    end
  end
end