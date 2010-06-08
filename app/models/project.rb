class Project < Envision::Model
  field :name, :index => true #, :unique => true
  field :descr
  
  belongs_to :user, User
  has_many :sheets, Sheet
  
  def to_hash
    {
      :id => id,
      :name => name,
      :descr => descr,
      :sheets => sheets.map { |s| s.to_hash }
    }
  end
  
  def to_json
    JSON.pretty_generate(to_hash)
  end
end