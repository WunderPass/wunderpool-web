if Dir['backend/*'].length < 1
  puts "Backend Folder is empty. Run this command first:"
  puts "scp -r root@pools-service.wunderpass.org:/root/wunder-pools-service/media backend/"
end

def getFilesInDir(path)
  if File.directory?(path)
    return Dir["#{path}/*"].map {|f_o_d| getFilesInDir(f_o_d)}.flatten
  else
    return path
  end
end

pools = []

Dir['backend/*'].each do |add|
  address = add.split('/').last
  files = getFilesInDir(add)
  banner = files.filter {|b| b.match(/banner/)}.last
  image = files.reject {|b| b.match(/banner/)}.last
  pools << {address: address, image: image, banner: banner}
end

pools.each do |pool|
  return unless pool[:image] || pool[:banner]
  banner_part = pool[:banner] ? "banner_location = '#{pool[:banner].gsub('backend/', '/root/wunder-pools-service/media/')}'" : nil
  image_part = pool[:image] ? "image_location = '#{pool[:image].gsub('backend/', '/root/wunder-pools-service/media/')}'" : nil
  update_part = banner_part && image_part ? "#{banner_part}, #{image_part}" : "#{banner_part || image_part}"
  puts "UPDATE pools SET #{update_part} WHERE pool_contract_address = '#{pool[:address]}';"
end
