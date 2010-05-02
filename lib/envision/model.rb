###################################################
# A simple Redis Object Mapper
# It's based on Hurl::Model but makes heavy use of
# the brandnew redis hash datastructure and adds
# basic support for associations
# no more json serialization
###################################################
# 
# Usage:
#
# 
# class User < Envision::Model
#   field :name
#   field :email, :index => true
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
  
    def self.relationships
      @relationships ||= {}
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
      @redis ||= Redis.new
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
      setup_associations
    end
  
    def load_fields(fields)
      fields.each do |key, value|
        send "#{key}=", value
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
  
    def store_reference(name, r, obj)
      prev = r.model.get(redis.get(key(id, :associations, name)))

      if (prev != obj) # reference has changed
        redis.set(key(id, :associations, name), obj.id)
        if (prev) # remove obsolete back link
          redis.lrem(prev.key(prev.id, :associations, self.class.to_s.tableize), 0, self.id)
        end
        redis.rpush(obj.key(obj.id, :associations, self.class.to_s.tableize), self.id)
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
      
        # update references
        self.class.relationships.select {|k,r| r.type == :reference }.each do |name, r|
          @associations[name] ||= fetch_association(name, r)
          store_reference(name, r, @associations[name])
        end
        
        # put it on the all list
        redis.rpush(key(:all), self.id) unless saved?
        
        @saved = true
      else
        false
      end
      
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